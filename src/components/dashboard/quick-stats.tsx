'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Clock, AlertTriangle, Tag } from 'lucide-react';

interface QuickStatsProps {
  activeSubs: number;
  trialsEndingSoon: number;
  upcomingThisWeek: number;
  categoryCount: number;
}

export function QuickStats({ activeSubs, trialsEndingSoon, upcomingThisWeek, categoryCount }: QuickStatsProps) {
  const stats = [
    { label: 'Active', value: activeSubs, icon: CreditCard, color: 'text-green-600' },
    { label: 'Trials Ending', value: trialsEndingSoon, icon: Clock, color: 'text-blue-600' },
    { label: 'This Week', value: upcomingThisWeek, icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Categories', value: categoryCount, icon: Tag, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
