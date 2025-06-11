import { openDatabase } from "@/shared/database/database-service";
import { ItemType } from "@/shared/dto/Filter";
import { ItemDisplay } from "@/shared/dto/Item";

/**
 * Cuenta el número de ítems en la base de datos.
 * @return Promise<number>
 * */
export const countItems = async (): Promise<number> => {
    const db = await openDatabase();
    if (!db) return 0;

    try {
        const query = `SELECT COUNT(*) as count FROM item i
                        WHERE i.is_origin = 0`; // Solo cuenta ítems que no están asociados a un origen
        const result = await db.query(query);
        return result.values[0].count as number;
    } catch (error) {
        console.error("❌ Error al contar ítems", error);
        return 0;
    }
}

export const countOrigins = async (): Promise<number> => {
  const db = await openDatabase();
  if (!db) return 0;

  try {
    const query = `SELECT COUNT(*) as count FROM item i
                    WHERE i.is_origin = 1`; // Solo cuenta ítems que son orígenes
    const result = await db.query(query);
    return result.values[0].count as number;
  } catch (error) {
    console.error("❌ Error al contar orígenes", error);
    return 0;
  }
}

export const countItemsFiltered = async (
  searchTerm: string,
  filters: { category?: number[]; type: ItemType },
  areItemsGrouped: boolean
): Promise<number> => {
  const db = await openDatabase();
  if (!db) return 0;

  const params: any[] = [];
  const whereClauses: string[] = [];

  // --- Filtro por búsqueda
  if (searchTerm) {
    whereClauses.push(`name LIKE ?`);
    params.push(`%${searchTerm}%`);
  }

  // --- Filtro por categoría
  if (filters.category !== undefined) {
    const placeholders = filters.category.map(() => '?').join(', ');
    whereClauses.push(`i.category_id IN (${placeholders})`);
    params.push(...filters.category); // <-- separa los valores individualmente
  }

  // --- Filtro por tipo
  if (filters.type !== 'all') {
    // --- Filtro por tipo
    whereClauses.push(`i.is_origin = ?`);
    params.push(filters.type === 'origin' ? 1 : 0);
  }

  if (areItemsGrouped) {
    // Si los ítems están agrupados, no se cuenta el origen
    whereClauses.push(`oi.origin_id IS NULL`);
  }

  // --- Construcción de la consulta base
  let query = `SELECT COUNT(*) as count FROM item i LEFT JOIN origin_item oi ON i.id = oi.item_id`;

  // --- Aplicar filtros
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  try {
    const result = await db.query(query, params);
    return result.values[0].count as number;
  } catch (error) {
    console.error('❌ Error al contar ítems filtrados:', error);
    return 0;
  }
}

interface SortOptions {
  type: 'date' | 'rating' | 'name' | 'none';
  order: 'asc' | 'desc' | 'none';
}

interface FilterOptions {
  category?: number[];
  type: ItemType;
}

export const getItemsDisplay = async (
  page: number,
  size: number,
  searchTerm: string,
  sort: SortOptions,
  filters: FilterOptions,
  areItemsGrouped: boolean
): Promise<ItemDisplay[]> => {
  const db = await openDatabase();
  if (!db) return [];

  const offset = page * size;
  const params: any[] = [];
  const whereClauses: string[] = [];

  // --- Filtro por búsqueda
  if (searchTerm) {
    whereClauses.push(`i.name LIKE ?`);
    params.push(`%${searchTerm}%`);
  }

  // --- Filtro por categoría
  if (filters.category !== undefined) {
    const placeholders = filters.category.map(() => '?').join(', ');
    whereClauses.push(`i.category_id IN (${placeholders})`);
    params.push(...filters.category); // <-- separa los valores individualmente
  }

  if (filters.type !== 'all') {
    // --- Filtro por tipo
    whereClauses.push(`i.is_origin = ?`);
    params.push(filters.type === 'origin' ? 1 : 0);
  }

  if (areItemsGrouped) {
    // Si los ítems están agrupados, no se cuenta el origen
    whereClauses.push(`oi.origin_id IS NULL`);
  }

  // --- Construcción de la consulta base
  let query = `
    SELECT
      i.id,
      i.name,
      i.image,
      i.is_origin,
      case when oi.origin_id is not null then oi.origin_id else null end as origin_id,
      COUNT(r.rating) AS number_of_reviews,
      c.icon AS category_icon,
      c.color AS category_color,
      (
        SELECT r2.rating
        FROM review r2
        WHERE r2.item_id = i.id
        ORDER BY r2.created_at DESC
        LIMIT 1
      ) AS last_rating
    FROM item i
    LEFT JOIN review r ON i.id = r.item_id
    LEFT JOIN category c ON i.category_id = c.id
    LEFT JOIN origin_item oi ON i.id = oi.item_id
  `;

  // --- Aplicar filtros
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // --- Agrupamiento
  query += ` GROUP BY i.id, c.icon, c.color`;

  // --- Ordenamiento
  const { type: sortType, order: sortOrder } = sort;
  if (sortType !== 'none' && sortOrder !== 'none') {
    const sortColumnMap: Record<string, string> = {
      date: 'i.created_at',
      rating: 'last_rating',
      name: 'i.name',
    };
    const sortColumn = sortColumnMap[sortType];
    if (sortColumn) {
      query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;
    }
  }else {
    // Si no hay ordenamiento, se ordena por ID por defecto
    query += ` ORDER BY i.id DESC`;
  }

  if (!areItemsGrouped) {
    // Si los ítems están agrupados, se ordena por el ID del origen
    query += `, oi.origin_id DESC`;
  }

  // --- Paginación
  query += ` LIMIT ? OFFSET ?`;
  params.push(size, offset);

  try {
    const result = await db.query(query, params);
    return result.values.map((row: any) => ({
      id: row.id,
      name: row.name,
      image: row.image || null,
      last_rating: row.last_rating || 0,
      origin_id: row.origin_id || null,
      number_of_reviews: row.number_of_reviews || 0,
      is_origin: row.is_origin,
      category_icon: row.category_icon,
      category_color: row.category_color
    })) as ItemDisplay[];
  } catch (error) {
    console.error('❌ Error al obtener ítems:', error);
    return [];
  }
};