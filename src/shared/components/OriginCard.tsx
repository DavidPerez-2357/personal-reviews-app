import StarRating from "@/shared/components/StarRating";
import { CategoryColors } from "@/shared/enums/colors";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonButton, IonCard, IonLabel } from "@ionic/react";
import { Building2, SquarePen, Star } from "lucide-react";
import { ItemDisplay } from "../dto/Item";
import { useTranslation } from "react-i18next";
import { Suspense, useEffect, useState } from "react";
import { getFeaturedCategoryOfItemsInsideOfOrigin, getItemsByOrigin } from "../services/item-service";
import Loader from "./Loader";
import { CategoryAppearance } from "../dto/Category";

interface OriginCardProps {
  item: ItemDisplay;
}

const OriginCard = ({ item }: OriginCardProps) => {
  const { t } = useTranslation();

  const [isOriginExpanded, setIsOriginExpanded] = useState(false);
  const [itemsInside, setItemsInside] = useState<ItemDisplay[]>([]);
  const [featuredCategory, setFeaturedCategory] = useState<CategoryAppearance>({
    color: CategoryColors.default,
    icon: "xmark",
  });
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    if (itemsInside.length > 0) {
      getFeaturedCategory(itemsInside).then(setFeaturedCategory);
      setAverageRating(getAverageRating(itemsInside));
    }
  }, [itemsInside]);

  const getFeaturedCategory = async (items: ItemDisplay[]): Promise<CategoryAppearance> => {
    if (items.length === 0) {
      return {
        color: CategoryColors.default,
        icon: "xmark",
      };
    }

    const category = await getFeaturedCategoryOfItemsInsideOfOrigin(item.id);
    if (category) {
      return category;
    }

    return {
      color: "gray",
      icon: "xmark"
    };
  }

  const getAverageRating = (items: ItemDisplay[]): number => {
    if (items.length === 0) {
      return 0;
    }
    const totalRating = items.reduce((sum, item) => sum + (item.last_rating || 0), 0);
    return totalRating / items.length;
  }

  const expandOrigin = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOriginExpanded) {
      setIsOriginExpanded(false);
      return;
    }

    setIsOriginExpanded(true);

    if (itemsInside.length > 0) {
      return;
    }

    getItemsByOrigin(item.id).then((items) => {
      setItemsInside(items);
    });
  }

  return (
    <IonCard className="bg-[var(--ion-color-secondary)]" routerLink={`/app/items/${item.id}/viewItem`}>
      <div className="flex flex-col gap-4 px-4 pt-2 pb-4 relative">
        <div className="flex gap-3 font-medium w-full items-center text-[var(--ion-color-secondary-step-800)]">
          <Building2 size={20} strokeWidth={2} />
          <span className="text-base">
            {t("common.origin")}
          </span>
        </div>

        <div className="bg-[var(--ion-color-secondary)] items-center gap-4 flex cursor-pointer">
          <div
            className="flex items-center justify-center size-16 rounded-md p-2"
            style={{ backgroundColor: CategoryColors[item.category_color] }}
          >
            <FontAwesomeIcon
              icon={item.category_icon as IconName}
              className="fa-2xl"
              color="var(--ion-color-primary-contrast)"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-lg">
              {item.name}
            </span>
            <div className="flex items-center gap-2">
              <StarRating
                size={30}
                rating={item.last_rating}
                setRating={() => { }}
              />
              <span className="flex items-center justify-center rounded-full w-6 h-6 p-2 text-[var(--ion-color-secondary)]">
                {item.number_of_reviews}
              </span>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <IonButton
              color={"tertiary"}
              className="aspect-square edit-button"
              routerLink={`/app/item/${item.id}/edit`}
            >
              <SquarePen size={20}></SquarePen>
            </IonButton>
          </div>
        </div>

        {!isOriginExpanded && (
          <div className="flex pt-2 items-center text-base gap-2 text-[var(--ion-color-secondary-step-800)]" onClick={expandOrigin}>
            <IonLabel className="text-[var(--ion-color-secondary-step-800)] underline w-full text-center">
              {t("common.show-more")}
            </IonLabel>
          </div>
        )}

        {isOriginExpanded && (
          <Suspense fallback={<Loader sizeModifier={0.5} />}>
            <div className="flex flex-col gap-3">
              <span className="text-[var(--ion-color-secondary-step-800)] text-base">
                {itemsInside.length} {itemsInside.length === 1 ? t("common.item") : t("common.items")}
              </span>
              <div className="flex gap-2 justify-around items-center">
                <div className="text-[var(--ion-color-secondary-step-800)] text-base items-center grid grod-rows-[1fr_auto] h-full">
                  <span className="font-bold text-2xl flex items-center gap-1 text-center">
                    {averageRating.toFixed(1)}
                    <Star size={20} strokeWidth={2} color="var(--ion-color-primary)" fill="var(--ion-color-primary)" />
                  </span>

                  <span className="text-center">
                    Media
                  </span>
                </div>

                <div className="items-center gap-2 grid grod-rows-[1fr_auto] h-full">
                  <div
                    className="flex  items-center justify-center rounded-md"
                  >
                    <FontAwesomeIcon
                      icon={featuredCategory.icon as IconName}
                      className="fa-2x"
                    />
                  </div>
                  <span className="text-base text-center text-[var(--ion-color-secondary-step-800)]">
                    Destacada
                  </span>
                </div>
              </div>
            </div>
          </Suspense>
        )}
      </div>


    </IonCard>
  );
};

export default OriginCard;
