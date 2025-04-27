export interface CategoryRating {
    id: number;
    name: string;
    category_id: number;
}

export interface CategoryRatingMix {
    id: number;
    name: string;
    value: number; // Debe estar entre 0 y 10
}