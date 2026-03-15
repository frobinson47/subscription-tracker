import { addMonths, startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import type { Subscription } from '@/types';
import { getCashflowEntries } from '@/lib/renewal-engine';

export interface MonthlyProjection {
  month: string;          // "Mar", "Apr", etc.
  monthKey: string;       // "2026-03", "2026-04", etc.
  total: number;          // projected spending for that month
  isCurrentMonth: boolean;
}

export function projectSpending(
  subs: Subscription[],
  months: number = 12
): MonthlyProjection[] {
  const projections: MonthlyProjection[] = [];
  const now = new Date();
  const currentMonthKey = format(now, 'yyyy-MM');

  for (let i = 0; i < months; i++) {
    const monthStart = startOfMonth(addMonths(now, i));
    const monthEnd = endOfMonth(monthStart);
    const monthKey = format(monthStart, 'yyyy-MM');

    // Get all renewal events in this month using existing engine
    const entries = getCashflowEntries(subs, monthStart, monthEnd);

    // For future months, adjust for trial-to-paid conversions
    // The getCashflowEntries uses current amounts, but we need to check
    // if intro pricing will have expired by then
    let total = 0;
    for (const entry of entries) {
      const sub = subs.find(s => s.id === entry.subscriptionId);
      if (sub && sub.hasIntroPricing && sub.introEndDate && sub.introPrice !== undefined) {
        const introEnd = parseISO(sub.introEndDate);
        const entryDate = parseISO(entry.date);
        if (entryDate >= introEnd) {
          // Intro period has ended - use full price instead of intro price
          const fullAmount = sub.amount + (sub.taxAmount ?? 0);
          total += fullAmount;
          continue;
        }
      }
      total += entry.amount;
    }

    projections.push({
      month: format(monthStart, 'MMM'),
      monthKey,
      total: Math.round(total * 100) / 100,
      isCurrentMonth: monthKey === currentMonthKey,
    });
  }

  return projections;
}

export function getProjectedYearlyTotal(projections: MonthlyProjection[]): number {
  return Math.round(projections.reduce((sum, p) => sum + p.total, 0) * 100) / 100;
}

export function getAverageMonthly(projections: MonthlyProjection[]): number {
  if (projections.length === 0) return 0;
  return Math.round((projections.reduce((sum, p) => sum + p.total, 0) / projections.length) * 100) / 100;
}

export function getHighestMonth(projections: MonthlyProjection[]): MonthlyProjection | null {
  if (projections.length === 0) return null;
  return projections.reduce((max, p) => p.total > max.total ? p : max, projections[0]);
}
