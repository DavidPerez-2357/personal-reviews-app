import { Camera, Images, InfoIcon } from "lucide-react";
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonGrid,
  IonLabel,
  IonPage,
  IonRow,
  IonTextarea,
} from "@ionic/react";
import StarRating from "@components/StarRating";
import { useEffect, useRef, useState } from "react";
import "@styles/ManageItemReview.css";
import { usePhotoGallery } from "@hooks/usePhotoGallery";
import { Item, ItemOption } from "@dto/item/Item";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { insertItem, updateItem } from "@services/item-service";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { getCategoryById, getCategoryRatingsByCategoryId, getChildrenCategories, getParentCategory, insertCategoryRatingValue } from "@services/category-service";
import { Category } from "@dto/category/Category";
import CategorySelectorModal from "@components/CategorySelectorModal";
import { CategoryRating, CategoryRatingMix } from "@dto/category/CategoryRating";
import PreviewPhotoModal from "@components/PreviewPhotoModal";
import SubcategoriesBadgeSelector from "@/app/manage-review/components/SubcategoriesBadgeSelector";
import { CategoryColors } from "@shared/enums/colors";
import { useTranslation } from "react-i18next";
import { Review } from "@dto/review/Review";
import { insertReview, insertReviewImage } from "@shared/services/review-service";
import { CategoryRatingValue } from "@shared/dto/category/CategoryRatingValue";
import { useHistory } from "react-router-dom";
import ItemSelector from "./components/ItemSelector";
import CategoryRatingRange from "./components/CategoryRatingRange";
import ErrorAlert from "@/shared/components/ErrorAlert";
import { ReviewImage } from "@/shared/dto/review/ReviewImage";


