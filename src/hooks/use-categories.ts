'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Category } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray()) ?? [];

  const addCategory = async (data: Omit<Category, 'id'>) => {
    const cat: Category = { ...data, id: uuidv4() };
    await db.categories.add(cat);
    return cat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await db.categories.update(id, updates);
  };

  const deleteCategory = async (id: string) => {
    await db.categories.delete(id);
  };

  return { categories, addCategory, updateCategory, deleteCategory };
}
