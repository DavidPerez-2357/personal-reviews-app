import { ItemFull } from "@/shared/dto/Item";
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
  IonItem,
} from "@ionic/react";
import { use, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSelectableItemsForRelation } from "@/shared/services/item-service";
import { Check, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { CategoryColors } from "@/shared/enums/colors";
import { Capacitor } from "@capacitor/core";

interface ItemsSelectorProps {
  isOpen: boolean;
  onDismiss: () => void;
  isOrigin: boolean;
  itemId: number;
  itemsOfOrigin?: ItemFull[];
  onSave?: (selectedItems: ItemFull[]) => void;
}

const ItemsSelectorModal = ({
  isOpen,
  onDismiss,
  isOrigin,
  itemId,
  itemsOfOrigin = [],
  onSave,
}: ItemsSelectorProps) => {
  const PAGE_SIZE = 10;

  // i18n translation
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemFull[]>(itemsOfOrigin);
  const [selectedItems, setSelectedItems] = useState<ItemFull[]>(itemsOfOrigin);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = async (reset = false) => {
    const offset = (page - 1) * PAGE_SIZE;
    const result = await getSelectableItemsForRelation(
      isOrigin,
      PAGE_SIZE,
      offset,
      searchTerm,
      itemId
    );

    // Añadir itemsOfOrigin al principio si no están ya
    let merged: ItemFull[] = [];
    if (reset) {
      // Solo al reset, para evitar duplicados en paginación
      const ids = new Set(itemsOfOrigin.map((i) => i.id));
      merged = [
        ...itemsOfOrigin,
        ...result.filter((i) => !ids.has(i.id)),
      ];
      setItems(merged);
    } else {
      // En paginación, solo añadir los nuevos
      setItems((prev) => {
        const ids = new Set(prev.map((i) => i.id));
        return [...prev, ...result.filter((i) => !ids.has(i.id))];
      });
    }
    setHasMore(result.length === PAGE_SIZE);
  };

  useEffect(() => {
    setSearchTerm("");
    setPage(1);
    fetchItems(true);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchItems(true);
    }
    // eslint-disable-next-line
  }, [searchTerm]);

  const handleLoadMore = () => {
    setPage((prev) => {
      const newPage = prev + 1;
      return newPage;
    });
  };

  useEffect(() => {
    if (page > 1) {
      fetchItems();
    }
  }, [page]);

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(itemsOfOrigin);
    }
  }, [isOpen, itemsOfOrigin]);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} ref={modal}>
      <IonHeader className="ion-no-border ion-padding-top">
        <IonToolbar>
          <IonTitle className="text-2xl font-bold text-start p-5">
            {isOrigin
              ? t("manage-item.select-items")
              : t("manage-item.select-origin")}
          </IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            color="tertiary"
            onClick={() => {
              if (onSave) onSave(selectedItems);
              onDismiss();
            }}
          >
            <X size={25} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ">
        <IonGrid>
            <IonCol>
            <IonInput
              placeholder={
              isOrigin
                ? t("manage-item.search-items")
                : t("manage-item.search-origin")
              }
              type="text"
              fill="solid"
              onIonInput={(e: any) => {
              setSearchTerm(e.target.value);
              }}
              value={searchTerm}
            />
            </IonCol>
          <IonCol>
            {/* Render list of items con Ionic */}
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                {t("manage-item.no-items")}
              </div>
            ) : (
              <IonList lines="none">
                {items.map((item: ItemFull) => {
                  const isSelected = selectedItems.some(
                    (i) => i.id === item.id
                  );
                  return (
                    <IonItem
                      key={item.id}
                      button
                      color={isSelected ? "primary" : undefined}
                      onClick={() => {
                        if (isOrigin) {
                          // Selección múltiple
                          if (!isSelected) {
                            setSelectedItems([...selectedItems, item]);
                          } else {
                            setSelectedItems(
                              selectedItems.filter((i) => i.id !== item.id)
                            );
                          }
                        } else {
                          // Solo uno seleccionado a la vez
                          if (!isSelected) {
                            setSelectedItems([item]);
                          } else {
                            setSelectedItems([]);
                          }
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 py-3">
                        {item.image ? (
                          <div className="flex relative items-center justify-center size-10 rounded-md overflow-hidden">
                            <img
                              src={Capacitor.convertFileSrc(item.image)}
                              alt={item.name}
                              className="object-cover w-full h-full"
                            />
                            <div
                              className="absolute bottom-0 right-0 size-4 rounded-md flex items-center justify-center p-1"
                              style={{
                                backgroundColor:
                                  CategoryColors[item.category_color],
                              }}
                            >
                              <FontAwesomeIcon
                                icon={item.category_icon as IconName}
                                className="fa-xs text-[var(--ion-color-primary-contrast)]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-center size-10 rounded-md p-2"
                            style={{
                              backgroundColor:
                                CategoryColors[item.category_color],
                            }}
                          >
                            <FontAwesomeIcon
                              icon={item.category_icon as IconName}
                              className="fa-xl text-[var(--ion-color-primary-contrast)]"
                            />
                          </div>
                        )}
                        {item.name}
                      </div>
                      {isSelected && (
                        <Check
                          size={20}
                          className="text-[var(--ion-color-primary-contrast)] absolute right-3"
                          style={{ top: "50%", transform: "translateY(-50%)" }}
                        />
                      )}
                    </IonItem>
                  );
                })}
              </IonList>
            )}
            {hasMore && items.length > 0 && (
              <IonButton
                expand="block"
                color={"tertiary"}
                className="text-[var(--ion-color-tertiary-contrast)]"
                onClick={handleLoadMore}
              >
                {t("common.load-more")}
              </IonButton>
            )}
          </IonCol>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default ItemsSelectorModal;
