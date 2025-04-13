import React, { useEffect, useMemo, useState } from "react";
import { ReviewCardDTO } from "../dto/review/ReviewCardDTO";
import {
  IonButton,
  IonCard,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
} from "@ionic/react";
import { ArrowDown, ArrowUp, ArrowUpDown, Funnel, Search } from "lucide-react";
import ReviewCard from "@components/ReviewCard";
import { insertTestCategories } from "@services/category-service";
import { insertTestItems } from "@services/item-service";
import { getReviewsCards, insertTestReviews } from "@services/review-service";
import ReviewCardFilterModal from "@components/ReviewCardFilterModal";
import { initDB } from "@/database-service";

export const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewCardDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  // Estado para guardar los filtros personalizados del modal. Se incluye 'category'
  const [customFilters, setCustomFilters] = useState<{
    keyword: string;
    rating?: number;
    category?: string;
  }>({ keyword: "", category: "" });

  // Estado para manejo de errores
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeData() {
      try {
        // await insertTestCategories(); // Inserta categorías de prueba
        // await insertTestItems(); // Inserta ítems de prueba
        // await insertTestReviews(); // Inserta reseñas de prueba
        // const reviewsFromDB = await getReviewsCards();
        const reviewsFromDB: ReviewCardDTO[] = [
          {
            id: 1,
            item: "Producto A",
            comment: "Excelente producto, lo recomiendo.",
            rating: 5,
            created_at: "2023-10-01T10:00:00Z",
            updated_at: "2023-10-01T10:00:00Z",
            category: "Electrónica",
            images: ["https://example.com/image1.jpg"],
          },
          {
            id: 2,
            item: "Producto B",
            comment: "No cumplió mis expectativas.",
            rating: 2,
            created_at: "2023-10-01T10:00:00Z",
            updated_at: "2023-10-01T10:00:00Z",
            category: "Hogar",
            images: ["https://example.com/image2.jpg"],
          },
          {
            id: 3,
            item: "Producto C",
            comment: "Muy bueno, pero un poco caro.",
            rating: 4,
            created_at: "2023-10-02T12:00:00Z",
            updated_at: "2023-10-02T12:00:00Z",
            category: "Ropa",
            images: ["https://example.com/image3.jpg"],
          },
          {
            id: 4,
            item: "Producto D",
            comment: "No está mal, pero podría mejorar.",
            rating: 3,
            created_at: "2023-10-03T15:00:00Z",
            updated_at: "2023-10-03T15:00:00Z",
            category: "Deportes",
            images: ["https://example.com/image4.jpg"],
          },
          {
            id: 5,
            item: "Producto E",
            comment: "Increíble calidad, lo volvería a comprar.",
            rating: 5,
            created_at: "2023-10-04T18:00:00Z",
            updated_at: "2023-10-04T18:00:00Z",
            category: "Tecnología",
            images: ["https://example.com/image5.jpg"],
          },
        ];
        setReviews(reviewsFromDB);
      } catch (err) {
        console.error("Error al inicializar datos:", err);
        setError("Error al inicializar los datos.");
      }
    }
    initializeData();
  }, []);

  // Uso de useMemo para optimizar el filtrado
  const filteredReviews = useMemo(() => {
    // Aseguramos que los valores sean cadenas válidas para aplicar .toLowerCase()
    const lowerSearchTerm = (searchTerm ?? "").toLowerCase().trim();
    const lowerModalKeyword = (customFilters.keyword ?? "")
      .toLowerCase()
      .trim();
    const lowerFilterCategory = (customFilters.category ?? "")
      .toLowerCase()
      .trim();

    return reviews.filter((review) => {
      // Usamos valores por defecto para evitar null values
      const comment = (review.comment ?? "").toLowerCase();
      const item = (review.item ?? "").toLowerCase();
      const category = (review.category ?? "").toString().toLowerCase();
      const rating = review.rating;

      // Buscamos coincidencias con el término de búsqueda
      const reviewTextMatch =
        comment.includes(lowerSearchTerm) ||
        item.includes(lowerSearchTerm) ||
        rating.toString() === lowerSearchTerm;

      // Filtro del modal: palabra clave sobre el comentario o el ítem
      const modalTextMatch =
        !lowerModalKeyword ||
        comment.includes(lowerModalKeyword) ||
        item.includes(lowerModalKeyword);

      // Filtro del modal: calificación mínima
      const modalRatingMatch =
        customFilters.rating === undefined || rating >= customFilters.rating;

      // Filtro del modal: categoría
      const modalCategoryMatch =
        !lowerFilterCategory || category.includes(lowerFilterCategory);

      return (
        reviewTextMatch &&
        modalTextMatch &&
        modalRatingMatch &&
        modalCategoryMatch
      );
    });
  }, [reviews, searchTerm, customFilters]);

  // Ordena las reseñas según el orden seleccionado
  const sortedReviews = useMemo(() => {
    if (sortOrder === "none") return filteredReviews;
    return [...filteredReviews].sort((a, b) =>
      sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
    );
  }, [filteredReviews, sortOrder]);

  // Agrupar reseñas por fecha si no se aplica ordenación (para mejorar la visualización)
  const reviewCardsByDate = useMemo(() => {
    if (sortOrder !== "none") return {};
    if (reviews.length === 0) return ;

    const validReviews = sortedReviews.filter(
      (r) => r.created_at && !isNaN(new Date(r.created_at).getTime())
    );

    if (validReviews.length === 0) return {};

    const sortedByDate = [...validReviews].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sortedByDate.reduce((acc, review) => {
      const dateKey = new Date(review.created_at).toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(review);
      return acc;
    }, {} as Record<string, ReviewCardDTO[]>);
  }, [sortedReviews, sortOrder]);

  // Función para alternar el orden de clasificación
  const toggleSortOrder = () => {
    setSortOrder((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"
    );
  };

  // Función para aplicar filtros desde el modal (se incluye category)
  const handleApplyFilters = (filters: {
    keyword: string;
    rating?: number;
    category?: string;
  }) => {
    setCustomFilters({
      keyword: filters.keyword,
      rating: filters.rating,
      category: filters.category ?? "",
    });
  };

  return (
    <IonPage className="safe-area-top">
      <IonContent>
        <IonGrid className="p-4 h-full">
          {/* Sección: Información general y botón para nueva reseña */}
          <IonRow>
            <IonCol className="gap-5 flex flex-col">
              <div className="flex flex-col items-center justify-center text-center text-primary p-3 border-2 border-foreground rounded-lg">
                <IonLabel className="text-5xl font-bold">
                  {reviews.length}
                </IonLabel>
                <IonLabel className="text-lg font-bold">
                  reseñas
                </IonLabel>
              </div>
              <IonButton
                color="tertiary"
                expand="block"
                className="bg-primary"
              >
                Hacer una nueva reseña
              </IonButton>
            </IonCol>
          </IonRow>

          {/* Sección: Buscador y botones de ordenación/filtro */}
          <IonRow className="mt-10">
            <IonCol>
              <IonTitle className="text-4xl font-semibold text-primary">
                Buscar
              </IonTitle>
              <IonGrid>
                <IonRow className="ion-align-items-center gap-3">
                  <IonCol>
                    <IonInput
                      type="text"
                      placeholder="Buscar reseñas"
                      value={searchTerm}
                      onIonInput={(e) => setSearchTerm(e.detail.value ?? "")}
                      fill="solid"
                      className="search-input"
                    >
                      <IonButton fill="clear" slot="end">
                        <Search color={"var(--ion-color-tertiary)"} />
                      </IonButton>
                    </IonInput>
                  </IonCol>
                  <IonCol size="auto">
                    <IonButton
                      onClick={toggleSortOrder}
                      color="secondary"
                      className="w-full rounded-lg flex items-center justify-center text-primary"
                    >
                      {sortOrder === "asc" ? (
                        <ArrowUp
                          color={"var(--ion-color-tertiary)"}
                          size={20}
                        />
                      ) : sortOrder === "desc" ? (
                        <ArrowDown
                          color={"var(--ion-color-tertiary)"}
                          size={20}
                        />
                      ) : (
                        <ArrowUpDown
                          color={"var(--ion-color-tertiary)"}
                          size={20}
                        />
                      )}
                    </IonButton>
                  </IonCol>
                  <IonCol size="auto">
                    <IonButton
                      color={"secondary"}
                      className="w-full rounded-lg flex items-center justify-center text-primary"
                      onClick={() => setFilterModalOpen(true)}
                    >
                      <Funnel size={20} />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
          </IonRow>

          {/* Sección: Listado de reseñas */}
          <IonRow className="mt-10">
            <IonCol>
              <IonList className="h-full overflow-y-auto">
                {error && (
                  <IonText color="danger" className="text-center">
                    {error}
                  </IonText>
                )}
                {reviews.length === 0 ? (
                  <IonText className="text-center text-gray-500">
                  No hay reseñas disponibles.
                  </IonText>
                ) : (
                  Object.entries(reviewCardsByDate ?? {}).map(([date, reviews]) => (
                  <IonItemGroup key={date}>
                    <IonLabel className="text-lg font-semibold">
                    {new Date(date).toLocaleDateString()}
                    </IonLabel>
                    {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                    ))}
                  </IonItemGroup>
                  ))
                )}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modal de filtros personalizados */}
        <ReviewCardFilterModal
          isOpen={isFilterModalOpen}
          onDismiss={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
        />
      </IonContent>
    </IonPage>
  );
};

export default ReviewPage;
