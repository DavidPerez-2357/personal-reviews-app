import { ItemSortType, SortOrder } from "@/shared/dto/Sort";
import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonList, IonModal, IonRippleEffect, IonRow, IonTitle, IonToolbar } from "@ionic/react";
import { ArrowDown, ArrowUp, Calendar, CaseUpper, Star, X } from "lucide-react";
import React, { use, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface ItemSortModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    onApplySort: (sortType: ItemSortType, sortOrder: SortOrder) => void;
};

const ItemSortModal = ({ isOpen, onDismiss , onApplySort }: ItemSortModalProps) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const { t } = useTranslation();

    const [sortOrder, setSortOrder] = React.useState<SortOrder>("none");
    const [sortType, setSortType] = React.useState<ItemSortType>("none");

    const handleApplySort = () => {
        if (sortType !== "none" && sortOrder !== "none") {
            onApplySort(sortType, sortOrder);
        }
    };

    const clearSort = () => {
        setSortOrder("none");
        setSortType("none");
        onApplySort("none", "none");

        if (modal.current) {
            modal.current.dismiss();
        }
    }

    useEffect(() => {
        if (sortOrder == "none" && sortType !== "none") {
            setSortOrder("asc");
        }
    }, [sortType]);

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onDismiss}
            ref={modal}
            initialBreakpoint={0.60}
            breakpoints={[0, 0.60, 0.70]}
            className="ion-no-padding ion-no-border">
            <IonHeader
                className="ion-no-border">
              <IonToolbar
                style={{ paddingTop: 0, marginTop: 0 }}>
                <IonTitle
                  className="text-2xl font-bold text-start p-5">
                  {t("common.sort")}
                </IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-no-padding">
                <IonGrid className="flex flex-col justify-between gap-10 px-5 pb-5">
                    <IonRow className="flex gap-4 h-10">
                        <IonCol>
                            <IonButton className={"flex-1 text-base border-[var(--ion-color-tertiary)] rounded-lg" + (sortOrder === "asc" ? ' border-2' : '')} color="secondary" size="default" expand="block" onClick={() => setSortOrder("asc")}>
                                <ArrowUp size={28} className="inline-block mr-2" />
                                {t("common.ascending")}
                            </IonButton>
                        </IonCol>

                        <IonCol>
                            <IonButton className={"flex-1 text-base border-[var(--ion-color-tertiary)] rounded-lg" + (sortOrder === "desc" ? ' border-2' : '')} color="secondary" size="default" expand="block" onClick={() => setSortOrder("desc")}>
                                <ArrowDown size={28} className="inline-block mr-2" />
                                {t("common.descending")}
                            </IonButton>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol className="flex flex-col">
                            <IonItem
                                className={
                                    "ion-activatable ripple-parent ion-no-padding"
                                }
                                color="default"
                                style={sortType === "name" ? { backgroundColor: "var(--ion-color-secondary)" } : {}}
                                onClick={() => setSortType("name")}
                            >
                                <div className="flex items-center gap-3 px-2 py-4">
                                    <CaseUpper size={30} className="w-8" />
                                    <span className="text-lg">{t("common.by-name")}</span>
                                </div>
                                <IonRippleEffect className="rounded-lg" />
                            </IonItem>
                            <IonItem
                                className="ion-activatable ripple-parent ion-no-padding"
                                color="default"
                                style={sortType === "date" ? { backgroundColor: "var(--ion-color-secondary)" } : {}}
                                onClick={() => setSortType("date")}
                            >
                                <div className="flex items-center gap-3 px-2 py-4">
                                    <Calendar size={28} className="w-8" />
                                    <span className="text-lg">{t("common.by-date")}</span>
                                </div>
                                <IonRippleEffect className="rounded-lg" />
                            </IonItem>
                            <IonItem
                                className="ion-activatable ripple-parent ion-no-padding"
                                color="default"
                                style={sortType === "rating" ? { backgroundColor: "var(--ion-color-secondary)" } : {}}
                                onClick={() => setSortType("rating")}
                            >
                                <div className="flex items-center gap-3 px-2 py-4">
                                    <Star size={28} className="w-8" />
                                    <span className="text-lg">{t("common.by-rating")}</span>
                                </div>
                                <IonRippleEffect className="rounded-lg" />
                            </IonItem>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol className="flex gap-4 flex-wrap h-12">
                            <IonButton className="flex-1 text-base" color="secondary" size="default" expand="block" onClick={() => clearSort()}>
                                {t("common.reset")}
                            </IonButton>

                            <IonButton className="flex-1 text-base" color="tertiary" size="default" expand="block" onClick={() => handleApplySort()}>
                                {t("common.apply")}
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonModal>
    );
};

export default ItemSortModal;