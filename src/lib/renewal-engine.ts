import {
  addWeeks, addMonths, addYears, addDays,
  lastDayOfMonth, isWeekend, nextMonday,
  isBefore, isEqual, parseISO, format,
} from 'date-fns';
import type { BillingCycle, RenewalDayRule, Subscription, CashflowEntry } from '@/types';

export function computeNextRenewal(
  lastRenewal: Date,
  cycle: BillingCycle,
  customDays?: number,
  dayRule: RenewalDayRule = 'exact'
): Date {
  let next: Date;

  switch (cycle) {
    case 'weekly':
      next = addWeeks(lastRenewal, 1);
      break;
    case 'monthly':
      next = addMonths(lastRenewal, 1);
      break;
    case 'quarterly':
      next = addMonths(lastRenewal, 3);
      break;
    case 'biannual':
      next = addMonths(lastRenewal, 6);
      break;
    case 'annual':
      next = addYears(lastRenewal, 1);
      break;
    case 'custom':
      next = addDays(lastRenewal, customDays ?? 30);
      break;
  }

  // Apply day rule
  switch (dayRule) {
    case 'lastDayOfMonth':
      next = lastDayOfMonth(next);
      break;
    case 'nextBusinessDay':
      if (isWeekend(next)) {
        next = nextMonday(next);
      }
      break;
    case 'exact':
    default:
      break;
  }

  return next;
}

export function advanceRenewalToFuture(
  renewalDate: Date,
  cycle: BillingCycle,
  customDays?: number,
  dayRule: RenewalDayRule = 'exact'
): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let current = renewalDate;

  while (isBefore(current, today)) {
    current = computeNextRenewal(current, cycle, customDays, dayRule);
  }

  return current;
}

export function getRenewalsInRange(
  sub: Subscription,
  startDate: Date,
  endDate: Date
): Date[] {
  if (sub.status === 'cancelled') return [];

  const renewals: Date[] = [];
  let current = parseISO(sub.nextRenewalDate);

  // Advance to start range if needed
  while (isBefore(current, startDate)) {
    current = computeNextRenewal(current, sub.billingCycle, sub.customCycleDays, sub.renewalDayRule);
  }

  // Collect renewals within range
  while (isBefore(current, endDate) || isEqual(current, endDate)) {
    renewals.push(current);
    current = computeNextRenewal(current, sub.billingCycle, sub.customCycleDays, sub.renewalDayRule);
  }

  return renewals;
}

export function isRenewalToday(sub: Subscription): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  return sub.nextRenewalDate === today;
}

export function getCashflowEntries(
  subs: Subscription[],
  startDate: Date,
  endDate: Date
): CashflowEntry[] {
  const entries: CashflowEntry[] = [];

  for (const sub of subs) {
    if (sub.status === 'cancelled') continue;
    const renewals = getRenewalsInRange(sub, startDate, endDate);
    for (const date of renewals) {
      entries.push({
        date: format(date, 'yyyy-MM-dd'),
        subscriptionId: sub.id,
        subscriptionName: sub.name,
        amount: sub.amount + (sub.taxAmount ?? 0),
        categoryId: sub.categoryId,
      });
    }
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export function getMonthTotal(entries: CashflowEntry[]): number {
  return Math.round(entries.reduce((sum, e) => sum + e.amount, 0) * 100) / 100;
}
