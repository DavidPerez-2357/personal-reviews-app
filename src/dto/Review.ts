export interface Review {
    id: number; // ID de la reseña
    rating: number; // Debe estar entre 0 y 5
    comment: string | null; // Puede no tener comentario
    item_id: number;
    created_at: string; // Fecha de creación en formato ISO
    updated_at: string; // Fecha de actualización en formato ISO
}

export interface ReviewCardDTO {
    id: number;
    comment: string;
    rating: number;
    created_at: string;
    updated_at: string;
    images: string[];
    category: string;
    item: string;
}

export interface ReviewImage {
    image: string;
    review_id: number;
}