import { SQLiteConnection } from '@capacitor-community/sqlite';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { storageService } from '@utils/storage';
import { applyMigrations } from './migrations';
import schema from './initial-schema.sql?raw';
import { insertDefaultCategories } from '../services/category-service';

const DB_NAME = 'personal-reviews-db';
const DB_VERSION = 2;
const DB_VERSION_KEY = 'db_version';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let dbInstance: any = null; // Singleton

export async function openDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const isConn = await sqlite.isConnection(DB_NAME, false);
  if (isConn.result) {
    dbInstance = await sqlite.retrieveConnection(DB_NAME, false);
  } else {    
    dbInstance = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
  }

  if (!dbInstance) {
    throw new Error('Could not create or retrieve SQLite connection.');
  }

  await dbInstance.open();

  const currentVersion = (await storageService.get(DB_VERSION_KEY)) || 0;

  if (currentVersion == 0) {    
    const queries = schema.split(';').map(query => query.trim()).filter(query => query.length > 0);
    
    for (const query of queries) {
        const res = await dbInstance.execute(query);
        if (res.changes?.changes < 0) {
            throw new Error('Error al ejecutar el esquema inicial');
        }
    }

    await insertDefaultCategories(dbInstance);
    await storageService.set(DB_VERSION_KEY, 1);
  }

  if (currentVersion < DB_VERSION) {
    await applyMigrations(dbInstance, currentVersion, DB_VERSION);
    await storageService.set(DB_VERSION_KEY, DB_VERSION);
  }

  return dbInstance;
}
