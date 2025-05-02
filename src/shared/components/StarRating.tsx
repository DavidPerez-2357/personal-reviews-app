import StarCheckbox from "@/shared/components/StarCheckbox";

type StarRatingProps = {
  size: number;
  rating: number;
  setRating: (rating: number) => void;
  canEdit?: boolean;
  classes?: string;
};

const StarRating = ({
  size,
  rating,
  setRating,
  canEdit = true,
  classes = "",
}: StarRatingProps) => {
  return (
    <div
      className={`flex gap-1 ${
        canEdit ? "cursor-pointer" : "select-none pointer-events-none"
      } ${classes}`}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <StarCheckbox
          key={index}
          index={index}
          checked={rating >= index}
          size={size}
          rating={rating}
          setRating={setRating}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};

export default StarRating;
