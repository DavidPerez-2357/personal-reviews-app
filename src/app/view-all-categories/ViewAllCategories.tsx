import { IonContent, IonPage } from "@ionic/react";
import { IonButton, IonCol, IonGrid, IonInput, IonLabel, IonRow } from "@ionic/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bookmark, Search } from "lucide-react";
import CategoryCard from "@/shared/components/CategoryCard";
import { Category } from "@/shared/dto/Category";
import { countCategories, countCategoriesFiltered, getCategoriesPaginated } from "./services/category-service";

const ViewAllCategories = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [numberOfCategories, setNumberOfCategories] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [numberOfCategoriesFiltered, setNumberOfCategoriesFiltered] = useState(0);
    const PAGE_SIZE = 15;

    const fetchCategories = async (page: number, size: number, searchTerm = ""): Promise<Category[]> => {
        return getCategoriesPaginated(page, size, searchTerm)
            .then((data) => {
                return data;
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                return [];
            });
    }


    const appendCategories = (newCategories: Category[]) => {
        setCategories((prevCategories) => {
            return [...prevCategories, ...newCategories];
        });
    }


    const fetchNextPage = async () => {
        const nextPage = Math.floor(categories.length / PAGE_SIZE);
        const newCategories = await fetchCategories(nextPage, PAGE_SIZE);
        appendCategories(newCategories);
    }

    useEffect(() => {
        countCategories()
            .then((count) => {
                setNumberOfCategories(count);
            })
            .catch((error) => {
                console.error("Error counting categories:", error);
            });

        fetchCategories(0, PAGE_SIZE)
            .then((data) => {
                setCategories(data);
            })
            .catch((error) => {
                console.error("Error fetching initial categories:", error);
            });
    }, [location.pathname]);

    useEffect(() => {
        countCategoriesFiltered(searchTerm.trim())
            .then((count) => {
                setNumberOfCategoriesFiltered(count);
            })
            .catch((error) => {
                console.error("Error counting categories:", error);
            });

        fetchCategories(0, PAGE_SIZE, searchTerm.trim())
            .then((data) => {
                setCategories(data);
            })
            .catch((error) => {
                console.error("Error fetching initial categories:", error);
            });
    }, [searchTerm, location.pathname]);

    return (
        <IonPage className="safe-area-top">
            <IonContent>
                <IonButton
                    color="tertiary"
                    expand="block"
                    className="bg-primary fixed bottom-5 left-5 right-5 z-50"
                    routerLink="/app/more/categories/create"
                >
                    {t('view-all-categories.create-category')}
                </IonButton>

                <IonGrid className="p-5 pb-20 flex flex-col gap-12">
                    <IonRow>
                        <IonCol className="gap-5 flex flex-col">
                            <div className="flex gap-4 w-full">
                                <div className="flex flex-col  w-full items-center justify-center text-center text-[var(--ion-text-color)] p-3 border border-[var(--ion-text-color)] rounded-lg">
                                    <IonLabel className="text-4xl font-bold">
                                        {numberOfCategories}
                                    </IonLabel>
                                    <IonLabel>
                                        {t("common.categories")}
                                    </IonLabel>
                                </div>
                            </div>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol className="flex flex-col gap-2">
                            <IonLabel className="section-title">{t('common.search')}</IonLabel>
                            <IonGrid className="flex flex-col gap-4">
                                <IonRow className="ion-align-items-center gap-3">
                                    <IonCol>
                                        <IonInput
                                            type="text"
                                            placeholder={t('view-all-categories.search-placeholder')}
                                            value={searchTerm}
                                            onIonInput={(e) => setSearchTerm(e.detail.value ?? "")}
                                            fill="solid"
                                        >
                                            <IonButton fill="clear" slot="end">
                                                <Search color={"var(--ion-color-tertiary)"} />
                                            </IonButton>
                                        </IonInput>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol className="flex flex-col gap-5">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        category={category} />
                                ))) : (
                                <div className="text-center flex flex-col items-center justify-center gap-2 text-[var(--ion-color-secondary-step-300)]">
                                    <Bookmark size={100} />
                                    <IonLabel>{t('common.no-categories-found')}</IonLabel>
                                </div>
                            )}

                            {(
                                categories.length > 0 &&
                                categories.length < numberOfCategoriesFiltered
                            ) && (
                                    <IonButton
                                        expand="block"
                                        onClick={async () => {
                                            await fetchNextPage();
                                        }}
                                        color="secondary"
                                    >
                                        {t('common.load-more')}
                                    </IonButton>
                                )}
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
}

export default ViewAllCategories;