'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Subscription } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useSubscriptions() {
  const subscriptions = useLiveQuery(() => db.subscriptions.toArray()) ?? [];

  const addSubscription = async (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const sub: Subscription = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.subscriptions.add(sub);
    return sub;
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    await db.subscriptions.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteSubscription = async (id: string) => {
    await db.subscriptions.delete(id);
  };

  const getSubscription = async (id: string): Promise<Subscription | undefined> => {
    return db.subscriptions.get(id);
  };

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscription,
  };
}

export function useSubscription(id: string) {
  const subscription = useLiveQuery(() => db.subscriptions.get(id), [id]);
  return subscription;
}
