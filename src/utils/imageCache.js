// IndexedDB utility for caching image data URLs
const DB_NAME = 'image-cache-db';
const STORE_NAME = 'images';
const DB_VERSION = 1;

/**
 * Opens the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves an image data URL to IndexedDB
 * @param {string} key - Unique identifier for the image (e.g., imageName)
 * @param {string} dataUrl - The base64 data URL of the image
 * @returns {Promise<void>}
 */
export async function saveImageData(key, dataUrl) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.put(dataUrl, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log(`Image cached in IndexedDB: ${key}`);
  } catch (error) {
    console.error('Error saving image to IndexedDB:', error);
  }
}

/**
 * Retrieves an image data URL from IndexedDB
 * @param {string} key - Unique identifier for the image
 * @returns {Promise<string|null>}
 */
export async function getImageData(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error retrieving image from IndexedDB:', error);
    return null;
  }
}

/**
 * Deletes an image from IndexedDB
 * @param {string} key - Unique identifier for the image
 * @returns {Promise<void>}
 */
export async function deleteImageData(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log(`Image deleted from IndexedDB: ${key}`);
  } catch (error) {
    console.error('Error deleting image from IndexedDB:', error);
  }
}

/**
 * Clears all images from IndexedDB
 * @returns {Promise<void>}
 */
export async function clearAllImages() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('All images cleared from IndexedDB');
  } catch (error) {
    console.error('Error clearing images from IndexedDB:', error);
  }
}
