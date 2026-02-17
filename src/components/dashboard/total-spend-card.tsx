'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';

interface TotalSpendCardProps {
  monthlyTotal: number;
  yearlyTotal: number;
  currency?: string;
}

export function TotalSpendCard({ monthlyTotal, yearlyTotal, currency = 'USD' }: TotalSpendCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(monthlyTotal, currency)}</div>
          <p className="text-xs text-muted-foreground mt-1">per month, all active subscriptions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Yearly Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(yearlyTotal, currency)}</div>
          <p className="text-xs text-muted-foreground mt-1">projected annual cost</p>
        </CardContent>
      </Card>
    </div>
  );
}
