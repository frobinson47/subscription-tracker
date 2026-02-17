'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import type { Subscription, Category, HouseholdMember } from '@/types';
import { getCurrentEffectiveMonthly, getEffectiveYearly, formatCurrency, formatEffectiveCost } from '@/lib/calculations';
import { formatDate, daysUntil } from '@/lib/utils';
import { STATUS_COLORS, BILLING_CYCLE_LABELS, USAGE_LABELS } from '@/lib/constants';
import { db } from '@/lib/db';

interface SubscriptionDetailProps {
  subscription: Subscription;
  category?: Category;
  members: HouseholdMember[];
}

export function SubscriptionDetail({ subscription: sub, category, members }: SubscriptionDetailProps) {
  const router = useRouter();
  const effectiveMonthly = getCurrentEffectiveMonthly(sub);
  const effectiveYearly = getEffectiveYearly(sub);
  const days = daysUntil(sub.nextRenewalDate);

  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name ?? 'Unknown';

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      await db.subscriptions.delete(sub.id);
      router.push('/subscriptions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {sub.logoUrl && (
              <img src={sub.logoUrl} alt="" className="w-10 h-10 rounded-lg object-contain shrink-0" />
            )}
            <h1 className="text-2xl font-bold">{sub.name}</h1>
            <Badge className={STATUS_COLORS[sub.status]}>{sub.status}</Badge>
          </div>
          {category && <p className="text-muted-foreground mt-1">{category.name}</p>}
          {sub.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {sub.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/subscriptions/${sub.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Cost card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Effective Monthly</p>
              <p className="text-3xl font-bold">{formatCurrency(effectiveMonthly, sub.currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatEffectiveCost(sub)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Annual Cost</p>
              <p className="text-2xl font-semibold">{formatCurrency(effectiveYearly, sub.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Renewal</p>
              <p className="text-2xl font-semibold">{formatDate(sub.nextRenewalDate)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing Details */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Billing Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cycle</span>
              <span>{BILLING_CYCLE_LABELS[sub.billingCycle]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>{formatCurrency(sub.amount, sub.currency)}</span>
            </div>
            {sub.taxAmount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(sub.taxAmount, sub.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-renew</span>
              <span>{sub.autoRenew ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start date</span>
              <span>{formatDate(sub.startDate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Household */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Household</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payer</span>
              <span>{getMemberName(sub.payerId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner</span>
              <span>{getMemberName(sub.ownerId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shared</span>
              <span>{sub.isShared ? 'Yes' : 'No'}</span>
            </div>
            {sub.userIds.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users</span>
                <span>{sub.userIds.map(getMemberName).join(', ')}</span>
              </div>
            )}
            {sub.seatCount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span>{sub.seatCount}{sub.costPerSeat ? ` @ ${formatCurrency(sub.costPerSeat, sub.currency)}/seat` : ''}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Value Assessment */}
        {(sub.valueScore || sub.lastUsed) && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Value Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {sub.valueScore && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value Score</span>
                  <span>{'★'.repeat(sub.valueScore)}{'☆'.repeat(5 - sub.valueScore)}</span>
                </div>
              )}
              {sub.lastUsed && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Used</span>
                  <span>{USAGE_LABELS[sub.lastUsed]}</span>
                </div>
              )}
              {sub.wouldMiss !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Would miss it?</span>
                  <span>{sub.wouldMiss ? 'Yes' : 'No'}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cancellation */}
        {(sub.cancelUrl || sub.cancelMethod || sub.cancellationChecklist?.length) && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Cancellation</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {sub.cancelUrl && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cancel URL</span>
                  <a href={sub.cancelUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1">
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {sub.cancelMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="capitalize">{sub.cancelMethod}</span>
                </div>
              )}
              {sub.cancelDeadlineDays && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span>{sub.cancelDeadlineDays} days before renewal</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Price History */}
      {sub.priceHistory.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Price History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sub.priceHistory.map((entry, i) => {
                const prev = sub.priceHistory[i - 1];
                const delta = prev ? entry.amount - prev.amount : 0;
                return (
                  <div key={`${entry.date}-${i}`} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{formatDate(entry.date)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(entry.amount, sub.currency)}</span>
                      {delta !== 0 && (
                        <Badge variant={delta > 0 ? 'destructive' : 'default'} className="text-xs">
                          {delta > 0 ? '+' : ''}{formatCurrency(delta, sub.currency)}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {sub.notes && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{sub.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
