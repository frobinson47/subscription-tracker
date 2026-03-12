import Dexie, { type EntityTable } from 'dexie';
import type { Subscription, HouseholdMember, Category, AppSettings, AlertRecord, UserPreference } from '@/types';

class SubTrackerDB extends Dexie {
  subscriptions!: EntityTable<Subscription, 'id'>;
  householdMembers!: EntityTable<HouseholdMember, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;
  alertRecords!: EntityTable<AlertRecord, 'id'>;
  userPreferences!: EntityTable<UserPreference, 'key'>;

  constructor() {
    super('SubTrackerDB');

    this.version(1).stores({
      subscriptions: 'id, name, categoryId, status, nextRenewalDate, payerId, ownerId',
      householdMembers: 'id, name',
      categories: 'id, name, sortOrder',
      settings: 'id',
      alertRecords: 'id, subscriptionId, renewalDate',
    });

    // v2: adds color to categories, avatarUrl to householdMembers (no index changes needed)
    this.version(2).stores({
      subscriptions: 'id, name, categoryId, status, nextRenewalDate, payerId, ownerId',
      householdMembers: 'id, name',
      categories: 'id, name, sortOrder',
      settings: 'id',
      alertRecords: 'id, subscriptionId, renewalDate',
    }).upgrade(async (tx) => {
      // Backfill color on existing categories
      const { DEFAULT_CATEGORIES } = await import('./constants');
      await tx.table('categories').toCollection().modify((cat: Record<string, unknown>) => {
        if (!cat.color) {
          const match = DEFAULT_CATEGORIES.find((dc) => dc.name === cat.name);
          cat.color = match?.color ?? '#9CA3AF';
        }
      });
    });

    // v3: add userPreferences table
    this.version(3).stores({
      subscriptions: 'id, name, categoryId, status, nextRenewalDate, payerId, ownerId',
      householdMembers: 'id, name',
      categories: 'id, name, sortOrder',
      settings: 'id',
      alertRecords: 'id, subscriptionId, renewalDate',
      userPreferences: 'key',
    });
  }
}

export const db = new SubTrackerDB();
