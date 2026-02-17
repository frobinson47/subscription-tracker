'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get('app'));

  const updateSettings = async (updates: Partial<AppSettings>) => {
    await db.settings.update('app', updates);
  };

  const resetSettings = async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS });
  };

  const resolved: AppSettings = settings ?? {
    ...DEFAULT_SETTINGS,
    pinVerifyHash: undefined,
    pinVerifySalt: undefined,
    pinEncryptSalt: undefined,
    lastBackupDate: undefined,
  };

  return {
    settings: resolved,
    updateSettings,
    resetSettings,
  };
}
