'use client';

import { useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Copy, TrendingUp, BarChart3 } from 'lucide-react';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { useSettings } from '@/hooks/use-settings';
import { getCurrentEffectiveMonthly, formatCurrency } from '@/lib/calculations';
import { findDuplicates, findSimilarSubscriptions } from '@/lib/duplicate-detection';
import { USAGE_LABELS } from '@/lib/constants';

export default function InsightsPage() {
  const { subscriptions } = useSubscriptions();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const active = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial');

  // Waste detector: not used in 90+ days, sorted by cost
  const wasteSubs = useMemo(() => {
    return active
      .filter((s) => s.lastUsed === 'over90' || s.lastUsed === 'never')
      .sort((a, b) => getCurrentEffectiveMonthly(b) - getCurrentEffectiveMonthly(a));
  }, [active]);

  // Low value / high cost
  const lowValueHighCost = useMemo(() => {
    const costs = active.map((s) => getCurrentEffectiveMonthly(s)).sort((a, b) => a - b);
    const p75 = costs[Math.floor(costs.length * 0.75)] ?? 0;
    return active
      .filter((s) => (s.valueScore ?? 5) <= 2 && getCurrentEffectiveMonthly(s) >= p75)
      .sort((a, b) => getCurrentEffectiveMonthly(b) - getCurrentEffectiveMonthly(a));
  }, [active]);

  // Duplicates
  const duplicates = useMemo(() => findDuplicates(active), [active]);

  // Similar subscriptions (3+ in same category)
  const similarGroups = useMemo(
    () => findSimilarSubscriptions(active, categories).map((g) => ({
      ...g,
      totalMonthly: g.subs.reduce((sum, s) => sum + getCurrentEffectiveMonthly(s), 0),
    })),
    [active, categories]
  );

  // Price increases
  const priceIncreases = useMemo(() => {
    return subscriptions.filter((s) => {
      if (s.priceHistory.length < 2) return false;
      const last = s.priceHistory[s.priceHistory.length - 1];
      const prev = s.priceHistory[s.priceHistory.length - 2];
      return last.amount > prev.amount;
    });
  }, [subscriptions]);

  const wasteTotal = wasteSubs.reduce((sum, s) => sum + getCurrentEffectiveMonthly(s), 0);

  return (
    <>
      <Header title="Insights" description="Find waste and optimize your spending" />

      <div className="space-y-6">
        {/* Waste Detector */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm">Unused Subscriptions</CardTitle>
              {wasteSubs.length > 0 && (
                <Badge variant="destructive">{formatCurrency(wasteTotal, settings.defaultCurrency)}/mo</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {wasteSubs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No unused subscriptions detected. Set &quot;Last Used&quot; on your subscriptions to enable this.</p>
            ) : (
              <div className="space-y-2">
                {wasteSubs.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-muted-foreground ml-2">{USAGE_LABELS[sub.lastUsed ?? 'never']}</span>
                    </div>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(getCurrentEffectiveMonthly(sub), sub.currency)}/mo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Value High Cost */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-500" />
                <CardTitle className="text-sm">Low Value, High Cost</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {lowValueHighCost.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low-value subscriptions found. Rate your subscriptions to enable this.</p>
              ) : (
                <div className="space-y-2">
                  {lowValueHighCost.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{sub.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {'★'.repeat(sub.valueScore ?? 0)}{'☆'.repeat(5 - (sub.valueScore ?? 0))}
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(getCurrentEffectiveMonthly(sub), sub.currency)}/mo</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Duplicates */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-yellow-500" />
                <CardTitle className="text-sm">Possible Duplicates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {duplicates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No duplicate subscriptions detected</p>
              ) : (
                <div className="space-y-2">
                  {duplicates.map((pair, i) => (
                    <div key={i} className="text-sm border-b pb-2">
                      <span className="font-medium">{pair.sub1.name}</span>
                      <span className="text-muted-foreground"> &amp; </span>
                      <span className="font-medium">{pair.sub2.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{pair.reason}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Similar Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Category Overlap</CardTitle>
            </CardHeader>
            <CardContent>
              {similarGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories with 3+ subscriptions</p>
              ) : (
                <div className="space-y-3">
                  {similarGroups.map((group) => (
                    <div key={group.categoryId} className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{group.categoryName}</span>
                        <span>{group.subs.length} subs &middot; {formatCurrency(group.totalMonthly, settings.defaultCurrency)}/mo</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {group.subs.map((s) => s.name).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Increases */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <CardTitle className="text-sm">Recent Price Increases</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {priceIncreases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No price increases tracked</p>
              ) : (
                <div className="space-y-2">
                  {priceIncreases.map((sub) => {
                    const last = sub.priceHistory[sub.priceHistory.length - 1];
                    const prev = sub.priceHistory[sub.priceHistory.length - 2];
                    const delta = last.amount - prev.amount;
                    return (
                      <div key={sub.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{sub.name}</span>
                        <Badge variant="destructive" className="text-xs">
                          +{formatCurrency(delta, sub.currency)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
