import React, { useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonBackButton,
  IonHeader,
  IonButton,
} from "@ionic/react";
import { useParams } from "react-router";
import { getItems } from "@/shared/services/item-service";
import { ItemDisplay, ItemFull, OriginDisplay } from "@/shared/dto/Item";
import { ChevronDown, EllipsisVertical } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { CategoryColors } from "@/shared/enums/colors";
import StarRating from "@/shared/components/StarRating";
import { Review } from "@/shared/dto/Review";
import TimelineEntry from "./components/TimeLineEntry";
import ItemCard from "./components/ItemCard";
import OriginCard from "./components/OriginCard";

export const ViewItem = () => {
  const { id } = useParams<{ id: string }>();

  const [showTimeline, setShowTimeline] = React.useState(false);

  const [item, setItem] = React.useState<ItemFull>({
    id: 0,
    name: "",
    image: null,
    created_at: "",
    updated_at: "",
    category_id: 0,
    category_name: "",
    category_icon: "",
    category_color: "",
  });

  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [itemsOfOrigin, setItemsOfOrigin] = React.useState<OriginDisplay[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // const mainItemDetailsFromDB = await getItem(id);

        const mainItemDetailsFromDB: ItemFull = {
          id: 1,
          name: "Apple",
          image: "https://desarrolloweb.com/media/761/imagenes-html.jpg",
          created_at: "2023-10-01",
          updated_at: "2023-10-01",
          category_id: 11,
          category_name: "Brand",
          category_icon: "apple-whole",
          category_color: "red",
        };
        const itemReviews: Review[] = [
          {
            id: 1,
            rating: 5,
            comment: "Excelente producto",
            item_id: 1,
            created_at: "2023-10-01",
            updated_at: "2023-10-01",
          },
          {
            id: 2,
            rating: 4,
            comment: "Muy bueno, pero caro",
            item_id: 1,
            created_at: "2023-10-02",
            updated_at: "2023-10-02",
          },
          {
            id: 3,
            rating: 3,
            comment: "Rinde bien, pero no es lo que esperaba",
            item_id: 1,
            created_at: "2023-10-03",
            updated_at: "2023-10-03",
          },
          {
            id: 4,
            rating: 2,
            comment: "No me gustó, se calienta mucho",
            item_id: 1,
            created_at: "2023-10-04",
            updated_at: "2023-10-04",
          },
          {
            id: 5,
            rating: 1,
            comment: "Malísimo, no lo compren",
            item_id: 1,
            created_at: "2023-10-05",
            updated_at: "2023-10-05",
          },
        ];

        const itemsOfOrigin: OriginDisplay[] = [
          {
            id: 2,
            name: "iPhone 14 Pro",
            category_name: "Brand",
            category_icon: "mobile-alt",
            category_color: "red",
            average_rating: 4.5,
            average_rating_all_items: 0,
            number_of_ratings: 120,
            date_last_review: "2023-10-10",
          },
          {
            id: 3,
            name: "iPhone 13",
            category_name: "Brand",
            category_icon: "mobile-alt",
            category_color: "red",
            average_rating: 4.2,
            average_rating_all_items: 4.3,
            number_of_ratings: 98,
            date_last_review: "2023-09-15",
          },
          {
            id: 4,
            name: "iPhone SE",
            category_name: "Brand",
            category_icon: "mobile-alt",
            category_color: "red",
            average_rating: 3.8,
            average_rating_all_items: 4.3,
            number_of_ratings: 45,
            date_last_review: "2023-08-20",
          },
        ];

        setItem(mainItemDetailsFromDB);
        setReviews(
          itemReviews.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
        setItemsOfOrigin(itemsOfOrigin);
      } catch (err) {
        console.error("Error initializing data:", err);
      }
    };
    initializeData();
  }, []);

  return (
    <IonPage>
      <IonContent>
        <IonRow className="flex justify-between items-center ion-padding">
          <IonBackButton defaultHref="/app/items" />
          <EllipsisVertical size={30} />
        </IonRow>
        <div className="flex flex-col gap-6">
          <div
            className="h-48 bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: `url(${item.image})`, // item.image puede ser null, CSS lo manejará
            }}
          >
            <IonCol className="flex items-center h-1/2 bg-[#222831]/80 ion-padding gap-3">
              <div
                className={`p-5 rounded-lg w-16 h-16 flex items-center justify-center`}
                style={{
                  backgroundColor: CategoryColors[item.category_color],
                }}
              >
                <FontAwesomeIcon
                  icon={item.category_icon as IconName}
                  className="fa-2xl text-[var(--ion-color-primary-contrast)]"
                />
              </div>
              <span className="text-2xl font-bold break-words text-[var(--ion-color-primary-contrast)]">
                {item.name}
              </span>
            </IonCol>
          </div>
          <div className="ion-padding flex flex-col gap-3 justify-center items-center">
            {reviews.length > 0 && (
              <>
                <StarRating
                  size={50}
                  rating={reviews[0].rating}
                  setRating={() => {}}
                />
                <span className="text-[var(--ion-text-color)] text-lg">
                  {reviews[0].comment}
                </span>
              </>
            )}
          </div>
          <IonButton
            color="tertiary"
            expand="block"
            className="bg-primary mx-5"
            routerLink="/app/reviews/create"
          >
            Crear Reseña
          </IonButton>
          {reviews.length > 1 && (
            <div className="px-5 flex flex-col gap-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowTimeline(!showTimeline)}
              >
                <span className="font-bold text-[var(--ion-text-color)] text-3xl">
                  Línea del tiempo
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--ion-color-tertiary-contrast)] text-sm p-1 rounded-full bg-[var(--ion-color-tertiary)] flex items-center justify-center w-6 h-6">
                    {reviews.length}
                  </span>
                  <ChevronDown
                    className={`transition-transform ${
                      showTimeline ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
              {showTimeline && (
                <div
                  className={`overflow-hidden transition-all duration-1000 ease-in-out ${
                    showTimeline ? "max-h-screen" : "max-h-0"
                  }`}
                >
                  <div className="relative flex flex-col justify-center mx-10 pt-4">
                    {reviews.map((entry, index) => (
                      <TimelineEntry
                        key={index}
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

          <div className="px-5 flex flex-col gap-4">
            <span className="font-bold text-[var(--ion-text-color)] text-3xl">
              Elementos
            </span>
            <IonGrid className="gap-4">
              <div className="flex flex-col gap-7">
                {itemsOfOrigin.map((item) => (
                  <ItemCard item={item} />
                ))}
              </div>
            </IonGrid>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ViewItem;
