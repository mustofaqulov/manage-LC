/**
 * IndexedDB audio store
 * Imtihon yozuvlarini brauzerda saqlash — History sahifasi backend'siz yuklasin
 */

const DB_NAME = 'manage-lc-audio';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('attemptId', 'attemptId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

export const saveRecording = async (
  attemptId: string,
  index: number,
  blob: Blob,
): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id: `${attemptId}-${index}`, attemptId, index, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getRecordingsForAttempt = async (
  attemptId: string,
): Promise<{ index: number; blob: Blob }[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).index('attemptId').getAll(attemptId);
    req.onsuccess = () => {
      const rows = (req.result as { index: number; blob: Blob }[]);
      resolve(rows.sort((a, b) => a.index - b.index));
    };
    req.onerror = () => reject(req.error);
  });
};
