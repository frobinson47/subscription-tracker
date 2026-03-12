'use client';

import { useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { TotalSpendCard } from '@/components/dashboard/total-spend-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown-chart';
import { UpcomingRenewalsWidget } from '@/components/dashboard/upcoming-renewals-widget';
import { AlertsWidget } from '@/components/dashboard/alerts-widget';
import { ForecastChart } from '@/components/dashboard/forecast-chart';
import { HealthScoreCard } from '@/components/dashboard/health-score-card';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { useAlerts } from '@/hooks/use-alerts';
import { useCashflow } from '@/hooks/use-cashflow';
import { useSettings } from '@/hooks/use-settings';
import { getTotalMonthly, getTotalYearly, getCategoryBreakdown } from '@/lib/calculations';
import { daysUntil } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Reorder } from 'framer-motion';
import { MotionPage } from '@/components/ui/motion-page';
import { useUserPreference } from '@/hooks/use-user-preferences';
import { EmptyState } from '@/components/ui/empty-state';
import { ChartBarsIllustration } from '@/components/ui/illustrations';

export default function DashboardPage() {
  const router = useRouter();
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

  const defaultOrder = ['total-spend', 'quick-stats', 'health-score', 'charts-alerts', 'forecast'];
  const [sectionOrder, setSectionOrder] = useUserPreference<string[]>('dashboard-order', defaultOrder);
  const order = sectionOrder.length === defaultOrder.length ? sectionOrder : defaultOrder;

  const sectionMap: Record<string, React.ReactNode> = {
    'total-spend': (
      <TotalSpendCard
        monthlyTotal={monthlyTotal}
        yearlyTotal={yearlyTotal}
        currency={settings.defaultCurrency}
      />
    ),
    'quick-stats': (
      <QuickStats
        activeSubs={activeSubs}
        trialsEndingSoon={trialsEndingSoon}
        upcomingThisWeek={entries.length}
        categoryCount={usedCategoryIds.size}
      />
    ),
    'health-score': (
      <HealthScoreCard
        subscriptions={subscriptions}
        categories={categories}
        settings={settings}
      />
    ),
    'charts-alerts': (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart data={breakdown} currency={settings.defaultCurrency} />
        <div className="space-y-6">
          <AlertsWidget alerts={alerts} currency={settings.defaultCurrency} />
          <UpcomingRenewalsWidget entries={entries} currency={settings.defaultCurrency} />
        </div>
      </div>
    ),
    'forecast': (
      <ForecastChart subscriptions={subscriptions} currency={settings.defaultCurrency} />
    ),
  };

  return (
    <MotionPage>
      <Header title="Dashboard" showAddButton />

      {subscriptions.length === 0 ? (
        <EmptyState
          illustration={<ChartBarsIllustration />}
          title="Your dashboard is empty"
          description="Add your first subscription to see spending analytics, trends, and alerts."
          primaryAction={{ label: 'Add Your First Subscription', onClick: () => router.push('/subscriptions/new') }}
        />
      ) : (
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setSectionOrder}
        className="space-y-6"
      >
        {order.map((id) => (
          <Reorder.Item
            key={id}
            value={id}
            whileDrag={{ scale: 1.01, boxShadow: '0 8px 24px rgba(68,46,20,0.08)' }}
            className="cursor-grab active:cursor-grabbing"
          >
            {sectionMap[id]}
          </Reorder.Item>
        ))}
      </Reorder.Group>
      )}
    </MotionPage>
  );
}
