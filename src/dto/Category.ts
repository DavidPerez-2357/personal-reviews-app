export interface Category {
    id: number;
    name: string;
    type: number;
    color: string;
    icon: string;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface CategoryRating {
    id: number;
    name: string;
    value: number;
    category_id: number;
}

export interface CategoryRatingValue {
    id: number;
    value: number; // Debe estar entre 0 y 100
    item_id: number;
    category_rating_id: number;
}