import {
    IonButton,
    IonCard,
    IonCol,
    IonContent,
    IonGrid,
    IonInput,
    IonLabel,
    IonPage,
    IonRow,
} from "@ionic/react";
import { ArrowDown, ArrowUp, ArrowUpDown, Funnel, LayoutGrid, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ItemFilterModal from "./components/ItemFilterModal";
import ItemSortModal from "./components/ItemSortModal";
import { ItemSortType, SortOrder } from "@/shared/dto/Sort";
import { countItems, countItemsFiltered, getItemsDisplay } from "./services/item-service";
import { ItemDisplay } from "@/shared/dto/Item";
import ItemCard from "@/shared/components/ItemCard";
import { ItemType } from "@/shared/dto/Filter";


const ViewAllItems = () => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("none");
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [sortModalOpen, setSortModalOpen] = useState(false);
    const [sortType, setSortType] = useState<ItemSortType>("none");
    const [areItemsGrouped, setAreItemsGrouped] = useState(false);
    const [areFiltersApplied, setAreFiltersApplied] = useState(false);
    const [numberOfItems, setNumberOfItems] = useState(0);
    const [numberOfItemsFiltered, setNumberOfItemsFiltered] = useState(0);
    const [items, setItems] = useState<ItemDisplay[]>([]);
    const [categoriesVisible, setCategoriesVisible] = useState<number[]>([]);
    const [itemTypeFilter, setItemTypeFilter] = useState<ItemType>("all");
    const PAGE_SIZE = 2;

    useEffect(() => {
        // Simulate fetching number of items from a service
        countItems().then((count) => {
            setNumberOfItems(count);
        }).catch((error) => {
            console.error("Error fetching number of items:", error);
            setNumberOfItems(0);
        });

        // Fetch initial items
        fetchItems(0, PAGE_SIZE).then((fetchedItems) => {
            setItems(fetchedItems);
        }).catch((error) => {
            console.error("Error fetching initial items:", error);
            setItems([]);
        });
    }, []);
        
    useEffect(() => {
        const filters = {
            category: categoriesVisible.length > 0 ? categoriesVisible : undefined,
            type: itemTypeFilter,
        }

        if (
            (categoriesVisible.length > 0 && itemTypeFilter !== "all") ||
            (categoriesVisible.length > 0) ||
            (itemTypeFilter !== "all") ||
            searchTerm.trim() !== ""
        ) {
            countItemsFiltered(searchTerm, filters).then((count) => {
                setNumberOfItemsFiltered(count);
                setAreFiltersApplied(count > 0);
            }).catch((error) => {
            console.error("Error fetching filtered item count:", error);
            setNumberOfItemsFiltered(0);
            });
        }

        fetchItems(0, PAGE_SIZE).then((fetchedItems) => {
            setItems(fetchedItems);
        }).catch((error) => {
            console.error("Error fetching items:", error);
            setItems([]);
        });

    }, [sortType, sortOrder, itemTypeFilter, categoriesVisible, areItemsGrouped, searchTerm]);

    const applyFilters = (filters: { category?: number[]; type: ItemType }) => {
        if (filters) {
            setAreFiltersApplied(true);
            console.log("Filters applied:", filters);
            setItemTypeFilter(filters.type);
            setCategoriesVisible(filters.category ? filters.category : []);
        }

        if (filters.type === "all" && !filters.category) {
            setAreFiltersApplied(false);
            setItemTypeFilter("all");
            setCategoriesVisible([]);
        }

        setFilterModalOpen(false);
    }

    const fetchItems = (page: number, size: number): Promise<ItemDisplay[]> => {
        const sort = {
            type: sortType,
            order: sortOrder,
        };

        const filters = {
            category: categoriesVisible.length > 0 ? categoriesVisible : undefined,
            type: itemTypeFilter,
        };

        console.log("Fetching items with params:",
            page,
            size,
            searchTerm,
            sort.order,
            sort.type,
            filters.category,
            filters.type,
            areItemsGrouped
        );

        return getItemsDisplay(page, size, searchTerm, sort, filters, areItemsGrouped)
            .then((fetchedItems: ItemDisplay[]) => {
                console.log("Fetched items:", fetchedItems);
                return fetchedItems;
            })
            .catch((error: Error) => {
                console.error("Error fetching items:", error);
                setItems([]);
                return [];
            });
    }

    const applySort = (sortType: ItemSortType, sortOrder: SortOrder) => {
        setSortType(sortType);
        setSortOrder(sortOrder);
        setSortModalOpen(false);
    }

    const appendItems = (newItems: ItemDisplay[]) => {
        setItems((prevItems) => [...prevItems, ...newItems]);
    }

    return (
        <IonPage className="safe-area-top">
            <IonContent>
                <IonGrid className="p-5 pb-10 flex flex-col gap-12">
                    <IonRow>
                        <IonCol className="gap-5 flex flex-col">
                            <div className="flex flex-col items-center justify-center text-center text-[var(--ion-text-color)] p-3 border border-[var(--ion-text-color)] rounded-lg">
                                <IonLabel className="text-4xl font-bold">
                                    {numberOfItems}
                                </IonLabel>
                                <IonLabel>
                                    {t("common.items")}
                                </IonLabel>
                            </div>
                            <IonButton
                                color="tertiary"
                                expand="block"
                                className="bg-primary"
                                routerLink="/app/items/create"
                            >
                                Crete new Item
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol className="flex flex-col gap-2">
                            <IonLabel className="section-title">{t('review-page.search')}</IonLabel>
                            <IonGrid className="flex flex-col gap-4">
                                <IonRow className="ion-align-items-center gap-3">
                                    <IonCol>
                                        <IonInput
                                        type="text"
                                        placeholder="Search items..."
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
                                            onClick={() => setAreItemsGrouped(!areItemsGrouped)}
                                            size="large"
                                            color={areItemsGrouped ? "tertiary" : "secondary"}
                                        >
                                            <LayoutGrid
                                                size={20}
                                                fill={areItemsGrouped ? "var(--ion-color-secondary)" : "none"}
                                            />
                                        </IonButton>
                                    </IonCol>
                                </IonRow>

                                <IonRow className="ion-align-items-center gap-3">
                                    <IonCol size="auto">
                                        <IonButton
                                        onClick={() => setSortModalOpen(true)}
                                        color={sortOrder !== "none" && sortType !== "none" ? "tertiary" : "secondary"}
                                        size="default"
                                        >

                                        {sortOrder === "asc" && sortType !== "none" ? (
                                            <ArrowUp
                                            color={"var(--ion-color-secondary)"}
                                            size={20}
                                            />
                                        ) : sortOrder === "desc" && sortType !== "none" ? (
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
                                            <span className="ml-3 text-base">
                                                {t('common.sort')}
                                            </span>
                                        </IonButton>
                                    </IonCol>
                                    <IonCol size="auto">
                                        <IonButton
                                            onClick={() => setFilterModalOpen(true)}
                                            size="default"
                                            color={areFiltersApplied ? "tertiary" : "secondary"}
                                        >
                                            <Funnel
                                                size={20}
                                                fill={areFiltersApplied ? "var(--ion-color-secondary)" : "none"}
                                            />
                                            <span className="ml-3 text-base">
                                                {t('common.filter')}
                                            </span>
                                        </IonButton>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol className="flex flex-col gap-5">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <ItemCard
                                        key={item.id}
                                        item={item} />   
                                ))
                            ) : (
                                <div className="text-center text-gray-500">
                                    {t('common.no-items-found')}
                                </div>
                            )}

                            {(
                                ((items.length < numberOfItems) && (!areFiltersApplied && !searchTerm)) ||
                                ((items.length < numberOfItemsFiltered) && (areFiltersApplied || searchTerm))
                            ) && (
                                <IonButton 
                                    expand="block"
                                    onClick={async () => {
                                        const nextPage = Math.floor(items.length / PAGE_SIZE);
                                        const newItems = await fetchItems(nextPage, PAGE_SIZE);
                                        appendItems(newItems);
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

            <ItemFilterModal
                isOpen={filterModalOpen}
                onDismiss={() => setFilterModalOpen(false)}
                onApplyFilters={(filters: any) => applyFilters(filters)}
            />

            <ItemSortModal
                isOpen={sortModalOpen}
                onDismiss={() => { setSortModalOpen(false); console.log("Sort modal dismissed"); }}
                onApplySort={(sortType: ItemSortType, sortOrder: SortOrder) => applySort(sortType, sortOrder)}
            />

        </IonPage>
    );
};

export default ViewAllItems;
