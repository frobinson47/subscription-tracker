'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { seedDatabase } from '@/lib/db-seed';
import { checkIndexedDBAvailability } from '@/lib/utils';

export function DBProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkIndexedDBAvailability()) {
      setError(
        'This app requires IndexedDB to store your data. Please ensure you are not in private/incognito mode and that storage is enabled.'
      );
      return;
    }

    seedDatabase()
      .then(() => setReady(true))
      .catch((e) => {
        setError(`Failed to initialize database: ${e instanceof Error ? e.message : String(e)}`);
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold text-destructive">Storage Unavailable</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
