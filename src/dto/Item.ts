export interface Item {
    id: number;
    name: string;
    image: string | null;
    rating: number;
    category_id: number;
}

export interface Origin {
    origin_id: number;
    item_id: number;
}