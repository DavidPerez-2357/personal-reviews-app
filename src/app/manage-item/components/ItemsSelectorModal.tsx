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
  itemsOfOrigin?: ItemFull[];
  onSave?: (selectedItems: ItemFull[]) => void; // <-- Añadido
}

const ItemsSelectorModal = ({
  isOpen,
  onDismiss,
  isOrigin,
  itemsOfOrigin = [],
  onSave, // <-- Añadido
}: ItemsSelectorProps) => {
  const PAGE_SIZE = 10;

  // i18n translation
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemFull[]>([]);
  const [selectedItems, setSelectedItems] = useState<ItemFull[]>(itemsOfOrigin);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = async (reset = false) => {
    const offset = (page - 1) * PAGE_SIZE;
    // const result = [
    //   // Mocked data for demonstration purposes
    //   {
    //     id: "1",
    //     name: "Item 1",
    //     category_color: "blue",
    //     category_icon: "icon1" as IconName,
    //   },
    //   {
    //     id: "2",
    //     name: "Item 2",
    //     category_color: "green",
    //     category_icon: "icon2" as IconName,
    //   }
    // ]
    const result = await getSelectableItemsForRelation(
      isOrigin,
      PAGE_SIZE,
      offset,
      searchTerm
    );
    console.log(
      "[ItemsSelectorModal] Fetched items:",
      JSON.stringify(result, null, 2)
    );
    if (reset) {
      setItems(result);
    } else {
      setItems((prev) => [...prev, ...result]);
    }
    setHasMore(result.length === PAGE_SIZE);
  };

  useEffect(() => {
    setSearchTerm("");
    setPage(1);
    fetchItems(true);
    console.log(
      "[ItemsSelectorModal] useEffect [] itemsOfOrigin:",
      JSON.stringify(itemsOfOrigin, null, 2)
    );
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchItems(true);
      console.log("[ItemsSelectorModal] useEffect [searchTerm]:", searchTerm);
    }
    // eslint-disable-next-line
  }, [searchTerm]);

  const handleLoadMore = () => {
    setPage((prev) => {
      const newPage = prev + 1;
      console.log("[ItemsSelectorModal] handleLoadMore newPage:", newPage);
      return newPage;
    });
  };

  useEffect(() => {
    if (page > 1) {
      fetchItems();
      console.log("[ItemsSelectorModal] useEffect [page]:", page);
    }
    // eslint-disable-next-line
  }, [page]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      ref={modal}
    >
      <IonHeader className="ion-no-border ion-padding-top">
        <IonToolbar style={{ paddingTop: 0, marginTop: 0 }}>
          <IonTitle className="text-2xl font-bold text-start p-5">
            {t("manage-item.item-input-placeholder")}
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
              placeholder={t("common.search-item")}
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
            <IonList>
              {items.map((item: ItemFull) => {
                const isSelected = selectedItems.some((i) => i.id === item.id);
                return (
                  <IonItem
                    key={item.id}
                    button
                    color={isSelected ? "primary" : undefined}
                    onClick={() => {
                      if (!isSelected) {
                        setSelectedItems([...selectedItems, item]);
                      } else {
                        setSelectedItems(
                          selectedItems.filter((i) => i.id !== item.id)
                        );
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {item.image ? (
                        <div className="flex relative items-center justify-center size-18 rounded-md overflow-hidden">
                          <img
                            src={Capacitor.convertFileSrc(item.image)}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                          <div
                            className="absolute bottom-0 right-0 size-9 rounded-md flex items-center justify-center p-1"
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
            {hasMore && (
              <IonButton
                expand="block"
                color={"tertiary"}
                className="text-[var(--ion-color-tertiary-contrast)]"
                onClick={handleLoadMore}>
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
