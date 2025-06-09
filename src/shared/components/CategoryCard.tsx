import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonButton, IonLabel } from "@ionic/react";
import { SquarePen } from "lucide-react";
import { Category } from "../dto/Category";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { useTranslation } from "react-i18next";
import { CategoryColors } from "../enums/colors";

interface CategoryCardProps {
    category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
    const {t} = useTranslation();

    return (
        <div className="pr-9 py-7 rounded-lg max-w-full text-[var(--ion-color-primary-contrast)] relative overflow-hidden min-h-20 pl-22 flex items-center gap-2" style={{ backgroundColor: CategoryColors[category.color] }}>
            <FontAwesomeIcon icon={category.icon as IconName} size="5x" fill="var(--ion-color-primary-contrast)" className="absolute transform -left-4 -translate-y-1/2 top-1/2 opacity-50" />
            <IonLabel className="text-2xl font-semibold w-full break-words whitespace-normal">
                {category.name}
            </IonLabel>
            <IonLabel className=" text-sm absolute bottom-1 right-2">
                28 {t("common.items")}
            </IonLabel>
            <div className="absolute top-1 right-2">
                <IonButton
                    color={"tertiary"}
                    className="aspect-square edit-button m-0"
                    routerLink={`/app/more/categories/${12}/edit`}
                >
                    <SquarePen size={17}></SquarePen>
                </IonButton>
            </div>
        </div>
    );
}

export default CategoryCard;