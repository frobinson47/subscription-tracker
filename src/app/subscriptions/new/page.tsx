'use client';

import { Header } from '@/components/layout/header';
import { SubscriptionForm } from '@/components/subscription/subscription-form';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { useHousehold } from '@/hooks/use-household';

export default function NewSubscriptionPage() {
  const { addSubscription } = useSubscriptions();
  const { categories } = useCategories();
  const { members } = useHousehold();

  return (
    <>
      <Header title="Add Subscription" />
      <SubscriptionForm
        categories={categories}
        members={members}
        onSubmit={async (data) => {
          await addSubscription(data);
        }}
      />
    </>
  );
}
