import { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonBackButton,
  IonButton,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useParams, useHistory } from "react-router";
import { ItemDisplay } from "@/shared/dto/Item";
import { Building2, ChevronDown, EllipsisVertical } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { CategoryColors } from "@/shared/enums/colors";
import StarRating from "@/shared/components/StarRating";
import { Review } from "@/shared/dto/Review";
import TimelineEntry from "./components/TimeLineEntry";
import StatOriginView from "./components/StatsOriginView";
import { getItemDisplay, getItemsByOrigin } from "@/shared/services/item-service";
import { getReviewsByItemId } from "@/shared/services/review-service";
import { useTranslation } from "react-i18next";
import "./styles/viewItem.css";
import ItemOrOrigin from "@/shared/components/ItemOrOrigin";
import { Capacitor } from "@capacitor/core";

export const ViewItem = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [showTimeline, setShowTimeline] = useState(false);

  const [item, setItem] = useState<ItemDisplay | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [itemsOfOrigin, setItemsOfOrigin] = useState<ItemDisplay[]>([]);
  const [imageError, setImageError] = useState(false);

  const { t } = useTranslation();

  const initializeData = async () => {
    try {
      const itemFromDB = await getItemDisplay(Number(id));
      const itemReviews = await getReviewsByItemId(Number(id));
      const itemsOfOrigin = await getItemsByOrigin(Number(id));

      if (!itemFromDB) {
        console.error("Item not found");
        return;
      }

      setItem(itemFromDB);
      setReviews(
        itemReviews.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
      );
      setItemsOfOrigin(itemsOfOrigin);
      // Si no hay elementos de origen, mostrar la línea temporal abierta
      if (itemsOfOrigin.length === 0) {
        setShowTimeline(true);
      }
    } catch (err) {
      console.error("Error initializing data:", err);
    }
  };

  useEffect(() => {
    initializeData();
  }, [id, location.pathname]);

  useEffect(() => {
    // Reset image error state when item changes
    setImageError(false);
  }, [item]);

  //según el value del IonSelect, redirigir a la página correspondiente
  const handleSelectChange = (event: CustomEvent) => {
    const value = event.detail.value;
    switch (value) {
      case "edit":
        history.push(`/app/items/${id}/edit`);
        break;
      case "origin":
        history.push(`/app/items/${id}/origin`);
        break;
      case "delete":
        // Aquí podrías implementar la lógica para eliminar el item
        console.log("Delete item with id:", id);
        // Por ejemplo, podrías mostrar un modal de confirmación antes de eliminar
        break;
      default:
        console.warn("Unhandled select option:", value);
        break;
    }
  };

  return (
    <IonPage className="safe-area-top">
      <IonContent>
        <IonRow className="flex justify-between items-center ion-padding">
          <IonBackButton defaultHref="/app/items" />
          <div className="relative">
            <EllipsisVertical color="var(--ion-text-color)" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
            <IonSelect
              interface="popover"
              className="pr-10 w-full [&::part(icon)]:hidden"
              style={{ minWidth: 0, width: "2.5rem" }}
              onIonChange={handleSelectChange}
            >
              <IonSelectOption value="edit">{t("common.edit")}</IonSelectOption>
              <IonSelectOption value="origin">{t("view-item.to-origin")}</IonSelectOption>
              <IonSelectOption value="delete">{t("common.delete")}</IonSelectOption>
            </IonSelect>
          </div>
        </IonRow>
        <div className="flex flex-col gap-12 pb-10">
          <div className="flex flex-col gap-7">
            {/* Mostrar el contenedor solo si hay imagen y no hay error, y quitar h-48 si no hay imagen o hay error */}
            <div
              className={`bg-cover bg-center flex items-center justify-center ${item?.image && !imageError ? " h-56" : ""
                }`}
              style={
                item?.image && !imageError
                  ? { backgroundImage: `url(${Capacitor.convertFileSrc(item.image)}` }
                  : {}
              }
            >
              {item?.image && !imageError && (
                <img
                  src={Capacitor.convertFileSrc(item.image)}
                  alt=""
                  style={{ display: "none" }}
                  onError={() => setImageError(true)}
                />
              )}
              <IonCol className="flex items-center h-1/2 bg-[#222831]/80 ion-padding gap-5">
                <div
                  className={`p-5 rounded-lg w-16 h-16 flex items-center justify-center`}
                  style={{
                    backgroundColor: CategoryColors[item?.category_color || "default"],
                  }}
                >
                  <FontAwesomeIcon
                    icon={item?.category_icon as IconName}
                    className="fa-2xl text-[var(--ion-color-primary-contrast)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-bold w-full break-words whitespace-normal text-[var(--ion-color-primary-contrast)] max-w-full">
                    {item?.name}
                  </span>
                  {itemsOfOrigin.length > 0 && (
                    <span className="text-sm text-[var(--ion-color-primary-contrast)] flex items-center gap-1">
                      <Building2 size={20} className="inline-block mr-1" />
                      {t("common.origin")}
                    </span>
                  )}
                </div>
              </IonCol>
            </div>
            <div className="ion-padding flex flex-col gap-3 justify-center items-center">
              <>
                <StarRating
                  size={60}
                  rating={reviews[0]?.rating || 0}
                  setRating={() => { }}
                />
                {reviews.length > 0 ? (
                  <span className="text-[var(--ion-text-color)] text-lg">
                    {reviews[0]?.comment}
                  </span>
                ) : (
                  <span className="text-[var(--ion-color-secondary)] text-lg">
                    {t("view-item.no-review")}
                  </span>
                )}
              </>
            </div>
          </div>
          <IonButton
            color="tertiary"
            expand="block"
            className="bg-primary mx-5 mb-5 text-lg"
            routerLink={`/app/reviews/create/item/${id}`}
          >
            {t("view-item.add-review")}
          </IonButton>
          {reviews.length > 1 && (
            <div className="px-5 flex flex-col gap-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => {
                  // Solo permitir toggle si hay elementos de origen
                  if (itemsOfOrigin.length > 0) setShowTimeline(!showTimeline);
                }}
              >
                <span className="font-bold text-[var(--ion-text-color)] text-3xl">
                  {t("view-item.timeline")}
                </span>
                {itemsOfOrigin.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--ion-color-tertiary-contrast)] font-bold text-sm p-1 rounded-full bg-[var(--ion-color-tertiary)] flex items-center justify-center w-6 h-6">
                      {reviews.length}
                    </span>
                    <ChevronDown
                      className={`transition-transform ${showTimeline ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                )}
              </div>
              {showTimeline && (
                <div
                  className={`overflow-hidden transition-all duration-1000 ease-in-out ${showTimeline ? "max-h-screen" : "max-h-0"
                    }`}
                >
                  <div className="relative flex flex-col justify-center mx-10 pt-4">
                    {reviews.map((entry) => (
                      <TimelineEntry
                        key={entry.id}
                        entry={{
                          date: entry.created_at,
                          rating: entry.rating,
                          comment: entry.comment,
                        }}
                      />
                    ))}
                    {/* Extending the timeline line to the bottom */}
                    <div className="absolute left-0 top-0 w-0.5 h-full bg-[var(--ion-color-tertiary)]"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {item?.is_origin ? (
            <div className="px-5 flex flex-col gap-4">
              <span className="font-bold text-[var(--ion-text-color)] text-3xl">
                {t("common.items")}
              </span>
              <StatOriginView items={itemsOfOrigin} />
              <IonGrid className="gap-4 mt-2">
                {itemsOfOrigin.length > 0 ? (
                  <div className="flex flex-col gap-7">
                    {itemsOfOrigin.map((item) => (
                      <ItemOrOrigin key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    {t("view-item.no-items-found")}
                  </div>
                )}
              </IonGrid>
            </div>
          ): ''}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ViewItem;
