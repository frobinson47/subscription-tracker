'use client';

import { use } from 'react';
import { Header } from '@/components/layout/header';
import { SubscriptionForm } from '@/components/subscription/subscription-form';
import { useSubscription, useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { useHousehold } from '@/hooks/use-household';

export default function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const subscription = useSubscription(id);
  const { updateSubscription } = useSubscriptions();
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
    <>
      <Header title={`Edit ${subscription.name}`} />
      <SubscriptionForm
        initialData={subscription}
        categories={categories}
        members={members}
        onSubmit={async (data) => {
          await updateSubscription(id, data);
        }}
      />
    </>
  );
}
