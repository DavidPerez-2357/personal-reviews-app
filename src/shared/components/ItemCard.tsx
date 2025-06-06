import StarRating from "@/shared/components/StarRating";
import type { ItemDisplay } from "@/shared/dto/Item";
import { CategoryColors } from "@/shared/enums/colors";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonButton, IonCard } from "@ionic/react";
import { SquarePen } from "lucide-react";

const ItemCard = ({ item }: { item: ItemDisplay }) => {

  return (
    <IonCard
      button={true}
      className="bg-[var(--ion-color-secondary)] px-4 py-5 relative"
      routerLink={`/app/items/${item.id}/viewItem`}
    >
      <div className="gap-4 w-full flex flex-row items-center">
        <div
          className="flex items-center justify-center size-16 rounded-md p-2"
          style={{ backgroundColor: CategoryColors[item.category_color] }}
        >
          <FontAwesomeIcon
            icon={item.category_icon as IconName}
            className="fa-2xl text-white"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-lg text-[var(--ion-text-color)] break-all pr-9">
            {item.name}
          </span>
          <div className="flex items-center gap-2">
            <StarRating
              size={30}
              rating={item.last_rating}
              setRating={() => {}}
            />
            {item.number_of_reviews >= 2 && (
              <span className="font-bold text-xs text-center rounded-full p-1 min-h-6 min-w-6 text-[var(--ion-color-secondary)] bg-[var(--ion-color-secondary-contrast)]">
                {item.number_of_reviews}
              </span>
            )}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <IonButton
            color={"tertiary"}
            className="aspect-square edit-button"
            routerLink={`/app/item/${item.id}/edit`}
          >
            <SquarePen size={17}></SquarePen>
          </IonButton>
        </div>
      </div>
    </IonCard>
  );
};

export default ItemCard;
