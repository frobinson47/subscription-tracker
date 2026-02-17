import type { Subscription } from '@/types';

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export interface DuplicatePair {
  sub1: Subscription;
  sub2: Subscription;
  score: number;
  reason: string;
}

export function findDuplicates(subs: Subscription[], threshold: number = 0.8): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];

  for (let i = 0; i < subs.length; i++) {
    for (let j = i + 1; j < subs.length; j++) {
      const nameA = subs[i].name.trim().toLowerCase();
      const nameB = subs[j].name.trim().toLowerCase();
      const score = similarity(nameA, nameB);

      if (score >= threshold) {
        pairs.push({
          sub1: subs[i],
          sub2: subs[j],
          score,
          reason: score === 1 ? 'Exact name match' : `Names are ${Math.round(score * 100)}% similar`,
        });
      }
    }
  }

  return pairs.sort((a, b) => b.score - a.score);
}

export interface CategoryGroup {
  categoryId: string;
  categoryName: string;
  subs: Subscription[];
  totalMonthly: number;
}

export function findSimilarSubscriptions(
  subs: Subscription[],
  categories: { id: string; name: string }[]
): CategoryGroup[] {
  const active = subs.filter((s) => s.status === 'active' || s.status === 'trial');
  const groups = new Map<string, Subscription[]>();

  for (const sub of active) {
    const existing = groups.get(sub.categoryId) || [];
    existing.push(sub);
    groups.set(sub.categoryId, existing);
  }

  return Array.from(groups.entries())
    .filter(([, groupSubs]) => groupSubs.length >= 3)
    .map(([catId, groupSubs]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        categoryId: catId,
        categoryName: cat?.name ?? 'Unknown',
        subs: groupSubs,
        totalMonthly: 0, // Computed by caller with getEffectiveMonthly
      };
    });
}
