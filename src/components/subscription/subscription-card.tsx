'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Subscription, Category } from '@/types';
import { getCurrentEffectiveMonthly, formatEffectiveCost, formatCurrency } from '@/lib/calculations';
import { formatDateShort, daysUntil } from '@/lib/utils';
import { STATUS_COLORS, CATEGORY_FALLBACK_COLOR } from '@/lib/constants';

interface SubscriptionCardProps {
  subscription: Subscription;
  category?: Category;
}

export function SubscriptionCard({ subscription: sub, category }: SubscriptionCardProps) {
  const days = daysUntil(sub.nextRenewalDate);
  const effectiveMonthly = getCurrentEffectiveMonthly(sub);

  return (
    <Link href={`/subscriptions/${sub.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {sub.logoUrl && (
                <img src={sub.logoUrl} alt="" className="w-8 h-8 rounded-md object-contain shrink-0" />
              )}
              <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{sub.name}</h3>
                <Badge variant="outline" className={`text-xs ${STATUS_COLORS[sub.status] ?? ''}`}>
                  {sub.status}
                </Badge>
              </div>
              {category && (
                <span
                  className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 w-fit"
                  style={{
                    backgroundColor: `${category.color ?? CATEGORY_FALLBACK_COLOR}20`,
                    color: category.color ?? CATEGORY_FALLBACK_COLOR,
                    boxShadow: `0 0 8px ${category.color ?? CATEGORY_FALLBACK_COLOR}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
                    style={{ backgroundColor: category.color ?? CATEGORY_FALLBACK_COLOR }}
                  />
                  {category.name}
                </span>
              )}
            </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-sm">{formatCurrency(effectiveMonthly, sub.currency)}/mo</div>
              {sub.billingCycle !== 'monthly' && (
                <div className="text-xs text-muted-foreground">
                  {formatEffectiveCost(sub)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Renews {formatDateShort(sub.nextRenewalDate)}</span>
            <span className={days <= 3 ? 'text-orange-600 font-medium' : ''}>
              {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
