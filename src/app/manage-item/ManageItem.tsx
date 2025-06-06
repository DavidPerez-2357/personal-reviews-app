import { usePhotoGallery } from "@/hooks/usePhotoGallery";
import SubcategoriesBadgeSelector from "@/shared/components/SubcategoriesBadgeSelector";
import { Category } from "@/shared/dto/Category";
import { CategoryColors } from "@/shared/enums/colors";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IonApp,
  IonBackButton,
  IonContent,
  IonGrid,
  IonLabel,
  IonRow,
} from "@ionic/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router";

const ManageItem = () => {
console.log("ManageItem component loaded");
  const {
    savedPhotos,
    setSavedPhotos,
    takePhoto,
    importPhoto,
    savePhoto,
    deletePhoto,
  } = usePhotoGallery();
  let { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();

  const modal = useRef<HTMLIonModalElement>(null);

  // Variable de no encontrar categorias
  const notFoundAnyCategories: Category = {
    id: 0,
    name: t("common.no-categories-found"),
    type: 1,
    color: "darkgray",
    icon: "circle-exclamation",
    parent_id: null,
  };

  const [parentCategory, setParentCategory] = useState<Category>(
    notFoundAnyCategories
  );
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const editMode = Boolean(id);

  const getSelectedCategory = () => {
    if (selectedSubcategory) {
      return selectedSubcategory;
    } else if (parentCategory) {
      return parentCategory;
    }
    return null;
  };

  const goBack = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    window.history.back();
  };

  const setEditData = async (categoryId: number) => {

  }

  return (
    <IonApp>
      <IonContent>
        <IonGrid>
          <IonRow
            onClick={() =>
              parentCategory &&
              parentCategory.id != 0 &&
              modal.current?.present()
            }
            id="category-banner"
            className="safe-area-top relative w-full px-5 py-2 grid grid-rows-[1fr_auto] gap-2"
            style={{
              backgroundColor: parentCategory
                ? CategoryColors[parentCategory.color]
                : "",
            }}
          >
            <div
              className="flex absolute safe-area-top top-0 p-3"
              onClick={goBack}
            >
              <IonBackButton defaultHref="/app/reviews" color="tertiary" />
            </div>
            <div className="flex items-center justify-center pb-3 pt-5 min-h-5">
              {parentCategory?.icon && (
                <FontAwesomeIcon
                  icon={parentCategory?.icon as IconName}
                  className="text-5xl text-white mt-5"
                />
              )}
            </div>

            <IonLabel className="truncate max-w-[95%]">
              {parentCategory?.name}
            </IonLabel>

            <SubcategoriesBadgeSelector
              subcategories={childrenCategories}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
            />
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonApp>
  );
};

export default ManageItem;
