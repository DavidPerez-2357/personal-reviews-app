export interface Category {
    id: number;
    title: string;
    type: number;
    color: string;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
}