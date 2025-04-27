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
import ReviewCard from "./components/ReviewCard";
import { getReviewsCards, insertTestReviewImages, insertTestReviews } from "@services/review-service";
import ReviewCardFilterModal from "./components/ReviewCardFilterModal";
import { Review, ReviewFull, ReviewImage } from "@dto/Review";
import { useTranslation } from "react-i18next";
import { Category } from "@dto/Category";
import { Item } from "@dto/Item";
import "./styles/reviewPage.css";
import { insertCategory, insertTestCategories } from "@/shared/services/category-service";
import { insertTestItems } from "@/shared/services/item-service";
import { resetAllAutoIncrement } from "@/database-service";

export const ReviewPage: React.FC = () => {

  const VISIBLE_REVIEWS_LIMIT = 50; // Default limit for visible reviews
  const VISIBLE_REVIEWS_INCREMENT = 10; // Increment for loading more reviews

  const [reviews, setReviews] = useState<ReviewFull[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  const [visibleReviewsCount, setVisibleReviewsCount] = useState(VISIBLE_REVIEWS_LIMIT);

  const [customFilters, setCustomFilters] = useState<{
    rating?: { lower: number; upper: number };
    category?: string[];
    keyword?: string;
  }>({
    rating: { lower: 0, upper: 5 },
    category: [],
    keyword: "",
  });

  const { t } = useTranslation();

  useEffect(() => {
    async function initializeData() {
      try {
        await resetAllAutoIncrement();
        await insertTestCategories();
        await insertTestItems();
        await insertTestReviewImages();
        await insertTestReviews();
        const reviewsFromDB = await getReviewsCards();

        // const categories: Category[] = [
        //   { id: 1, name: "Electrónica", type: 1, color: "#FF5733", icon: "computer", parent_id: null },
        //   { id: 2, name: "Ropa", type: 2, color: "#33FF57", icon: "shirt", parent_id: null},
        //   { id: 3, name: "Hogar", type: 3, color: "#3357FF", icon: "house", parent_id: null},
        //   { id: 4, name: "Juguetes", type: 4, color: "#FF33A1", icon: "child-toy", parent_id: null},
        //   { id: 5, name: "Deportes", type: 5, color: "#FF8C33", icon: "ball", parent_id: null},
        //   { id: 6, name: "Libros", type: 6, color: "#33FFF5", icon: "book", parent_id: null},
        //   { id: 7, name: "Salud", type: 7, color: "#FF33FF", icon: "health", parent_id: null},
        //   { id: 8, name: "Belleza", type: 8, color: "#FF5733", icon: "lip-gloss", parent_id: null},
        //   { id: 9, name: "Automóviles", type: 9, color: "#33FF57", icon: "car", parent_id: null},
        //   { id: 10, name: "Oficina", type: 10, color: "#3377FF", icon: "file", parent_id: null},
        //   // Subcategorías
        //   { id: 11, name: "Smartphones", type: 1, color: "#AA5733", icon: "mobile", parent_id: 1},
        //   { id: 12, name: "Portátiles", type: 1, color: "#BB5733", icon: "laptop", parent_id: 1},
        //   { id: 13, name: "Zapatillas", type: 2, color: "#33AA57", icon: "shoe-prints", parent_id: 2},
        //   { id: 14, name: "Vestidos", type: 2, color: "#33BB57", icon: "person-dress", parent_id: 2},
        //   { id: 15, name: "Muebles", type: 3, color: "#3344FF", icon: "couch", parent_id: 3},
        //   { id: 16, name: "Cocina", type: 3, color: "#3344AA", icon: "kitchen-set", parent_id: 3},
        //   { id: 17, name: "Libros Infantiles", type: 6, color: "#33BBF5", icon: "book-skull", parent_id: 6},
        //   { id: 18, name: "Maquillaje", type: 8, color: "#FF77FF", icon: "soap", parent_id: 8},
        //   { id: 19, name: "Suplementos", type: 7, color: "#FF99FF", icon: "prescription-bottle", parent_id: 7},
        //   { id: 20, name: "Sillas", type: 3, color: "#3344BB", icon: "chair", parent_id: 3},
        // ];

      //   const items: Item[] = [
      //     { id: 1, name: "iPhone 13", image: "iphone-13.jpg", category_id: 11 },
      //     { id: 2, name: "MacBook Air M1", image: "macbook-air.jpg", category_id: 12 },
      //     { id: 3, name: "Nike Air Force 1", image: "nike-airforce.jpg", category_id: 13 },
      //     { id: 4, name: "Zapatillas Adidas Ultraboost", image: "adidas-ultraboost.jpg", category_id: 13 },
      //     { id: 5, name: "Silla de oficina ergonómica", image: "silla-oficina.jpg",  category_id: 10 },
      //     { id: 6, name: "Cafetera Nespresso", image: "cafetera-nespresso.jpg", category_id: 15 },
      //     { id: 7, name: "Kindle Paperwhite", image: "kindle-paperwhite.jpg", category_id: 6 },
      //     { id: 8, name: "Mochila para portátil", image: "mochila-portatil.jpg", category_id: 10 },
      //     { id: 9, name: "Reloj Garmin Forerunner", image: "garmin-forerunner.jpg", category_id: 5 },
      //     { id: 10, name: "Sony WH-1000XM4", image: "sony-headphones.jpg", category_id: 1 },
      //     { id: 11, name: "Teclado mecánico Logitech", image: "logitech-teclado.jpg", category_id: 1 },
      //     { id: 12, name: "Guitarra Fender Stratocaster", image: "fender-guitarra.jpg", category_id: 4 },
      //     { id: 13, name: "Mueble modular para oficina", image: "mueble-oficina.jpg", category_id: 15 },
      //     { id: 14, name: "Silla gaming DXRacer", image: "dxracer-silla.jpg", category_id: 10 },
      //     { id: 15, name: "Suplemento Omega-3", image: "suplemento-omega3.jpg", category_id: 19 },
      //     { id: 16, name: "Lámpara de escritorio LED", image: "lampara-escritorio.jpg", category_id: 10 },
      //     { id: 17, name: "Smartwatch Samsung Galaxy", image: "samsung-smartwatch.jpg", category_id: 9 },
      //     { id: 18, name: "Juego de platos Corelle", image: "platos-corelle.jpg", category_id: 3 },
      //     { id: 19, name: "Silla ergonómica para oficina", image: "silla-ergonomica.jpg", category_id: 15 },
      //     { id: 20, name: "Altavoces Bose SoundLink", image: "bose-altavoces.jpg", category_id: 1 },
      //     { id: 21, name: "Auriculares Beats Studio", image: "beats-audifonos.jpg", category_id: 1 },
      //     { id: 22, name: "Sofá 3 plazas", image: "sofa-3-plazas.jpg", category_id: 15 },
      //     { id: 23, name: "Plancha de vapor Philips", image: "plancha-philips.jpg", category_id: 14 },
      //     { id: 24, name: "Cámara GoPro Hero 10", image: "gopro-hero10.jpg", category_id: 1 },
      //     { id: 25, name: "Pantalla LED 4K LG", image: "pantalla-lg.jpg", category_id: 1 }
      //   ];  

      //   const reviews: Review[] = [
      //     { id: 1, rating: 5, comment: "Excelente rendimiento y calidad de cámara. Muy recomendable", item_id: 1},
      //     { id: 2, rating: 4, comment: "Buen equipo, aunque la batería podría ser mejor", item_id: 1},
      //     { id: 3, rating: 3, comment: "La pantalla es buena, pero algo frágil", item_id: 2},
      //     { id: 4, rating: 5, comment: "Rápido y ligero, perfecto para trabajar", item_id: 2},
      //     { id: 5, rating: 4, comment: "Muy cómodas, pero el ajuste no es perfecto", item_id: 3},
      //     { id: 6, rating: 5, comment: "Me encantan, son super cómodas y van con todo", item_id: 4},
      //     { id: 7, rating: 2, comment: "No muy cómoda para usarla durante muchas horas", item_id: 5},
      //     { id: 8, rating: 5, comment: "Excelente café, la uso todos los días", item_id: 6},
      //     { id: 9, rating: 4, comment: "Buen dispositivo, aunque me gustaría que tuviera más almacenamiento", item_id: 7},
      //     { id: 10, rating: 4, comment: "Ideal para viajes, no ocupa mucho espacio", item_id: 8},
      //     { id: 11, rating: 5, comment: "Muy buenos para entrenar, gran aislamiento del ruido", item_id: 9},
      //     { id: 12, rating: 5, comment: "Increíble calidad de sonido, se nota la diferencia", item_id: 10},
      //     { id: 13, rating: 4, comment: "Es cómodo, pero el teclado es un poco ruidoso", item_id: 11},
      //     { id: 14, rating: 5, comment: "Ideal para tocar en casa o fuera", item_id: 12},
      //     { id: 15, rating: 3, comment: "Buena relación calidad-precio, pero la estructura no es tan duradera", item_id: 13},
      //     { id: 16, rating: 4, comment: "Muy buena, pero el asiento podría ser más cómodo", item_id: 14},
      //     { id: 17, rating: 4, comment: "Bien, pero me gustaría que tuviera más opciones de ajuste", item_id: 15},
      //     { id: 18, rating: 5, comment: "Es una de las mejores sillas que he probado", item_id: 16},
      //     { id: 19, rating: 2, comment: "No me gustó mucho, el funcionamiento no es lo esperado", item_id: 17},
      //     { id: 20, rating: 4, comment: "Buen smartwatch, aunque la pantalla podría ser más grande", item_id: 18},
      //     { id: 21, rating: 5, comment: "Excelente calidad, me ayudó a mejorar mi postura", item_id: 19},
      //     { id: 22, rating: 3, comment: "Buena, pero esperaba un mejor sonido", item_id: 20},
      //     { id: 23, rating: 4, comment: "Excelente calidad, pero un poco cara", item_id: 21},
      //     { id: 24, rating: 5, comment: "Ideal para ver películas y jugar", item_id: 22},
      //     { id: 25, rating: 4, comment: "Muy buena calidad, pero algo frágil", item_id: 23},
      //     { id: 26, rating: 5, comment: "Increíble para deportes de aventura, la recomiendo", item_id: 24},
      //     { id: 27, rating: 5, comment: "Es genial para todos los detalles que muestra", item_id: 25},
      //     { id: 28, rating: 4, comment: "Buena guitarra, aunque la caja es un poco pequeña", item_id: 12},
      //     { id: 29, rating: 5, comment: "Una maravilla, no me arrepiento de comprarlo", item_id: 1},
      //     { id: 30, rating: 3, comment: "Lo tengo hace poco, y no me termina de convencer", item_id: 5} 
      // ];

      //   const images: ReviewImage[] = [
      //       { image: "https://www.abrirllave.com/html/images/dos-parrafos-bloc-de-notas.gif", review_id: 1 },
      //       { image: "https://www.lluiscodina.com/wp-content/uploads/2019/05/html-5-ejemplo-de-marcado.png", review_id: 1 },
      //       { image: "https://www.loading.es/blog/wp-content/uploads/ejemplo-html-codigo-editor.jpg", review_id: 2 },
      //       { image: "https://iessantabarbara.es/departamentos/fisica/tecnologia/formacion/www/html01.png", review_id: 3 },
      //       { image: "https://www.ampersoundmedia.com/wp-content/uploads/2020/07/html-scaled.jpg", review_id: 4 },
      //       { image: "https://www.abrirllave.com/html/images/dos-parrafos-bloc-de-notas.gif", review_id: 5 },
      //       { image: "https://www.lluiscodina.com/wp-content/uploads/2019/05/html-5-ejemplo-de-marcado.png", review_id: 6 },
      //       { image: "https://www.loading.es/blog/wp-content/uploads/ejemplo-html-codigo-editor.jpg", review_id: 7 },
      //       { image: "https://iessantabarbara.es/departamentos/fisica/tecnologia/formacion/www/html01.png", review_id: 8 },
      //       { image: "https://www.ampersoundmedia.com/wp-content/uploads/2020/07/html-scaled.jpg", review_id: 9 },
      //   ];

      //   const reviewsFromDB: ReviewFull[] = [];

      //   for (const review of reviews) {
      //     const item = items.find(i => i.id === review.item_id);
      //     if (!item) continue;

      //     const reviewImages = images.filter(img => img.review_id === review.id).map(img => img.image);
      
      //     const category = categories.find(c => c.id === item.category_id);
      //     const parentCategory = category?.parent_id
      //       ? categories.find(c => c.id === category.parent_id)
      //       : null;
      
      //       const randomDate = new Date(
      //         Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
      //       ).toISOString();

      //       reviewsFromDB.push(
      //         {
      //         ...review,
      //         created_at: randomDate,
      //         updated_at: randomDate,
      //         images: reviewImages,
      //         category: parentCategory ? parentCategory.name : category?.name || "",
      //         icon: category ? category.icon : "",
      //         item: item.name,
      //         } as ReviewFull
      //       );
      //   }
        setReviews(reviewsFromDB);
      } catch (err) {
        console.error("Error initializing data:", err);
      }
    }
    initializeData();
  }, []);

  const filteredReviews = useMemo(() => {
    const lowerSearchTerm = (searchTerm ?? "").toLowerCase().trim();
    const lowerFilterCategory = (customFilters.category ?? []).map((category) =>
      category.toLowerCase().trim()
    );

    return reviews.filter((review) => {

      const comment = (review.comment ?? "").toLowerCase();
      const item = (review.item ?? "").toLowerCase();
      const category = (review.category ?? []).toString().toLowerCase();
      const rating = review.rating;

      // Search filter: finds the search term in the comment, item, or rating
      const reviewTextMatch =
        comment.includes(lowerSearchTerm) ||
        item.includes(lowerSearchTerm) ||
        rating.toString() === lowerSearchTerm;

      // Filter for the modal: rating
      const modalRatingMatch =
        !customFilters.rating || // If there's no rating filter, pass
        (rating >= customFilters.rating.lower && // Check the range
          rating <= customFilters.rating.upper);

      // Filter for the modal: category
      const modalCategoryMatch =
        !lowerFilterCategory.length ||
        lowerFilterCategory.some((cat) => category.includes(cat));

      return (
        reviewTextMatch &&
        modalRatingMatch &&
        modalCategoryMatch
      );
    });
  }, [reviews, searchTerm, customFilters]);

  // It is used to sort the reviews based on the selected order
  const sortedReviews: ReviewFull[] = useMemo(() => {
    if (sortOrder === "none") {
      return filteredReviews;
    }
    return [...filteredReviews].sort((a, b) =>
      sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
    );
  }, [filteredReviews, sortOrder]);

  // Get visible reviews based on the state
  const visibleReviews = useMemo(() => {
    return sortedReviews.slice(0, visibleReviewsCount);
  }, [sortedReviews, visibleReviewsCount]);

  // Group visible reviews by date if no sorting is applied
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
    }, {} as Record<string, ReviewFull[]>);
  }, [visibleReviews, sortOrder]);

  // Function to toggle the sort order
  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      const newSortOrder =
        prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc";

      // Reset the visible reviews limit if sorting is applied
      if (newSortOrder !== "none") {
        setVisibleReviewsCount(VISIBLE_REVIEWS_LIMIT);
      } else {
        // If returning to the default state, reset the limit
        setVisibleReviewsCount(VISIBLE_REVIEWS_LIMIT);
      }

      return newSortOrder;
    });
  };

  // Function to apply filters from the modal
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

    // Reset the visible reviews limit if the filters are not the default ones
    if (!isDefaultFilters) {
      setVisibleReviewsCount(VISIBLE_REVIEWS_LIMIT);
    } else {
      // If returning to the default state, reset the limit
      setVisibleReviewsCount(VISIBLE_REVIEWS_LIMIT);
    }
  };

  // Function to load more reviews
  const loadMoreReviews = () => {
    setVisibleReviewsCount((prevCount) => prevCount + VISIBLE_REVIEWS_INCREMENT);
  };

  return (
    <IonPage className="safe-area-top">
      <IonContent>
        <IonGrid className="p-5 pb-10 flex flex-col gap-12">
          {/* Section: General information and button for new review */}
          <IonRow>
            <IonCol className="gap-5 flex flex-col">
              <div className="flex flex-col items-center justify-center text-center text-[var(--ion-text-color)] p-3 border border-[var(--ion-text-color)] rounded-lg">
                <IonLabel className="text-4xl font-bold">
                  {reviews.length}
                </IonLabel>
                <IonLabel className="text-lg font-semibold">
                  {reviews.length === 1 ? t('common.review') : t('common.reviews')}
                </IonLabel>
              </div>
              <IonButton 
                color="tertiary" 
                expand="block" 
                className="bg-primary"
                routerLink="/app/reviews/create"
              >
                {t('review-page.add-review')}
              </IonButton>
            </IonCol>
          </IonRow>

          {/* Section: Search bar and sort/filter buttons */}
          <IonRow>
            <IonCol className="flex flex-col gap-2">
              <IonLabel className="section-title">{t('review-page.search')}</IonLabel>
              <IonGrid>
                <IonRow className="ion-align-items-center gap-3">
                  <IonCol>
                    <IonInput
                      type="text"
                      placeholder={t('review-page.search-placeholder')}
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
                            customFilters.rating.upper !== 5)) ||
                        (customFilters.category &&
                          customFilters.category.length > 0)
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
                              customFilters.rating.upper !== 5)) || 
                          (customFilters.category &&
                            customFilters.category.length > 0) 
                            ? "var(--ion-color-secondary)"
                            : "var(--ion-color-tertiary)"
                        }
                        fill={
                          (customFilters.rating &&
                            (customFilters.rating.lower !== 0 ||
                              customFilters.rating.upper !== 5)) ||
                          (customFilters.category &&
                            customFilters.category.length > 0)
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

          {/* Section: List of reviews */}
          <IonRow>
            <IonCol>
              <div className="h-full flex flex-col gap-9">
                {reviews.length === 0 || sortedReviews.length === 0 ? (
                  <div className="text-center flex flex-col items-center justify-center gap-2 text-[var(--ion-color-secondary-step-300)]">
                    <Star size={100} />
                    <IonLabel>{t('review-page.no-reviews')}</IonLabel>
                  </div>
                ) : sortOrder !== "none" ||
                  customFilters.rating?.lower !== 0 ||
                  customFilters.rating?.upper !== 5 ||
                  customFilters.category?.length !== 0 ? (
                  // Display sorted or filtered reviews directly
                  visibleReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  // Display reviews grouped by date if there is no sorting or filtering
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

          {/* Button to load more reviews */}
          {visibleReviewsCount < sortedReviews.length && (
            <IonRow>
              <IonCol className="text-center">
              <span
                onClick={loadMoreReviews}
                className="cursor-pointer text-tertiary hover:underline"
              >
                {t('review-page.load-more')}
              </span>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>

        {/* Custom filters modal */}
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
