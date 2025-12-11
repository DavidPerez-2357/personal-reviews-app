export interface Review {
    id: number;
    rating: number;
    comment: string;
    item_id: number;
    created_at: string;
    updated_at: string;
}

export interface ReviewFull {
    id: number;
    comment: string;
    rating: number;
    created_at: string;
    updated_at: string;
    images: string[];
    category_id: number;
    category: string;
    icon: string;
    item_id: number;
    item: string;
}

export interface ReviewImage {
    image: string;
    review_id: number;
}