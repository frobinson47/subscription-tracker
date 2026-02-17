import type { AlertTiming, BillingCycle, Category } from '@/types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Streaming', icon: 'tv', color: '#EF4444', isDefault: true, sortOrder: 0 },
  { name: 'Music', icon: 'music', color: '#8B5CF6', isDefault: true, sortOrder: 1 },
  { name: 'Gaming', icon: 'gamepad-2', color: '#22C55E', isDefault: true, sortOrder: 2 },
  { name: 'Cloud Storage', icon: 'cloud', color: '#0EA5E9', isDefault: true, sortOrder: 3 },
  { name: 'Software', icon: 'code', color: '#6366F1', isDefault: true, sortOrder: 4 },
  { name: 'News & Reading', icon: 'newspaper', color: '#F59E0B', isDefault: true, sortOrder: 5 },
  { name: 'Fitness', icon: 'dumbbell', color: '#F97316', isDefault: true, sortOrder: 6 },
  { name: 'Home & Utilities', icon: 'home', color: '#14B8A6', isDefault: true, sortOrder: 7 },
  { name: 'Security', icon: 'shield', color: '#64748B', isDefault: true, sortOrder: 8 },
  { name: 'Kids & Family', icon: 'baby', color: '#EC4899', isDefault: true, sortOrder: 9 },
  { name: 'Work & Productivity', icon: 'briefcase', color: '#3B82F6', isDefault: true, sortOrder: 10 },
  { name: 'Other', icon: 'package', color: '#9CA3AF', isDefault: true, sortOrder: 11 },
];

export const CATEGORY_FALLBACK_COLOR = '#9CA3AF';

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly (every 3 months)',
  biannual: 'Biannual (every 6 months)',
  annual: 'Annual (yearly)',
  custom: 'Custom',
};

export const ALERT_TIMING_OPTIONS: { value: AlertTiming; label: string }[] = [
  { value: 30, label: '30 days before' },
  { value: 14, label: '14 days before' },
  { value: 7, label: '7 days before' },
  { value: 3, label: '3 days before' },
  { value: 1, label: '1 day before' },
];

export const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trial: 'Trial',
  paused: 'Paused',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  trial: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const USAGE_LABELS: Record<string, string> = {
  within7: 'Used this week',
  within30: 'Used this month',
  within90: 'Used in last 3 months',
  over90: 'Not used in 90+ days',
  never: 'Never used',
};

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20AC)' },
  { value: 'GBP', label: 'GBP (\u00A3)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'JPY', label: 'JPY (\u00A5)' },
];

export const DEFAULT_SETTINGS = {
  id: 'app' as const,
  defaultCurrency: 'USD',
  defaultAlertDays: [7, 3, 1] as AlertTiming[],
  escalationThreshold: 50, // $50/mo effective cost triggers 30-day alert
  theme: 'system' as const,
};

export const AVG_DAYS_PER_MONTH = 30.436875; // 365.2425 / 12

export const AVATAR_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
];
