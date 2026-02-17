'use client';

import { useMemo } from 'react';
import type { Subscription } from '@/types';
import { generateAlerts } from '@/lib/alerts';
import { useStore } from '@/lib/store';

export function useAlerts(subscriptions: Subscription[], escalationThreshold: number = 50) {
  const dismissedAlertIds = useStore((s) => s.dismissedAlertIds);

  const alerts = useMemo(() => {
    const all = generateAlerts(subscriptions, new Date(), escalationThreshold);
    return all.filter((a) => !dismissedAlertIds.has(a.id));
  }, [subscriptions, escalationThreshold, dismissedAlertIds]);

  return alerts;
}
