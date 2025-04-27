import {checkDB, db} from "@/database-service";
import { Item } from "@/shared/dto/item/Item";
import { Origin } from "@/shared/dto/item/Origin";
import { ItemOption } from "@/shared/dto/item/Item";

/**
 * Inserta un ítem en la base de datos.
 * @param item
 */
export const insertItem = async (item: Item): Promise<number | null> => {
    if (!checkDB()) return null;

    try {
        const query = `INSERT INTO item (name, image, category_id) VALUES (?, ?, ?)`;
        const values = [item.name, item.image, item.category_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId as number;
    } catch (error) {
        console.error("❌ Error al insertar ítem", error);
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
        console.error("❌ Error al obtener ítems");
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
        console.error("❌ Error al insertar origen");
        return false;
    }
};

export const getItemOptions = async (search: string): Promise<ItemOption[]> => {
    if (!checkDB()) return [];

    try {
        const query = `SELECT i.id, i.name, i.category_id, c.parent_id AS parent_category_id, IFNULL(p.icon, c.icon) AS parent_category_icon
        FROM item i
        JOIN category c ON i.category_id = c.id
        LEFT JOIN category p ON c.parent_id = p.id
        WHERE i.name LIKE ?
        LIMIT 5`;
        const values = [`%${search}%`];
        const result = await db!.query(query, values);
        return result.values as ItemOption[];
        
    } catch (error) {
        console.error("❌ Error al obtener opciones de ítem");
        return [];
    }
}

export const updateItem = async (item: Item): Promise<boolean> => {
    if (!checkDB()) return false;

    try {
        const query = `UPDATE item SET name = ?, image = ?, category_id = ? WHERE id = ?`;
        const values = [item.name, item.image, item.category_id, item.id];

        await db!.run(query, values);
        return true;
    } catch (error) {
        console.error("❌ Error al actualizar ítem", error);
        return false;
    }
}

export const insertTestItems = async (): Promise<void> => {
    if (!checkDB()) return;

    const items: Item[] = [
        { id: 1, name: "Item 1", image: null, category_id: 1 },
        { id: 2, name: "Item 2", image: null, category_id: 2 },
        { id: 3, name: "Item 3", image: null, category_id: 1 },
        { id: 4, name: "Item 4", image: null, category_id: 3 },
    ];

    for (const item of items) {
        await insertItem(item);
    }
}