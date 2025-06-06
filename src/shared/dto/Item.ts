export interface Item {
    id: number;
    name: string;
    image: string | null;
    category_id: number;
}

export interface ItemWithCategory {
    id: number;
    name: string;
    category_id: number;
}

export interface ItemOption {
    id: number;
    name: string;
    category_id: number;
    parent_category_id: number | null;
    parent_category_icon: string;
}

export interface Origin {
    origin_id: number;
    item_id: number;
}

export interface ItemFull {
    id: number;
    name: string;
    image: string | null;
    is_origin: boolean;
    created_at: string;
    updated_at: string;
    category_id: number;
    category_name: string;
    category_icon: string;
    category_color: string;
}

export interface ItemDisplay {
    id: number;
    name: string;
    average_rating: number;
    number_of_ratings: number;
    date_last_review: string;
    category_name: string;
    category_icon: string;
    category_color: string;
}

export interface OriginDisplay {
    id: number;
    name: string;
    average_rating: number;
    average_rating_all_items?: number;
    number_of_ratings: number;
    date_last_review: string;
    category_name: string;
    category_icon: string;
    category_color: string;
    average_category?: string;
    average_category_icon?: string;
    average_category_percentage?: number;
}
