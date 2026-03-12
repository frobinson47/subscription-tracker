'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useUserPreference<T>(key: string, defaultValue: T): [T, (value: T) => Promise<void>] {
  const record = useLiveQuery(() => db.userPreferences.get(key), [key]);
  const value = (record?.value as T) ?? defaultValue;

  const setValue = useCallback(
    async (newValue: T) => {
      await db.userPreferences.put({ key, value: newValue });
    },
    [key]
  );

  return [value, setValue];
}
