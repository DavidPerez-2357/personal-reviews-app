import { CategoryRatingMix } from "@/shared/dto/category/CategoryRating";
import { IonRange } from "@ionic/react";
import { Dispatch, SetStateAction, useState } from "react";

interface CategoryRatingRangeProps {
    categoryRating: CategoryRatingMix;
    setCategoryRatings: Dispatch<SetStateAction<CategoryRatingMix[]>>;
}

const CategoryRatingRange = ({ categoryRating, setCategoryRatings }: CategoryRatingRangeProps) => {
    const [value, setValue] = useState<number>(categoryRating.value);

    const handleChange = (newValue: number) => {
        setCategoryRatings((prevRatings) =>
            prevRatings.map((rating) =>
                rating.id === categoryRating.id
                    ? { ...rating, value: newValue }
                    : rating
            )
        );
    };

    return (
        <IonRange
            key={categoryRating.id}
            labelPlacement="stacked"
            label={categoryRating.name}
            pin={true}
            ticks={true}
            snaps={true}
            max={10}
            step={1}
            min={0}
            className="w-full"
            value={value}
            onIonChange={(e) => {
                const newValue = e.detail.value as number;
                setValue(newValue);
                handleChange(newValue);
            }}
        />
    );
};

export default CategoryRatingRange;