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