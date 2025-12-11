import { useState } from "react";
import { Ham, SquarePen, Star } from "lucide-react";
import { IonButton, IonCard } from "@ionic/react";
import { ReviewFull } from "@dto/Review";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import PreviewPhotoModal from "@/shared/components/PreviewPhotoModal";
import StarRating from "@/shared/components/StarRating";
import { Capacitor } from '@capacitor/core';

const ReviewCard = ({ review }: { review: ReviewFull }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleImageClick = (image: string) => {
    setSelectedImageUrl(image);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-3 border-2 border-[var(--ion-color-secondary)] rounded-md p-2">
      <IonCard className="pb-4 pt-2 relative">
        <div className="flex flex-col px-3 gap-4">
            <div className="flex flex-row items-center gap-3">
              <FontAwesomeIcon icon={review.icon as IconName} className="fa-xl" />
              <IonButton
                fill="clear"
                color="primary"
                className="font-semibold text-md w-full break-words whitespace-normal text-start overflow-hidden pr-5"
                routerLink={`/app/items/${review.item_id}/viewItem`}
              >
                {review.item}
              </IonButton>
            </div>
            <IonButton
              color={"tertiary"}
              className="aspect-square edit-button absolute right-2 top-2 z-10"
              routerLink={`/app/reviews/${review.id}/edit`}
            >
              <SquarePen size={17}></SquarePen>
            </IonButton>

          {review.images.length > 0 && (
            <div className="flex flex-row gap-2 overflow-x-auto">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={Capacitor.convertFileSrc(image)}
                  alt={`Review image ${index + 1}`}
                  className="size-20 object-cover rounded-md border border-[var(--ion-color-secondary)]"
                  onClick={() => {
                    handleImageClick(image);
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-1">
              <StarRating
                size={35}
                rating={review.rating}
                setRating={() => { }}
                canEdit={false}
                classes="pointer-events-none"
              />
            </div>
            <span className="text-base w-full break-words whitespace-normal">
              {review.comment}
            </span>
          </div>
        </div>
      </IonCard>
      {selectedImageUrl && (
        <PreviewPhotoModal
          isOpen={isModalOpen}
          photoUrl={selectedImageUrl}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ReviewCard;
