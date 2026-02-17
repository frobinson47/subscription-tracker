'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { SubscriptionCard } from '@/components/subscription/subscription-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { getCurrentEffectiveMonthly } from '@/lib/calculations';
import { Search } from 'lucide-react';

export default function SubscriptionsPage() {
  const { subscriptions } = useSubscriptions();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

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
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [subscriptions, search, statusFilter, categoryFilter, sortBy]);

  return (
    <>
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
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {subscriptions.length === 0
            ? 'No subscriptions yet. Add your first one!'
            : 'No subscriptions match your filters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              category={categories.find((c) => c.id === sub.categoryId)}
            />
          ))}
        </div>
      )}
    </>
  );
}
