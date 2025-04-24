import {checkDB, db} from "@/database-service";
import { Item, Origin } from "@/dto/Item";

/**
 * Inserta un ítem en la base de datos.
 * @param item
 */
export const insertItem = async (item: Item): Promise<number | null> => {

    if (!checkDB()) return null;

    try {
        const query = `INSERT INTO item (name, image, rating, category_id) VALUES (?, ?, ?, ?)`;
        const values = [item.name, item.image, item.rating, item.category_id];

        const result = await db!.run(query, values);
        return result.changes as number;
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

    if (!checkDB()) return "❌ Error: Base de datos no inicializada.";

    // Verifica si ya existen ítems en la base de datos
    const existingItems = await getItems();
    if (existingItems.length > 0) {
        console.log("❌ Ya existen ítems en la base de datos. No se insertan ítems de prueba.");
        return "❌ Ya existen ítems en la base de datos. No se insertan ítems de prueba.";
    }

    try {
        const items: Item[]= [
            {
                id: 1,
                name: "Item 1",
                image: "https://example.com/image1.jpg",
                rating: 4.5,
                category_id: 43,
            },
            {
                id: 2,
                name: "Item 2",
                image: "https://example.com/image2.jpg",
                rating: 3.8,
                category_id: 44,
            },
            {
                id: 3,
                name: "Item 3",
                image: "https://example.com/image3.jpg",
                rating: 5.0,
                category_id: 45,
            },
        ];

        for (const item of items) {
            await insertItem(item);
        }

        return "✅ Ítems de prueba insertados correctamente.";
    } catch (error) {

        const items = await getItems();
        console.log("❌ Ítems de prueba:" + items);

        console.error("❌ Error al insertar ítems de prueba:", error);
        return "❌ Error al insertar ítems de prueba.";
    }
}

/**
 * Elimina todos los ítems de la base de datos.
 * @returns Promise<boolean>
 */
export const deleteAllItems = async (): Promise<boolean> => {
    if (!checkDB()) return false;

    try {
        const query = `DELETE FROM item`;
        await db!.run(query);
        console.log("✅ Todos los ítems han sido eliminados.");
        return true;
    } catch (error) {
        console.error("❌ Error al eliminar ítems:", error);
        return false;
    }
}