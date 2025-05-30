import { openDatabase } from "@/shared/database/database-service";
import { ItemType } from "@/shared/dto/Filter";
import { Item, ItemDisplay, ItemFull, ItemOption, Origin } from "@/shared/dto/Item";

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

export const countItemsFiltered = async (
  searchTerm: string,
  filters: { category?: number[]; type: ItemType }
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
  if (filters.category !== undefined && filters.category.length > 0) {
    whereClauses.push(`category_id IN (?)`);
    params.push(filters.category.join(','));
  }

  // --- Filtro por tipo
  if (filters.type !== 'all') {
    whereClauses.push(`type = ?`);
    params.push(filters.type);
  }

  // --- Construcción de la consulta base
  let query = `SELECT COUNT(*) as count FROM item`;

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
    whereClauses.push(`i.category_id IN (?)`);
    // Formatear el array de categorías como una cadena separada por comas
    console.log(`Filtrando por categorías: ${filters.category}`);
    
    params.push(filters.category.join(','));
  }

  // --- Construcción de la consulta base
  let query = `
    SELECT 
      i.id,
      i.name,
      COUNT(r.rating) AS number_of_reviews, 
      c.icon AS category_icon,
      c.color AS category_color,
      (
        SELECT r2.rating
        FROM review r2
        WHERE r2.item_id = i.id
        ORDER BY r2.created_at DESC
        LIMIT 1
      ) AS last_review
    FROM item i
    LEFT JOIN review r ON i.id = r.item_id
    LEFT JOIN category c ON i.category_id = c.id
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
      rating: 'last_review',
      name: 'i.name',
    };
    const sortColumn = sortColumnMap[sortType];
    if (sortColumn) {
      query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;
    }
  }

  // --- Paginación
  query += ` LIMIT ? OFFSET ?`;
  params.push(size, offset);

  try {
    const result = await db.query(query, params);
    return result.values.map((row: any) => ({
      id: row.id,
      name: row.name,
      last_review: row.last_review || '',
      number_of_reviews: row.number_of_reviews || 0,
      category_icon: row.category_icon,
      category_color: row.category_color
    })) as ItemDisplay[];
  } catch (error) {
    console.error('❌ Error al obtener ítems:', error);
    return [];
  }
};