import { Category } from "@dto/Category";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonContent, IonHeader, IonLabel, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { useEffect, useState } from "react";
import '@styles/CategorySelectorModal.css';
import { useTranslation } from "react-i18next";
import { CategoryColors } from "@/shared/enums/colors";
import { getParentCategories } from "../services/category-service";

interface CategorySelectorModalProps {
    modal: React.RefObject<HTMLIonModalElement | null>;
    selectedCategory: Category | null;
    setSelectedCategory: (category: Category | null) => void;
}

const CategorySelectorModal = ({ modal, selectedCategory, setSelectedCategory }: CategorySelectorModalProps) => {
    const [t] = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getParentCategories()
            .then((categories) => {
                setCategories(categories);
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
            });
    }
    , []);

    return (
        <IonModal ref={modal} initialBreakpoint={0.5} breakpoints={[0, 0.25, 0.5, 0.75]}>
            <IonHeader className="ion-no-border ion-padding-top">
                <IonToolbar>
                    <IonTitle className="ion-padding text-2xl text-start font-bold">{t('common.select-category')}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding safe-area-bottom overflow-y-scroll">
                {categories.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <IonLabel>{t('common.no-categories-found')}</IonLabel>
                    </div>
                ) : (
                    <div className="grid gap-x-4 gap-y-8 grid-cols-[repeat(auto-fit,minmax(6.25rem,1fr))] justify-center items-center justify-items-center">
                        {categories.map((category) => (
                            <div key={category.id} className={`flex flex-col w-23 items-center gap-2 justify-center`} onClick={() => {
                                setSelectedCategory(category);
                                modal.current?.dismiss(category);
                            }}>
                                <div className={`rounded-xl flex items-center justify-center size-23 ${selectedCategory?.id === category.id ? 'selected' : ''}`} style={{ backgroundColor: CategoryColors[category.color] }}>
                                    <FontAwesomeIcon icon={category.icon as IconName} size="3x" color="var(--ion-color-primary-contrast)" />
                                </div>
                                <IonLabel className="truncate max-w-full text-xs">{category.name}</IonLabel>
                            </div>
                        ))}
                    </div>
                )}
            </IonContent>
        </IonModal>
    )
}

export default CategorySelectorModal;