import {checkDB, db} from "src/database-service";
import { Item } from "src/dto/item/Item";
import { Origin } from "src/dto/item/Origin";

/**
 * Inserta un ítem en la base de datos.
 * @param item
 */
export const insertItem = async (item: Item): Promise<number | null> => {
    if (!checkDB()) return null;
    if (item.rating !== undefined && (item.rating < 0 || item.rating > 5)) {
        console.error("❌ La calificación debe estar entre 0 y 5.");
        return null;
    }

    try {
        const query = `INSERT INTO item (name, image, rating, category_id) VALUES (?, ?, ?, ?)`;
        const values = [item.name, item.image ?? null, item.rating ?? null, item.category_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar ítem:", error);
        return null;
    }
};

/**
 * Obtiene todos los ítems de la base de datos.
 * @returns Promise<Item[]>
 */
export const getItems = async (): Promise<Item[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT * FROM item`;
        const result = await db!.query(query);
        return result.values as Item[];
    } catch (error) {
        console.error("❌ Error al obtener ítems:", error);
        return [];
    }
};

/**
 * Inserta una relación de origen en la base de datos.
 * @param origin
 */
export const insertOrigin = async (origin: Origin): Promise<boolean> => {
    if (!checkDB()) return false;

    try {
        const query = `INSERT INTO origin_item (item1_id, item2_id) VALUES (?, ?)`;
        const values = [origin.origin_id, origin.item_id];

        await db!.run(query, values);
        return true;
    } catch (error) {
        console.error("❌ Error al insertar origen:", error);
        return false;
    }
};

/**
 * Inserta ítems de prueba en la base de datos.
 * @returns Promise<void>
 */
export const insertTestItems = async (): Promise<string> => {
    if (!checkDB()) return "❌ La base de datos no está inicializada.";
    try {
        const items: Item[] = [
            { name: "Item 1", image: "image1.jpg", rating: 4, category_id: 1 },
            { name: "Item 2", image: "image2.jpg", rating: 3, category_id: 2 },
            { name: "Item 3", image: "image3.jpg", rating: 5, category_id: 3 },
            { name: "Item 4", image: "image4.jpg", rating: 2, category_id: 1 },
            { name: "Item 5", image: "image5.jpg", rating: 1, category_id: 2 },
        ];

        for (const item of items) {
            await insertItem(item);
        }
        return "✅ Ítems de prueba insertados correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar ítems de prueba:", error);
        return "❌ Error al insertar ítems de prueba.";
    }
}