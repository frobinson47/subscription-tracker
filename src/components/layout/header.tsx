'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
}

export function Header({ title, description, showAddButton = false }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {showAddButton && (
        <Button asChild>
          <Link href="/subscriptions/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Link>
        </Button>
      )}
    </div>
  );
}
