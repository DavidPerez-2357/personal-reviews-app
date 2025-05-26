import {Star} from "lucide-react";
import {useEffect, useState} from "react";

type StarCheckboxProps = {
    index: number;
    rating: number;
    checked: boolean;
    size: number;
    setRating: (rating: number) => void;
    canEdit?: boolean;
}

const colorsForRating: Record<number, string> = {
    1: "var(--ion-color-primary-step-500)",
    2: "var(--ion-color-primary-step-500)",
    3: "var(--ion-color-primary-step-500)",
    4: "var(--ion-color-primary-step-500)",
    5: "var(--ion-color-primary-step-400)",
};

const StarCheckbox = ({ index, checked, size, rating, setRating, canEdit = true }: StarCheckboxProps) => {
    const [iconSize, setIconSize] = useState(size);

    // Adjust the icon size based on the window width
    useEffect(() => {
        const updateSize = () => {
            if (window.innerWidth < 340 && size > 40) {
                setIconSize(47);
            } else if (window.innerWidth < 390 && size > 50) {
                setIconSize(55);
            } else {
                setIconSize(size);
            }
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        return () => window.removeEventListener("resize", updateSize);
    }, [size]);

    function handleClick() {
        if (!canEdit) return;

        if (checked && rating === index) {
            setRating(0);
        }
        else {
            setRating(index);
        }
    }

    return (
        <label title="Star" className="star">
            <input className="checkbox hidden" type="checkbox" checked={checked} onChange={handleClick} id={`star-${index}`} />
            <Star size={iconSize} fill={checked ? colorsForRating[rating] : "var( --ion-color-secondary-step-100)"} color="none" className={`transition-all ${(checked && rating == 5 && canEdit) && ` rotate-animation-1 animation-ease animation-delay-${index - 1}00ms`}`} />
        </label>
    )
}

export default StarCheckbox;