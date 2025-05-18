import StarRating from "@/shared/components/StarRating";
import type { ItemDisplay } from "@/shared/dto/Item";
import { CategoryColors } from "@/shared/enums/colors";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonButton, IonCard } from "@ionic/react";
import { SquarePen } from "lucide-react";

const ItemCard = ({ item }: { item: ItemDisplay }) => {
  return (
    <IonCard className="bg-[var(--ion-color-secondary)] p-4 flex items-center gap-4">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-md"
        style={{ backgroundColor: CategoryColors[item.category_color] }}
      >
        <FontAwesomeIcon
          icon={item.category_icon as IconName}
          className="fa-2xl text-white"
        />
      </div>

      <div className="flex flex-col">
        <span className="text-lg text-[var(--ion-color-primary-contrast)]">
          {item.name}
        </span>
        <div className="flex items-center gap-2">
          <StarRating
            size={30}
            rating={Math.round(item.average_rating)}
            setRating={() => {}}
          />
          <span className="flex items-center justify-center rounded-full w-6 h-6 p-2 text-[var(--ion-color-secondary)] bg-[var(--ion-color-secondary-contrast)]">
            {item.number_of_ratings}
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
    </IonCard>
  );
};

export default ItemCard;
