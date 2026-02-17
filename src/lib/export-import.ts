import { db } from './db';
import type { ExportData, ImportResult, Subscription } from '@/types';
import Papa from 'papaparse';

// ============ JSON EXPORT/IMPORT ============

export async function exportJSON(): Promise<string> {
  const data: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    subscriptions: await db.subscriptions.toArray(),
    householdMembers: await db.householdMembers.toArray(),
    categories: await db.categories.toArray(),
    settings: await db.settings.get('app'),
  };
  return JSON.stringify(data, null, 2);
}

export async function importJSON(json: string): Promise<ImportResult> {
  const errors: string[] = [];

  let data: ExportData;
  try {
    data = JSON.parse(json);
  } catch {
    return { success: false, subscriptionsImported: 0, membersImported: 0, categoriesImported: 0, errors: ['Invalid JSON'] };
  }

  if (!data.version || !data.subscriptions) {
    return { success: false, subscriptionsImported: 0, membersImported: 0, categoriesImported: 0, errors: ['Invalid export format'] };
  }

  try {
    // Clear and replace
    await db.transaction('rw', [db.subscriptions, db.householdMembers, db.categories, db.settings], async () => {
      await db.subscriptions.clear();
      await db.householdMembers.clear();
      await db.categories.clear();

      if (data.subscriptions?.length) {
        await db.subscriptions.bulkAdd(data.subscriptions);
      }
      if (data.householdMembers?.length) {
        await db.householdMembers.bulkAdd(data.householdMembers);
      }
      if (data.categories?.length) {
        await db.categories.bulkAdd(data.categories);
      }
      if (data.settings) {
        await db.settings.put(data.settings);
      }
    });

    return {
      success: true,
      subscriptionsImported: data.subscriptions?.length ?? 0,
      membersImported: data.householdMembers?.length ?? 0,
      categoriesImported: data.categories?.length ?? 0,
      errors,
    };
  } catch (e) {
    return {
      success: false,
      subscriptionsImported: 0,
      membersImported: 0,
      categoriesImported: 0,
      errors: [`Import failed: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}

// ============ CSV EXPORT/IMPORT ============

const CSV_COLUMNS = [
  'name', 'categoryId', 'tags', 'billingCycle', 'amount', 'currency',
  'taxAmount', 'status', 'nextRenewalDate', 'startDate', 'autoRenew',
  'isShared', 'payerId', 'ownerId', 'notes',
] as const;

export async function exportCSV(): Promise<string> {
  const subs = await db.subscriptions.toArray();

  const rows = subs.map((sub) => ({
    name: sub.name,
    categoryId: sub.categoryId,
    tags: sub.tags.join(';'),
    billingCycle: sub.billingCycle,
    amount: sub.amount,
    currency: sub.currency,
    taxAmount: sub.taxAmount ?? '',
    status: sub.status,
    nextRenewalDate: sub.nextRenewalDate,
    startDate: sub.startDate,
    autoRenew: sub.autoRenew ? 'yes' : 'no',
    isShared: sub.isShared ? 'yes' : 'no',
    payerId: sub.payerId,
    ownerId: sub.ownerId,
    notes: sub.notes ?? '',
  }));

  return Papa.unparse(rows, { columns: [...CSV_COLUMNS] });
}

export async function importCSV(csvString: string): Promise<ImportResult> {
  const errors: string[] = [];

  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });

  if (result.errors.length > 0) {
    return {
      success: false,
      subscriptionsImported: 0,
      membersImported: 0,
      categoriesImported: 0,
      errors: result.errors.map((e) => `Row ${e.row}: ${e.message}`),
    };
  }

  const subs: Subscription[] = [];
  for (const row of result.data as Record<string, string>[]) {
    if (!row.name || !row.amount) {
      errors.push(`Skipping row without name or amount`);
      continue;
    }

    const now = new Date().toISOString();
    subs.push({
      id: crypto.randomUUID(),
      name: row.name,
      categoryId: row.categoryId || '',
      tags: row.tags ? row.tags.split(';').filter(Boolean) : [],
      billingCycle: (row.billingCycle as Subscription['billingCycle']) || 'monthly',
      amount: parseFloat(row.amount) || 0,
      currency: row.currency || 'USD',
      taxAmount: row.taxAmount ? parseFloat(row.taxAmount) : undefined,
      hasIntroPricing: false,
      startDate: row.startDate || new Date().toISOString().split('T')[0],
      nextRenewalDate: row.nextRenewalDate || new Date().toISOString().split('T')[0],
      renewalDayRule: 'exact',
      status: (row.status as Subscription['status']) || 'active',
      autoRenew: row.autoRenew === 'yes',
      cancellationNeeded: false,
      alertDaysBefore: [7, 3, 1],
      payerId: row.payerId || '',
      ownerId: row.ownerId || '',
      userIds: [],
      isShared: row.isShared === 'yes',
      addOns: [],
      priceHistory: [{ date: new Date().toISOString().split('T')[0], amount: parseFloat(row.amount) || 0 }],
      notes: row.notes || undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  try {
    await db.subscriptions.bulkAdd(subs);
    return {
      success: true,
      subscriptionsImported: subs.length,
      membersImported: 0,
      categoriesImported: 0,
      errors,
    };
  } catch (e) {
    return {
      success: false,
      subscriptionsImported: 0,
      membersImported: 0,
      categoriesImported: 0,
      errors: [`CSV import failed: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}

// ============ FILE DOWNLOAD HELPER ============

export function downloadFile(content: string, filename: string, mimeType: string = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
