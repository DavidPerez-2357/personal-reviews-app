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

const ItemsSelectorModal = ({
  isOpen,
  onDismiss,
  isOrigin,
  itemsOfOrigin = [],
}: {
  isOpen: boolean;
  onDismiss: () => void;
  isOrigin: boolean;
  itemsOfOrigin?: ItemFull[];
}) => {
  // i18n translation
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemFull[]>([]);
  const [selectedItems, setSelectedItems] = useState<ItemFull[]>(itemsOfOrigin);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = async (reset = false) => {
    const offset = (page - 1) * pageSize;
    const result = await getSelectableItemsForRelation(
      isOrigin,
      pageSize,
      offset,
      searchTerm
    );
    console.log("[ItemsSelectorModal] Fetched items:", JSON.stringify(result, null, 2));
    if (reset) {
      setItems(result);
    } else {
      setItems((prev) => [...prev, ...result]);
    }
    setHasMore(result.length === pageSize);
  };

  useEffect(() => {
      setSearchTerm("");
      setPage(1);
      fetchItems(true);
      console.log("[ItemsSelectorModal] useEffect [] itemsOfOrigin:", JSON.stringify(itemsOfOrigin, null, 2));
  }, []);

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
      className="ion-no-border"
    >
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ paddingTop: 0, marginTop: 0 }}>
          <IonTitle className="text-2xl font-bold text-start p-5">
            {t("common.select-item")}
          </IonTitle>
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
              {items.map((item) => (
                <IonItem key={item.id}>{item.name}</IonItem>
              ))}
            </IonList>
            {hasMore && (
              <IonButton
                expand="block"
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
