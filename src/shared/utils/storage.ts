import { Storage } from '@ionic/storage';

const storage = new Storage();
let storageReady: Promise<void> | null = null;

function ensureStorageReady() {
  if (!storageReady) {
    storageReady = storage.create().then(() => {});
  }
  return storageReady;
}

export const storageService = {
  async get(key: string): Promise<any> {
    await ensureStorageReady();
    return storage.get(key);
  },
  async set(key: string, value: any): Promise<void> {
    await ensureStorageReady();
    await storage.set(key, value);
  }
};
