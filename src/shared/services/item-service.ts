import { openDatabase } from "../database/database-service";
import { Item, ItemDisplay, ItemFull, ItemOption, ItemWithCategory, Origin } from "@dto/Item";
import { CategoryAppearance } from "../dto/Category";


/**
 * Inserta un ítem en la base de datos.
 * @param item
 */
export const insertItem = async (item: Item): Promise<number | null> => {
    const db = await openDatabase();
    if (!db) return null;

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
 * obtiene un ítem por su ID.
 * @param id
 * @returns Promise<ItemFull | null>
 */
export const getItemFull = async (id: number): Promise<ItemFull | null> => {
    const db = await openDatabase();
    if (!db) return null;

    try {
        const query = `select
                            i.id,
                            i.name,
                            i.image,
                            round(avg(r.rating), 2) as average_rating,
                            count(r.id) as number_of_ratings,
                            max(r.created_at) as date_last_review,
                            c.name as category_name,
                            c.icon as category_icon,
                            c.color as category_color
                        from item i
                        join category c on i.category_id = c.id
                        left join review r on i.id = r.item_id
                        where i.id = ?
                        group by i.id, i.name, c.name, c.icon, c.color
                        order by i.id;`;
        const result = await db!.query(query, [id]);
        return result.values && result.values[0] as ItemFull || null;
    } catch (error) {
        console.error("❌ Error al obtener ítem", error);
        return null;
    }
}

/**
 * Obtiene los items de un origen con la nueva estructura de ItemDisplay.
 * @param id
 * @returns Promise<ItemDisplay[]>
 */
export const getItemsByOrigin = async (id: number): Promise<ItemDisplay[]> => {
    const db = await openDatabase();
    if (!db) return [];

    try {
        const query = `
            SELECT i.id, i.name, i.image,
               COUNT(r.rating) AS number_of_rewviews, 
               c.icon AS category_icon, 
               c.color AS category_color,
               i.is_origin,
               case when oi.origin_id is not null then oi.origin_id else null end as origin_id,
               (
               SELECT r2.rating
               FROM review r2
               WHERE r2.item_id = i.id
               ORDER BY r2.created_at DESC
               LIMIT 1
               ) AS last_review
            FROM item i
            LEFT JOIN review r ON i.id = r.item_id
            LEFT JOIN category c ON i.category_id = c.id
            LEFT JOIN origin_item oi ON i.id = oi.item_id
            WHERE oi.origin_id = ?
            GROUP BY i.id, i.name, c.icon, c.color
        `;
        const result = await db!.query(query, [id]);
        // Map fields to match ItemDisplay interface
        return (result.values || []).map((row: ItemDisplay) => ({
            id: row.id,
            name: row.name,
            image: row.image || null,
            is_origin: row.is_origin || false,
            origin_id: row.origin_id || undefined,
            last_review: row.last_rating ? Number(new Date(row.last_rating)) : 0,
            number_of_reviews: row.number_of_reviews,
            category_icon: row.category_icon,
            category_color: row.category_color
        })) as ItemDisplay[];
    } catch (error) {
        console.error("❌ Error al obtener ítems por origen", error);
        return [];
    }
}

/**
 * Obtiene todos los ítems de la base de datos.
 * @returns Promise<Item[]>
 */
export const getItems = async (): Promise<Item[]> => {
    const db = await openDatabase();
    if (!db) return [];

    try {
        const query = `SELECT * FROM item`;
        const result = await db!.query(query);
        return result.values as Item[];
    } catch (error) {
        console.error("❌ Error al obtener ítems");
        return [];
    }
};

export const getFeaturedCategoryOfItemsInsideOfOrigin = async (item_id: number): Promise<CategoryAppearance | null> => {
    const db = await openDatabase();
    if (!db) return null;

    try {
        const query = `
            SELECT
            c.icon,
            c.color,
            COUNT(*) as count
            FROM item i
            JOIN category c ON i.category_id = c.id
            JOIN origin_item oi ON i.id = oi.item_id
            WHERE oi.origin_id = ?
            GROUP BY c.id
            ORDER BY count DESC
            LIMIT 1
        `;
        const result = await db!.query(query, [item_id]);
        if (result.values && result.values[0]) {
            return {
            icon: result.values[0].icon,
            color: result.values[0].color
            } as CategoryAppearance;
        }
        return null;
    }catch (error) {
        console.error("❌ Error al obtener ítems");
        return null;
    }
}

/**
 * Inserta una relación de origen en la base de datos.
 * @param origin
 */
export const insertOrigin = async (origin: Origin): Promise<boolean> => {
    const db = await openDatabase();
    if (!db) return false;

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
    const db = await openDatabase();
    if (!db) return [];

    try {
        const query = `SELECT i.id, i.name, i.category_id, c.icon AS category_icon
        FROM item i
        JOIN category c ON i.category_id = c.id
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
    const db = await openDatabase();
    if (!db) return false;

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

export const updateItemWithCategory = async (item: ItemWithCategory): Promise<boolean> => {
    const db = await openDatabase();
    if (!db) return false;

    try {
        const query = `UPDATE item SET name = ?, category_id = ? WHERE id = ?`;
        const values = [item.name, item.category_id, item.id];

        await db!.run(query, values);
        return true;
    } catch (error) {
        console.error("❌ Error al actualizar ítem con categoría", error);
        return false;
    }
}

export const getItemById = async (id: number): Promise<Item | null> => {
    const db = await openDatabase();
    if (!db) return null;

    try {
        const query = `SELECT * FROM item WHERE id = ?`;
        const result = await db!.query(query, [id]);
        return result.values && result.values[0] as Item || null;
    } catch (error) {
        console.error("❌ Error al obtener ítem por ID", error);
        return null;
    }
}