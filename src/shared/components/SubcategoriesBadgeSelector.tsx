import { Category } from "@dto/Category";
import { SubCategoryColors } from "@/shared/enums/colors";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonLabel } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { getChildrenCategories } from "../services/category-service";

interface SubcategoriesBadgeSelectorProps {
    parentCategory: Category | null;
    selectedSubcategory: Category | null;
    setSelectedSubcategory: (subcategory: Category | null) => void;
}

const SubcategoriesBadgeSelector = ({ parentCategory, selectedSubcategory, setSelectedSubcategory }: SubcategoriesBadgeSelectorProps) => {
    const [selectedSubcategoryElement, setSelectedSubcategoryElement] = useState<HTMLDivElement | null>(null);
    const [ subcategories, setSubcategories ] = useState<Category[]>([]);

    // Vairables para manejar el scroll de la lista de subcategorias
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const offset = 15; // Offset para el scroll

    useEffect(() => {
        getChildrenCategories(parentCategory?.id || 0)
            .then((categories) => {
                setSubcategories(categories);
            })
            .catch((error) => {
                console.error("Error fetching subcategories:", error);
            });
    }, [parentCategory]);

    const checkScrollPosition = () => {
        const el = scrollRef.current;
        if (!el) return;

        const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - offset;
        setIsAtEnd(nearEnd);
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            checkScrollPosition();

            if (selectedSubcategoryElement) {
                const el = selectedSubcategoryElement;
                const scrollLeft = el.offsetLeft; // Offset para el scroll
                scrollRef.current?.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        });
    }, [subcategories, selectedSubcategoryElement]);

    if (subcategories.length === 0) {
        return null; // No hay subcategorías o la categoría padre no está definida
    }

    return (
        <div ref={scrollRef} onScroll={checkScrollPosition} className={`flex items-center overflow-x-scroll transition-all max-w-full gap-3 py-2 relative ${isAtEnd ? '' : 'opacity-gradient'}`} onClick={(event) => event.stopPropagation()}>
            {subcategories.map((subcategory) => (
                <div key={subcategory.id} className={`h-full border items-center rounded-lg py-2 px-3 flex gap-2`}
                style={{ backgroundColor: selectedSubcategory?.id === subcategory.id ? SubCategoryColors[selectedSubcategory.color] : '', borderColor: selectedSubcategory?.id === subcategory.id ? SubCategoryColors[selectedSubcategory.color] : 'var(--ion-color-primary-contrast)' }}
                ref={selectedSubcategory?.id === subcategory.id ? setSelectedSubcategoryElement : null}
                onClick={() => {selectedSubcategory?.id !== subcategory.id ? setSelectedSubcategory(subcategory) : setSelectedSubcategory(null)}}>
                    <FontAwesomeIcon icon={subcategory.icon as IconName} size="xl" color={'light'} />
                    <IonLabel color={'light'} className="text-nowrap">{subcategory.name}</IonLabel>
                </div>
            ))}
        </div>
    )
}

export default SubcategoriesBadgeSelector;