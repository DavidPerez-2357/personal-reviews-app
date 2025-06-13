import { openDatabase } from "@/shared/database/database-service";
import { Category } from "@/shared/dto/Category";

export const getCategoriesPaginated = async (page: number, size: number, searchTerm = ""): Promise<Category[]> => {
    const db = await openDatabase();
    if (!db) return [];

    try {
        const offset = page * size;
        const query = `
            SELECT * FROM category
            WHERE name LIKE ? and parent_id IS NULL
            ORDER BY id DESC
            LIMIT ? OFFSET ?`;
        const params = [`%${searchTerm}%`, size, offset];
        const result = await db!.query(query, params);

        return result.values as Category[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export const countCategories = async (): Promise<number> => {
    const db = await openDatabase();
    if (!db) return 0;

    try {
        const query = `SELECT COUNT(*) as count FROM category WHERE parent_id IS NULL`;
        const result = await db.query(query);
        return result.values[0].count as number;
    } catch (error) {
        console.error("Error counting categories:", error);
        return 0;
    }
}

export const countCategoriesFiltered = async (searchTerm: string): Promise<number> => {
    const db = await openDatabase();
    if (!db) return 0;

    try {
        const query = `SELECT COUNT(*) as count FROM category WHERE name LIKE ? and parent_id IS NULL`;
        const result = await db.query(query, [`%${searchTerm}%`]);
        return result.values[0].count as number;
    } catch (error) {
        console.error("Error counting filtered categories:", error);
        return 0;
    }
}