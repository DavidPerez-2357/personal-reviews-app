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
import { countItems } from "./services/item-service";


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

    useEffect(() => {
        // Simulate fetching number of items from a service
        countItems().then((count) => {
            setNumberOfItems(count);
        }).catch((error) => {
            console.error("Error fetching number of items:", error);
            setNumberOfItems(0);
        });
    }, []);

    const applyFilters = (filters: any) => {
        console.log(filters);

        if (filters) {
            setAreFiltersApplied(true);
            console.log("Filters applied:", filters);
        }

        if (filters.type === "all" && !filters.category) {
            setAreFiltersApplied(false);
        }
    }

    const applySort = (sortType: ItemSortType, sortOrder: SortOrder) => {
        console.log(`Applying sort: ${sortType} in ${sortOrder} order`);
        setSortType(sortType);
        setSortOrder(sortOrder);
        setSortModalOpen(false);
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
