import { IonBackButton, IonLabel } from "@ionic/react"
import SubcategoriesBadgeSelector from "./SubcategoriesBadgeSelector"
import { use, useEffect, useRef, useState } from "react";
import { Category } from "../dto/Category";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { CategoryColors } from "../enums/colors";
import CategorySelectorModal from "./CategorySelectorModal";
import { getCategoryById } from "../services/category-service";

interface CategorySelectorHeaderProps {
    selectedCategory: Category | null;
    setSelectedCategory: (category: Category | null) => void;
}

const CategorySelectorHeader = ({ selectedCategory, setSelectedCategory }: CategorySelectorHeaderProps) => {
    const [parentCategory, setParentCategory] = useState<Category | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
    const modal = useRef<HTMLIonModalElement>(null);

    useEffect(() => {
        if (selectedCategory && selectedCategory.parent_id && parentCategory?.id !== selectedCategory.parent_id) {
            getCategoryById(selectedCategory.parent_id)
            .then((category) => {
                setParentCategory(category);
                setSelectedSubcategory(selectedCategory);
                console.log("Parent category fetched:", category?.name);
                console.log("Selected subcategory set:", selectedCategory?.name);
            })
            .catch((error) => {
                console.error("Error fetching parent category:", error);
            });

        }else if (selectedCategory && !selectedCategory.parent_id && parentCategory?.id !== selectedCategory.id) {
            setParentCategory(selectedCategory);
            setSelectedSubcategory(null);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (selectedSubcategory) {
            setSelectedCategory(selectedSubcategory);
        }else if (parentCategory) {
            setSelectedCategory(parentCategory);
        } else {
            setSelectedCategory(null);
        }
    }, [parentCategory, selectedSubcategory]);

    useEffect(() => {
        if (!parentCategory || selectedSubcategory?.parent_id !== parentCategory.id) {
            setSelectedSubcategory(null);
        }
    }, [parentCategory]);

    return (
        <>
            <div onClick={() => parentCategory && parentCategory.id != 0 && modal.current?.present()}
                id="category-banner"
                className="safe-area-top relative w-full px-5 py-2 grid grid-rows-[1fr_auto] gap-2"
                style={{ backgroundColor: parentCategory ? CategoryColors[parentCategory.color] : '' }}
                >
                <div className="flex items-center justify-center pb-3 pt-5 min-h-5">
                    {parentCategory?.icon && (<FontAwesomeIcon
                    icon={parentCategory?.icon as IconName}
                    className="text-5xl text-white mt-5"
                    />)}
                </div>

                <IonLabel className="truncate max-w-[95%]">
                    {parentCategory?.name}
                </IonLabel>

                <SubcategoriesBadgeSelector parentCategory={parentCategory} selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory} />
            </div>

            <CategorySelectorModal modal={modal} selectedCategory={parentCategory} setSelectedCategory={setParentCategory} />
        </>
    )
}

export default CategorySelectorHeader;