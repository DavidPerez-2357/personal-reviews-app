import {Star} from "lucide-react";
import {useEffect, useState} from "react";

type StarCheckboxProps = {
    index: number;
    checked: boolean;
    size: number;
    setRating: (rating: number) => void;
}

const colorsForRating: Record<number, string> = {
    1: "var(--ion-color-primary-step-500)",
    2: "var(--ion-color-primary-step-500)",
    3: "var(--ion-color-primary-step-500)",
    4: "var(--ion-color-primary-step-500)",
    5: "var(--ion-color-primary-step-400)",
};

const StarCheckbox = ({ index, checked, size, rating, setRating }: StarCheckboxProps) => {
    const [iconSize, setIconSize] = useState(size);

    // Adjust the icon size based on the window width
    useEffect(() => {
        const updateSize = () => {
            if (window.innerWidth < 350 && size > 40) {
                setIconSize(40);
            } else if (window.innerWidth < 400 && size > 50) {
                setIconSize(50);
            } else {
                setIconSize(size);
            }
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        return () => window.removeEventListener("resize", updateSize);
    }, [size]);

    function handleClick() {
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
            <Star size={iconSize} fill={checked ? colorsForRating[rating] : "var( --ion-color-secondary)"} color="none" className={`transition-all ${(checked && rating == 5) && ` rotate-animation-1 animation-ease animation-delay-${index - 1}00ms`}`} />
        </label>
    )
}

export default StarCheckbox;