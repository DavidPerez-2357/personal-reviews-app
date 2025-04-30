import { db } from "@/database-service.ts";
import { checkDB } from "@/database-service";
import { Review, ReviewFull, ReviewImage } from "@dto/Review";

/**
 * Inserta una reseña en la base de datos.
 * @param review
 */
export const insertReview = async (review: Review): Promise<number | null> => {
    if (!checkDB()) return null;
    if (review.rating < 0 || review.rating > 5) {
        console.error("❌ La calificación debe estar entre 0 y 5.");
        return null;
    }

    try {
        const query = `INSERT INTO review (rating, comment, item_id)
                       VALUES (?, ?, ?)`;
        const values = [review.rating, review.comment ?? null, review.item_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar reseña");
        return null;
    }
};



/**
 * Obtiene todas las reseñas de la base de datos.
 * @returns Promise<Review[]>
 */
export const getReviews = async (): Promise<Review[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT *
                       FROM review`;
        const result = await db!.query(query);
        return result.values as Review[];
    } catch (error) {
        console.error("❌ Error al obtener reseñas");
        return [];
    }
};

/**
 * Obtiene todas las reseñas de la base de datos en formato DTO.
 * @returns Promise<ReviewCardDTO[]>
 */
export const getReviewsCards = async (): Promise<ReviewFull[]> => {
    try {
        if (!checkDB()) {
            console.error("❌ Error: La base de datos no está inicializada.");
            return [];
        };
        const query = `
            SELECT r.id,
                   r.comment,
                   r.rating,
                   r.created_at,
                   r.updated_at,
                   i.name                      AS item,
                   c.name                     AS category,
                   c.icon                     AS icon,
                   GROUP_CONCAT(COALESCE(ri.image, '')) AS images
            FROM review r
                     JOIN item i ON r.item_id = i.id
                     JOIN category c ON i.category_id = c.id
                     LEFT JOIN review_image ri ON r.id = ri.review_id
            GROUP BY r.id;
        `;
        const result = await db!.query(query);
        if (result && result.values) {
            return result.values.map((row) => ({
                id: row.id,
                comment: row.comment,
                rating: row.rating,
                created_at: row.created_at,
                updated_at: row.updated_at,
                images: row.images ? row.images.split(',') : [],
                category: row.category,
                icon: row.icon,
                item: row.item,
            }));
        } else {
            console.error("❌ Error al obtener reseñas:", result);
            return [];
        }
    } catch (error) {
        console.error("❌ Error al obtener reseñas");
        return [];
    }
};

/**
 * Obtiene todas las imágenes de reseñas de la base de datos.
 * @returns Promise<ReviewImage[]>
 */
export const getReviewImages = async (): Promise<ReviewImage[]> => {
    try {
        if (!checkDB()) return [];
        const query = `SELECT *
                       FROM review_image`;
        const result = await db!.query(query);
        return result.values as ReviewImage[];
    } catch (error) {
        console.error("❌ Error al obtener imágenes de reseñas");
        return [];
    }
};

/**
 * Inserta una imagen de reseña en la base de datos.
 * @param reviewImage
 */
export const insertReviewImage = async (reviewImage: ReviewImage): Promise<number | null> => {
    if (!checkDB()) return null;

    try {
        const query = `INSERT INTO review_image (image, review_id)
                       VALUES (?, ?)`;
        const values = [reviewImage.image, reviewImage.review_id];

        const result = await db!.run(query, values);
        return result.changes?.lastId || null;
    } catch (error) {
        console.error("❌ Error al insertar imagen de reseña");
        return null;
    }
};

/**
 * Inserta varias imágenes de prueba en la base de datos.
 * @returns Promise<void>
 */
export const insertTestReviewImages = async (): Promise<string> => {
    if (!checkDB()) return "❌ La base de datos no está inicializada.";

    const existingImages = await getReviewImages();
    if (existingImages.length > 0) {
        console.log("❌ Ya existen imágenes de reseñas en la base de datos. No se insertan imágenes de prueba.");
        return "❌ Ya existen imágenes de reseñas en la base de datos. No se insertan imágenes de prueba.";
    }

    try {
        const images: ReviewImage[] = [
            { image: "https://www.abrirllave.com/html/images/dos-parrafos-bloc-de-notas.gif", review_id: 1 },
            { image: "https://www.lluiscodina.com/wp-content/uploads/2019/05/html-5-ejemplo-de-marcado.png", review_id: 1 },
            { image: "https://www.loading.es/blog/wp-content/uploads/ejemplo-html-codigo-editor.jpg", review_id: 2 },
            { image: "https://iessantabarbara.es/departamentos/fisica/tecnologia/formacion/www/html01.png", review_id: 3 },
            { image: "https://www.ampersoundmedia.com/wp-content/uploads/2020/07/html-scaled.jpg", review_id: 4 },
            { image: "https://www.abrirllave.com/html/images/dos-parrafos-bloc-de-notas.gif", review_id: 5 },
            { image: "https://www.lluiscodina.com/wp-content/uploads/2019/05/html-5-ejemplo-de-marcado.png", review_id: 6 },
            { image: "https://www.loading.es/blog/wp-content/uploads/ejemplo-html-codigo-editor.jpg", review_id: 7 },
            { image: "https://iessantabarbara.es/departamentos/fisica/tecnologia/formacion/www/html01.png", review_id: 8 },
            { image: "https://www.ampersoundmedia.com/wp-content/uploads/2020/07/html-scaled.jpg", review_id: 9 },
        ];

        for (const image of images) {
            await insertReviewImage(image);
        }
        console.log("✅ Imágenes de prueba insertadas correctamente.");
        return "✅ Imágenes de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar imágenes de prueba");
        return "❌ Error al insertar imágenes de prueba.";
    }
};

/**
 * Inserta varias reseñas de prueba en la base de datos.
 * @returns Promise<string>
 */
export const insertTestReviews = async (): Promise<string> => {
    if (!checkDB()) return "❌ La base de datos no está inicializada.";

    // Verifica si ya existen reseñas en la base de datos
    const existingReviews = await getReviews();
    if (existingReviews.length > 0) {
        console.log("❌ Ya existen reseñas en la base de datos. No se insertan reseñas de prueba.");
        return "❌ Ya existen reseñas en la base de datos. No se insertan reseñas de prueba.";
    }

    try {
        // Use the full Review interface, assuming id, created_at, updated_at are handled by DB/insertReview
        const reviews: Review[] = [
            { id: 1, rating: 5, comment: "Excelente rendimiento y calidad de cámara. Muy recomendable", item_id: 1},
            { id: 2, rating: 4, comment: "Buen equipo, aunque la batería podría ser mejor", item_id: 1},
            { id: 3, rating: 3, comment: "La pantalla es buena, pero algo frágil", item_id: 2},
            { id: 4, rating: 5, comment: "Rápido y ligero, perfecto para trabajar", item_id: 2},
            { id: 5, rating: 4, comment: "Muy cómodas, pero el ajuste no es perfecto", item_id: 3},
            { id: 6, rating: 5, comment: "Me encantan, son super cómodas y van con todo", item_id: 4},
            { id: 7, rating: 2, comment: "No muy cómoda para usarla durante muchas horas", item_id: 5},
            { id: 8, rating: 5, comment: "Excelente café, la uso todos los días", item_id: 6},
            { id: 9, rating: 4, comment: "Buen dispositivo, aunque me gustaría que tuviera más almacenamiento", item_id: 7},
            { id: 10, rating: 4, comment: "Ideal para viajes, no ocupa mucho espacio", item_id: 8},
            { id: 11, rating: 5, comment: "Muy buenos para entrenar, gran aislamiento del ruido", item_id: 9},
            { id: 12, rating: 5, comment: "Increíble calidad de sonido, se nota la diferencia", item_id: 10},
            { id: 13, rating: 4, comment: "Es cómodo, pero el teclado es un poco ruidoso", item_id: 11},
            { id: 14, rating: 5, comment: "Ideal para tocar en casa o fuera", item_id: 12},
            { id: 15, rating: 3, comment: "Buena relación calidad-precio, pero la estructura no es tan duradera", item_id: 13},
            { id: 16, rating: 4, comment: "Muy buena, pero el asiento podría ser más cómodo", item_id: 14},
            { id: 17, rating: 4, comment: "Bien, pero me gustaría que tuviera más opciones de ajuste", item_id: 15},
            { id: 18, rating: 5, comment: "Es una de las mejores sillas que he probado", item_id: 16},
            { id: 19, rating: 2, comment: "No me gustó mucho, el funcionamiento no es lo esperado", item_id: 17},
            { id: 20, rating: 4, comment: "Buen smartwatch, aunque la pantalla podría ser más grande", item_id: 18},
            { id: 21, rating: 5, comment: "Excelente calidad, me ayudó a mejorar mi postura", item_id: 19},
            { id: 22, rating: 3, comment: "Buena, pero esperaba un mejor sonido", item_id: 20},
            { id: 23, rating: 4, comment: "Excelente calidad, pero un poco cara", item_id: 21},
            { id: 24, rating: 5, comment: "Ideal para ver películas y jugar", item_id: 22},
            { id: 25, rating: 4, comment: "Muy buena calidad, pero algo frágil", item_id: 23},
            { id: 26, rating: 5, comment: "Increíble para deportes de aventura, la recomiendo", item_id: 24},
            { id: 27, rating: 5, comment: "Es genial para todos los detalles que muestra", item_id: 25},
            { id: 28, rating: 4, comment: "Buena guitarra, aunque la caja es un poco pequeña", item_id: 12},
            { id: 29, rating: 5, comment: "Una maravilla, no me arrepiento de comprarlo", item_id: 1},
            { id: 30, rating: 3, comment: "Lo tengo hace poco, y no me termina de convencer", item_id: 5} 
        ];
          

        for (const review of reviews) {
            // No need for type assertion anymore
            await insertReview(review);
        }
        return "✅ Reseñas de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar reseñas de prueba");
        return "❌ Error al insertar reseñas de prueba.";
    }
}

/**
 * Actualiza una reseña en la base de datos.
 * 
 * @param review 
 * @returns 
 */
export const updateReview = async (review: Review): Promise<boolean> => {
    if (!checkDB()) return false;
    if (review.rating < 0 || review.rating > 5) {
        console.error("❌ La calificación debe estar entre 0 y 5.");
        return false;
    }

    try {
        const query = `UPDATE review
                       SET rating = ?,
                           comment = ?,
                           item_id = ?
                       WHERE id = ?`;
        const values = [review.rating, review.comment ?? null, review.item_id, review.id];

        const result = await db!.run(query, values);
        return (result.changes?.changes ?? 0) > 0;

    } catch (error) {
        console.error("❌ Error al actualizar reseña");
        return false;
    }
}
/**
 * Elimina una reseña de la base de datos.
 * 
 * @param id 
 * @returns 
 */
export const getReviewById = async (id: number): Promise<Review | null> => {
    if (!checkDB()) return null;
    try {
        const query = `SELECT * FROM review WHERE id = ?`;
        const result = await db!.query(query, [id]);
        return result.values && result.values[0] as Review || null;
    } catch (error) {
        console.error("❌ Error al obtener reseña por ID");
        return null;
    }
}

/**
 * Obtiene todas las imágenes de una reseña por su ID.
 * 
 * @param id 
 * @returns 
 */
export const getReviewImagesbyId = async (id: number): Promise<ReviewImage[]> => {
    if (!checkDB()) return [];
    try {
        const query = `SELECT * FROM review_image WHERE review_id = ?`;
        const result = await db!.query(query, [id]);
        return result.values as ReviewImage[] || [];
    } catch (error) {
        console.error("❌ Error al obtener imágenes de reseña por ID", error);
        return [];
    }
}

/**
 * Elimina las imágenes de una reseña por su ID.
 * 
 * @param id 
 * @returns 
 */
export const deleteReviewImages = async (reviewId: number): Promise<boolean> => {
    if (!checkDB()) return false;
    try {
        const query = `DELETE FROM review_image WHERE review_id = ?`;
        const result = await db!.run(query, [reviewId]);
        return (result.changes?.changes ?? 0) > 0;
    } catch (error) {
        console.error("❌ Error al eliminar imágenes de reseña", error);
        return false;
    }
}

/**
 * Elimina todas las reseñas de la base de datos.
 * * @returns Promise<boolean>
 */
export const deleteAllReviews = async (): Promise<boolean> => {
    if (!checkDB()) return false;
    try {
        const query = `DELETE FROM review`;
        await db!.run(query);
        console.log("✅ Todas las reseñas han sido eliminadas.");
        return true;
    } catch (error) {
        console.error("❌ Error al eliminar reseñas:", error);
        return false;
    }
}
