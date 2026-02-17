'use client';

import { useState, useMemo } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isSameDay,
} from 'date-fns';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useCategories } from '@/hooks/use-categories';
import { useSettings } from '@/hooks/use-settings';
import { getCashflowEntries, getMonthTotal } from '@/lib/renewal-engine';
import { formatCurrency } from '@/lib/calculations';
import { formatDateShort } from '@/lib/utils';
import { CATEGORY_FALLBACK_COLOR } from '@/lib/constants';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions();
  const { categories } = useCategories();
  const { settings } = useSettings();

  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.color ?? CATEGORY_FALLBACK_COLOR);
    }
    return map;
  }, [categories]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const entries = useMemo(
    () => getCashflowEntries(subscriptions, monthStart, monthEnd),
    [subscriptions, monthStart, monthEnd]
  );

  const monthTotal = getMonthTotal(entries);

  // Average monthly for "big hit" detection
  const avgMonthly = useMemo(() => {
    let total = 0;
    let months = 0;
    for (let i = -5; i <= 0; i++) {
      const ms = startOfMonth(addMonths(new Date(), i));
      const me = endOfMonth(ms);
      const e = getCashflowEntries(subscriptions, ms, me);
      total += getMonthTotal(e);
      months++;
    }
    return months > 0 ? total / months : 0;
  }, [subscriptions]);

  const isBigHitMonth = avgMonthly > 0 && monthTotal > avgMonthly * 1.5;

  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const entry of entries) {
      const key = entry.date;
      const existing = map.get(key) || [];
      existing.push(entry);
      map.set(key, existing);
    }
    return map;
  }, [entries]);

  const selectedEntries = selectedDate
    ? entriesByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  return (
    <>
      <Header title="Calendar" />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] gap-6">
        {/* Calendar Grid */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(monthTotal, settings.defaultCurrency)} in renewals
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {isBigHitMonth && (
                <div className="flex items-center gap-2 mt-2 text-orange-600 bg-orange-50 dark:bg-orange-950 rounded-md px-3 py-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Big hit month! {formatCurrency(monthTotal, settings.defaultCurrency)} is significantly above average.
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 border-t border-l border-border">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2 border-r border-b border-border">
                    {day}
                  </div>
                ))}
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="border-r border-b border-border" />
                ))}
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayEntries = entriesByDate.get(dateStr) || [];
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(day)}
                      className={`relative p-2 text-sm transition-colors min-h-[60px] text-left border-r border-b border-border
                        ${isSelected ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-accent'}
                        ${isToday ? 'font-bold' : ''}
                      `}
                    >
                      <span className={isToday ? 'text-primary' : ''}>{format(day, 'd')}</span>
                      {dayEntries.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap">
                          {dayEntries.slice(0, 3).map((e, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: categoryColorMap.get(e.categoryId) ?? CATEGORY_FALLBACK_COLOR }}
                            />
                          ))}
                          {dayEntries.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{dayEntries.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{format(selectedDate, 'EEEE, MMMM d')}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No renewals on this day</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEntries.map((entry, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span>{entry.subscriptionName}</span>
                        <span className="font-medium">{formatCurrency(entry.amount, settings.defaultCurrency)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between text-sm font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(getMonthTotal(selectedEntries), settings.defaultCurrency)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Renewals This Month</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No renewals this month</p>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{entry.subscriptionName}</span>
                        <span className="text-muted-foreground ml-2">{formatDateShort(entry.date)}</span>
                      </div>
                      <span>{formatCurrency(entry.amount, settings.defaultCurrency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
