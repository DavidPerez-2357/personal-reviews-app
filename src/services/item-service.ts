import {checkDB, db, resetAutoIncrement} from "@/database-service";
import { Item, Origin } from "@/dto/Item";

/**
 * Inserta un ítem en la base de datos.
 * @param item
 */
export const insertItem = async (item: Item): Promise<number | null> => {
    if (!checkDB()) return null;

    const query = `INSERT INTO item (name, image, rating, category_id, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
        item.name, 
        item.image, 
        item.rating, 
        item.category_id, 
        new Date().toISOString(), // Para el campo created_at
        new Date().toISOString()  // Para el campo updated_at
    ];

    try {
        const result = await db!.run(query, values);
        return result.changes?.lastId || null;  // Devuelve el ID del ítem insertado
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
        const items: Item[] = [
            { id: 1, name: "iPhone 13", image: "iphone-13.jpg", rating: 5, category_id: 11 },
            { id: 2, name: "MacBook Air M1", image: "macbook-air.jpg", rating: 4, category_id: 12 },
            { id: 3, name: "Nike Air Force 1", image: "nike-airforce.jpg", rating: 3, category_id: 13 },
            { id: 4, name: "Zapatillas Adidas Ultraboost", image: "adidas-ultraboost.jpg", rating: 4, category_id: 13 },
            { id: 5, name: "Silla de oficina ergonómica", image: "silla-oficina.jpg", rating: 2, category_id: 10 },
            { id: 6, name: "Cafetera Nespresso", image: "cafetera-nespresso.jpg", rating: 4, category_id: 15 },
            { id: 7, name: "Kindle Paperwhite", image: "kindle-paperwhite.jpg", rating: 5, category_id: 6 },
            { id: 8, name: "Mochila para portátil", image: "mochila-portatil.jpg", rating: 4, category_id: 10 },
            { id: 9, name: "Reloj Garmin Forerunner", image: "garmin-forerunner.jpg", rating: 4, category_id: 5 },
            { id: 10, name: "Sony WH-1000XM4", image: "sony-headphones.jpg", rating: 5, category_id: 1 },
            { id: 11, name: "Teclado mecánico Logitech", image: "logitech-teclado.jpg", rating: 3, category_id: 1 },
            { id: 12, name: "Guitarra Fender Stratocaster", image: "fender-guitarra.jpg", rating: 5, category_id: 4 },
            { id: 13, name: "Mueble modular para oficina", image: "mueble-oficina.jpg", rating: 2, category_id: 15 },
            { id: 14, name: "Silla gaming DXRacer", image: "dxracer-silla.jpg", rating: 4, category_id: 10 },
            { id: 15, name: "Suplemento Omega-3", image: "suplemento-omega3.jpg", rating: 4, category_id: 19 },
            { id: 16, name: "Lámpara de escritorio LED", image: "lampara-escritorio.jpg", rating: 5, category_id: 10 },
            { id: 17, name: "Smartwatch Samsung Galaxy", image: "samsung-smartwatch.jpg", rating: 3, category_id: 9 },
            { id: 18, name: "Juego de platos Corelle", image: "platos-corelle.jpg", rating: 4, category_id: 3 },
            { id: 19, name: "Silla ergonómica para oficina", image: "silla-ergonomica.jpg", rating: 2, category_id: 15 },
            { id: 20, name: "Altavoces Bose SoundLink", image: "bose-altavoces.jpg", rating: 4, category_id: 1 },
            { id: 21, name: "Auriculares Beats Studio", image: "beats-audifonos.jpg", rating: 3, category_id: 1 },
            { id: 22, name: "Sofá 3 plazas", image: "sofa-3-plazas.jpg", rating: 5, category_id: 15 },
            { id: 23, name: "Plancha de vapor Philips", image: "plancha-philips.jpg", rating: 4, category_id: 14 },
            { id: 24, name: "Cámara GoPro Hero 10", image: "gopro-hero10.jpg", rating: 4, category_id: 1 },
            { id: 25, name: "Pantalla LED 4K LG", image: "pantalla-lg.jpg", rating: 5, category_id: 1 }
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