// ============ ENUMS / UNIONS ============

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom';
export type SubStatus = 'active' | 'trial' | 'paused' | 'on_hold' | 'cancelled';
export type UsageRecency = 'within7' | 'within30' | 'within90' | 'over90' | 'never';
export type CancelMethod = 'website' | 'phone' | 'chat' | 'email';
export type AlertTiming = 1 | 3 | 7 | 14 | 30;
export type HouseholdRole = 'admin' | 'member';
export type RenewalDayRule = 'exact' | 'lastDayOfMonth' | 'nextBusinessDay';

// ============ CORE ENTITIES ============

export interface AddOn {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  customCycleDays?: number;
}

export interface PriceEntry {
  date: string; // YYYY-MM-DD
  amount: number;
  note?: string;
}

export interface Subscription {
  id: string;
  name: string;
  logoUrl?: string;

  // Classification
  categoryId: string;
  tags: string[];

  // Billing
  billingCycle: BillingCycle;
  customCycleDays?: number;
  amount: number;
  currency: string;
  taxAmount?: number;

  // Intro/trial pricing
  hasIntroPricing: boolean;
  introPrice?: number;
  introDurationDays?: number;
  introEndDate?: string; // YYYY-MM-DD

  // Dates & renewal
  startDate: string; // YYYY-MM-DD
  nextRenewalDate: string; // YYYY-MM-DD
  renewalDayRule: RenewalDayRule;

  // Status & auto-renew
  status: SubStatus;
  autoRenew: boolean;
  cancellationNeeded: boolean;

  // Alert configuration
  alertDaysBefore: AlertTiming[];
  alertSnoozedUntil?: string; // YYYY-MM-DD

  // Household
  payerId: string;
  ownerId: string;
  managerId?: string;
  userIds: string[];
  isShared: boolean;
  seatCount?: number;
  costPerSeat?: number;

  // Cancellation workflow
  cancelUrl?: string;
  cancelMethod?: CancelMethod;
  cancelDeadlineDays?: number;
  cancellationChecklist?: string[];
  cancellationProofBlobId?: string;

  // Value assessment
  lastUsed?: UsageRecency;
  valueScore?: 1 | 2 | 3 | 4 | 5;
  wouldMiss?: boolean;

  // Add-ons
  addOns: AddOn[];

  // Price history
  priceHistory: PriceEntry[];

  // Notes
  notes?: string;
  sensitiveNotes?: string; // AES-GCM encrypted

  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: HouseholdRole;
  avatarColor: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex color for dot/pill
  isDefault: boolean;
  sortOrder: number;
}

export interface AlertRecord {
  id: string;
  subscriptionId: string;
  renewalDate: string;
  daysBefore: AlertTiming;
  dismissed: boolean;
  snoozedUntil?: string;
}

export interface AppSettings {
  id: string; // always 'app'
  defaultCurrency: string;
  defaultAlertDays: AlertTiming[];
  escalationThreshold: number; // monthly cost above which to auto-add 30-day alert
  pinVerifyHash?: string;
  pinVerifySalt?: string;
  pinEncryptSalt?: string;
  theme: 'light' | 'dark' | 'system';
  lastBackupDate?: string;
}

// ============ COMPUTED / UI TYPES ============

export interface Alert {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  renewalDate: string;
  amount: number;
  effectiveMonthly: number;
  daysBefore: number;
  alertDate: string;
  dismissed: boolean;
  snoozedUntil?: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  totalMonthly: number;
  count: number;
  percentage: number;
}

export interface CashflowEntry {
  date: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  categoryId: string;
}

export interface ImportResult {
  success: boolean;
  subscriptionsImported: number;
  membersImported: number;
  categoriesImported: number;
  errors: string[];
}

export interface ExportData {
  version: number;
  exportDate: string;
  subscriptions: Subscription[];
  householdMembers: HouseholdMember[];
  categories: Category[];
  settings: AppSettings | undefined;
}
