import { Ham, SquarePen, Star } from "lucide-react";
import { IonButton, IonCard } from "@ionic/react";
import { ReviewFull} from "@dto/Review";
import "../styles/reviewPage.css";
const ReviewCard = ({ review }: { review: ReviewFull }) => {
  return (
    <div className="flex flex-col gap-3 border-2 border-[var(--ion-color-secondary)] rounded-md p-2">
      <IonCard className="pb-4 pt-2">
        <div className="flex flex-col px-3 gap-4">
            <div className="grid grid-cols-[1fr_auto] items-center">
            <div className="flex flex-row items-center gap-3">
              <Ham size={20}></Ham>
              <span className="font-semibold text-md">{review.item}</span>
            </div>
            <IonButton
              color={"tertiary"}
              className="aspect-square edit-button"
            >
              <SquarePen size={20}></SquarePen>
            </IonButton>
          </div>

            {review.images.length > 0 && (
            <div className="flex flex-row gap-2 overflow-x-auto">
              {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="size-20 object-cover rounded-md border border-[var(--ion-color-secondary)]"
              />
              ))}
            </div>
            )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  fill={index < review.rating ? "var(--ion-color-primary)" : "var(--ion-color-secondary"}
                  strokeWidth={0}
                  size={35}
                ></Star>
              ))}
            </div>
            <span className="text-base">{review.comment}</span>
          </div>
        </div>
      </IonCard>
    </div>
  );
};

export default ReviewCard;
