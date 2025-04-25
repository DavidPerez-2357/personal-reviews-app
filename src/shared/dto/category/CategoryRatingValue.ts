export interface CategoryRatingValue {
    id: number;
    value: number; // Debe estar entre 0 y 10
    review_id: number;
    category_rating_id: number;
}