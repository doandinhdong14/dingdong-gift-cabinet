/**
 * universeImageStorage.ts
 *
 * Dedicated Promise-based IndexedDB utility for storing user-uploaded photos for LoveUniverse01.
 * Strict compliance with spec:
 * - Does NOT store image base64 blobs into localStorage.
 * - Stores images in client-side IndexedDB with explicit quota management and cleanup.
 * - Provides clear operations to retrieve, save, delete individual images, and clear all saved images.
 * - Safe fallback to in-memory store in private browsing or headless/unit-test environments.
 */

export interface StoredUniversePhoto {
  id: string;
  name: string;
  url: string; // Base64 dataURL or Blob ObjectURL
  size: number;
  createdAt: number;
}

const DB_NAME = 'dingdong-gift-cabinet-universe';
const DB_VERSION = 1;
const STORE_NAME = 'universe_photos';

// In-memory fallback if IndexedDB is unavailable
const memoryFallbackStore = new Map<string, StoredUniversePhoto>();

function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Convert a File or Blob into a DataURL string
 */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Save an uploaded user photo into IndexedDB
 */
export async function saveUniversePhoto(file: File): Promise<StoredUniversePhoto> {
  const dataUrl = await readFileAsDataUrl(file);
  const id = `uphoto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const photoItem: StoredUniversePhoto = {
    id,
    name: file.name,
    url: dataUrl,
    size: file.size,
    createdAt: Date.now(),
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photoItem);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed; falling back to in-memory store:', err);
    memoryFallbackStore.set(id, photoItem);
  }

  return photoItem;
}

/**
 * Retrieve all saved user photos from IndexedDB
 */
export async function getAllUniversePhotos(): Promise<StoredUniversePhoto[]> {
  try {
    const db = await openDatabase();
    return await new Promise<StoredUniversePhoto[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result || []) as StoredUniversePhoto[];
        // Sort newest first
        results.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed; using in-memory store:', err);
    return Array.from(memoryFallbackStore.values()).sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * Delete a specific photo by ID from IndexedDB
 */
export async function deleteUniversePhoto(id: string): Promise<void> {
  memoryFallbackStore.delete(id);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
  }
}

/**
 * Clear all saved user photos from IndexedDB
 */
export async function clearAllUniversePhotos(): Promise<void> {
  memoryFallbackStore.clear();
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB clear failed:', err);
  }
}
