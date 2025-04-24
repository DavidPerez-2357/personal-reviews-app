import React, { useEffect, useMemo, useState } from "react";
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonLabel,
  IonPage,
  IonRow,
} from "@ionic/react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Funnel,
  Search,
  Star,
} from "lucide-react";
import ReviewCard from "@components/ReviewCard";
import { insertTestCategories } from "@services/category-service";
import { insertTestItems } from "@services/item-service";
import { getReviewsCards, insertTestReviews } from "@services/review-service";
import ReviewCardFilterModal from "@components/ReviewCardFilterModal";
import { initDB } from "@/database-service";
import { ReviewCardDTO } from "@/dto/Review";

export const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewCardDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(2); // Estado para controlar cuántas reseñas se muestran

  // Estado para guardar los filtros personalizados del modal. Se incluye 'category'
  const [customFilters, setCustomFilters] = useState<{
    rating?: { lower: number; upper: number }; // Cambiar a un objeto con lower y upper
    category?: string[];
    keyword?: string;
  }>({
    rating: { lower: 0, upper: 5 },
    category: [],
    keyword: "",
  });

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
            item: "Pizza Margherita",
            comment: "Excelente producto, lo recomiendo.",
            rating: 5,
            created_at: "2023-10-01T10:00:00Z",
            updated_at: "2023-10-01T10:00:00Z",
            category: "Comida",
            images: [
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
            ],
          },
          {
            id: 2,
            item: "Auriculares Bluetooth",
            comment: "No cumplió mis expectativas.",
            rating: 2,
            created_at: "2023-10-01T10:00:00Z",
            updated_at: "2023-10-01T10:00:00Z",
            category: "Electrónica",
            images: [
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
              "https://pix4free.org/assets/library/2024-11-05/originals/psychometric-test.jpg",
            ],
          },
          {
            id: 3,
            item: "Planta Decorativa",
            comment: "Muy bueno, pero un poco caro.",
            rating: 4,
            created_at: "2023-10-02T12:00:00Z",
            updated_at: "2023-10-02T12:00:00Z",
            category: "Ambiente",
            images: [],
          },
          {
            id: 4,
            item: "Camiseta Deportiva",
            comment: "No está mal, pero podría mejorar.",
            rating: 3,
            created_at: "2023-10-03T15:00:00Z",
            updated_at: "2023-10-03T15:00:00Z",
            category: "Precio",
            images: ["https://example.com/image4.jpg"],
          },
          {
            id: 5,
            item: "Robot Aspirador",
            comment: "Increíble calidad, lo volvería a comprar.",
            rating: 5,
            created_at: "2023-10-04T18:00:00Z",
            updated_at: "2023-10-04T18:00:00Z",
            category: "Limpieza",
            images: ["https://example.com/image5.jpg"],
          },
          {
            id: 6,
            item: "Helado de Vainilla",
            comment: "Delicioso y cremoso, perfecto para el verano.",
            rating: 5,
            created_at: "2023-10-05T10:00:00Z",
            updated_at: "2023-10-05T10:00:00Z",
            category: "Postres",
            images: ["https://example.com/icecream.jpg"],
          },
          {
            id: 7,
            item: "Tarta de Chocolate",
            comment: "Muy rica, pero un poco empalagosa.",
            rating: 4,
            created_at: "2023-10-06T12:00:00Z",
            updated_at: "2023-10-06T12:00:00Z",
            category: "Postres",
            images: ["https://example.com/chocolatecake.jpg"],
          },
          {
            id: 8,
            item: "Cerveza Artesanal",
            comment: "Buen sabor, pero algo cara.",
            rating: 4,
            created_at: "2023-10-07T15:00:00Z",
            updated_at: "2023-10-07T15:00:00Z",
            category: "Bebidas",
            images: [],
          },
          {
            id: 9,
            item: "Zumo de Naranja",
            comment: "Fresco y natural, muy recomendable.",
            rating: 5,
            created_at: "2023-10-08T09:00:00Z",
            updated_at: "2023-10-08T09:00:00Z",
            category: "Bebidas",
            images: [],
          },
          {
            id: 10,
            item: "Smartphone Galaxy",
            comment: "Excelente rendimiento, pero la batería podría durar más.",
            rating: 4,
            created_at: "2023-10-09T14:00:00Z",
            updated_at: "2023-10-09T14:00:00Z",
            category: "Móviles",
            images: [],
          },
          {
            id: 11,
            item: "iPhone 14",
            comment: "Muy caro, pero la calidad es innegable.",
            rating: 5,
            created_at: "2023-10-10T16:00:00Z",
            updated_at: "2023-10-10T16:00:00Z",
            category: "Móviles",
            images: [],
          },
          {
            id: 12,
            item: "Laptop Gaming",
            comment: "Perfecta para juegos, aunque algo pesada.",
            rating: 4,
            created_at: "2023-10-11T18:00:00Z",
            updated_at: "2023-10-11T18:00:00Z",
            category: "Ordenadores",
            images: [],
          },
          {
            id: 13,
            item: "MacBook Pro",
            comment: "Ideal para trabajo, pero el precio es elevado.",
            rating: 5,
            created_at: "2023-10-12T20:00:00Z",
            updated_at: "2023-10-12T20:00:00Z",
            category: "Ordenadores",
            images: [],
          },
          {
            id: 14,
            item: "Cámara DSLR",
            comment: "Gran calidad de imagen, pero un poco complicada de usar.",
            rating: 4,
            created_at: "2023-10-13T11:00:00Z",
            updated_at: "2023-10-13T11:00:00Z",
            category: "Fotografía",
            images: [],
          },
          {
            id: 15,
            item: "Cámara Instantánea",
            comment: "Divertida y fácil de usar, pero las fotos son pequeñas.",
            rating: 3,
            created_at: "2023-10-14T13:00:00Z",
            updated_at: "2023-10-14T13:00:00Z",
            category: "Fotografía",
            images: [],
          },
          {
            id: 16,
            item: "Reloj Inteligente",
            comment: "Muy útil, pero la batería dura poco.",
            rating: 4,
            created_at: "2023-10-15T15:00:00Z",
            updated_at: "2023-10-15T15:00:00Z",
            category: "Tecnología",
            images: [],
          },
          {
            id: 17,
            item: "Gafas de Sol",
            comment: "Estilo y protección, pero un poco caras.",
            rating: 4,
            created_at: "2023-10-16T17:00:00Z",
            updated_at: "2023-10-16T17:00:00Z",
            category: "Moda",
            images: [],
          },
          {
            id: 18,
            item: "Zapatos de Correr",
            comment: "Cómodos y ligeros, pero la suela se desgasta rápido.",
            rating: 3,
            created_at: "2023-10-17T19:00:00Z",
            updated_at: "2023-10-17T19:00:00Z",
            category: "Deportes",
            images: [],
          },
          {
            id: 19,
            item: "Bicicleta de Montaña",
            comment: "Excelente para senderismo, pero pesada.",
            rating: 4,
            created_at: "2023-10-18T21:00:00Z",
            updated_at: "2023-10-18T21:00:00Z",
            category: "Deportes",
            images: [],
          },
          {
            id: 20,
            item: "Cargador Solar",
            comment: "Muy útil para viajes, pero lento.",
            rating: 3,
            created_at: "2023-10-19T22:00:00Z",
            updated_at: "2023-10-19T22:00:00Z",
            category: "Tecnología",
            images: [],
          },
          {
            id: 21,
            item: "Cámara de Seguridad",
            comment: "Buena calidad, pero la instalación es complicada.",
            rating: 4,
            created_at: "2023-10-20T23:00:00Z",
            updated_at: "2023-10-20T23:00:00Z",
            category: "Hogar",
            images: [],
          },
          {
            id: 22,
            item: "Silla de Oficina",
            comment: "Cómoda y ergonómica, pero cara.",
            rating: 5,
            created_at: "2023-10-21T12:00:00Z",
            updated_at: "2023-10-21T12:00:00Z",
            category: "Oficina",
            images: [],
          },
          {
            id: 23,
            item: "Mesa de Comedor",
            comment: "Bonita y funcional, pero difícil de montar.",
            rating: 4,
            created_at: "2023-10-22T14:00:00Z",
            updated_at: "2023-10-22T14:00:00Z",
            category: "Muebles",
            images: [],
          },
          {
            id: 24,
            item: "Cama King Size",
            comment: "Increíble comodidad, pero ocupa mucho espacio.",
            rating: 5,
            created_at: "2023-10-23T16:00:00Z",
            updated_at: "2023-10-23T16:00:00Z",
            category: "Muebles",
            images: [],
          },
          {
            id: 25,
            item: "Cafetera Espresso",
            comment: "Café delicioso, pero un poco ruidosa.",
            rating: 4,
            created_at: "2023-10-24T18:00:00Z",
            updated_at: "2023-10-24T18:00:00Z",
            category: "Cocina",
            images: [],
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
    const lowerFilterCategory = (customFilters.category ?? []).map((category) =>
      category.toLowerCase().trim()
    );

    return reviews.filter((review) => {
      // Usamos valores por defecto para evitar null values
      const comment = (review.comment ?? "").toLowerCase();
      const item = (review.item ?? "").toLowerCase();
      const category = (review.category ?? []).toString().toLowerCase();
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

      // Filtro del modal: rango de calificaciones
      const modalRatingMatch =
        !customFilters.rating || // Si no hay filtro de calificación, pasa
        (rating >= customFilters.rating.lower && // Verifica el rango
          rating <= customFilters.rating.upper);

      // Filtro del modal: categoría
      const modalCategoryMatch =
        !lowerFilterCategory.length ||
        lowerFilterCategory.some((cat) => category.includes(cat));

      return (
        reviewTextMatch &&
        modalTextMatch &&
        modalRatingMatch &&
        modalCategoryMatch
      );
    });
  }, [reviews, searchTerm, customFilters]);

  // Ordena las reseñas según el orden seleccionado
  const sortedReviews: ReviewCardDTO[] = useMemo(() => {
    if (sortOrder === "none") {
      return filteredReviews;
    }
    return [...filteredReviews].sort((a, b) =>
      sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
    );
  }, [filteredReviews, sortOrder]);

  // Obtener las reseñas visibles según el estado
  const visibleReviews = useMemo(() => {
    return sortedReviews.slice(0, visibleReviewsCount);
  }, [sortedReviews, visibleReviewsCount]);

  // Agrupar reseñas visibles por fecha si no se aplica ordenación (para mejorar la visualización)
  const reviewCardsByDate = useMemo(() => {
    if (sortOrder !== "none") return {};
    if (visibleReviews.length === 0) return {};

    const validReviews = visibleReviews.filter(
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
  }, [visibleReviews, sortOrder]);

  // Función para alternar el orden de clasificación
  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      const newSortOrder =
        prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc";

      // Restablecer el límite de reseñas visibles si se aplica ordenación
      if (newSortOrder !== "none") {
        setVisibleReviewsCount(2);
      } else {
        // Si se vuelve al estado predeterminado, restablecer el límite
        setVisibleReviewsCount(2);
      }

      return newSortOrder;
    });
  };

  // Función para aplicar filtros desde el modal
  const handleApplyFilters = (filters: {
    rating?: { lower: number; upper: number };
    category?: string[] | null;
  }) => {
    const isDefaultFilters =
      (!filters.rating ||
        (filters.rating.lower === 0 && filters.rating.upper === 5)) &&
      (!filters.category || filters.category.length === 0);

    setCustomFilters({
      rating: filters.rating,
      category: filters.category ?? [],
    });

    // Restablecer el límite de reseñas visibles si los filtros no son los predeterminados
    if (!isDefaultFilters) {
      setVisibleReviewsCount(2);
    } else {
      // Si se vuelve al estado predeterminado, restablecer el límite
      setVisibleReviewsCount(2);
    }
  };

  // Función para cargar más reseñas
  const loadMoreReviews = () => {
    setVisibleReviewsCount((prevCount) => prevCount + 10);
  };

  return (
    <IonPage className="safe-area-top">
      <IonContent>
        <IonGrid className="p-5 pb-10 flex flex-col gap-12">
          {/* Sección: Información general y botón para nueva reseña */}
          <IonRow>
            <IonCol className="gap-5 flex flex-col">
              <div className="flex flex-col items-center justify-center text-center text-[var(--ion-text-color)] p-3 border border-[var(--ion-text-color)] rounded-lg">
                <IonLabel className="text-4xl font-bold">
                  {reviews.length}
                </IonLabel>
                <IonLabel className="text-lg font-semibold">reseñas</IonLabel>
              </div>
              <IonButton color="tertiary" expand="block" className="bg-primary">
                Hacer una nueva reseña
              </IonButton>
            </IonCol>
          </IonRow>

          {/* Sección: Buscador y botones de ordenación/filtro */}
          <IonRow>
            <IonCol className="flex flex-col gap-2">
              <IonLabel className="section-title">Buscar</IonLabel>
              <IonGrid>
                <IonRow className="ion-align-items-center gap-3">
                  <IonCol>
                    <IonInput
                      type="text"
                      placeholder="Buscar reseñas"
                      value={searchTerm}
                      onIonInput={(e) => setSearchTerm(e.detail.value ?? "")}
                      fill="solid"
                    >
                      <IonButton fill="clear" slot="end">
                        <Search color={"var(--ion-color-tertiary)"} />
                      </IonButton>
                    </IonInput>
                  </IonCol>
                  <IonCol size="auto">
                    <IonButton
                      onClick={toggleSortOrder}
                      color={sortOrder !== "none" ? "tertiary" : "secondary"}
                      size="large"
                    >
                      {sortOrder === "asc" ? (
                        <ArrowUp
                          color={"var(--ion-color-secondary)"}
                          size={20}
                        />
                      ) : sortOrder === "desc" ? (
                        <ArrowDown
                          color={"var(--ion-color-secondary)"}
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
                      color={
                        (customFilters.rating &&
                          (customFilters.rating.lower !== 0 ||
                            customFilters.rating.upper !== 5)) || // Verifica si el rango de calificación no es el predeterminado
                        (customFilters.category &&
                          customFilters.category.length > 0) // Verifica si hay categorías seleccionadas
                          ? "tertiary"
                          : "secondary"
                      }
                      onClick={() => setFilterModalOpen(true)}
                      size="large"
                    >
                      <Funnel
                        size={20}
                        color={
                          (customFilters.rating &&
                            (customFilters.rating.lower !== 0 ||
                              customFilters.rating.upper !== 5)) || // Verifica si el rango de calificación no es el predeterminado
                          (customFilters.category &&
                            customFilters.category.length > 0) // Verifica si hay categorías seleccionadas
                            ? "var(--ion-color-secondary)"
                            : "var(--ion-color-tertiary)"
                        }
                        fill={
                          (customFilters.rating &&
                            (customFilters.rating.lower !== 0 ||
                              customFilters.rating.upper !== 5)) || // Verifica si el rango de calificación no es el predeterminado
                          (customFilters.category &&
                            customFilters.category.length > 0) // Verifica si hay categorías seleccionadas
                            ? "var(--ion-color-tertiary-contrast)"
                            : "var(--ion-color-secondary)"
                        }
                      />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
          </IonRow>

          {/* Sección: Listado de reseñas */}
          <IonRow>
            <IonCol>
              <div className="h-full flex flex-col gap-9">
                {reviews.length === 0 || sortedReviews.length === 0 ? (
                  <div className="text-center flex flex-col items-center justify-center gap-2 text-[var(--ion-color-secondary-step-300)]">
                    <Star size={100} />
                    <IonLabel>No hay reseñas disponibles</IonLabel>
                  </div>
                ) : sortOrder !== "none" ||
                  customFilters.rating?.lower !== 0 ||
                  customFilters.rating?.upper !== 5 ||
                  customFilters.category?.length !== 0 ? (
                  // Mostrar las reseñas ordenadas o filtradas directamente
                  visibleReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  // Mostrar las reseñas agrupadas por fecha si no hay ordenación ni filtros
                  Object.entries(reviewCardsByDate ?? {}).map(
                    ([date, reviews]) => (
                      <div className="flex flex-col gap-3" key={date}>
                        <IonLabel className="text-lg" color={"medium"}>
                          {new Date(date).toLocaleDateString()}
                        </IonLabel>
                        <div className="flex flex-col gap-6">
                          {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                          ))}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </IonCol>
          </IonRow>

          {/* Botón para cargar más reseñas */}
          {visibleReviewsCount < sortedReviews.length && (
            <IonRow>
              <IonCol className="text-center">
              <span
                onClick={loadMoreReviews}
                className="cursor-pointer text-tertiary hover:underline"
              >
                Cargar más reseñas
              </span>
              </IonCol>
            </IonRow>
          )}
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
