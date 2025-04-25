
import {db, resetAutoIncrement} from "../database-service";
import { checkDB } from "../database-service";
import { Category, CategoryRating, CategoryRatingValue } from "../dto/Category.ts";


/**
 * Obtiene todas las categorías de la base de datos.
 * @returns Promise<Category[]>
 */
export const getCategories = async (): Promise<Category[]> => {
    try {
        if (!checkDB()) return [];

        const query = `SELECT * FROM category`;
        const result = await db!.query(query);

        return result.values?.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            color: row.color,
            parent_id: row.parent_id as number | null,
            created_at: row.created_at,
            updated_at: row.updated_at
        })) as Category[] || [];
    } catch (error) {
        console.error("❌ Error al obtener categorías:", error);
        return [];
    }
};

/**
 * Inserta una categoría en la base de datos.
 * @param category Objeto categoría a insertar.
 * @returns Promise<number | null>
 */
export const insertCategory = async (category: Category): Promise<number | null> => {
    if (!checkDB()) return null;
  
    try {
      // Validación mínima
      if (!category.name || !category.color || !category.icon) {
        console.warn("⚠️ Datos incompletos al insertar categoría:", category);
        return null;
      }
  
      const query = `
        INSERT INTO category (name, type, icon, color, parent_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [
        category.name,
        category.type,
        category.icon,
        category.color,
        category.parent_id,
      ];
  
      const result = await db!.run(query, values);
      return result.changes?.lastId || null;
    } catch (error) {
      console.error("❌ Error al insertar categoría:", error);
      return null;
    }
};  


/**
 * Inserta una puntuación de categoría en la base de datos.
 * @param categoryRating
 */
export const insertCategoryRating = async (categoryRating: CategoryRating): Promise<number | null> => {
    if (!checkDB()) return null;
    if (categoryRating.value < 0 || categoryRating.value > 100) {
        console.error("❌ El valor debe estar entre 0 y 100.");
        return null;
    }

    try {
        const query = `INSERT INTO category_rating (name, value, category_id) VALUES (?, ?, ?)`;
        const values = [categoryRating.name, categoryRating.value, categoryRating.category_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar puntuación de categoría:", error);
        return null;
    }
};

/**
 * Inserta un valor de puntuación de categoría en la base de datos.
 * @param categoryRatingValue
 */
export const insertCategoryRatingValue = async (categoryRatingValue: CategoryRatingValue): Promise<number | null> => {
    if (!checkDB()) return null;
    if (categoryRatingValue.value < 0 || categoryRatingValue.value > 100) {
        console.error("❌ El valor debe estar entre 0 y 100.");
        return null;
    }

    try {
        const query = `INSERT INTO category_rating_value (value, item_id, category_rating_id) VALUES (?, ?, ?)`;
        const values = [categoryRatingValue.value, categoryRatingValue.item_id, categoryRatingValue.category_rating_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar valor de puntuación de categoría:", error);
        return null;
    }
};

/**
 * Obtiene todas las puntuaciones de categoría de la base de datos.
 * @returns Promise<CategoryRating[]>
 */
export const getCategoryRatings = async (): Promise<CategoryRating[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT * FROM category_rating`;
        const result = await db!.query(query);
        return result.values as CategoryRating[];
    } catch (error) {
        console.error("❌ Error al obtener puntuaciones de categoría:", error);
        return [];
    }
};

/**
 * Obtiene todos los valores de puntuación de categoría de la base de datos.
 * @returns Promise<CategoryRatingValue[]>
 */
