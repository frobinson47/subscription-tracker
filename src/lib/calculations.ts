import type { Subscription, AddOn, BillingCycle, CategoryBreakdown, Category } from '@/types';
import { AVG_DAYS_PER_MONTH } from './constants';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeToMonthly(amount: number, cycle: BillingCycle, customDays?: number): number {
  switch (cycle) {
    case 'weekly':    return amount * (52 / 12);
    case 'monthly':   return amount;
    case 'quarterly': return amount / 3;
    case 'biannual':  return amount / 6;
    case 'annual':    return amount / 12;
    case 'custom':    return amount * AVG_DAYS_PER_MONTH / (customDays ?? 30);
  }
}

function normalizeAddOnMonthly(addon: AddOn): number {
  return normalizeToMonthly(addon.amount, addon.billingCycle, addon.customCycleDays);
}

export function getEffectiveMonthly(sub: Subscription): number {
  const baseAmount = sub.amount + (sub.taxAmount ?? 0);
  const addOnTotal = sub.addOns.reduce((sum, a) => sum + normalizeAddOnMonthly(a), 0);
  const monthly = normalizeToMonthly(baseAmount, sub.billingCycle, sub.customCycleDays) + addOnTotal;
  return round2(monthly);
}

export function getCurrentEffectiveMonthly(sub: Subscription): number {
  if (sub.hasIntroPricing && sub.introEndDate && sub.introPrice !== undefined) {
    const introEnd = new Date(sub.introEndDate);
    if (new Date() < introEnd) {
      const introMonthly = normalizeToMonthly(sub.introPrice, sub.billingCycle, sub.customCycleDays);
      return round2(introMonthly);
    }
  }
  return getEffectiveMonthly(sub);
}

export function getEffectiveYearly(sub: Subscription): number {
  return round2(getEffectiveMonthly(sub) * 12);
}

export function getTotalMonthly(subs: Subscription[]): number {
  const activeSubs = subs.filter((s) => s.status === 'active' || s.status === 'trial');
  return round2(activeSubs.reduce((sum, s) => sum + getCurrentEffectiveMonthly(s), 0));
}

export function getTotalYearly(subs: Subscription[]): number {
  return round2(getTotalMonthly(subs) * 12);
}

export function getCategoryBreakdown(subs: Subscription[], categories: Category[]): CategoryBreakdown[] {
  const activeSubs = subs.filter((s) => s.status === 'active' || s.status === 'trial');
  const totalMonthly = getTotalMonthly(activeSubs);

  const categoryMap = new Map<string, { total: number; count: number }>();
  for (const sub of activeSubs) {
    const existing = categoryMap.get(sub.categoryId) || { total: 0, count: 0 };
    existing.total += getCurrentEffectiveMonthly(sub);
    existing.count += 1;
    categoryMap.set(sub.categoryId, existing);
  }

  const breakdown: CategoryBreakdown[] = [];
  for (const [catId, data] of categoryMap) {
    const cat = categories.find((c) => c.id === catId);
    breakdown.push({
      categoryId: catId,
      categoryName: cat?.name ?? 'Unknown',
      categoryIcon: cat?.icon ?? 'package',
      totalMonthly: round2(data.total),
      count: data.count,
      percentage: totalMonthly > 0 ? round2((data.total / totalMonthly) * 100) : 0,
    });
  }

  return breakdown.sort((a, b) => b.totalMonthly - a.totalMonthly);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatEffectiveCost(sub: Subscription): string {
  const monthly = getCurrentEffectiveMonthly(sub);
  const currency = sub.currency || 'USD';
  if (sub.billingCycle === 'monthly') {
    return `${formatCurrency(monthly, currency)}/mo`;
  }
  const cycleCost = formatCurrency(sub.amount + (sub.taxAmount ?? 0), currency);
  const cycleLabel = sub.billingCycle === 'annual' ? '/yr' :
    sub.billingCycle === 'quarterly' ? '/qtr' :
    sub.billingCycle === 'biannual' ? '/6mo' :
    sub.billingCycle === 'weekly' ? '/wk' : '/cycle';
  return `${cycleCost}${cycleLabel} (${formatCurrency(monthly, currency)}/mo)`;
}
