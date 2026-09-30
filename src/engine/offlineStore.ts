import { PHC, StockRecord, Alert } from '../types';

const DB_NAME = 'AegisHealthDB';
const DB_VERSION = 1;

export interface OfflineSyncItem {
  id: string;
  type: 'voice_report' | 'vision_report' | 'stock_update';
  phcId: string;
  payload: any;
  timestamp: string;
  synced: boolean;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('phcs')) {
        db.createObjectStore('phcs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stockRecords')) {
        db.createObjectStore('stockRecords', { keyPath: 'phcId' });
      }
      if (!db.objectStoreNames.contains('alerts')) {
        db.createObjectStore('alerts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offlineSyncQueue')) {
        db.createObjectStore('offlineSyncQueue', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 1. Save PHCs to IndexedDB
export async function savePhcsToDB(phcs: PHC[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('phcs', 'readwrite');
    const store = tx.objectStore('phcs');
    phcs.forEach((p) => store.put(p));
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.error('[IndexedDB Quota Exceeded] Storage quota full!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('idb-quota-exceeded', { detail: 'Browser storage quota full! Clear site data.' }));
      }
    } else {
      console.warn('Failed to save PHCs to IndexedDB:', err);
    }
  }
}

// 2. Load PHCs from IndexedDB
export async function getPhcsFromDB(): Promise<PHC[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('phcs', 'readonly');
      const store = tx.objectStore('phcs');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get PHCs from IndexedDB:', err);
    return [];
  }
}

// 3. Save Stock Records to IndexedDB
export async function saveStockRecordsToDB(records: Record<string, StockRecord>): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('stockRecords', 'readwrite');
    const store = tx.objectStore('stockRecords');
    Object.values(records).forEach((r) => store.put(r));
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.error('[IndexedDB Quota Exceeded] Storage quota full!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('idb-quota-exceeded', { detail: 'Browser storage quota full! Clear site data.' }));
      }
    } else {
      console.warn('Failed to save stock records to IndexedDB:', err);
    }
  }
}

// 4. Load Stock Records from IndexedDB
export async function getStockRecordsFromDB(): Promise<Record<string, StockRecord>> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('stockRecords', 'readonly');
      const store = tx.objectStore('stockRecords');
      const request = store.getAll();
      request.onsuccess = () => {
        const list: StockRecord[] = request.result || [];
        const recordMap: Record<string, StockRecord> = {};
        list.forEach((item) => {
          recordMap[item.phcId] = item;
        });
        resolve(recordMap);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to get stock records from IndexedDB:', err);
    return {};
  }
}

// 5. Queue Offline Sync Updates
export async function queueSyncItem(item: OfflineSyncItem): Promise<string> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('offlineSyncQueue', 'readwrite');
    const store = tx.objectStore('offlineSyncQueue');
    store.put(item);
    return item.id;
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.error('[IndexedDB Quota Exceeded] Storage quota full!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('idb-quota-exceeded', { detail: 'Browser storage quota full! Clear site data.' }));
      }
    } else {
      console.warn('Failed to queue sync item:', err);
    }
    return item.id;
  }
}

export async function queueOfflineReport(item: Omit<OfflineSyncItem, 'id' | 'timestamp' | 'synced'>): Promise<string> {
  const syncItem: OfflineSyncItem = {
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  return queueSyncItem(syncItem);
}

// 6. Flush Offline Sync Queue on Reconnect
export async function flushSyncQueue(): Promise<{ syncedCount: number; remainingCount: number }> {
  try {
    const db = await openDatabase();
    const items: OfflineSyncItem[] = await new Promise((resolve, reject) => {
      const tx = db.transaction('offlineSyncQueue', 'readonly');
      const store = tx.objectStore('offlineSyncQueue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const unsynced = items.filter((i) => !i.synced);
    if (unsynced.length === 0) return { syncedCount: 0, remainingCount: 0 };

    let syncedCount = 0;
    for (const item of unsynced) {
      try {
        let endpoint = '/api/gemini/voice-report';
        if (item.type === 'vision_report') endpoint = '/api/gemini/stock-photo';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          syncedCount++;
          const deleteTx = db.transaction('offlineSyncQueue', 'readwrite');
          deleteTx.objectStore('offlineSyncQueue').delete(item.id);
        }
      } catch (err) {
        console.warn(`[Sync Queue] Item ${item.id} failed to sync:`, err);
      }
    }

    const remainingCount = unsynced.length - syncedCount;
    return { syncedCount, remainingCount };
  } catch (err) {
    console.warn('Failed to flush offline sync queue:', err);
    return { syncedCount: 0, remainingCount: 0 };
  }
}

// 7. Get Pending Sync Items Count
export async function getPendingSyncCount(): Promise<number> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offlineSyncQueue', 'readonly');
      const store = tx.objectStore('offlineSyncQueue');
      const request = store.count();
      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return 0;
  }
}

// Auto-flush when browser comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Store] Network restored. Flushing pending sync items...');
    flushSyncQueue();
  });
  setTimeout(() => flushSyncQueue(), 2500);
}
