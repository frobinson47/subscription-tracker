'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CashflowEntry } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { formatDateShort, daysUntil } from '@/lib/utils';

interface UpcomingRenewalsWidgetProps {
  entries: CashflowEntry[];
  currency?: string;
}

export function UpcomingRenewalsWidget({ entries, currency = 'USD' }: UpcomingRenewalsWidgetProps) {
  const upcoming = entries.slice(0, 7);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No upcoming renewals</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((entry, i) => {
              const days = daysUntil(entry.date);
              return (
                <Link
                  key={`${entry.subscriptionId}-${entry.date}-${i}`}
                  href={`/subscriptions/${entry.subscriptionId}`}
                  className="flex items-center justify-between hover:bg-accent rounded-md px-2 py-1 -mx-2 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm">{entry.subscriptionName}</div>
                    <div className="text-xs text-muted-foreground">{formatDateShort(entry.date)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{formatCurrency(entry.amount, currency)}</span>
                    <Badge variant={days <= 1 ? 'destructive' : days <= 3 ? 'default' : 'secondary'}>
                      {days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
