'use client';

import { useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { TotalSpendCard } from '@/components/dashboard/total-spend-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown-chart';
import { UpcomingRenewalsWidget } from '@/components/dashboard/upcoming-renewals-widget';
import { AlertsWidget } from '@/components/dashboard/alerts-widget';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { useAlerts } from '@/hooks/use-alerts';
import { useCashflow } from '@/hooks/use-cashflow';
import { useSettings } from '@/hooks/use-settings';
import { getTotalMonthly, getTotalYearly, getCategoryBreakdown } from '@/lib/calculations';
import { daysUntil } from '@/lib/utils';

export default function DashboardPage() {
  const { subscriptions } = useSubscriptions();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const alerts = useAlerts(subscriptions, settings.escalationThreshold);
  const { entries } = useCashflow(subscriptions, 7);

  const monthlyTotal = useMemo(() => getTotalMonthly(subscriptions), [subscriptions]);
  const yearlyTotal = useMemo(() => getTotalYearly(subscriptions), [subscriptions]);
  const breakdown = useMemo(() => getCategoryBreakdown(subscriptions, categories), [subscriptions, categories]);

  const activeSubs = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial').length;
  const trialsEndingSoon = subscriptions.filter(
    (s) => s.status === 'trial' && daysUntil(s.nextRenewalDate) <= 7
  ).length;
  const usedCategoryIds = new Set(subscriptions.map((s) => s.categoryId));

  return (
    <>
      <Header title="Dashboard" showAddButton />

      <div className="space-y-6">
        <TotalSpendCard
          monthlyTotal={monthlyTotal}
          yearlyTotal={yearlyTotal}
          currency={settings.defaultCurrency}
        />

        <QuickStats
          activeSubs={activeSubs}
          trialsEndingSoon={trialsEndingSoon}
          upcomingThisWeek={entries.length}
          categoryCount={usedCategoryIds.size}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdownChart data={breakdown} currency={settings.defaultCurrency} />
          <div className="space-y-6">
            <AlertsWidget alerts={alerts} currency={settings.defaultCurrency} />
            <UpcomingRenewalsWidget entries={entries} currency={settings.defaultCurrency} />
          </div>
        </div>
      </div>
    </>
  );
}
