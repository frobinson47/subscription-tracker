'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import type { Subscription } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { projectSpending, getAverageMonthly, getProjectedYearlyTotal, getHighestMonth } from '@/lib/forecast';

interface ForecastChartProps {
  subscriptions: Subscription[];
  currency: string;
}

export function ForecastChart({ subscriptions, currency }: ForecastChartProps) {
  const projections = useMemo(() => projectSpending(subscriptions, 12), [subscriptions]);
  const avgMonthly = useMemo(() => getAverageMonthly(projections), [projections]);
  const yearlyTotal = useMemo(() => getProjectedYearlyTotal(projections), [projections]);
  const highestMonth = useMemo(() => getHighestMonth(projections), [projections]);

  const hasData = projections.some(p => p.total > 0);
  const highSpendWarning = highestMonth && avgMonthly > 0 && highestMonth.total > avgMonthly * 1.3;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            12-Month Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">
            Add subscriptions to see your spending forecast
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            12-Month Forecast
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Projected yearly: {formatCurrency(yearlyTotal, currency)} | Avg monthly: {formatCurrency(avgMonthly, currency)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value, currency)}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as { month: string; monthKey: string; total: number; isCurrentMonth: boolean };
                  return (
                    <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-md">
                      <p className="text-sm font-medium">
                        {data.month} {data.monthKey.split('-')[0]}
                        {data.isCurrentMonth && ' (current)'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(data.total, currency)}
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={avgMonthly}
                stroke="#94A3B8"
                strokeDasharray="5 5"
                label={{ value: 'Avg', position: 'right', fontSize: 11, fill: '#94A3B8' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#forecastGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {highSpendWarning && highestMonth && (
          <div className="flex items-center gap-2 mt-3 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {highestMonth.month} is a high spend month at {formatCurrency(highestMonth.total, currency)} ({Math.round((highestMonth.total / avgMonthly) * 100 - 100)}% above average)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
