'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { SubscriptionCard } from '@/components/subscription/subscription-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { getCurrentEffectiveMonthly } from '@/lib/calculations';
import { Search } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { MotionPage } from '@/components/ui/motion-page';
import { useUserPreference } from '@/hooks/use-user-preferences';
import { EmptyState } from '@/components/ui/empty-state';
import { StackedCardsIllustration } from '@/components/ui/illustrations';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { subscriptions } = useSubscriptions();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortByState] = useState<string>('name');
  const [customOrder, setCustomOrder] = useUserPreference<string[]>('subscriptions-order', []);

  const setSortBy = (value: string) => {
    if (value === 'custom' && customOrder.length === 0 && subscriptions.length > 0) {
      setCustomOrder(subscriptions.map((s) => s.id));
    }
    setSortByState(value);
  };

  const filtered = useMemo(() => {
    let result = subscriptions;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.categoryId === categoryFilter);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return getCurrentEffectiveMonthly(b) - getCurrentEffectiveMonthly(a);
        case 'renewal':
          return a.nextRenewalDate.localeCompare(b.nextRenewalDate);
        case 'added':
          return b.createdAt.localeCompare(a.createdAt);
        case 'custom': {
          const orderMap = new Map(customOrder.map((id, i) => [id, i]));
          return (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity);
        }
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [subscriptions, search, statusFilter, categoryFilter, sortBy, customOrder]);

  return (
    <MotionPage>
      <Header title="Subscriptions" description={`${subscriptions.length} total`} showAddButton />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="amount">Cost (high)</SelectItem>
            <SelectItem value="renewal">Next Renewal</SelectItem>
            <SelectItem value="added">Date Added</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        subscriptions.length === 0 ? (
          <EmptyState
            illustration={<StackedCardsIllustration />}
            title="No subscriptions yet"
            description="Start tracking your recurring costs by adding your first subscription."
            primaryAction={{ label: 'Add Subscription', onClick: () => router.push('/subscriptions/new') }}
            secondaryAction={{ label: 'Import CSV', onClick: () => router.push('/settings') }}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No subscriptions match your filters.
          </div>
        )
      ) : sortBy === 'custom' ? (
        <Reorder.Group
          axis="y"
          values={filtered.map((s) => s.id)}
          onReorder={(newOrder) => setCustomOrder(newOrder)}
          className="space-y-3"
        >
          {filtered.map((sub) => (
            <Reorder.Item
              key={sub.id}
              value={sub.id}
              whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(68,46,20,0.12)' }}
              className="cursor-grab active:cursor-grabbing"
            >
              <SubscriptionCard
                subscription={sub}
                category={categories.find((c) => c.id === sub.categoryId)}
                disableLink
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map((sub, index) => (
            <motion.div
              key={sub.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: index >= 12 ? 0 : 0.25 } },
              }}
            >
              <SubscriptionCard
                subscription={sub}
                category={categories.find((c) => c.id === sub.categoryId)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </MotionPage>
  );
}
