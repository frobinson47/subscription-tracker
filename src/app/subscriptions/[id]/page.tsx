'use client';

import { use } from 'react';
import { Header } from '@/components/layout/header';
import { SubscriptionDetail } from '@/components/subscription/subscription-detail';
import { useSubscription } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { useHousehold } from '@/hooks/use-household';

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const subscription = useSubscription(id);
  const { categories } = useCategories();
  const { members } = useHousehold();

  if (subscription === undefined) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading...</div>
    );
  }

  if (subscription === null) {
    return (
      <>
        <Header title="Not Found" />
        <div className="text-center py-12 text-muted-foreground">
          Subscription not found.
        </div>
      </>
    );
  }

  return (
    <SubscriptionDetail
      subscription={subscription}
      category={categories.find((c) => c.id === subscription.categoryId)}
      members={members}
    />
  );
}
