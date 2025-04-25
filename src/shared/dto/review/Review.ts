export interface Review {
    id: number; // ID de la reseña
    rating: number; // Debe estar entre 0 y 5
    comment: string | null; // Puede no tener comentario
    item_id: number;
}