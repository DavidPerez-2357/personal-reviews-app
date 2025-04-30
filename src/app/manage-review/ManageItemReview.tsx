import { Camera, Images, InfoIcon } from "lucide-react";
import {
  IonAlert,
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
import { getItemById, insertItem, updateItem } from "@services/item-service";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { deleteRatingValuesFromReview, getCategoryById, getCategoryRatingsByCategoryId, getCategoryRatingValues, getCategoryRatingValuesByReviewId, getChildrenCategories, getParentCategory, insertCategoryRatingValue } from "@services/category-service";
import { Category } from "@dto/category/Category";
import CategorySelectorModal from "@components/CategorySelectorModal";
import { CategoryRating, CategoryRatingMix } from "@dto/category/CategoryRating";
import PreviewPhotoModal from "@components/PreviewPhotoModal";
import SubcategoriesBadgeSelector from "@/app/manage-review/components/SubcategoriesBadgeSelector";
import { CategoryColors } from "@shared/enums/colors";
import { useTranslation } from "react-i18next";
import { Review } from "@dto/review/Review";
import { deleteReview, deleteReviewImages, getReviewById, getReviewImages, getReviewImagesbyId, getReviews, insertReview, insertReviewImage, updateReview } from "@shared/services/review-service";
import { CategoryRatingValue } from "@shared/dto/category/CategoryRatingValue";
import { useHistory, useParams } from "react-router-dom";
import ItemSelector from "./components/ItemSelector";
import CategoryRatingRange from "./components/CategoryRatingRange";
import ErrorAlert from "@/shared/components/ErrorAlert";
import { ReviewImage } from "@/shared/dto/review/ReviewImage";
import { UserPhoto } from "@/shared/dto/Photo";


const ManageItemReview = () => {
  const { photos, savedPhotos, setPhotos, setSavedPhotos, takePhoto, importPhoto, savePhoto, deletePhoto } = usePhotoGallery();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { t } = useTranslation();

  // Referencias
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Variables para manejar el modal
  const modal = useRef<HTMLIonModalElement>(null);

  // Variables del boton de guardar reseña
  const [saveButtonText, setSaveButtonText] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Variables de previsualizacion de fotos
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setPreviewPhoto(null);
  };
  const handlePreviewOpen = (photo: string) => {
    setPreviewPhoto(photo);
    setIsPreviewOpen(true);
  };

  // Alerts
  const [errorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // Variables del fomulario
  const editMode = id !== undefined;
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [itemName, setItemName] = useState("");
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatingMix[]>([]);
  const [selectedOption, setSelectedOption] = useState<ItemOption | null>(null);
  const [comment, setComment] = useState("");

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

  const setEditData = async (reviewId: number) => {
    const review: Review | null = await getReviewById(reviewId);
    if (!review) throw new Error(t('manage-item-review.error-message.review-not-found'));

    const item: Item | null = await getItemById(review.item_id);
    if (!item) throw new Error(t('manage-item-review.error-message.item-not-found'));

    const category: Category | null = await getCategoryById(item.category_id);
    if (!category) throw new Error(t('manage-item-review.error-message.category-not-found'));

    const parentCategory: Category | null = await getParentCategory(item.category_id);
    if (!parentCategory) throw new Error(t('manage-item-review.error-message.category-not-found'));

    const categoryRatingsFound: CategoryRatingValue[] = await getCategoryRatingValuesByReviewId(reviewId);
    if (!categoryRatings) throw new Error(t('manage-item-review.error-message.category-ratings-not-found'));

    const reviewImages: ReviewImage[] = await getReviewImagesbyId(reviewId);
    if (!reviewImages) throw new Error(t('manage-item-review.error-message.review-images-not-found'));

    setItemName(item.name);
    setRating(review.rating);
    setComment(review.comment || "");
    setParentCategory(parentCategory);
    setSelectedOption({ id: item.id, name: item.name, category_id: item.category_id, parent_category_id: parentCategory.id, parent_category_icon: parentCategory.icon });
    
    const photosConverted: UserPhoto[] = reviewImages.map((image) => ({
      filepath: image.image,
      webviewPath: image.image,
    }));
    setPhotos(photosConverted);
    setSavedPhotos(photosConverted);

    // Mix the category ratings with the review ratings
    const categoryRatingsConverted: CategoryRatingMix[] = categoryRatingsFound.map((categoryRatingValue) => {
      const categoryRating = categoryRatings.find((rating) => rating.id === categoryRatingValue.category_rating_id);
      return {
        id: categoryRating?.id || 0,
        name: categoryRating?.name || "",
        value: categoryRatingValue.value,
      };
    });
    
    setCategoryRatings(categoryRatingsConverted);

    if (category.parent_id) {
      setSelectedSubcategory(category);
    }
  }

  useEffect(() => {
      if (editMode) {
        setSaveButtonText(t('common.save-changes'));
        const reviewId = parseInt(id);
        
        setEditData(reviewId).catch((error) => {
          history.push("/app/reviews", { toast: t('manage-item-review.error-message.review-not-found') });
        });
      }else {
        setSaveButtonText(t('manage-item-review.create-review'));
        setSelectedOption(null);
        setItemName("");
        setRating(0);
        setComment("");
        setPhotos([]);
        setSavedPhotos([]);
        setSelectedSubcategory(null);
        setParentCategory(null);
      }
  }, [id, editMode]);

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
      showError(t("manage-item-review.error-message.empty-title"));
      return false;
    }

    if (parentCategory == null || parentCategory.id === 0) {
      showError(t("manage-item-review.error-message.empty-category"));
      return false;
    }

    return true;
  }

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorAlert(true);
  }

  /** Guarda un nuevo ítem o actualiza uno existente */
  const saveOrUpdateItem = async (item: Item): Promise<number | null> => {
    try {
      if (!selectedOption) {
        const itemId = await insertItem(item);
        if (!itemId) throw new Error(t('manage-item-review.error-message.error-creating-item'));
        return itemId;
      } else {
        const success = await updateItem(item);
        if (!success) throw new Error(t('manage-item-review.error-message.error-updating-item'));
        return selectedOption.id;
      }
    } catch (error) {
      showError((error as Error).message);
      return null;
    }
  };

  /** Guarda o actualiza la review */
  const saveOrUpdateReview = async (review: Review): Promise<number | null> => {
    try {
      if (editMode) {
        review.id = parseInt(id);
        const success = await updateReview(review);
        if (!success) throw new Error(t('manage-item-review.error-message.error-updating-review'));
        return review.id;
      } else {
        const reviewId = await insertReview(review);
        if (!reviewId) throw new Error(t('manage-item-review.error-message.error-creating-review'));
        return reviewId;
      }
    } catch (error) {
      showError((error as Error).message);
      return null;
    }
  };

  /** Guarda los ratings de las categorías asociadas */
  const saveCategoryRatings = async (reviewId: number) => {
    if (categoryRatings.length === 0) return; // No hay ratings para guardar

    try {
      if (editMode) {
        const success = await deleteRatingValuesFromReview(reviewId);
        if (!success) throw new Error(t('manage-item-review.error-message.error-saving-review-ratings'));
      }

      for (const rating of categoryRatings) {
        const categoryRatingValue: CategoryRatingValue = {
          id: 0,
          review_id: reviewId,
          category_rating_id: rating.id,
          value: rating.value,
        };
        const success = await insertCategoryRatingValue(categoryRatingValue);
        if (!success) throw new Error(t('manage-item-review.error-message.error-saving-review-ratings'));
      }
    } catch (error) {
      showError((error as Error).message);
    }
  };

  /** Guarda las imágenes asociadas a la review */
  const saveReviewImages = async (reviewId: number) => {
    if (photos.length === 0) return; // No hay fotos para guardar

    try {
      if (editMode) {
        const success = await deleteReviewImages(reviewId);
        if (!success) throw new Error(t('manage-item-review.error-message.error-saving-review-images'));
      }

      for (const photo of photos) {
        // Guardar la foto en el sistema de archivos
        if (savedPhotos.find((p) => p.filepath === photo.filepath)) continue; // Si la foto ya está guardada, no la guardamos de nuevo

        const savedPhoto = await savePhoto(photo);
        if (!savedPhoto) throw new Error(t('manage-item-review.error-message.error-saving-review-images'));
      }

      for (const photo of savedPhotos) {
        // Si la foto no esta en photos, la eliminamos
        if (!photos.find((p) => p.filepath === photo.filepath)) {
          await deletePhoto(photo); // Eliminar la foto del sistema de archivos
          continue;
        }

        const reviewImage: ReviewImage = {
          review_id: reviewId,
          image: photo.webviewPath!,
        };
        const success = await insertReviewImage(reviewImage);
        if (!success) throw new Error(t('manage-item-review.error-message.error-saving-review-images'));
      }
    } catch (error) {
      showError((error as Error).message);
    }
  };


  /** Acción al hacer clic en Guardar */
  const handleSaveReview = async () => {
    if (!validateForm()) return;

    setIsButtonDisabled(true);
    setSaveButtonText(t('manage-item-review.saving-review'));

    const item: Item = {
      id: 0,
      name: itemName,
      image: null,
      category_id: getSelectedCategory()?.id || 0,
    };

    const itemId = await saveOrUpdateItem(item);
    if (!itemId) {
      setIsButtonDisabled(false);
      return;
    }

    const review: Review = {
      id: 0,
      item_id: itemId,
      rating,
      comment,
    };

    const reviewId = await saveOrUpdateReview(review);
    if (!reviewId) {
      setIsButtonDisabled(false);
      return;
    }

    await saveCategoryRatings(reviewId);
    await saveReviewImages(reviewId);

    setSaveButtonText(t('manage-item-review.saving-review-success'));
    setIsButtonDisabled(false);

    setTimeout(() => {
      history.push('/app/reviews', { toast: t('manage-item-review.saving-review-success') });
    }, 1000);
  };

  const handleDeletePhoto = async (photo: UserPhoto) => {
    handlePreviewClose();
    setPhotos(photos.filter((p) => p.filepath !== photo.filepath));
  }

  const handleReplacePhoto = async (photo: UserPhoto) => {
    handlePreviewClose();
    const newPhoto = await takePhoto(); // Save the new photo to the filesystem
    if (!newPhoto) return;
    setPhotos(photos.map((p) => (p.filepath === photo.filepath ? newPhoto : p)));
  }

  const handleDeleteReview = async () => {
    if (!editMode) return;
    setIsButtonDisabled(true);
    setSaveButtonText(t('manage-item-review.deleting-review'));

    const reviewId = parseInt(id);
    const success = await deleteReview(reviewId);
    if (!success) {
      setIsButtonDisabled(false);
      setSaveButtonText(t('manage-item-review.delete-review'));
      showError(t('manage-item-review.error-message.error-deleting-review'));
      return;
    }

    // Delete review images from filesystem
    for (const photo of savedPhotos) {
      await deletePhoto(photo); // Delete the photo from the filesystem
    }

    setSaveButtonText(t('manage-item-review.deleting-review-success'));
    setTimeout(() => {
      history.push('/app/reviews', { toast: t('manage-item-review.deleting-review-success') });
    }, 1000);
  }

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
            <div className="flex items-center justify-center pb-3 pt-5 min-h-5">
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
                  value={comment}
                  onIonChange={(e) => setComment(e.detail.value!)}
                />
              </IonRow>

              <IonRow className="flex py-6 flex-col gap-2 ">
                <IonLabel className="section-title">{t("common.images")}</IonLabel>

                <div className={`gap-x-3 gap-y-6 w-full grid grid-cols-[repeat(auto-fit,minmax(100px,max-content))] items-center`}>
                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={async () => {setPhotos(photos.concat(await takePhoto()));}}>
                    <Camera size={40} />
                  </div>

                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={async () => {setPhotos(photos.concat(await importPhoto()));}}>
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
              id="save-review" color="tertiary" expand="full" disabled={isButtonDisabled} onClick={handleSaveReview}>
                {saveButtonText}
              </IonButton>

              // Delte de la reseña
              {editMode && (
                <IonButton className={`z-[1000] bottom-0 right-0 right-0 mt-10 mb-5 ml-5 mr-5`}
                id="delete-review" color="danger" expand="full" onClick={() => setIsDeleteAlertOpen(true)}>
                  {t('manage-item-review.delete-review')}
                </IonButton>
              )}
            </IonGrid>

          </IonRow>
        </IonGrid>
      </IonContent>

      <CategorySelectorModal modal={modal} selectedCategory={parentCategory} setSelectedCategory={setParentCategory} />
      <PreviewPhotoModal
        photoUrl={previewPhoto!}
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
        showActions={true}
        onReplace={() => handleReplacePhoto(photos.find((p) => p.webviewPath === previewPhoto!)!)} // Pass the photo to replace
        onDelete={() => handleDeletePhoto(photos.find((p) => p.webviewPath === previewPhoto!)!)} // Pass the photo to delete
      />
      <ErrorAlert
        title={t("common.error")}
        message={errorMessage}
        isOpen={errorAlert}
        setIsOpen={() => {}}
        buttons={[t("common.ok")]}
        onDidDismiss={() => setIsButtonDisabled(false)}
      />

      // Alert de seguro de eliminar reseña
      <IonAlert
        isOpen={isDeleteAlertOpen}
        onDidDismiss={() => setIsDeleteAlertOpen(false)}
        header={t("common.delete")}
        message={t("manage-item-review.delete-review-confirmation")}
        buttons={[
          {
            text: t("common.cancel"),
            role: "cancel",
            cssClass: "secondary",
            handler: () => {
              setErrorAlert(false);
            },
          },
          {
            text: t("common.delete"),
            cssClass: "danger",
            handler: () => {
              handleDeleteReview();
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default ManageItemReview;