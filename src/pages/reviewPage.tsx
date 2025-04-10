import React, {useEffect, useMemo, useState} from "react";
import {ReviewCardDTO} from "../dto/review/ReviewCardDTO";
import {
    IonButton,
    IonCard, IonCardSubtitle, IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonInput,
    IonItemGroup,
    IonLabel,
    IonList,
    IonRow,
    IonText,
    IonTitle
} from "@ionic/react";
import {ArrowDown, ArrowUp, ArrowUpDown, Funnel, Search} from "lucide-react";
import ReviewCard from "../components/ReviewCard.tsx";
import {insertTestCategories} from "../services/category-service.ts";
import {insertTestItems} from "../services/item-service.ts";
import {getReviewsCards, insertTestReviews} from "../services/review-service.ts";
import ReviewCardFilterModal from "../components/ReviewCardFilterModal.tsx";
import {initDB} from "@/database-service.ts";


export const ReviewPage: React.FC = () => {

    const [reviews, setReviews] = useState<ReviewCardDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    // Estado para guardar los filtros aplicados desde el modal
    const [customFilters, setCustomFilters] = useState<{ keyword: string; rating?: number; category?: string }>({ keyword: ""});

    // lista de errores
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initializeData() {
            try {
                // await insertTestCategories();
                // await insertTestItems();
                // await insertTestReviews();
                // getReviewsCards().then(
                //     (reviews) => {
                //         setReviews(reviews);
                //     }
                // )
                const mockReviews: ReviewCardDTO[] = [
                    {
                        id: 1,
                        comment: "Muy bueno",
                        rating: 5,
                        created_at: "2025-03-26",
                        updated_at: "2021-09-01",
                        images: [],
                        category: "Comida",
                        item: "Pizza",
                    },
                    {
                        id: 2,
                        comment: "Muy malo",
                        rating: 1,
                        created_at: "2021-09-01",
                        updated_at: "2021-09-01",
                        images: [],
                        category: "Comida",
                        item: "Hamburguesa",
                    },
                    {
                        id: 3,
                        comment: "Regular",
                        rating: 3,
                        created_at: "2021-09-01",
                        updated_at: "2021-09-01",
                        images: [],
                        category: "Comida",
                        item: "Tacos",
                    },
                    {
                        id: 4,
                        comment: "Excelente",
                        rating: 5,
                        created_at: "2021-09-01",
                        updated_at: "2021-09-01",
                        images: [],
                        category: "Comida",
                        item: "Ensalada",
                    },
                    {
                        id: 5,
                        comment: "No me gustó",
                        rating: 2,
                        created_at: "2021-09-01",
                        updated_at: "2021-09-01",
                        images: [],
                        category: "Comida",
                        item: "Sopa",
                    },
                    {
                        id: 6,
                        comment: "Increíble",
                        rating: 5,
                        created_at: "2023-05-17",
                        updated_at: "2023-05-15",
                        images: [],
                        category: "Comida",
                        item: "Pasta",
                    },
                    {
                        id: 7,
                        comment: "Delicioso",
                        rating: 4,
                        created_at: "2023-05-17",
                        updated_at: "2023-05-16",
                        images: [],
                        category: "Comida",
                        item: "Sushi",
                    },
                    {
                        id: 8,
                        comment: "No está mal",
                        rating: 3,
                        created_at: "2023-05-17",
                        updated_at: "2023-05-17",
                        images: [],
                        category: "Comida",
                        item: "Enchiladas",
                    },
                ];
                setReviews(mockReviews);
            } catch (error) {
                console.error("Error al inicializar datos:", error);
            }
        }

        initializeData();
    }, []);

