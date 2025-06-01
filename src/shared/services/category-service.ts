import { Category, CategoryRating, CategoryRatingMix, CategoryRatingValue } from "@dto/Category";
import { openDatabase } from "../database/database-service";
import i18n from 'i18next';

/**
 * Obtiene todas las categorías de la base de datos.
 * @returns Promise<Category[]>
 */
export const getCategories = async (): Promise<Category[]> => {
    const db = await openDatabase();
    if (!db) return [];

    try {
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
    const db = await openDatabase();
    if (!db) return null;

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
    const db = await openDatabase();
    if (!db) return null;

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
    const db = await openDatabase();
    if (!db) return null;
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
    const db = await openDatabase();
    if (!db) return [];

    try {
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
    const db = await openDatabase();
    if (!db) return [];

    try {
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
    const db = await openDatabase();
    if (!db) return [];

    try {
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
    const db = await openDatabase();
    if (!db) return false;

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
    const db = await openDatabase();
    if (!db) return false;

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
    const db = await openDatabase();
    if (!db) return "❌ La base de datos no está inicializada.";

    try {
        const existingCategories = await getCategories();
        if (existingCategories.length > 0) {
            console.log("✅ La base de datos ya contiene categorías.");
        }

        const categories: Category[] = [
          { id: 1, name: "Electrónica", type: 1, color: "red", icon: "computer", parent_id: null },
          { id: 2, name: "Ropa", type: 2, color: "green", icon: "shirt", parent_id: null},
          { id: 3, name: "Hogar", type: 3, color: "blue", icon: "house", parent_id: null},
          { id: 4, name: "Juguetes", type: 4, color: "yellow", icon: "chess-knight", parent_id: null},
          { id: 5, name: "Deportes", type: 5, color: "gray", icon: "football", parent_id: null},
          { id: 6, name: "Libros", type: 6, color: "darkgray", icon: "book", parent_id: null},
          { id: 7, name: "Salud", type: 7, color: "turquoise", icon: "staff-snake", parent_id: null},
          { id: 8, name: "Belleza", type: 8, color: "purple", icon: "bath", parent_id: null},
          { id: 9, name: "Automóviles", type: 9, color: "red", icon: "car", parent_id: null},
          { id: 10, name: "Oficina", type: 10, color: "darkgray", icon: "file", parent_id: null},
          // Subcategorías
          { id: 11, name: "Smartphones", type: 1, color: "darkgray", icon: "mobile", parent_id: 1},
          { id: 12, name: "Portátiles", type: 1, color: "purple", icon: "laptop", parent_id: 1},
          { id: 13, name: "Zapatillas", type: 2, color: "green", icon: "shoe-prints", parent_id: 2},
          { id: 14, name: "Vestidos", type: 2, color: "red", icon: "person-dress", parent_id: 2},
          { id: 15, name: "Muebles", type: 3, color: "turquoise", icon: "couch", parent_id: 3},
          { id: 16, name: "Cocina", type: 3, color: "red", icon: "kitchen-set", parent_id: 3},
          { id: 17, name: "Libros Infantiles", type: 6, color: "purple", icon: "book-skull", parent_id: 6},
          { id: 18, name: "Maquillaje", type: 8, color: "green", icon: "soap", parent_id: 8},
          { id: 19, name: "Suplementos", type: 7, color: "blue", icon: "prescription-bottle", parent_id: 7},
          { id: 20, name: "Sillas", type: 3, color: "yellow", icon: "chair", parent_id: 3},
        ];

        const insertPromises = categories.map((category) => insertCategory(category));
        await Promise.all(insertPromises);
        console.log("✅ Categorías de prueba insertadas correctamente.");
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
    const db = await openDatabase();
    if (!db) return "❌ La base de datos no está inicializada.";

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
export const updateCategory = async (category: Category): Promise<boolean> => {
    const db = await openDatabase();
    if (!db) return false;

    try {
        const query = `UPDATE category SET name = ?, type = ?, color = ?, icon = ?, parent_id = ? WHERE id = ?`;
        const values = [category.name, category.type, category.color, category.icon, category.parent_id, category.id];

        await db!.run(query, values);
        return true;
    } catch (error) {
        console.error("❌ Error al actualizar categoría");
        return false;
    }
}

/**
 * Obtiene la categoría de un item a partir de su ID.
 * 
 * @param itemId 
 * @returns 
 */
export const getCategoryFromItem = async (itemId: number): Promise<Category | null> => {
    const db = await openDatabase();
    if (!db) return null;

    try {
        const query = `SELECT c.* FROM category c INNER JOIN item i ON c.id = i.category_id WHERE i.id = ?`;
        const values = [itemId];
        const result = await db!.query(query, values);
        return result.values?.[0] as Category || null;
    } catch (error) {
        console.error("❌ Error al obtener categoría del item");
        return null;
    }
}

/**
 * Obtiene las categorías padre de la base de datos.
 * @returns Promise<Category[]>
 */
export const getParentCategories = async (): Promise<Category[]> => {
    const db = await openDatabase();
    if (!db) return [];

    try {
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
    const db = await openDatabase();
    if (!db) return null;
    try {
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
    const db = await openDatabase();
    if (!db) return [];

    try {
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
    const db = await openDatabase();
    if (!db) return null;

    try {
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
    const db = await openDatabase();
    if (!db) return false;

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
export const getCategoryRatingMixByReviewId = async (reviewId: number): Promise<CategoryRatingMix[]> => {
    const db = await openDatabase();
    if (!db) return [];

    try {
        const query = `SELECT cr.id, cr.category_id, cr.name, crv.value FROM category_rating_value crv INNER JOIN category_rating cr ON crv.category_rating_id = cr.id WHERE review_id = ?`;
        const values = [reviewId];
        const result = await db!.query(query, values);

        return result.values as CategoryRatingMix[];
    } catch (error) {
        console.error("❌ Error al obtener valores de puntuación de categoría de la reseña");
        return [];
    }
}

export const insertDefaultCategories = async (db: any) => {
    const defaultReviewCategories = [
        // 🍔 Comida (Padre)
        { id: 1, name: i18n.t('categories.food'), type: 2, color: 'orange', icon: 'utensils', parent_id: null },

        // 📱 Tecnología (Padre)
        { id: 4, name: i18n.t('categories.electronics'), type: 2, color: 'blue', icon: 'plug', parent_id: null },

        // 👕 Moda (Padre)
        { id: 8, name: i18n.t('categories.fashion'), type: 2, color: 'gray', icon: 'tshirt', parent_id: null },

        // 🏥 Salud (Padre)
        { id: 9, name: i18n.t('categories.health'), type: 2, color: 'salmon', icon: 'heartbeat', parent_id: null },

        // 🎉 Entretenimiento (Padre)
        { id: 11, name: i18n.t('categories.entertainment'), type: 2, color: 'gold', icon: 'star', parent_id: null },

        // 🚗 Vehículos (Padre)
        { id: 16, name: i18n.t('categories.vehicles'), type: 2, color: 'brown', icon: 'car', parent_id: null },

        // ✈️ Viajes (Padre)
        { id: 17, name: i18n.t('categories.travel'), type: 2, color: 'cyan', icon: 'plane', parent_id: null },

        // 🏀 Deportes (Padre)
        { id: 18, name: i18n.t('categories.sports'), type: 2, color: 'green', icon: 'basketball-ball', parent_id: null },

        // 🏨 Hostelería (Padre)
        { id: 19, name: i18n.t('categories.hostelery'), type: 2, color: 'bordeaux', icon: 'concierge-bell', parent_id: null },
    ];


    const categoryRatings: CategoryRating[] = [
        // 🍔 Comida
        { id: 1, name: i18n.t('category-rating.taste'), category_id: 1 },
        { id: 2, name: i18n.t('category-rating.quality'), category_id: 1 },
        { id: 3, name: i18n.t('category-rating.price'), category_id: 1 },
        { id: 4, name: i18n.t('category-rating.presentation'), category_id: 1 },

        // 📱 Tecnología
        { id: 6, name: i18n.t('category-rating.performance'), category_id: 4 },
        { id: 7, name: i18n.t('category-rating.battery'), category_id: 4 },
        { id: 8, name: i18n.t('category-rating.camera'), category_id: 4 },
        { id: 9, name: i18n.t('category-rating.features'), category_id: 4 },
        { id: 10, name: i18n.t('category-rating.design'), category_id: 4 },

        // 👕 Moda
        { id: 11, name: i18n.t('category-rating.design'), category_id: 8 },
        { id: 12, name: i18n.t('category-rating.comfort'), category_id: 8 },
        { id: 13, name: i18n.t('category-rating.fit'), category_id: 8 },
        { id: 14, name: i18n.t('category-rating.quality'), category_id: 8 },
        { id: 15, name: i18n.t('category-rating.price'), category_id: 8 },

        // 🏥 Salud
        { id: 16, name: i18n.t('category-rating.effectiveness'), category_id: 9 },
        { id: 17, name: i18n.t('category-rating.scent'), category_id: 9 },
        { id: 18, name: i18n.t('category-rating.ingredients'), category_id: 9 },
        { id: 19, name: i18n.t('category-rating.price'), category_id: 9 },

        // 🎉 Entretenimiento
        { id: 20, name: i18n.t('category-rating.story'), category_id: 11 },
        { id: 21, name: i18n.t('category-rating.visuals'), category_id: 11 },
        { id: 22, name: i18n.t('category-rating.sound'), category_id: 11 },
        { id: 23, name: i18n.t('category-rating.originality'), category_id: 11 },

        // 🚗 Vehículos
        { id: 24, name: i18n.t('category-rating.performance'), category_id: 16 },
        { id: 25, name: i18n.t('category-rating.fuel_efficiency'), category_id: 16 },
        { id: 26, name: i18n.t('category-rating.safety'), category_id: 16 },
        { id: 27, name: i18n.t('category-rating.design'), category_id: 16 },

        // ✈️ Viajes
        { id: 28, name: i18n.t('category-rating.experience'), category_id: 17 },
        { id: 29, name: i18n.t('category-rating.organization'), category_id: 17 },
        { id: 30, name: i18n.t('category-rating.activities'), category_id: 17 },
        { id: 31, name: i18n.t('category-rating.fun'), category_id: 17 },

        // 🏀 Deportes
        { id: 32, name: i18n.t('category-rating.variety'), category_id: 18 },
        { id: 33, name: i18n.t('category-rating.fitness_benefits'), category_id: 18 },
        { id: 34, name: i18n.t('category-rating.teamwork'), category_id: 18 },
        { id: 35, name: i18n.t('category-rating.equipment_quality'), category_id: 18 },

        // 🏨 Hostelería
        { id: 36, name: i18n.t('category-rating.accessibility'), category_id: 19 },
        { id: 37, name: i18n.t('category-rating.professionalism'), category_id: 19 },
        { id: 38, name: i18n.t('category-rating.facilities'), category_id: 19 },
        { id: 39, name: i18n.t('category-rating.cleanliness'), category_id: 19 },
        { id: 40, name: i18n.t('category-rating.location'), category_id: 19 },
        { id: 41, name: i18n.t('category-rating.ambience'), category_id: 19 },
        { id: 42, name: i18n.t('category-rating.drink_quality'), category_id: 19 },
        { id: 43, name: i18n.t('category-rating.music'), category_id: 19 }
    ];


    for (const category of defaultReviewCategories) {
        await db.run(
            `INSERT INTO category (id, name, type, color, icon, parent_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [category.id, category.name, category.type, category.color, category.icon, category.parent_id]
        );
    }

    for (const categoryRating of categoryRatings) {
        await db.run(
            `INSERT INTO category_rating (id, name, category_id) VALUES (?, ?, ?)`,
            [categoryRating.id, categoryRating.name, categoryRating.category_id]
        );
    }

    console.log("✅ Categorías por defecto insertadas correctamente.");
}
