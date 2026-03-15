import type { Subscription, Category, AppSettings } from '@/types';
import { getCurrentEffectiveMonthly, formatCurrency } from '@/lib/calculations';
import { findDuplicates, findSimilarSubscriptions } from '@/lib/duplicate-detection';

export interface HealthDetail {
  category: string;
  score: number;
  maxScore: number;
  issues: string[];
  suggestions: string[];
}

export interface HealthScore {
  total: number;          // 0-100
  utilization: number;    // 0-40
  efficiency: number;     // 0-25
  awareness: number;      // 0-20
  flexibility: number;    // 0-15
  breakdown: HealthDetail[];
  quickWins: string[];    // top 3 actionable suggestions
}

export function calculateHealthScore(
  subs: Subscription[],
  categories: Category[],
  settings: AppSettings
): HealthScore {
  const active = subs.filter(s => s.status === 'active' || s.status === 'trial');

  if (active.length === 0) {
    return {
      total: 100, utilization: 40, efficiency: 25, awareness: 20, flexibility: 15,
      breakdown: [
        { category: 'Utilization', score: 40, maxScore: 40, issues: [], suggestions: [] },
        { category: 'Efficiency', score: 25, maxScore: 25, issues: [], suggestions: [] },
        { category: 'Awareness', score: 20, maxScore: 20, issues: [], suggestions: [] },
        { category: 'Flexibility', score: 15, maxScore: 15, issues: [], suggestions: [] },
      ],
      quickWins: [],
    };
  }

  // === UTILIZATION (0-40) ===
  let utilizationScore = 40;
  const utilizationIssues: string[] = [];
  const utilizationSuggestions: string[] = [];

  for (const sub of active) {
    const monthly = getCurrentEffectiveMonthly(sub);

    if (sub.lastUsed === 'never' || sub.lastUsed === 'over90') {
      const penalty = monthly > 20 ? 5 : 3;
      utilizationScore -= penalty;
      utilizationIssues.push(`${sub.name} hasn't been used recently`);
      utilizationSuggestions.push(`Review ${sub.name} — ${formatCurrency(monthly, sub.currency)}/mo unused`);
    }

    if ((sub.valueScore ?? 5) <= 2 && monthly > 10) {
      utilizationScore -= 3;
      utilizationIssues.push(`${sub.name} rated low value at ${formatCurrency(monthly, sub.currency)}/mo`);
      utilizationSuggestions.push(`Consider cancelling ${sub.name} (rated ${sub.valueScore}/5)`);
    }
  }
  utilizationScore = Math.max(0, utilizationScore);

  // === EFFICIENCY (0-25) ===
  let efficiencyScore = 25;
  const efficiencyIssues: string[] = [];
  const efficiencySuggestions: string[] = [];

  const dupes = findDuplicates(active);
  efficiencyScore -= dupes.length * 5;
  dupes.forEach(d => {
    efficiencyIssues.push(`${d.sub1.name} & ${d.sub2.name} may be duplicates`);
    efficiencySuggestions.push(`Review "${d.sub1.name}" and "${d.sub2.name}" for overlap`);
  });

  const overlaps = findSimilarSubscriptions(active, categories);
  efficiencyScore -= overlaps.length * 3;
  overlaps.forEach(g => {
    efficiencyIssues.push(`${g.subs.length} subscriptions in ${g.categoryName}`);
    efficiencySuggestions.push(`${g.subs.length} subs in ${g.categoryName} — consolidate?`);
  });
  efficiencyScore = Math.max(0, efficiencyScore);

  // === AWARENESS (0-20) ===
  let awarenessScore = 20;
  const awarenessIssues: string[] = [];
  const awarenessSuggestions: string[] = [];

  const subsWithoutUsage = active.filter(s => !s.lastUsed);
  if (subsWithoutUsage.length > active.length * 0.5) {
    awarenessScore -= 8;
    awarenessIssues.push(`${subsWithoutUsage.length} subscriptions without usage tracking`);
    awarenessSuggestions.push(`Set "Last Used" on ${subsWithoutUsage.length} subscriptions`);
  }

  const subsWithoutAlerts = active.filter(s => !s.alertDaysBefore?.length);
  if (subsWithoutAlerts.length > active.length * 0.3) {
    awarenessScore -= 6;
    awarenessIssues.push(`${subsWithoutAlerts.length} subscriptions without alerts`);
    awarenessSuggestions.push(`Add renewal alerts to ${subsWithoutAlerts.length} subscriptions`);
  }

  const subsWithoutCategory = active.filter(s => !s.categoryId);
  if (subsWithoutCategory.length > 0) {
    awarenessScore -= 3;
    awarenessIssues.push(`${subsWithoutCategory.length} uncategorized subscriptions`);
    awarenessSuggestions.push(`Categorize ${subsWithoutCategory.length} subscriptions`);
  }

  if (!settings.lastBackupDate) {
    awarenessScore -= 3;
    awarenessIssues.push('No data backup on record');
    awarenessSuggestions.push('Export a backup in Settings');
  }
  awarenessScore = Math.max(0, awarenessScore);

  // === FLEXIBILITY (0-15) ===
  let flexibilityScore = 15;
  const flexibilityIssues: string[] = [];
  const flexibilitySuggestions: string[] = [];

  const annualSubs = active.filter(s => s.billingCycle === 'annual');
  const annualRatio = annualSubs.length / Math.max(active.length, 1);

  if (annualRatio > 0.75) {
    flexibilityScore -= 10;
    flexibilityIssues.push('Over 75% of subscriptions are annual');
    flexibilitySuggestions.push('Consider monthly plans for services you might cancel');
  } else if (annualRatio > 0.5) {
    flexibilityScore -= 5;
    flexibilityIssues.push('Over 50% of subscriptions are annual');
  }

  const expensiveWithoutCancel = active
    .filter(s => getCurrentEffectiveMonthly(s) > 15 && !s.cancelUrl && !s.cancelMethod);
  flexibilityScore -= Math.min(5, expensiveWithoutCancel.length * 2);
  if (expensiveWithoutCancel.length > 0) {
    flexibilityIssues.push(`${expensiveWithoutCancel.length} expensive subs missing cancel info`);
    flexibilitySuggestions.push(`Add cancellation info for ${expensiveWithoutCancel.length} expensive subscriptions`);
  }
  flexibilityScore = Math.max(0, flexibilityScore);

  // Collect quick wins (top 3 most impactful suggestions)
  const allSuggestions = [
    ...utilizationSuggestions,
    ...efficiencySuggestions,
    ...awarenessSuggestions,
    ...flexibilitySuggestions,
  ];

  return {
    total: utilizationScore + efficiencyScore + awarenessScore + flexibilityScore,
    utilization: utilizationScore,
    efficiency: efficiencyScore,
    awareness: awarenessScore,
    flexibility: flexibilityScore,
    breakdown: [
      { category: 'Utilization', score: utilizationScore, maxScore: 40,
        issues: utilizationIssues, suggestions: utilizationSuggestions },
      { category: 'Efficiency', score: efficiencyScore, maxScore: 25,
        issues: efficiencyIssues, suggestions: efficiencySuggestions },
      { category: 'Awareness', score: awarenessScore, maxScore: 20,
        issues: awarenessIssues, suggestions: awarenessSuggestions },
      { category: 'Flexibility', score: flexibilityScore, maxScore: 15,
        issues: flexibilityIssues, suggestions: flexibilitySuggestions },
    ],
    quickWins: allSuggestions.slice(0, 3),
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

export function getProgressColor(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-yellow-500';
  if (pct >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}
