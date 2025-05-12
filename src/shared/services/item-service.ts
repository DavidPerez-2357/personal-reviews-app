import { openDatabase } from "../database/database-service";
import { Item, ItemOption, Origin } from "../dto/Item";

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

export const insertTestItems = async (): Promise<void> => {
    const db = await openDatabase();
    if (!db) return;

    const items: Item[] = [
        { id: 1, name: "iPhone 13", image: "iphone-13.jpg", category_id: 11 },
        { id: 2, name: "MacBook Air M1", image: "macbook-air.jpg", category_id: 12 },
        { id: 3, name: "Nike Air Force 1", image: "nike-airforce.jpg", category_id: 13 },
        { id: 4, name: "Zapatillas Adidas Ultraboost", image: "adidas-ultraboost.jpg", category_id: 13 },
        { id: 5, name: "Silla de oficina ergonómica", image: "silla-oficina.jpg",  category_id: 10 },
        { id: 6, name: "Cafetera Nespresso", image: "cafetera-nespresso.jpg", category_id: 15 },
        { id: 7, name: "Kindle Paperwhite", image: "kindle-paperwhite.jpg", category_id: 6 },
        { id: 8, name: "Mochila para portátil", image: "mochila-portatil.jpg", category_id: 10 },
        { id: 9, name: "Reloj Garmin Forerunner", image: "garmin-forerunner.jpg", category_id: 5 },
        { id: 10, name: "Sony WH-1000XM4", image: "sony-headphones.jpg", category_id: 1 },
        { id: 11, name: "Teclado mecánico Logitech", image: "logitech-teclado.jpg", category_id: 1 },
        { id: 12, name: "Guitarra Fender Stratocaster", image: "fender-guitarra.jpg", category_id: 4 },
        { id: 13, name: "Mueble modular para oficina", image: "mueble-oficina.jpg", category_id: 15 },
        { id: 14, name: "Silla gaming DXRacer", image: "dxracer-silla.jpg", category_id: 10 },
        { id: 15, name: "Suplemento Omega-3", image: "suplemento-omega3.jpg", category_id: 19 },
        { id: 16, name: "Lámpara de escritorio LED", image: "lampara-escritorio.jpg", category_id: 10 },
        { id: 17, name: "Smartwatch Samsung Galaxy", image: "samsung-smartwatch.jpg", category_id: 9 },
        { id: 18, name: "Juego de platos Corelle", image: "platos-corelle.jpg", category_id: 3 },
        { id: 19, name: "Silla ergonómica para oficina", image: "silla-ergonomica.jpg", category_id: 15 },
        { id: 20, name: "Altavoces Bose SoundLink", image: "bose-altavoces.jpg", category_id: 1 },
        { id: 21, name: "Auriculares Beats Studio", image: "beats-audifonos.jpg", category_id: 1 },
        { id: 22, name: "Sofá 3 plazas", image: "sofa-3-plazas.jpg", category_id: 15 },
        { id: 23, name: "Plancha de vapor Philips", image: "plancha-philips.jpg", category_id: 14 },
        { id: 24, name: "Cámara GoPro Hero 10", image: "gopro-hero10.jpg", category_id: 1 },
        { id: 25, name: "Pantalla LED 4K LG", image: "pantalla-lg.jpg", category_id: 1 }
      ];  

    for (const item of items) {
        await insertItem(item);
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