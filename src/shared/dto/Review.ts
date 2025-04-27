export interface Review {
    id: number;
    rating: number;
    comment: string | null; 
    item_id: number;
}

export interface ReviewFull {
    id: number;
    comment: string;
    rating: number;
    created_at: string;
    updated_at: string;
    images: string[];
    category: string;
    icon: string;
    item: string;
}

export interface ReviewImage {
    image: string;
    review_id: number;
}