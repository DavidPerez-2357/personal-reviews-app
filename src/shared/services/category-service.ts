import { Category } from '@/shared/dto/category/Category';
import { db } from "@/database-service";
import { checkDB } from "@/database-service";
import {CategoryRating} from "@/shared/dto/category/CategoryRating";
import {CategoryRatingValue} from "@/shared/dto/category/CategoryRatingValue";

/**
 * Obtiene todas las categorías de la base de datos.
 * @returns Promise<Category[]>
 */
export const getCategories = async (): Promise<Category[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT * FROM category`;
        const result = await db!.query(query);
        return result.values as Category[];
    } catch (error) {
        console.error("❌ Error al obtener categorías");
        return [];
    }
};

/**
 * Inserta una categoría en la base de datos.
 * @param category
 * @returns Promise<number | null>
 */
export const insertCategory = async (category: Category): Promise<number | null | unknown> => {
    if (!checkDB()) return null;

    try {
        const query = `INSERT INTO category (name, type, color, icon, parent_id) VALUES (?, ?, ?, ?, ?)`;
        const values = [category.name, category.type, category.color, category.icon, category.parent_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar categoría");
        return error;
    }
};

/**
 * Inserta una puntuación de categoría en la base de datos.
 * @param categoryRating
 */
export const insertCategoryRating = async (categoryRating: CategoryRating): Promise<number | null> => {
    if (!checkDB()) return null;

    try {
        const query = `INSERT INTO category_rating (name, category_id) VALUES (?, ?)`;
        const values = [categoryRating.name, categoryRating.category_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar puntuación de categoría:");
        return null;
    }
};


/**
 * Inserta un valor de puntuación de categoría en la base de datos.
 * @param categoryRatingValue
 */
export const insertCategoryRatingValue = async (categoryRatingValue: CategoryRatingValue): Promise<number | null> => {
    if (!checkDB()) return null;
    if (categoryRatingValue.value < 0 || categoryRatingValue.value > 10) {
        console.error("❌ El valor debe estar entre 0 y 10.");
        return null;
    }

    try {
        const query = `INSERT INTO category_rating_value (value, review_id, category_rating_id) VALUES (?, ?, ?)`;
        const values = [categoryRatingValue.value, categoryRatingValue.review_id, categoryRatingValue.category_rating_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar valor de puntuación de categoría:" + error);
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
        console.error("❌ Error al obtener puntuaciones de categoría");
        return [];
    }
};

/**
 * Obtiene todos las puntuaciones de categoría de una categoría a partir de su ID.
 * @param categoryId
 * @returns Promise<CategoryRatingValue[]>
 */
export const getCategoryRatingsByCategoryId = async (categoryId: number): Promise<CategoryRating[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT * FROM category_rating WHERE category_id = ?`;
        const values = [categoryId];
        const result = await db!.query(query, values);
        return result.values as CategoryRating[];
    } catch (error) {
        console.error("❌ Error al obtener puntuaciones de categoría por ID de categoría");
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
        console.error("❌ Error al obtener valores de puntuación de categoría");
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
        console.error("❌ Error al eliminar categoría");
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
        console.error("❌ Error al eliminar las categorías");
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
            { id: 1, name: "Electrónica", type: 1, color: "red", icon: "star", parent_id: null },
            { id: 2, name: "Ropa", type: 2, color: "green", icon: "heart", parent_id: null },
            { id: 3, name: "Hogar", type: 3, color: "turquoise", icon: "poo", parent_id: 1 }
        ];

        const insertPromises = categories.map((category) => insertCategory(category));
        await Promise.all(insertPromises);
        return "✅ Categorías de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar categorías de prueba");
        return "❌ Error al insertar categorías de prueba.";
    }
};

/**
 * Inserta puntuaciones de categoría de prueba si la base de datos está vacía.
 * @returns 
 */
export const insertTestCategoryRating = async (): Promise<string> => {
    if (!checkDB()) return "❌ La base de datos no está inicializada.";

    try {
        const existingCategoryRatings = await getCategoryRatings();
        if (existingCategoryRatings.length > 0) {
            return "✅ La base de datos ya contiene puntuaciones de categoría.";
        }

        const categoryRatings: CategoryRating[] = [
            { id: 1, name: "Calidad", category_id: 1},
            { id: 2, name: "Precio", category_id: 1},
            { id: 3, name: "Durabilidad", category_id: 2},
            { id: 4, name: "Estilo", category_id: 2},
            { id: 5, name: "Comodidad", category_id: 3},
            { id: 6, name: "Diseño", category_id: 3}
        ];

        const insertPromises = categoryRatings.map((categoryRating) => insertCategoryRating(categoryRating));
        await Promise.all(insertPromises);
        return "✅ Puntuaciones de categoría de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar puntuaciones de categoría de prueba");
        return "❌ Error al insertar puntuaciones de categoría de prueba.";
    }
}

