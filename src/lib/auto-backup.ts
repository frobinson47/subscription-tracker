// Auto-backup via File System Access API
// Stores backup JSON to a user-selected local directory (works with cloud sync folders)

const HANDLE_DB_NAME = 'SubTrackerBackupHandles';
const HANDLE_STORE_NAME = 'handles';
const HANDLE_KEY = 'backupDir';

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// Raw IndexedDB for FileSystemDirectoryHandle storage (Dexie can't serialize these)

async function openHandleDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(HANDLE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(HANDLE_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE_NAME, 'readwrite');
    tx.objectStore(HANDLE_STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openHandleDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE_NAME, 'readonly');
      const request = tx.objectStore(HANDLE_STORE_NAME).get(HANDLE_KEY);
      request.onsuccess = () => { db.close(); resolve(request.result ?? null); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  } catch {
    return null;
  }
}

export async function clearDirectoryHandle(): Promise<void> {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE_NAME, 'readwrite');
    tx.objectStore(HANDLE_STORE_NAME).delete(HANDLE_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function pickBackupDirectory(): Promise<FileSystemDirectoryHandle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
  await storeDirectoryHandle(handle);
  return handle;
}

export async function writeBackup(jsonData: string): Promise<boolean> {
  const handle = await getStoredDirectoryHandle();
  if (!handle) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const permission = await (handle as any).queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request = await (handle as any).requestPermission({ mode: 'readwrite' });
      if (request !== 'granted') return false;
    }

    const fileHandle = await handle.getFileHandle('sub-tracker-backup.json', { create: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writable = await (fileHandle as any).createWritable();
    await writable.write(jsonData);
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

export async function checkBackupStatus(): Promise<{
  configured: boolean;
  hasPermission: boolean;
  dirName: string | null;
}> {
  const handle = await getStoredDirectoryHandle();
  if (!handle) return { configured: false, hasPermission: false, dirName: null };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const permission = await (handle as any).queryPermission({ mode: 'readwrite' });
    return {
      configured: true,
      hasPermission: permission === 'granted',
      dirName: handle.name,
    };
  } catch {
    return { configured: true, hasPermission: false, dirName: handle.name };
  }
}
