export interface Item {
    id: number;
    name: string;
    image: string | null;
    rating: number;
    category_id: number;
}

export interface ItemOption {
    id: number;
    name: string;
    category_id: number;
}