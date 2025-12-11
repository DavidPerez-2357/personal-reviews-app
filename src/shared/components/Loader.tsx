import { Star } from "lucide-react";

interface LoaderProps {
    sizeModifier?: number;
}

const Loader = ({ sizeModifier = 1 }: LoaderProps) => {
    return (
        <div className="flex h-full w-full items-center justify-center user-none select-none">
            {/* Original animation from Uiverse.io by LightAndy1 */}
            <Star size={45 * sizeModifier} fill="var(--ion-color-primary)" color="transparent" className="loader-animation-1" />
            <Star size={30 * sizeModifier} fill="var(--ion-color-primary)" color="transparent" className="loader-animation-1 animation-delay-250ms" />
            <Star size={25 * sizeModifier} fill="var(--ion-color-primary)" color="transparent" className="loader-animation-1 animation-delay-500ms" />
        </div>
    );
};

export default Loader;