import { openDatabase } from "@/shared/database/database-service";
import { Item, ItemOption, Origin } from "@/shared/dto/Item";

/**
 * Cuenta el número de ítems en la base de datos.
 * @return Promise<number>
 * */
export const countItems = async (): Promise<number> => {
    const db = await openDatabase();
    if (!db) return 0;

    try {
        const query = `SELECT COUNT(*) as count FROM item`;
        const result = await db.query(query);
        return result.values[0].count as number;
    } catch (error) {
        console.error("❌ Error al contar ítems", error);
        return 0;
    }
}