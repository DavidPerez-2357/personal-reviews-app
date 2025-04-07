import { db } from "../database-service.ts";
import { checkDB } from "../database-service";
import { Review } from "../dto/review/Review";
import { ReviewCardDTO } from "../dto/review/ReviewCardDTO";
import { ReviewImage } from "../dto/review/ReviewImage";

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
        console.error("❌ Error al insertar reseña:", error);
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
        console.error("❌ Error al obtener reseñas:", error);
        return [];
    }
};

/**
 * Obtiene todas las reseñas de la base de datos en formato DTO.
 * @returns Promise<ReviewCardDTO[]>
 */
export const getReviewsCards = async (): Promise<ReviewCardDTO[]> => {
    try {
        if (!checkDB()) return [{ id: -1, comment: "❌ La base de datos no está inicializada.", rating: 0, created_at: "", updated_at: "", images: [], category: "", item: "" }];
        const query = `
            SELECT r.id,
                   r.comment,
                   r.rating,
                   r.created_at,
                   r.updated_at,
                   i.name                      AS item,
                   c.title                     AS category,
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
                item: row.item,
            }));
        } else {
            console.error("❌ Error al obtener reseñas:", result);
            return [{ id: -1, comment: "❌ Error al obtener reseñas.", rating: 0, created_at: "", updated_at: "", images: [], category: "", item: "" }];
        }
    } catch (error) {
        console.error("❌ Error al obtener reseñas:", error);
        return [{ id: -1, comment: "❌ Error al obtener reseñas.", rating: 0, created_at: "", updated_at: "", images: [], category: "", item: "" }];
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
        console.error("❌ Error al obtener imágenes de reseñas:", error);
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
        console.error("❌ Error al insertar imagen de reseña:", error);
        return null;
    }
};

/**
 * Inserta varias imágenes de prueba en la base de datos.
 * @returns Promise<void>
 */
export const insertTestReviewImages = async (): Promise<string> => {
    if (!checkDB()) return "❌ La base de datos no está inicializada.";

    try {
        const images = [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
            "https://example.com/image3.jpg",
        ];

        for (const image of images) {
            await insertReviewImage({image, review_id: 1});
        }
        return "✅ Imágenes de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar imágenes de prueba:", error);
        return "❌ Error al insertar imágenes de prueba.";
    }
};

/**
 * Inserta varias reseñas de prueba en la base de datos.
 * @returns Promise<void>
 */
export const insertTestReviews = async (): Promise<string> => {
    if (!checkDB()) return "❌ La base de datos no está inicializada.";

    try {
        const reviews = [
            {rating: 5, comment: "Excelente producto", item_id: 1},
            {rating: 4, comment: "Muy bueno", item_id: 2},
            {rating: 3, comment: "Regular", item_id: 3},
        ];

        for (const review of reviews) {
            await insertReview(review);
        }
        return "✅ Reseñas de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar reseñas de prueba:", error);
        return "❌ Error al insertar reseñas de prueba.";
    }
}