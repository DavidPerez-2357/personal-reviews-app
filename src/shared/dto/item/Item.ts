export interface Item {
    id: number;
    name: string;
    image: string | null;
    category_id: number;
}

export interface ItemOption {
    id: number;
    name: string;
    category_id: number;
    parent_category_id: number | null;
    parent_category_icon: string;
}