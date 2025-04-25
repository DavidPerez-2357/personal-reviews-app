import StarCheckbox from "@/shared/components/StarCheckbox";

type StarRatingProps = {
    size: number;
    rating: number;
    setRating: (rating: number) => void;
    canEdit?: boolean;
    classes?: string;
}

const StarRating = ({ size, rating, setRating, canEdit = true, classes = "" }: StarRatingProps) => {
    return (
        <div className={`flex gap-1` + (canEdit ? " cursor-pointer " : " select-none pointer-events-none ") + classes}>
            <StarCheckbox index={1} checked={rating >= 1} size={size} rating={rating} setRating={setRating} />
            <StarCheckbox index={2} checked={rating >= 2} size={size} rating={rating} setRating={setRating} />
            <StarCheckbox index={3} checked={rating >= 3} size={size} rating={rating} setRating={setRating} />
            <StarCheckbox index={4} checked={rating >= 4} size={size} rating={rating} setRating={setRating} />
            <StarCheckbox index={5} checked={rating >= 5} size={size} rating={rating} setRating={setRating} />
        </div>
    )
}

export default StarRating;