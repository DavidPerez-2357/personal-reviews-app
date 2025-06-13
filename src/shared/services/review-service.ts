import { Review, ReviewFull, ReviewImage } from "@dto/Review";
import { openDatabase } from "../database/database-service";

/**
 * Inserta una reseña en la base de datos.
 * @param review
 */
export const insertReview = async (review: Review): Promise<number | null> => {
    const db = await openDatabase();
    if (!db) return null;
    if (review.rating < 0 || review.rating > 5) {
        console.error("❌ La calificación debe estar entre 0 y 5.");
        return null;
    }

    try {
        const query = `INSERT INTO review (rating, comment, item_id)
                       VALUES (?, ?, ?)`;
        const values = [review.rating, review.comment?.trim() ?? null, review.item_id];

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
    const db = await openDatabase();
    if (!db) return [];

    try {
        const query = `SELECT * FROM review`;
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
    const db = await openDatabase();
    if (!db) return [];

    try {
        const query = `
            SELECT r.id,
                   r.comment,
                   r.rating,
                   r.created_at,
                   r.updated_at,
                   i.id                       AS item_id,
                   i.name                      AS item,
                   c.id                       AS category_id,
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
            return result.values.map((row: any) => ({
                id: row.id,
                comment: row.comment,
                rating: row.rating,
                created_at: row.created_at,
                updated_at: row.updated_at,
                images: row.images ? row.images.split(',') : [],
                category_id: row.category_id,
                category: row.category,
                icon: row.icon,
                item_id: row.item_id,
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
    const db = await openDatabase();
    if (!db) return [];

    try {
        const query = `SELECT * FROM review_image`;
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
    const db = await openDatabase();
    if (!db) return null;

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
 * Actualiza una reseña en la base de datos.
 * 
 * @param review 
 * @returns 
 */
export const updateReview = async (review: Review): Promise<boolean> => {
    const db = await openDatabase();
    if (!db) return false;
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
        const values = [review.rating, review.comment?.trim() ?? null, review.item_id, review.id];

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
    const db = await openDatabase();
    if (!db) return null;
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
    const db = await openDatabase();
    if (!db) return [];
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
    const db = await openDatabase();
    if (!db) return false;
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
 * Elimina una reseña de la base de datos.
 * 
 * @param id 
 * @returns 
 */
export const deleteReview = async (id: number): Promise<boolean> => {
    const db = await openDatabase();
    if (!db) return false;
    try {
        const query = `DELETE FROM review WHERE id = ?`;
        await db!.run(query, [id]);
        return true; // Siempre devuelve true si no hay error
    } catch (error) {
        console.error("❌ Error al eliminar reseña", error);
        return false;
    }
}

/**
 * Devuelve las reseñas de un ítem.
 * 
 * @param itemId
 * @returns Promise<Review[]>
 */
export const getReviewsByItemId = async (itemId: number): Promise<Review[]> => {
    const db = await openDatabase();
    if (!db) return [];
    try {
        const query = `select
                            r.id,
                            r.rating,
                            r.comment,
                            r.item_id,
                            r.created_at,
                            r.updated_at
                            from review r
                            join item i on i.id = r.item_id
                            where i.id = ?;`;
        const result = await db!.query(query, [itemId]);
        return result.values as Review[] || [];
    } catch (error) {
        console.error("❌ Error al obtener reseñas por ID de ítem", error);
        return [];
    }
}