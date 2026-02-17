'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import type { Alert } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { getAlertUrgencyColor } from '@/lib/alerts';
import { formatDateShort, daysUntil } from '@/lib/utils';
import { useStore } from '@/lib/store';

interface AlertsWidgetProps {
  alerts: Alert[];
  currency?: string;
}

export function AlertsWidget({ alerts, currency = 'USD' }: AlertsWidgetProps) {
  const dismissAlert = useStore((s) => s.dismissAlert);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          {alerts.length > 0 && (
            <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-0.5">
              {alerts.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No active alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => {
              const days = daysUntil(alert.renewalDate);
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 ${getAlertUrgencyColor(days)}`}
                >
                  <div>
                    <div className="font-medium text-sm">{alert.subscriptionName}</div>
                    <div className="text-xs opacity-80">
                      Renews {formatDateShort(alert.renewalDate)} &middot; {formatCurrency(alert.amount, currency)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
