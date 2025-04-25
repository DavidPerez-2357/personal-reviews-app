import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";

export let sqliteConnection: SQLiteConnection | null = null;
export let db: SQLiteDBConnection | null = null;

/**
 * Inicializa la base de datos SQLite y crea las tablas necesarias.
 * @returns Promise<void>
 */
export const initDB = async () => {
    try {
        sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        db = await sqliteConnection.createConnection("personal-reviews2", false, "no-encryption", 1, false);

        if (!db) {
            throw new Error("No se pudo crear la conexión a SQLite.");
        }

        await db.open();

        const queries = [
            `CREATE TABLE IF NOT EXISTS category (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 "name" TEXT NOT NULL,
                 "type" INTEGER NOT NULL DEFAULT 0,
                 color CHAR(7) NOT NULL CHECK (color LIKE '#______'),
                icon VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                parent_id INTEGER,
                FOREIGN KEY (parent_id) REFERENCES category(id) ON DELETE SET NULL
                );`,
            `CREATE TABLE IF NOT EXISTS item (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 "name" TEXT NOT NULL,
                 image TEXT,
                 rating INTEGER CHECK (rating BETWEEN 0 AND 5),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                category_id INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
                );`,
            `CREATE TABLE IF NOT EXISTS origin_item (
                origin_id INTEGER NOT NULL,
                item_id INTEGER NOT NULL,
                PRIMARY KEY (origin_id, item_id),
                FOREIGN KEY (origin_id) REFERENCES item(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE
                );`,
            `CREATE TABLE IF NOT EXISTS review (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                item_id INTEGER NOT NULL,
                FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE
                );`,
            `CREATE TABLE IF NOT EXISTS review_image (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             image TEXT NOT NULL,
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             review_id INTEGER NOT NULL,
             FOREIGN KEY (review_id) REFERENCES review(id) ON DELETE CASCADE
                );`,
            `CREATE TABLE IF NOT EXISTS category_rating (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                "name" TEXT NOT NULL,
                "value" INTEGER NOT NULL CHECK (value BETWEEN 0 AND 100),
                category_id INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
                );`,
            `CREATE TABLE IF NOT EXISTS category_rating_value (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  "value" INTEGER NOT NULL CHECK (value BETWEEN 0 AND 100),
                item_id INTEGER NOT NULL,
                category_rating_id INTEGER NOT NULL,
                FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
                FOREIGN KEY (category_rating_id) REFERENCES category_rating(id) ON DELETE CASCADE
                );`
        ];

        await db.executeSet(queries.map(query => ({ statement: query, values: [] })));
        console.log("✅ Base de datos inicializada correctamente.");
    } catch (error) {
        console.error("❌ Error al iniciar la base de datos:", error);
    }
};

/**
 * Verifica si la base de datos está inicializada.
 * @returns boolean
 */
export const checkDB = (): boolean => {
    if (!db) {
        console.error("❌ La base de datos no está inicializada.");
        return false;
    }
    return true;
};

/**
 * Reinicia el contador AUTOINCREMENT de una tabla específica.
 * IMPORTANTE: solo reinicia si la tabla está vacía o los datos no importan.
 * @param tableName El nombre de la tabla a reiniciar
 */
export const resetAutoIncrement = async (tableName: string): Promise<void> => {
    if (!checkDB()) return;

    try {
        await db!.execute(`DELETE FROM ${tableName};`);
        await db!.run(`DELETE FROM sqlite_sequence WHERE name = ?;`, [tableName]);

        console.log(`🔁 Autoincremento reiniciado para la tabla "${tableName}"`);
    } catch (error) {
        console.error(`❌ Error al reiniciar el autoincremento para "${tableName}":`, error);
    }
};

/**
 * reinicia el autoincremento de todas las tablas de la base de datos.
 * @returns Promise<void>
 */
export const resetAllAutoIncrement = async (): Promise<void> => {
    if (!checkDB()) return;

    try {
        const tables = ["category", "item", "origin_item", "review", "review_image", "category_rating", "category_rating_value"];
        for (const table of tables) {
            await resetAutoIncrement(table);
        }
        console.log("🔁 Autoincremento reiniciado para todas las tablas.");
    } catch (error) {
        console.error("❌ Error al reiniciar el autoincremento para todas las tablas:", error);
    }
}