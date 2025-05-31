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
  IonToast,
} from "@ionic/react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Funnel,
  Search,
  Star,
} from "lucide-react";
import { getReviewsCards } from "@services/review-service";
import { ReviewFull } from "@dto/Review";
import { useTranslation } from "react-i18next";
import "./styles/reviewPage.css";
import { useLocation, useHistory } from "react-router-dom"; // Import useLocation and useHistory
import ReviewFilterModal from "./components/ReviewFilterModal";
import ReviewCard from "@/shared/components/ReviewCard";

export const ReviewPage: React.FC = () => {
  const VISIBLE_REVIEWS_LIMIT = 50; // Default limit for visible reviews
  const VISIBLE_REVIEWS_INCREMENT = 10; // Increment for loading more reviews

  const [reviews, setReviews] = useState<ReviewFull[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  const [visibleReviewsCount, setVisibleReviewsCount] = useState(
    VISIBLE_REVIEWS_LIMIT
  );

  const [customFilters, setCustomFilters] = useState<{
    rating?: { minRating: number; maxRating: number };
    category?: number[];
    keyword?: string;
  }>({
    rating: { minRating: 0, maxRating: 5 },
    category: [],
    keyword: "",
  });

  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const location = useLocation<{ toast?: string }>(); // Get location object
  const history = useHistory(); // Get history object
  const { t } = useTranslation();

  useEffect(() => {
    async function initializeData() {
      try {
        const reviewsFromDB = await getReviewsCards();
        setReviews(reviewsFromDB);
      } catch (err) {
        console.error("Error initializing data:", err);
      }
    }
    initializeData();

    // Check for toast message in location state when component mounts or location changes

    if (location.state?.toast) {
      setToastMessage(location.state.toast);
      setIsToastOpen(true);

      if (location.pathname === "/app/reviews") {
        (async () => {
          const reviewsFromDB = await getReviewsCards();
          setReviews(reviewsFromDB);
        })();
      }
    }
  }, [location.state, history, location.pathname]);

  const filteredReviews = useMemo(() => {
    const lowerSearchTerm = (searchTerm ?? "").toLowerCase().trim();
    const filterCategoryIds = customFilters.category ?? [];
    return reviews.filter((review) => {
      const comment = (review.comment ?? "").toLowerCase();
      const item = (review.item ?? "").toLowerCase();
      const rating = review.rating;
      // Usar category_id para filtrar por id
      const reviewCategoryId = review.category_id;

      // Search filter: finds the search term in the comment, item, or rating
      const reviewTextMatch =
        comment.includes(lowerSearchTerm) ||
        item.includes(lowerSearchTerm) ||
        rating.toString() === lowerSearchTerm;

      // Filter for the modal: rating
      const modalRatingMatch =
        !customFilters.rating ||
        (rating >= customFilters.rating.minRating &&
          rating <= customFilters.rating.maxRating);

      // Filter for the modal: category (by id)
      const modalCategoryMatch =
        !filterCategoryIds.length ||
        filterCategoryIds.includes(reviewCategoryId);

      return reviewTextMatch && modalRatingMatch && modalCategoryMatch;
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
    rating?: { minRating: number; maxRating: number };
    category?: number[] | null;
  }) => {
    const isDefaultFilters =
      (!filters.rating ||
        (filters.rating.minRating === 0 && filters.rating.maxRating === 5)) &&
      (!filters.category || filters.category.length === 0);

    setCustomFilters({
      rating: filters.rating,
      category: filters.category ?? [],
    });

    setVisibleReviewsCount(VISIBLE_REVIEWS_LIMIT);
  };

  // Function to load more reviews
  const loadMoreReviews = () => {
    setVisibleReviewsCount(
      (prevCount) => prevCount + VISIBLE_REVIEWS_INCREMENT
    );
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
                  {reviews.length === 1
                    ? t("common.review")
                    : t("common.reviews")}
                </IonLabel>
              </div>
              <IonButton
                color="tertiary"
                expand="block"
                className="bg-primary"
                routerLink="/app/reviews/create"
              >
                {t("review-page.add-review")}
              </IonButton>
            </IonCol>
          </IonRow>

          {/* Section: Search bar and sort/filter buttons */}
          <IonRow>
            <IonCol className="flex flex-col gap-2">
              <IonLabel className="section-title">
                {t("review-page.search")}
              </IonLabel>
              <IonGrid>
                <IonRow className="ion-align-items-center gap-3">
                  <IonCol>
                    <IonInput
                      type="text"
                      placeholder={t("review-page.search-placeholder")}
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
                          (customFilters.rating.minRating !== 0 ||
                            customFilters.rating.maxRating !== 5)) ||
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
                            (customFilters.rating.minRating !== 0 ||
                              customFilters.rating.maxRating !== 5)) ||
                          (customFilters.category &&
                            customFilters.category.length > 0)
                            ? "var(--ion-color-secondary)"
                            : "var(--ion-color-tertiary)"
                        }
                        fill={
                          (customFilters.rating &&
                            (customFilters.rating.minRating !== 0 ||
                              customFilters.rating.maxRating !== 5)) ||
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
                    <IonLabel>{t("review-page.no-reviews")}</IonLabel>
                  </div>
                ) : sortOrder !== "none" ||
                  customFilters.rating?.minRating !== 0 ||
                  customFilters.rating?.maxRating !== 5 ||
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
                          {new Date(date).toLocaleDateString(
                            t("config.date-format"),
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
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
                  {t("review-page.load-more")}
                </span>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>

        {/* Custom filters modal */}
        <ReviewFilterModal
          isOpen={isFilterModalOpen}
          onDismiss={() => setFilterModalOpen(false)}
          applyFilters={handleApplyFilters}
        />
      </IonContent>

      {/* Update IonToast to be controlled by state */}
      <IonToast
        className="safe-margin-top"
        isOpen={isToastOpen}
        message={toastMessage}
        position="top"
        onDidDismiss={() => setIsToastOpen(false)} // Hide toast when dismissed
        duration={3000} // Set duration (e.g., 3 seconds)
      />
    </IonPage>
  );
};

export default ReviewPage;
