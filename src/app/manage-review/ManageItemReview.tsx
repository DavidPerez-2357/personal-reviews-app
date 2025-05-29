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
import "./styles/ManageItemReview.css";
import { usePhotoGallery } from "@hooks/usePhotoGallery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getItemById, insertItem, updateItem, updateItemWithCategory } from "@services/item-service";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { deleteRatingValuesFromReview, getCategoryById, getCategoryRatingMixByReviewId, getCategoryRatingsByCategoryId, getChildrenCategories, getParentCategories, getParentCategory, insertCategoryRatingValue } from "@services/category-service";
import CategorySelectorModal from "@components/CategorySelectorModal";
import PreviewPhotoModal from "@components/PreviewPhotoModal";
import SubcategoriesBadgeSelector from "./components/SubcategoriesBadgeSelector";
import { CategoryColors } from "@shared/enums/colors";
import { useTranslation } from "react-i18next";
import { deleteReview, deleteReviewImages, getReviewById, getReviewImagesbyId, insertReview, insertReviewImage, updateReview } from "@shared/services/review-service";
import { useHistory, useLocation, useParams } from "react-router-dom";
import ItemSelector from "./components/ItemSelector";
import CategoryRatingRange from "./components/CategoryRatingRange";
import ErrorAlert from "@/shared/components/ErrorAlert";
import { UserPhoto } from "@/shared/dto/Photo";
import { Category, CategoryRating, CategoryRatingMix, CategoryRatingValue } from "@dto/Category";
import { Item, ItemOption, ItemWithCategory } from "@dto/Item";
import { Review, ReviewImage } from "@dto/Review";
import { init } from "i18next";
import { Capacitor } from '@capacitor/core';

