
export interface Category {
    id: number;
    name: string;
    icon: string; // URL de la imagen del icono
    color: string;
    type: number; // Tipo de categoría (0: item, 1: review)
    parent_id: number | null; // ID de la categoría padre (null si es raíz)
}

export interface CategoryRating {
    id: number;
    name: string;
    category_id: number;
}

export interface CategoryRatingMix {
    id: number;
    category_id: number;
    name: string;
    value: number; // Debe estar entre 0 y 10
}

export interface CategoryRatingValue {
    id: number;
    value: number;
    review_id: number;
    category_rating_id: number;
}
