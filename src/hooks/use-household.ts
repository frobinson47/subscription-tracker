'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { HouseholdMember } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useHousehold() {
  const members = useLiveQuery(() => db.householdMembers.toArray()) ?? [];

  const addMember = async (data: Omit<HouseholdMember, 'id' | 'createdAt'>) => {
    const member: HouseholdMember = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await db.householdMembers.add(member);
    return member;
  };

  const updateMember = async (id: string, updates: Partial<HouseholdMember>) => {
    await db.householdMembers.update(id, updates);
  };

  const deleteMember = async (id: string) => {
    await db.householdMembers.delete(id);
  };

  return { members, addMember, updateMember, deleteMember };
}
