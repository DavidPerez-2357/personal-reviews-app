import { usePhotoGallery } from "@/hooks/usePhotoGallery";
import SubcategoriesBadgeSelector from "@/shared/components/SubcategoriesBadgeSelector";
import { Category } from "@/shared/dto/Category";
import { Item } from "@/shared/dto/Item";
import { CategoryColors } from "@/shared/enums/colors";
import { getCategoryById, getChildrenCategories, getParentCategory } from "@/shared/services/category-service";
import { getItemById } from "@/shared/services/item-service";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IonApp,
  IonBackButton,
  IonContent,
  IonGrid,
  IonLabel,
  IonPage,
  IonRow,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
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

    const setEditData = async (reviewId: number) => {
      try {
        // Datos de prueba estáticos
        // const item: Item = {
        //   id: reviewId,
        //   name: "iPhone 13 Pro",
        //   image: "https://example.com/items/iphone13pro.jpg",
        //   category_id: 2,
        //   is_origin: true,
        // };
        // const category: Category = {
        //   id: 2,
        //   name: "Móviles",
        //   icon: "mobile",
        //   color: "green",
        //   type: 1,
        //   parent_id: 1,
        // };
        // const parentCategory: Category = {
        //   id: 1,
        //   name: "Tecnología",
        //   icon: "laptop",
        //   color: "blue",
        //   type: 1,
        //   parent_id: null,
        // };
        // const children = [
        //   {
        //     id: 2,
        //     name: "Móviles",
        //     icon: "mobile",
        //     color: "green",
        //     type: 1,
        //     parent_id: 1,
        //   },
        //   {
        //     id: 3,
        //     name: "Portátiles",
        //     icon: "laptop",
        //     color: "purple",
        //     type: 1,
        //     parent_id: 1,
        //   },
        // ];

        // Comentado: llamadas reales a la base de datos
        const item: Item | null = await getItemById(reviewId);
        if (!item) throw new Error(t('manage-item-review.error-message.review-not-found'));
        const category: Category | null = await getCategoryById(item.category_id);
        if (!category) throw new Error(t('manage-item-review.error-message.category-not-found'));
        const parentCategory: Category = category.parent_id ? await getParentCategory(category.parent_id) || notFoundAnyCategories : category;
        if (category.parent_id) {
          setParentCategory(parentCategory);
          setSelectedSubcategory(category);
        } else {
          setParentCategory(category);
          setSelectedSubcategory(null);
        }
        if (parentCategory) {
          const children = await getChildrenCategories(parentCategory.id);
          setChildrenCategories(children);
        }

        // Manejar categorías padre e hija
        if (category.parent_id) {
          setParentCategory(parentCategory);
          setSelectedSubcategory(category);
        } else {
          setParentCategory(category);
          setSelectedSubcategory(null);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

  // Cargar datos de edición si estamos en modo edición
  useEffect(() => {
    if (editMode && id) {
      setEditData(parseInt(id)).catch((error) => {
        console.error("Error al cargar los datos de edición:", error);
        history.replace("/app/items");
      });
    } else {
      // Si no estamos en modo edición, inicializar las categorías
      setParentCategory(notFoundAnyCategories);
      setChildrenCategories([]);
      setSelectedSubcategory(null);
    }
  }, [editMode, id, history]);

  return (
    <IonPage>
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
              <IonBackButton defaultHref="/app/items" color="tertiary" />
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
          <IonRow className="flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">
              {editMode && selectedSubcategory && selectedSubcategory.type === 2
              ? t("manage-item-review.origin")
              : t("manage-item-review.item")}
            </span>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ManageItem;
