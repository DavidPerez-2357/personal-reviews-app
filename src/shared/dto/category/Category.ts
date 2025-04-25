export interface Category {
    id: number;
    name: string;
    type: number;
    color: string;
    icon: string;
    parent_id: number | null;
}