/**
 * Actualiza una categoría en la base de datos.
 * 
 * @param category 
 * @returns 
 */
export const updateCategory = (category: Category): Promise<boolean> => {
    if (!checkDB()) return Promise.resolve(false);

    return new Promise((resolve, reject) => {
        const query = `UPDATE category SET name = ?, type = ?, color = ?, icon = ?, parent_id = ? WHERE id = ?`;
        const values = [category.name, category.type, category.color, category.icon, category.parent_id, category.id];

        db!.run(query, values)
            .then(() => resolve(true))
            .catch((error) => {
                console.error("❌ Error al actualizar categoría");
                resolve(false);
            });
    });
}

/**
 * Obtiene la categoría de un item a partir de su ID.
 * 
 * @param itemId 
 * @returns 
 */
export const getCategoryFromItem = (itemId: number): Promise<Category | null> => {
    if (!checkDB()) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
        const query = `SELECT c.* FROM category c INNER JOIN item i ON c.id = i.category_id WHERE i.id = ?`;
        const values = [itemId];

        db!.run(query, values)
            .then((result) => {
                if (result) {
                    resolve(result as Category);
                } else {
                    resolve(null);
                }
            })
            .catch((error) => {
                console.error("❌ Error al obtener categoría del item");
                resolve(null);
            });
    });
}

/**
 * Obtiene las categorías padre de la base de datos.
 * @returns Promise<Category[]>
 */
export const getParentCategories = async (): Promise<Category[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT * FROM category WHERE parent_id IS NULL`;
        const result = await db!.query(query);
        return result.values as Category[];
    } catch (error) {
        console.error("❌ Error al obtener categorías padre");
        return [];
    }
}

/**
 * Obtiene la categoría padre de una categoría a partir de su ID, si esa categoria es padre, la devuelve. En cambio, si no lo es, devuelve la categoría padre.
 * 
 * @param categoryId 
 * @returns 
 */
export const getParentCategory = async (categoryId: number): Promise<Category | null> => {
    try {
        if (!checkDB()) return null;

        // Obtener la categoría actual
        const queryCategory = `SELECT * FROM category WHERE id = ?`;
        const valuesCategory = [categoryId];
        const resultCategory = await db!.query(queryCategory, valuesCategory);

        const category = resultCategory.values?.[0] as Category | null;

        if (!category) {
            console.error("❌ Categoría no encontrada.");
            return null;
        }

        // Si la categoría ya es una categoría padre, devolverla
        if (category.parent_id === null) {
            return category;
        }

        // Si no es una categoría padre, obtener la categoría padre
        const queryParent = `SELECT * FROM category WHERE id = ?`;
        const valuesParent = [category.parent_id];
        const resultParent = await db!.query(queryParent, valuesParent);

        return resultParent.values?.[0] as Category || null;
    } catch (error) {
        console.error("❌ Error al obtener categoría padre");
        return null;
    }
}

export const getChildrenCategories = async (categoryId: number): Promise<Category[]> => {
    try {
        if (!checkDB()) return [];

        const query = `SELECT * FROM category WHERE parent_id = ?`;
        const values = [categoryId];
        const result = await db!.query(query, values);

        return result.values as Category[];
    } catch (error) {
        console.error("❌ Error al obtener categorías hijo");
        return [];
    }
}

export const getCategoryById = async (categoryId: number): Promise<Category | null> => {
    try {
        if (!checkDB()) return null;

        const query = `SELECT * FROM category WHERE id = ?`;
        const values = [categoryId];
        const result = await db!.query(query, values);

        return result.values?.[0] as Category || null;
    } catch (error) {
        console.error("❌ Error al obtener categoría por ID");
        return null;
    }
}

/**
 * Elimina los valores de puntuación de categoría de una reseña a partir de su ID.
 * 
 * @param reviewId 
 * @returns 
 */
export const deleteRatingValuesFromReview = async (reviewId: number): Promise<boolean> => {
    if (!checkDB()) return false;

    try {
        const query = `DELETE FROM category_rating_value WHERE review_id = ?`;
        const values = [reviewId];

        await db!.run(query, values);
        return true;
    } catch (error) {
        console.error("❌ Error al eliminar valores de puntuación de categoría de la reseña");
        return false;
    }
}

/**
 * Obtiene los valores de puntuación de categoría de una reseña a partir de su ID.
 * 
 * @param reviewId 
 * @returns 
 */
export const getCategoryRatingValuesByReviewId = async (reviewId: number): Promise<CategoryRatingValue[]> => {
    try {
        if (!checkDB()) return [];

        const query = `SELECT * FROM category_rating_value WHERE review_id = ?`;
        const values = [reviewId];
        const result = await db!.query(query, values);

        return result.values as CategoryRatingValue[] || [];
    } catch (error) {
        console.error("❌ Error al obtener valores de puntuación de categoría por ID de reseña");
        return [];
    }
}