export const getCategoryRatingValues = async (): Promise<CategoryRatingValue[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT * FROM category_rating_value`;
        const result = await db!.query(query);
        return result.values as CategoryRatingValue[];
    } catch (error) {
        console.error("❌ Error al obtener valores de puntuación de categoría:", error);
        return [];
    }
};

/**
 * Elimina una categoría de la base de datos.
 */
export const deleteCategory = async (id: number): Promise<boolean> => {
    if (!checkDB()) return false;

    try {
        const query = `DELETE FROM category WHERE id = ?`;
        const values = [id];

        await db!.run(query, values);
        return true;
    } catch (error) {
        console.error("❌ Error al eliminar categoría:", error);
        return false;
    }
};

/**
 * Elimina todas las categorías de la base de datos.
 */
export const deleteAllCategories = async (): Promise<boolean> => {
    if (!checkDB()) return false;

    try {
        const query = `DELETE FROM category`; // Eliminar todos los registros de la tabla category
        await db!.run(query); // Ejecutamos la consulta
        console.log("✅ Todas las categorías han sido eliminadas.");
        return true;
    } catch (error) {
        console.error("❌ Error al eliminar las categorías:", error);
        return false;
    }
};

/**
 * Inserta categorías de prueba si la base de datos está vacía.
 * @returns Promise<string>
 */
export const insertTestCategories = async (): Promise<string> => {
    if (!checkDB()) return "❌ La base de datos no está inicializada.";

    const categories = await getCategories();
    if (categories.length > 0) {
        console.log("⚠️ La base de datos ya contiene categorías. No se insertarán categorías de prueba.");
        return "⚠️ La base de datos ya contiene categorías. No se insertarán categorías de prueba.";
    }

    try {
        
        const categories: Category[] = [
            { id: 1, name: "Electrónica", type: 1, color: "#FF5733", icon: "icon-electronica", parent_id: null, created_at: "2025-04-01T10:00:00Z", updated_at: "2025-04-01T10:00:00Z" },
            { id: 2, name: "Ropa", type: 2, color: "#33FF57", icon: "icon-ropa", parent_id: null, created_at: "2025-04-01T10:10:00Z", updated_at: "2025-04-01T10:10:00Z" },
            { id: 3, name: "Hogar", type: 3, color: "#3357FF", icon: "icon-hogar", parent_id: null, created_at: "2025-04-01T10:20:00Z", updated_at: "2025-04-01T10:20:00Z" },
            { id: 4, name: "Juguetes", type: 4, color: "#FF33A1", icon: "icon-juguetes", parent_id: null, created_at: "2025-04-01T10:30:00Z", updated_at: "2025-04-01T10:30:00Z" },
            { id: 5, name: "Deportes", type: 5, color: "#FF8C33", icon: "icon-deportes", parent_id: null, created_at: "2025-04-01T10:40:00Z", updated_at: "2025-04-01T10:40:00Z" },
            { id: 6, name: "Libros", type: 6, color: "#33FFF5", icon: "icon-libros", parent_id: null, created_at: "2025-04-01T10:50:00Z", updated_at: "2025-04-01T10:50:00Z" },
            { id: 7, name: "Salud", type: 7, color: "#FF33FF", icon: "icon-salud", parent_id: null, created_at: "2025-04-01T11:00:00Z", updated_at: "2025-04-01T11:00:00Z" },
            { id: 8, name: "Belleza", type: 8, color: "#FF5733", icon: "icon-belleza", parent_id: null, created_at: "2025-04-01T11:10:00Z", updated_at: "2025-04-01T11:10:00Z" },
            { id: 9, name: "Automóviles", type: 9, color: "#33FF57", icon: "icon-automoviles", parent_id: null, created_at: "2025-04-01T11:20:00Z", updated_at: "2025-04-01T11:20:00Z" },
            { id: 10, name: "Oficina", type: 10, color: "#3377FF", icon: "icon-oficina", parent_id: null, created_at: "2025-04-01T11:30:00Z", updated_at: "2025-04-01T11:30:00Z" },
            // Subcategorías
            { id: 11, name: "Smartphones", type: 1, color: "#AA5733", icon: "icon-smartphones", parent_id: 1, created_at: "2025-04-01T11:40:00Z", updated_at: "2025-04-01T11:40:00Z" },
            { id: 12, name: "Portátiles", type: 1, color: "#BB5733", icon: "icon-portatiles", parent_id: 1, created_at: "2025-04-01T11:50:00Z", updated_at: "2025-04-01T11:50:00Z" },
            { id: 13, name: "Zapatillas", type: 2, color: "#33AA57", icon: "icon-zapatillas", parent_id: 2, created_at: "2025-04-01T12:00:00Z", updated_at: "2025-04-01T12:00:00Z" },
            { id: 14, name: "Vestidos", type: 2, color: "#33BB57", icon: "icon-vestidos", parent_id: 2, created_at: "2025-04-01T12:10:00Z", updated_at: "2025-04-01T12:10:00Z" },
            { id: 15, name: "Muebles", type: 3, color: "#3344FF", icon: "icon-muebles", parent_id: 3, created_at: "2025-04-01T12:20:00Z", updated_at: "2025-04-01T12:20:00Z" },
            { id: 16, name: "Cocina", type: 3, color: "#3344AA", icon: "icon-cocina", parent_id: 3, created_at: "2025-04-01T12:30:00Z", updated_at: "2025-04-01T12:30:00Z" },
            { id: 17, name: "Libros Infantiles", type: 6, color: "#33BBF5", icon: "icon-libros-infantiles", parent_id: 6, created_at: "2025-04-01T12:40:00Z", updated_at: "2025-04-01T12:40:00Z" },
            { id: 18, name: "Maquillaje", type: 8, color: "#FF77FF", icon: "icon-maquillaje", parent_id: 8, created_at: "2025-04-01T12:50:00Z", updated_at: "2025-04-01T12:50:00Z" },
            { id: 19, name: "Suplementos", type: 7, color: "#FF99FF", icon: "icon-suplementos", parent_id: 7, created_at: "2025-04-01T13:00:00Z", updated_at: "2025-04-01T13:00:00Z" },
            { id: 20, name: "Sillas", type: 3, color: "#3344BB", icon: "icon-sillas", parent_id: 3, created_at: "2025-04-01T13:10:00Z", updated_at: "2025-04-01T13:10:00Z" },
          ];
                 
        const results: string[] = [];
        for (const category of categories) {
            if (await insertCategory(category) !== null) {
                const successMessage = `✅ Categoría ${category.name} insertada correctamente.`;
                console.log(successMessage);
                results.push(successMessage);
            } else {
                const errorMessage = `❌ Error al insertar la categoría ${category.name}.`;
                console.error(errorMessage);
                results.push(errorMessage);
            }
        }

        console.log("✅ Categorías de prueba insertadas correctamente.");
        return "✅ Categorías de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar categorías de prueba:", error);
        return "❌ Error al insertar categorías de prueba.";
    }
};
