interface CacheRecord<T> {
  key: string;
  value: T;
  updatedAt: number;
}

const DB_NAME = 'intset-demo-cache';
const STORE_NAME = 'kv';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase | null> | null = null;

const openDb = (): Promise<IDBDatabase | null> => {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });

  return dbPromise;
};

export const getCachedValue = async <T>(key: string): Promise<CacheRecord<T> | null> => {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve((request.result as CacheRecord<T>) || null);
    request.onerror = () => resolve(null);
  });
};

export const setCachedValue = async <T>(
  key: string,
  value: T,
  updatedAt = Date.now(),
): Promise<void> => {
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, value, updatedAt });

    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
};

export const isFresh = (updatedAt: number, maxAgeMs: number): boolean => {
  return Date.now() - updatedAt <= maxAgeMs;
};
