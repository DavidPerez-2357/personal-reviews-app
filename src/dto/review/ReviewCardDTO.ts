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