// Filtrado de reseñas combinando el searchTerm y los filtros personalizados del modal
    const filteredReviews = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        const lowerModalKeyword = customFilters.keyword.toLowerCase().trim();

        return reviews.filter((review) => {
            const reviewTextMatch =
                review.comment.toLowerCase().includes(lowerSearchTerm) ||
                review.item.toLowerCase().includes(lowerSearchTerm) ||
                review.rating.toString() === lowerSearchTerm;

            const modalTextMatch =
                !lowerModalKeyword ||
                review.comment.toLowerCase().includes(lowerModalKeyword) ||
                review.item.toLowerCase().includes(lowerModalKeyword);

            const modalRatingMatch =
                customFilters.rating === undefined || review.rating >= customFilters.rating;

            const modalCategoryMatch =
                !customFilters.keyword ||
                review.category.toLowerCase().includes(customFilters.keyword.toLowerCase());

            return reviewTextMatch && modalTextMatch && modalRatingMatch && modalCategoryMatch;
        });
    }, [reviews, searchTerm, customFilters]);

    // Ordenar reseñas por puntuación cuando se cambia `sortOrder`
    const sortedReviews = useMemo(() => {
        if (sortOrder === "none") return filteredReviews;
        return [...filteredReviews].sort((a, b) =>
            sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
        );
    }, [filteredReviews, sortOrder]);

    // Agrupar reseñas por fecha solo si el orden es "none"
    const reviewCardsByDate = useMemo(() => {
        if (sortOrder !== "none") return {};
        const sortedByDate = [...sortedReviews].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

    // Alternar orden cuando se hace clic en el botón
    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"));
    };

    // Función para aplicar los filtros personalizados desde el modal
    const handleApplyFilters = (filters: { keyword: string; rating?: number; category: string }) => {
        setCustomFilters(filters);
    };

    return (
        <IonContent>
            <IonGrid className="p-4 h-full">
                {/* Primera sección: Información de reseñas y botón */}
                <IonRow>
                    <IonCol className="gap-5 flex flex-col">
                        <IonCard
                            className="flex flex-col items-center justify-center text-center text-primary h-20 border-2 border-foreground rounded-lg">
                            <IonCardTitle className="text-4xl font-bold">{reviews.length}</IonCardTitle>
                            <IonCardSubtitle className="font-semibold">reseñas</IonCardSubtitle>
                        </IonCard>
                        <IonButton color="tertiary" expand="block" className="bg-primary text-primary-foreground">
                            Hacer una nueva reseña
                        </IonButton>
                    </IonCol>
                </IonRow>

                {/* Segunda sección: Buscador y botones de ordenación/filtro */}
                <IonRow className="mt-10">
                    <IonCol>
                        <IonTitle className="text-4xl font-semibold text-primary">Buscar</IonTitle>
                        <IonGrid>
                            <IonRow className="ion-align-items-center gap-3">
                                <IonCol>
                                        <IonInput
                                            type="text"
                                            placeholder="Buscar reseñas por comentario, categoría, ítem o puntuación..."
                                            value={searchTerm}
                                            onIonInput={(inputChange) => setSearchTerm(inputChange.target.value as string)}
                                        >
                                        <IonButton fill="clear" slot="end">
                                            <Search color={"var(--ion-color-tertiary)"} />
                                        </IonButton>
                                        </IonInput>
                                </IonCol>
                                <IonCol size="auto">
                                    <IonButton
                                        onClick={toggleSortOrder}
                                        className="bg-input rounded-lg flex items-center justify-center text-primary"
                                    >
                                        {sortOrder === "asc" ? (
                                            <ArrowUp color={"var(--ion-color-tertiary)"}  size={20}/>
                                        ) : sortOrder === "desc" ? (
                                            <ArrowDown color={"var(--ion-color-tertiary)"}  size={20}/>
                                        ) : (
                                            <ArrowUpDown color={"var(--ion-color-tertiary)"}  size={20}/>
                                        )}
                                    </IonButton>
                                </IonCol>
                                <IonCol size="auto">
                                    <IonButton
                                        className="bg-input rounded-lg flex items-center justify-center text-primary"
                                        onClick={() => setFilterModalOpen(true)}
                                    >
                                        <Funnel size={20}/>
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCol>
                </IonRow>

                {/* Tercera sección: Listado de reseñas */}
                <IonRow className="mt-10">
                    <IonCol>
                        {sortOrder === "none" ? (
                            Object.entries(reviewCardsByDate).map(([date, reviews]) => (
                                <IonList key={date}>
                                    <IonItemGroup>
                                        <IonLabel className="text-primary">{date}</IonLabel>
                                        {reviews.map((review) => (
                                            <ReviewCard key={review.id} review={review}/>
                                        ))}
                                    </IonItemGroup>
                                </IonList>
                            ))
                        ) : (
                            sortedReviews.map((review) => (
                                <ReviewCard key={review.id} review={review}/>
                            ))
                        )}
                        {sortedReviews.length === 0 && (
                            <IonText className="text-center text-muted-foreground">
                                No se encontraron reseñas.
                            </IonText>
                        )}
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
    );
};

export default ReviewPage;