const ManageItemReview = () => {
  const { savedPhotos, setSavedPhotos, takePhoto, importPhoto, savePhoto, deletePhoto } = usePhotoGallery();
  let { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();
  const itemId = location.state?.itemId; 

  console.log("itemId", itemId);
  // Variable de no encontrar categorias
  const notFoundAnyCategories: Category = {
    id: 0,
    name: t('common.no-categories-found'),
    type: 1,
    color: "darkgray",
    icon: "circle-exclamation",
    parent_id: null,
  };

  // Referencias
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Variables para manejar el modal
  const modal = useRef<HTMLIonModalElement>(null);

  // Variables del boton de guardar reseña
  const [saveButtonText, setSaveButtonText] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Variables del boton de eliminar reseña
  const [deleteButtonText, setDeleteButtonText] = useState(t('manage-item-review.delete-review'));

  // Variables de previsualizacion de fotos
  const [previewPhoto, setPreviewPhoto] = useState<UserPhoto | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setPreviewPhoto(null);
  };
  const handlePreviewOpen = (photo: UserPhoto) => {
    setPreviewPhoto(photo);
    setIsPreviewOpen(true);
  };

  // Alerts
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // Variables del fomulario
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const editMode = Boolean(id);
  const [parentCategory, setParentCategory] = useState<Category>(notFoundAnyCategories);
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [itemName, setItemName] = useState("");
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatingMix[]>([]);
  const [selectedOption, setSelectedOption] = useState<ItemOption | null>(null);
  const [comment, setComment] = useState("");
  const [reviewDeleted, setReviewDeleted] = useState(false); // Variable para saber si la reseña ha sido eliminada

  // Variables para edicion
  const [reviewHasPhotos, setReviewHasPhotos] = useState(false); // Variable para saber si la reseña tiene fotos cuando se edita

  // Variables de categorias
  const [categories, setCategories] = useState<Category[]>([]);

  const getSelectedCategory = () => {
    if (selectedSubcategory) {
      return selectedSubcategory;
    } else if (parentCategory) {
      return parentCategory;
    }
    return null;
  }

  const convertToCategoryRatingMix = (categoryRatings: CategoryRating[]): CategoryRatingMix[] => {
    return categoryRatings.map((categoryRating) => ({
      id: categoryRating.id,
      name: categoryRating.name,
      category_id: categoryRating.category_id,
      value: 0, // Valor inicial
    }));
  }

  const setEditData = async (reviewId: number) => {
    try {
        const review: Review | null = await getReviewById(reviewId);
        if (!review) throw new Error(t('manage-item-review.error-message.review-not-found'));

        const item: Item | null = await getItemById(review.item_id);
        if (!item) throw new Error(t('manage-item-review.error-message.item-not-found'));

        const category: Category | null = await getCategoryById(item.category_id);
        if (!category) throw new Error(t('manage-item-review.error-message.category-not-found'));

        const parentCategory: Category = category.parent_id ? await getParentCategory(category.parent_id) || notFoundAnyCategories : category;

        const categoryRatingsFound: CategoryRatingMix[] = await getCategoryRatingMixByReviewId(reviewId);
        const reviewImages: ReviewImage[] = await getReviewImagesbyId(reviewId);

        setIsInitialLoad(true);

        // Configurar los datos en el estado
        setItemName(item.name);
        setRating(review.rating);
        setComment(review.comment || "");
        setSelectedOption({
            id: item.id,
            name: item.name,
            category_id: item.category_id,
            parent_category_id: parentCategory.id,
            parent_category_icon: parentCategory?.icon || '',
        });

        const photosConverted: UserPhoto[] = reviewImages.map((image) => ({
            filepath: image.image,
            webviewPath: Capacitor.convertFileSrc(image.image),
        }));
        setSavedPhotos(photosConverted);
        setReviewHasPhotos(photosConverted.length > 0);

        setCategoryRatings(categoryRatingsFound);

        // Manejar categorías padre e hija
        if (category.parent_id) {
            setParentCategory(parentCategory);
            setSelectedSubcategory(category);
        } else {
            setParentCategory(category);
            setSelectedSubcategory(null);
        }

        // Cargar las subcategorías de la categoría padre
        if (parentCategory) {
            const children = await getChildrenCategories(parentCategory.id);
            setChildrenCategories(children);
        }
    } catch (error) {
        console.error(error);
        throw error; // Permitir que el efecto maneje el error
    }
  };

  useEffect(() => {
    // Resetear el estado antes de cargar una nueva reseña
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-item-review.create-review'));
    setIsButtonDisabled(false);
    setItemName("");
    setRating(0);
    setComment("");
    setSavedPhotos([]);
    setSelectedOption(null);
    setParentCategory(notFoundAnyCategories);
    setSelectedSubcategory(null);
    setCategoryRatings([]);
    setChildrenCategories([]);

    console.log("🔍 Cargando reseña con ID:", id);
    if (reviewDeleted) {
      console.log("🔍 Reseña eliminada, redirigiendo a la lista de reseñas...");
        return;
    }

    if (editMode) {
        const reviewId = parseInt(id);
        setEditData(reviewId)
            .then(() => setIsInitialLoad(false))
            .catch((error) => {
                console.error(error);
                setIsInitialLoad(false);
                history.push("/app/reviews", { toast: t('manage-item-review.error-message.review-not-found') });
            });
    } else {
        setIsInitialLoad(false);
    }
  }, [location.key]);

  useEffect(() => {
    getParentCategories()
        .then((data) => {
            console.log("🔍 Categorías cargadas:", data);
            setCategories(data);

            if (data.length === 0) {
                setParentCategory(notFoundAnyCategories);
            } else if (parentCategory === null || parentCategory.id === 0 || !editMode) {
                setParentCategory(data[0]);
            }
        })
        .catch((error) => {
            console.error("❌ Error al cargar categorías:", error);
            setCategories([]);
            setParentCategory(notFoundAnyCategories);
        });
  }, []);

  useEffect(() => {
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-item-review.create-review'));
  }, [editMode]);

  // Funcion que se ejecuta cada vez que cambia la opción seleccionada
  useEffect(() => {
    if (isInitialLoad) return; // No se ha cambiado el formulario por el usuario, no se actualizan los ratings
    if (!selectedOption) return;

    console.log("🔍 Opción seleccionada:", selectedOption.id);
    
    getParentCategory(selectedOption.category_id).then((category) => {
      // Solo actualiza el estado si la categoría realmente cambió
      setParentCategory((prevCategory) => {
        if (prevCategory?.id !== category?.id && category) {
          return category;
        }
        return prevCategory || notFoundAnyCategories;
      });

      if (!category) {
        setChildrenCategories([]);
        return;
      }
    });
    
  }, [selectedOption]);

  useEffect(() => {
    if (!parentCategory) return;

    getChildrenCategories(parentCategory.id).then((categories) => {
        setChildrenCategories(categories);

        // Mantener la subcategoría seleccionada si ya está configurada
        if (selectedSubcategory && categories.some((cat) => cat.id === selectedSubcategory.id)) {
            return;
        }

        // Si no hay subcategoría seleccionada o no coincide, resetear
        setSelectedSubcategory(null);
    });
  }, [parentCategory]);

  useEffect(() => {
    const selectedCategory = getSelectedCategory();
    if (!selectedCategory) return;

    // Evitar sobrescribir los ratings si estás en modo edición y ya se cargaron
    if (editMode && isInitialLoad) return;

    // Obtener los ratings de la categoría seleccionada
    getCategoryRatingsByCategoryId(selectedCategory.id).then((ratings) => {
        setCategoryRatings(convertToCategoryRatingMix(ratings));
    }).catch((error) => {
        console.error("❌ Error al obtener los ratings de la categoría seleccionada:", error);
        setCategoryRatings([]);
    });
  }, [parentCategory, selectedSubcategory]);

  const handleTakePhoto = async () => {
    const newPhoto = await takePhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
  }

  const handleGetPhotoFromGallery = async () => {
    const newPhoto = await importPhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
  }

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
    setShowErrorAlert(true);

    setIsButtonDisabled(false);
    setSaveButtonText(t('manage-item-review.create-review'));
    setDeleteButtonText(t('manage-item-review.delete-review'));
  }

  /** Guarda un nuevo ítem o actualiza uno existente */
  const saveOrUpdateItem = async (item: Item): Promise<number | null> => {
    try {
        if (!selectedOption) {
            const itemId = await insertItem(item);
            if (!itemId) throw new Error(t('manage-item-review.error-message.error-creating-item'));
            return itemId;
        } else {
            const minItem: ItemWithCategory = {
                id: selectedOption.id,
                name: item.name,
                category_id: getSelectedCategory()?.id || 0,
            };

            const success = await updateItemWithCategory(minItem);
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
            if (!success) {
                console.error("❌ Error al eliminar los valores de puntuación existentes.");
                throw new Error(t('manage-item-review.error-message.error-saving-review-ratings'));
            }
        }

        for (const rating of categoryRatings) {
            if (rating.value < 0 || rating.value > 10) {
                throw new Error(t('manage-item-review.error-message.invalid-rating-value'));
            }

            const categoryRatingValue: CategoryRatingValue = {
                id: 0,
                review_id: reviewId,
                category_rating_id: rating.id,
                value: rating.value,
            };
            const success = await insertCategoryRatingValue(categoryRatingValue);
            if (!success) throw new Error(t('manage-item-review.error-message.error-saving-review-ratings'));
        }

        return true;
    } catch (error) {
        showError((error as Error).message);
        return false;
    }
  };

  /** Guarda las imágenes asociadas a la review */
  const saveReviewImages = async (reviewId: number) => {
    try {      
        if (editMode && reviewHasPhotos) {
            console.log("🔍 Editando reseña, eliminando imágenes existentes...");
            const success = await deleteReviewImages(reviewId);
            if (!success) throw new Error(t('manage-item-review.error-message.error-saving-review-images'));
        }

        if (savedPhotos.length === 0) return true; // No hay fotos para guardar

        for (const photo of savedPhotos) {
            console.log("🔍 Revisando foto:", photo);

            const reviewImage: ReviewImage = {
                review_id: reviewId,
                image: photo.filepath!,
            };

            const success = await insertReviewImage(reviewImage);
            if (!success) throw new Error(t('manage-item-review.error-message.error-saving-review-images'));
        }

        return true;
    } catch (error) {
        console.error("❌ Error al guardar las imágenes:", error);
        showError((error as Error).message);
        return false;
    }
  };

  /** Acción al hacer clic en Guardar */
  const handleSaveReview = async () => {
    if (!validateForm()) return;

    setIsButtonDisabled(true);
    setSaveButtonText(t('manage-item-review.saving-review'));

    try {
        const item: Item = {
            id: 0,
            name: itemName,
            image: null,
            category_id: getSelectedCategory()?.id || 0,
        };

        const itemId = await saveOrUpdateItem(item);

        if (!itemId) {
            throw new Error(t('manage-item-review.error-message.error-saving-item'));
        }

        const now = new Date().toISOString();
        const review: Review = {
            id: 0,
            item_id: itemId,
            rating,
            comment,
            created_at: now,
            updated_at: now,
        };
        
        const reviewId = await saveOrUpdateReview(review);

        if (!reviewId) {
            throw new Error(t('manage-item-review.error-message.error-saving-review'));
        }

        await saveCategoryRatings(reviewId);

        await saveReviewImages(reviewId);

        // Si todo se guarda correctamente
        setSaveButtonText(t('manage-item-review.saving-review-success'));
        setTimeout(() => {
            history.push('/app/reviews', { toast: t('manage-item-review.saving-review-success') });
        }, 500);
    } catch (error) {
        showError((error as Error).message);
        setSaveButtonText(editMode ? t('common.save-changes') : t('manage-item-review.create-review'));
        setIsButtonDisabled(false);
    }
  };

  const handleDeletePhoto = async (photo: UserPhoto) => {
    handlePreviewClose();

    try {
      await deletePhoto(photo);
      console.log("✅ Foto eliminada correctamente del sistema de archivos.");
    } catch (error) {
      console.error("❌ Error al eliminar la foto:", error);
    }

    // Actualiza el estado después de eliminar la foto
    setSavedPhotos((prevPhotos) => {
      const updatedPhotos = prevPhotos.filter((p) => p.filepath !== photo.filepath);
      console.log("🔍 Fotos guardadas después de eliminar:", updatedPhotos.length);
      return updatedPhotos;
    });
  }

  const handleReplacePhoto = async (photo: UserPhoto) => {
    try {
      await deletePhoto(photo); // Delete the photo from the filesystem
    } catch (error) {
      console.error("❌ Error al eliminar la foto:", error);
    }
    
    handlePreviewClose();
    const newPhoto = await takePhoto(); // Save the new photo to the filesystem
    // Delete the old photo from the filesystem
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto); // Save the new photo to the filesystem
    if (!savedPhoto) return;
    setSavedPhotos(savedPhotos.map((p) => (p.filepath === photo.filepath ? savedPhoto : p)));
  }

  const handleDeleteReview = async () => {
    if (!editMode) return;
    setIsButtonDisabled(true);
    setDeleteButtonText(t('manage-item-review.deleting-review'));

    const reviewId = parseInt(id);
    setDeleteButtonText(t('manage-item-review.deleting-review'));
    const success = await deleteReview(reviewId);
    setReviewDeleted(true); // Set the review as deleted
    console.log("🔍 Reseña eliminada:", reviewDeleted);
    if (!success) {
      setIsButtonDisabled(false);
      setDeleteButtonText(t('manage-item-review.delete-review'));
      showError(t('manage-item-review.error-message.error-deleting-review'));
      return;
    }

    // Delete review images from filesystem
    try {
       for (const photo of savedPhotos) {
        await deletePhoto(photo); // Delete the photo from the filesystem
      }
    } catch (error) {
      console.error("❌ Error al eliminar las imágenes de la reseña:", error);
      // TODO: Recuperar la reseña si no se eliminan las imágenes
    }

    setDeleteButtonText(t('manage-item-review.delete-review-success'));
    setTimeout(() => {
      history.push('/app/reviews', { toast: t('manage-item-review.delete-review-success') });
    }, 500);
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
                <ItemSelector selectedOption={selectedOption} setSelectedOption={setSelectedOption} itemName={itemName} setItemName={setItemName} isInitialLoad={isInitialLoad} />

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
                  onIonInput={(e => setComment(e.detail.value!))}
                />
              </IonRow>

              <IonRow className="flex py-6 flex-col gap-2 ">
                <IonLabel className="section-title">{t("common.images")}</IonLabel>

                <div className={`gap-x-3 gap-y-6 w-full grid grid-cols-[repeat(auto-fit,minmax(100px,max-content))] items-center`}>
                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={async () => {handleTakePhoto();}}>
                    <Camera size={40} />
                  </div>

                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={async () => {handleGetPhotoFromGallery();}}>
                    <Images size={40} />
                  </div>

                  {savedPhotos.map((photo, index) => (
                    <img
                      key={index}
                      src={Capacitor.convertFileSrc(photo.filepath!)}
                      alt={`Image ${index + 1}`}
                      className="size-25 rounded-lg object-cover"
                      onClick={() => handlePreviewOpen(photo)} // Open preview on click
                    />
                  ))}
                </div>
              </IonRow>

              <IonButton className={`z-[1000] bottom-0 right-0 right-0 mt-10 mb-5 ml-5 mr-5`}
              id="save-review" color="tertiary" expand="full" disabled={isButtonDisabled} onClick={handleSaveReview}>
                {saveButtonText}
              </IonButton>

              {editMode && (
                <IonButton
                id="delete-review" color="danger" expand="full" className=" ml-5 mr-5" onClick={() => setIsDeleteAlertOpen(true)}>
                  {deleteButtonText}
                </IonButton>
              )}
            </IonGrid>

          </IonRow>
        </IonGrid>
      </IonContent>

      <CategorySelectorModal modal={modal} selectedCategory={parentCategory} setSelectedCategory={setParentCategory} categories={categories} />
      <PreviewPhotoModal
        photoUrl={previewPhoto?.filepath!}
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
        showActions={true}
        onReplace={() => handleReplacePhoto(previewPhoto!)} // Pass the photo to replace
        onDelete={() => handleDeletePhoto(previewPhoto!)} // Pass the photo to delete
      />
      <ErrorAlert
        title={t("common.error")}
        message={errorMessage}
        isOpen={showErrorAlert}
        setIsOpen={setShowErrorAlert}
        buttons={[t("common.ok")]}
        onDidDismiss={() => setIsButtonDisabled(false)}
      />

      <IonAlert
        isOpen={isDeleteAlertOpen}
        onDidDismiss={() => setIsDeleteAlertOpen(false)}
        header={t("common.delete")}
        message={t("manage-item-review.delete-review-confirm")}
        buttons={[
          {
            text: t("common.cancel"),
            role: "cancel",
            cssClass: "secondary",
            handler: () => {
              setShowErrorAlert(false);
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