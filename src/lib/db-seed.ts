import { db } from './db';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './constants';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      id: uuidv4(),
    }));
    await db.categories.bulkAdd(categories);
  }

  const settings = await db.settings.get('app');
  if (!settings) {
    await db.settings.add({ ...DEFAULT_SETTINGS });
  }
}
