import { parseISO, differenceInDays, format, addDays } from 'date-fns';
import type { Subscription, Alert, AlertTiming } from '@/types';
import { getCurrentEffectiveMonthly, getTotalMonthly } from './calculations';

export function generateAlerts(
  subs: Subscription[],
  today: Date = new Date(),
  escalationThreshold: number = 50
): Alert[] {
  const alerts: Alert[] = [];
  const todayStr = format(today, 'yyyy-MM-dd');
  const activeSubs = subs.filter((s) => s.status === 'active' || s.status === 'trial');
  const avgMonthly = activeSubs.length > 0 ? getTotalMonthly(activeSubs) / activeSubs.length : 0;

  for (const sub of activeSubs) {
    const renewalDate = parseISO(sub.nextRenewalDate);
    const daysUntil = differenceInDays(renewalDate, today);
    const effectiveMonthly = getCurrentEffectiveMonthly(sub);

    // Determine alert timings (configured + escalation)
    const timings = new Set<AlertTiming>(sub.alertDaysBefore);

    // Escalation: if expensive, add 30-day alert
    if (effectiveMonthly > escalationThreshold || effectiveMonthly > avgMonthly * 2) {
      timings.add(30);
    }

    for (const daysBefore of timings) {
      // Alert should fire when we're within the window
      if (daysUntil <= daysBefore && daysUntil >= 0) {
        const alertDate = format(addDays(renewalDate, -daysBefore), 'yyyy-MM-dd');

        // Check snooze
        if (sub.alertSnoozedUntil && todayStr < sub.alertSnoozedUntil) {
          continue;
        }

        alerts.push({
          id: `${sub.id}-${sub.nextRenewalDate}-${daysBefore}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          renewalDate: sub.nextRenewalDate,
          amount: sub.amount + (sub.taxAmount ?? 0),
          effectiveMonthly,
          daysBefore,
          alertDate,
          dismissed: false,
          snoozedUntil: undefined,
        });
      }
    }
  }

  // Sort: most urgent first
  return alerts.sort((a, b) => {
    const daysA = differenceInDays(parseISO(a.renewalDate), today);
    const daysB = differenceInDays(parseISO(b.renewalDate), today);
    return daysA - daysB;
  });
}

export function getAlertUrgencyColor(daysUntil: number): string {
  if (daysUntil <= 1) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
  if (daysUntil <= 3) return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
  if (daysUntil <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
  return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
}
