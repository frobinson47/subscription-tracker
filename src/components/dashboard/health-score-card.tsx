'use client';

import { useMemo, useState } from 'react';
import { Activity, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Subscription, Category, AppSettings } from '@/types';
import {
  calculateHealthScore,
  getScoreColor,
  getScoreLabel,
  getProgressColor,
} from '@/lib/health-score';

interface HealthScoreCardProps {
  subscriptions: Subscription[];
  categories: Category[];
  settings: AppSettings;
}

export function HealthScoreCard({ subscriptions, categories, settings }: HealthScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  const health = useMemo(
    () => calculateHealthScore(subscriptions, categories, settings),
    [subscriptions, categories, settings]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subscription Health
            </CardTitle>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? 'Less' : 'Details'}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main score */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(health.total)}`}>
              {health.total}
            </span>
            <span className="text-sm text-muted-foreground">
              / 100 &middot; {getScoreLabel(health.total)}
            </span>
          </div>
          <Progress value={health.total} className="h-2.5" />
        </div>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="space-y-3 pt-2 border-t">
            {health.breakdown.map((dim) => (
              <div key={dim.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{dim.category}</span>
                  <span className="text-muted-foreground">
                    {dim.score}/{dim.maxScore}
                  </span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressColor(dim.score, dim.maxScore)}`}
                    style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                  />
                </div>
                {dim.issues.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-0.5 pl-3">
                    {dim.issues.map((issue, i) => (
                      <li key={i} className="list-disc">{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick wins */}
        {health.quickWins.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" />
              Quick wins
            </div>
            <ul className="space-y-1">
              {health.quickWins.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-snug">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