const ManageItemReview = () => {
  const { photos, takePhoto, importPhoto } = usePhotoGallery();
  const history = useHistory();
  const { t } = useTranslation();

  // Referencias
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Variables para manejar el modal
  const modal = useRef<HTMLIonModalElement>(null);

  // Variables del boton de guardar reseña
  const [saveButtonText, setSaveButtonText] = useState(t("manage-item-review.create-review"));
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Variables de previsualizacion de fotos
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewPhotoModal = useRef<HTMLIonModalElement>(null);
  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setPreviewPhoto(null);
  };
  const handlePreviewOpen = (photo: string) => {
    setPreviewPhoto(photo);
    setIsPreviewOpen(true);
  };

  // Error
  const [errorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Variables del fomulario
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [itemName, setItemName] = useState("");
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatingMix[]>([]);
  const [selectedOption, setSelectedOption] = useState<ItemOption | null>(null);

  const getSelectedCategory = () => {
    if (selectedSubcategory) {
      return selectedSubcategory;
    } else if (parentCategory) {
      return parentCategory;
    }
    return null;
  }

  const convertToCategoryRatingMix = (categoryRatings: CategoryRating[]) => {
    return categoryRatings.map((categoryRating) => ({
      id: categoryRating.id,
      name: categoryRating.name,
      value: 0, // Valor inicial
    }));
  }

  // Funcion que se ejecuta cada vez que cambia la opción seleccionada
  useEffect(() => {
    if (selectedOption) {
      getParentCategory(selectedOption.category_id).then((category) => {
        // Solo actualiza el estado si la categoría realmente cambió
        setParentCategory((prevCategory) => {
          if (prevCategory?.id !== category?.id) {
            return category;
          }
          return prevCategory;
        });

        if (!category) {
          setChildrenCategories([]);
          return;
        }
      });
    }
  }, [selectedOption]);

  useEffect(() => {
    setSelectedSubcategory(null); // Reset selected subcategory when parent category changes

    if (!parentCategory) return;

    getChildrenCategories(parentCategory?.id).then((categories) => {
      setChildrenCategories((prevCategories) => {
        // Solo actualiza si las categorías realmente cambiaron
        if (
          prevCategories.length !== categories.length ||
          !prevCategories.every((cat, index) => cat.id === categories[index].id)
        ) {
          return categories;
        }
        return prevCategories;
      });
    });
  }, [parentCategory]);

  useEffect(() => {
    if (!selectedOption?.parent_category_id) {
        setSelectedSubcategory(null); // Reset selected subcategory if no parent category is selected
    }else {
        getCategoryById(selectedOption.category_id).then((category) => {          
          if (category) {
              setSelectedSubcategory(category);
          } else {
              setSelectedSubcategory(null); // Reset selected subcategory if category not found
          }
        });
    }
  }, [itemName, selectedOption]);
    

  useEffect(() => {
    const selectedCategory = getSelectedCategory();
    if (!selectedCategory) return;

    getCategoryRatingsByCategoryId(selectedCategory?.id).then((ratings) => {
      setCategoryRatings((prevRatings) => {
        // Solo actualiza si los ratings realmente cambiaron
        if (
          prevRatings.length !== ratings.length ||
          !prevRatings.every((rating, index) => rating.id === ratings[index].id)
        ) {
          return convertToCategoryRatingMix(ratings);
        }
        return prevRatings;
      });
    });

  }, [parentCategory, selectedSubcategory]);

  // Funciones para manejar el input y su desplegable
  const handleParentScroll = async (event: CustomEvent) => {
    const target = event.detail as HTMLIonContentElement;
    const button = document.getElementById("save-review");

    if (!contentRef.current) return;

    const scrollEl = await contentRef.current.getScrollElement();
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight;
    const clientHeight = scrollEl.clientHeight;

    const offset = button && button.style.position === "fixed" ? 5 : (button?.offsetHeight || 0) * 4;

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - offset;

    if (button) {
      button.classList.toggle("downToNormal-animation-1", !isAtBottom);
      button.style.position = isAtBottom ? "" : "fixed";
    }
  };

  const goBack = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    window.history.back();
  };

  const validateForm = () => {
    if (itemName.trim() === "") {
      showErrorAlert(t("manage-item-review.error-message.empty-title"));
      return false;
    }

    if (parentCategory == null || parentCategory.id === 0) {
      showErrorAlert(t("manage-item-review.error-message.empty-category"));
      return false;
    }

    return true;
  }

  const showErrorAlert = (message: string) => {
    setErrorMessage(message);
    setErrorAlert(true);
  }

  const  handleSaveButtonClick = async () => {
    const item: Item = {
      id: 0,
      name: itemName,
      image: null,
      category_id: getSelectedCategory()?.id || 0,
    }

    const review: Review = {
      id: 0,
      item_id: item.id,
      rating: rating,
      comment: "",
    }
    
    const isValid = validateForm();
    
    if (!isValid) return;

    setIsButtonDisabled(true);
    setSaveButtonText(t("manage-item-review.saving-review"));

    if (!selectedOption) {
      await insertItem(item).then((itemId) => {
        if (!itemId){
          showErrorAlert(t("manage-item-review.error-message.error-creating-item"));
          return;
        }

        item.id = itemId;
        review.item_id = itemId;
        setIsButtonDisabled(true);
      });
    }else {
      item.id = selectedOption.id;
      review.item_id = selectedOption.id;

      await updateItem(item).then((success) => {
        if (!success) {
          showErrorAlert(t("manage-item-review.error-message.error-updating-item"));
          return;
        }
        setIsButtonDisabled(true);
      });
    }

    await insertReview(review).then((success) => {
      if (!success) {
        showErrorAlert(t("manage-item-review.error-message.error-creating-review"));
        return;
      }

      review.id = 0;
    });

    for (const categoryRating of categoryRatings) {
      const categoryRatingValue: CategoryRatingValue = {
        id: 0,
        review_id: review.id,
        category_rating_id: categoryRating.id,
        value: categoryRating.value,
      };

      await insertCategoryRatingValue(categoryRatingValue).then((success) => {
        if (!success) {
          showErrorAlert(t("manage-item-review.error-message.error-inserting-category-ratings"));
          return;
        }
      });
    }

    for (const photo of photos) {
      const reviewImage: ReviewImage = {
        review_id: review.id,
        image: photo.webviewPath!,
      }

      await insertReviewImage(reviewImage).then((success) => {
        if (!success) {
          showErrorAlert(t("manage-item-review.error-message.error-inserting-review-images"));
          return;
        }
      });
    }

    setSaveButtonText(t("manage-item-review.saving-review-success"));
    setIsButtonDisabled(false);

    setTimeout(() => {
      setSaveButtonText(t("manage-item-review.create-review"));
      history.push("/app/reviews", { toast: '¡Recurso creado con éxito!' });
      history.replace("/app/reviews", { toast: '¡Recurso creado con éxito!' });
    }, 2000);
  };

  return (
    <IonPage>
      <IonContent scrollEvents={true} onIonScroll={handleParentScroll} ref={contentRef}>
        <IonGrid>
          <IonRow onClick={() => parentCategory && parentCategory.id != 0 && modal.current?.present()}
            id="category-banner"
            className="safe-area-top relative w-full px-5 py-2 grid grid-rows-[1fr_auto] gap-2"
            style={{ backgroundColor: parentCategory? CategoryColors[parentCategory.color]: '' }}
          >
            <div className="flex absolute safe-area-top top-0 p-3" onClick={goBack}>
              <IonBackButton defaultHref="/app/reviews" color="tertiary" />
            </div>
            <div className="flex items-center justify-center pb-3 pt-5">
              {parentCategory?.icon && (<FontAwesomeIcon
                icon={parentCategory?.icon as IconName}
                className="text-5xl text-white mt-5"
              />)}
            </div>

            <IonLabel className="truncate max-w-[95%]">
              {parentCategory?.name}
            </IonLabel>

            <SubcategoriesBadgeSelector subcategories={childrenCategories} selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory} />
          </IonRow>

          <IonRow className="px-5 pb-10">
            <IonGrid>
              <IonRow className="pt-6 pb-6 gap-5 w-full">
                {/* <IonInput fill="solid" id="item-name" placeholder="Nombre del elemento..." /> */}
                {/* <IonButton color="tertiary" className="secondary" id="item-button-exists">¿Existe?</IonButton> */}

                <ItemSelector selectedOption={selectedOption} setSelectedOption={setSelectedOption} itemName={itemName} setItemName={setItemName} />

                {selectedOption != null && (
                  <div className="text-sm font-medium px-4 pt-2 rounded flex items-center gap-2">
                    <InfoIcon className="w-4 h-4" />
                    {t("manage-item-review.used-item-exists")}
                  </div>
                )}
              </IonRow>

              <IonRow className="flex flex-col py-6 gap-2">
                <IonLabel className="section-title">{t("common.review")}</IonLabel>
                <StarRating
                  size={65}
                  rating={rating}
                  setRating={setRating}
                  classes="w-full justify-center gap-2"
                />

                <div className="px-5 pt-6 flex flex-col gap-8 w-full" hidden={categoryRatings.length === 0}>
                  {categoryRatings.map((categoryRating) => (
                    <CategoryRatingRange
                      key={categoryRating.id}
                      categoryRating={categoryRating}
                      setCategoryRatings={setCategoryRatings} />
                  ))}

                </div>
              </IonRow>

              <IonRow className="flex py-6 flex-col gap-2">
                <IonLabel className="section-title">{t("common.comment")}</IonLabel>
                <IonTextarea
                  autoGrow={true}
                  fill="solid"
                  placeholder={t("manage-item-review.comment-input-placeholder")}
                  className="w-full"
                />
              </IonRow>

              <IonRow className="flex py-6 flex-col gap-2 ">
                <IonLabel className="section-title">{t("common.images")}</IonLabel>

                <div className={`gap-x-3 gap-y-6 w-full grid grid-cols-[repeat(auto-fit,minmax(100px,max-content))] items-center`}>
                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={takePhoto}>
                    <Camera size={40} />
                  </div>

                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={importPhoto}>
                    <Images size={40} />
                  </div>

                  {photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.webviewPath}
                      alt={`Image ${index + 1}`}
                      className="size-25 rounded-lg object-cover"
                      onClick={() => handlePreviewOpen(photo.webviewPath!)} // Open preview on click
                    />
                  ))}
                </div>
              </IonRow>

              <IonButton className={`z-[1000] bottom-0 right-0 right-0 mt-10 mb-5 ml-5 mr-5`}
              id="save-review" color="tertiary" expand="full" disabled={isButtonDisabled} onClick={handleSaveButtonClick}>
                {saveButtonText}
              </IonButton>
            </IonGrid>

          </IonRow>
        </IonGrid>
      </IonContent>

      <CategorySelectorModal modal={modal} selectedCategory={parentCategory} setSelectedCategory={setParentCategory} />
      <PreviewPhotoModal
        photoUrl={previewPhoto!}
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
      />
      <ErrorAlert
        title={t("common.error")}
        message={errorMessage}
        isOpen={errorAlert}
        setIsOpen={() => {}}
        buttons={[t("common.ok")]}
        onDidDismiss={() => setIsButtonDisabled(false)}
      />
    </IonPage>
  );
};

export default ManageItemReview;