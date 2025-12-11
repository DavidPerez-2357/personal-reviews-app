import { SQLiteDBConnection } from "@capacitor-community/sqlite";

// Example migration function
async function migration_2(db: SQLiteDBConnection) {
    await db.execute('ALTER TABLE item ADD COLUMN is_origin BOOLEAN DEFAULT 0');
}

// Export the migration function
export { migration_2 };