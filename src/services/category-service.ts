
import { db } from "../database-service";
import { checkDB } from "../database-service";
import { Category } from "../dto/category/Category";
import {CategoryRating} from "../dto/category/CategoryRating.ts";
import {CategoryRatingValue} from "../dto/category/CategoryRatingValue.ts";

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
            title: row.title,
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
 * @param category
 * @returns Promise<number | null>
 */
export const insertCategory = async (category: Category): Promise<number | null> => {
    if (!checkDB()) return null;

    try {
        const query = `INSERT INTO category (title, type, color, parent_id) VALUES (?, ?, ?, ?)`;
        const values = [category.title, category.type, category.color, category.parent_id];

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

    try {
        const existingCategories = await getCategories();
        if (existingCategories.length > 0) {
            return "✅ La base de datos ya contiene categorías.";
        }

        const categories: Category[] = [
            { id: 1, title: "Electrónica", type: 1, color: "#FF5733", parent_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 2, title: "Ropa", type: 2, color: "#33FF57", parent_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 3, title: "Hogar", type: 3, color: "#3357FF", parent_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];

        const results: string[] = [];
        for (const category of categories) {
            if (await insertCategory(category) !== null) {
                const successMessage = `✅ Categoría ${category.title} insertada correctamente.`;
                console.log(successMessage);
                results.push(successMessage);
            } else {
                const errorMessage = `❌ Error al insertar la categoría ${category.title}.`;
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
