import { db, resetAutoIncrement } from "../database-service.ts";
import { checkDB } from "../database-service";
import { Review, ReviewCardDTO, ReviewImage } from "../dto/Review.ts";

/**
 * Inserta una reseña en la base de datos.
 * @param review
 */
export const insertReview = async (review: Review): Promise<number | null> => {
    if (!checkDB()) return null;

    // Validación de rating
    if (review.rating < 0 || review.rating > 5) {
        console.error("❌ La calificación debe estar entre 0 y 5.");
        return null;
    }

    // Asignar las fechas si no se proporcionan
    const createdAt = review.created_at || new Date().toISOString();
    const updatedAt = review.updated_at || createdAt;

    // Consulta SQL para insertar la reseña
    const query = `INSERT INTO review (rating, comment, item_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?)`;
    const values = [
        review.rating, 
        review.comment, 
        review.item_id, 
        createdAt, 
        updatedAt
    ];

    try {
        const result = await db!.run(query, values);
        return result.changes?.lastId || null;  // Devuelve el ID de la reseña insertada
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
                   c.name                     AS category,
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
            { id: 1, rating: 5, comment: "Excelente rendimiento y calidad de cámara. Muy recomendable", item_id: 1, created_at: "2025-04-02T10:00:00Z", updated_at: "2025-04-02T10:00:00Z" },
            { id: 2, rating: 4, comment: "Buen equipo, aunque la batería podría ser mejor", item_id: 1, created_at: "2025-04-02T10:15:00Z", updated_at: "2025-04-02T10:15:00Z" },
            { id: 3, rating: 3, comment: "La pantalla es buena, pero algo frágil", item_id: 2, created_at: "2025-04-02T11:00:00Z", updated_at: "2025-04-02T11:00:00Z" },
            { id: 4, rating: 5, comment: "Rápido y ligero, perfecto para trabajar", item_id: 2, created_at: "2025-04-02T11:10:00Z", updated_at: "2025-04-02T11:10:00Z" },
            { id: 5, rating: 4, comment: "Muy cómodas, pero el ajuste no es perfecto", item_id: 3, created_at: "2025-04-02T12:00:00Z", updated_at: "2025-04-02T12:00:00Z" },
            { id: 6, rating: 5, comment: "Me encantan, son super cómodas y van con todo", item_id: 4, created_at: "2025-04-02T12:15:00Z", updated_at: "2025-04-02T12:15:00Z" },
            { id: 7, rating: 2, comment: "No muy cómoda para usarla durante muchas horas", item_id: 5, created_at: "2025-04-02T13:00:00Z", updated_at: "2025-04-02T13:00:00Z" },
            { id: 8, rating: 5, comment: "Excelente café, la uso todos los días", item_id: 6, created_at: "2025-04-02T13:45:00Z", updated_at: "2025-04-02T13:45:00Z" },
            { id: 9, rating: 4, comment: "Buen dispositivo, aunque me gustaría que tuviera más almacenamiento", item_id: 7, created_at: "2025-04-02T14:30:00Z", updated_at: "2025-04-02T14:30:00Z" },
            { id: 10, rating: 4, comment: "Ideal para viajes, no ocupa mucho espacio", item_id: 8, created_at: "2025-04-02T15:00:00Z", updated_at: "2025-04-02T15:00:00Z" },
            { id: 11, rating: 5, comment: "Muy buenos para entrenar, gran aislamiento del ruido", item_id: 9, created_at: "2025-04-02T16:00:00Z", updated_at: "2025-04-02T16:00:00Z" },
            { id: 12, rating: 5, comment: "Increíble calidad de sonido, se nota la diferencia", item_id: 10, created_at: "2025-04-02T16:30:00Z", updated_at: "2025-04-02T16:30:00Z" },
            { id: 13, rating: 4, comment: "Es cómodo, pero el teclado es un poco ruidoso", item_id: 11, created_at: "2025-04-02T17:00:00Z", updated_at: "2025-04-02T17:00:00Z" },
            { id: 14, rating: 5, comment: "Ideal para tocar en casa o fuera", item_id: 12, created_at: "2025-04-02T18:00:00Z", updated_at: "2025-04-02T18:00:00Z" },
            { id: 15, rating: 3, comment: "Buena relación calidad-precio, pero la estructura no es tan duradera", item_id: 13, created_at: "2025-04-02T19:00:00Z", updated_at: "2025-04-02T19:00:00Z" },
            { id: 16, rating: 4, comment: "Muy buena, pero el asiento podría ser más cómodo", item_id: 14, created_at: "2025-04-02T19:30:00Z", updated_at: "2025-04-02T19:30:00Z" },
            { id: 17, rating: 4, comment: "Bien, pero me gustaría que tuviera más opciones de ajuste", item_id: 15, created_at: "2025-04-02T20:00:00Z", updated_at: "2025-04-02T20:00:00Z" },
            { id: 18, rating: 5, comment: "Es una de las mejores sillas que he probado", item_id: 16, created_at: "2025-04-02T20:30:00Z", updated_at: "2025-04-02T20:30:00Z" },
            { id: 19, rating: 2, comment: "No me gustó mucho, el funcionamiento no es lo esperado", item_id: 17, created_at: "2025-04-02T21:00:00Z", updated_at: "2025-04-02T21:00:00Z" },
            { id: 20, rating: 4, comment: "Buen smartwatch, aunque la pantalla podría ser más grande", item_id: 18, created_at: "2025-04-02T21:30:00Z", updated_at: "2025-04-02T21:30:00Z" },
            { id: 21, rating: 5, comment: "Excelente calidad, me ayudó a mejorar mi postura", item_id: 19, created_at: "2025-04-02T22:00:00Z", updated_at: "2025-04-02T22:00:00Z" },
            { id: 22, rating: 3, comment: "Buena, pero esperaba un mejor sonido", item_id: 20, created_at: "2025-04-02T22:30:00Z", updated_at: "2025-04-02T22:30:00Z" },
            { id: 23, rating: 4, comment: "Excelente calidad, pero un poco cara", item_id: 21, created_at: "2025-04-02T23:00:00Z", updated_at: "2025-04-02T23:00:00Z" },
            { id: 24, rating: 5, comment: "Ideal para ver películas y jugar", item_id: 22, created_at: "2025-04-02T23:30:00Z", updated_at: "2025-04-02T23:30:00Z" },
            { id: 25, rating: 4, comment: "Muy buena calidad, pero algo frágil", item_id: 23, created_at: "2025-04-03T00:00:00Z", updated_at: "2025-04-03T00:00:00Z" },
            { id: 26, rating: 5, comment: "Increíble para deportes de aventura, la recomiendo", item_id: 24, created_at: "2025-04-03T00:30:00Z", updated_at: "2025-04-03T00:30:00Z" },
            { id: 27, rating: 5, comment: "Es genial para todos los detalles que muestra", item_id: 25, created_at: "2025-04-03T01:00:00Z", updated_at: "2025-04-03T01:00:00Z" },
            { id: 28, rating: 4, comment: "Buena guitarra, aunque la caja es un poco pequeña", item_id: 12, created_at: "2025-04-03T01:30:00Z", updated_at: "2025-04-03T01:30:00Z" },
            { id: 29, rating: 5, comment: "Una maravilla, no me arrepiento de comprarlo", item_id: 1, created_at: "2025-04-03T02:00:00Z", updated_at: "2025-04-03T02:00:00Z" },
            { id: 30, rating: 3, comment: "Lo tengo hace poco, y no me termina de convencer", item_id: 5, created_at: "2025-04-03T02:30:00Z", updated_at: "2025-04-03T02:30:00Z" } 
        ];
          

        for (const review of reviews) {
            // No need for type assertion anymore
            await insertReview(review);
        }
        return "✅ Reseñas de prueba insertadas correctamente.";
    } catch (error) {
        console.error("❌ Error al insertar reseñas de prueba:", error);
        return "❌ Error al insertar reseñas de prueba.";
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
