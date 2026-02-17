'use client';

import { useMemo } from 'react';
import { addDays } from 'date-fns';
import type { Subscription } from '@/types';
import { getCashflowEntries, getMonthTotal } from '@/lib/renewal-engine';

export function useCashflow(subscriptions: Subscription[], days: number = 30) {
  const { entries, total } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, days);
    const cashflowEntries = getCashflowEntries(subscriptions, today, endDate);
    return {
      entries: cashflowEntries,
      total: getMonthTotal(cashflowEntries),
    };
  }, [subscriptions, days]);

  return { entries, total };
}
