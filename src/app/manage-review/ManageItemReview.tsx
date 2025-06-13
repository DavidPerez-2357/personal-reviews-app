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
import { getItemById, insertItem, updateItemWithCategory } from "@services/item-service";
import { deleteRatingValuesFromReview, getCategoryById, getCategoryRatingMixByReviewId, getCategoryRatingsByCategoryId, getChildrenCategories, getFirstCategory, getParentCategories, getParentCategory, insertCategoryRatingValue } from "@services/category-service";
import PreviewPhotoModal from "@components/PreviewPhotoModal";
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
import { Capacitor } from '@capacitor/core';
import CategorySelectorHeader from "@/shared/components/CategorySelectorHeader";
import { useToast } from "../ToastContext";

const ManageItemReview = () => {
  const { savedPhotos, setSavedPhotos, takePhoto, importPhoto, savePhoto, deletePhoto } = usePhotoGallery();
  let { id } = useParams<{ id: string }>();
  let { itemId } = useParams<{ itemId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();
  const saveButtonRef = useRef<HTMLIonButtonElement>(null);
  const { showToast } = useToast();

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
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);

  // Variables del boton de eliminar reseña
  const [deleteButtonText, setDeleteButtonText] = useState(t('manage-item-review.delete-review'));
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(false);

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
  const [itemName, setItemName] = useState("");
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatingMix[]>([]);
  const [selectedOption, setSelectedOption] = useState<ItemOption | null>(null);
  const [comment, setComment] = useState("");
  const [reviewDeleted, setReviewDeleted] = useState(false); // Variable para saber si la reseña ha sido eliminada
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Variables para edicion
  const [reviewHasPhotos, setReviewHasPhotos] = useState(false); // Variable para saber si la reseña tiene fotos cuando se edita

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
      const categoryRatingsFound: CategoryRatingMix[] = await getCategoryRatingMixByReviewId(reviewId);
      const reviewImages: ReviewImage[] = await getReviewImagesbyId(reviewId);

      setIsInitialLoad(true);

      setRating(review.rating);
      setComment(review.comment || "");
      setSelectedOptionByItemId(review.item_id);
      setCategoryRatings(categoryRatingsFound);

      const photosConverted: UserPhoto[] = reviewImages.map((image) => ({
        filepath: image.image,
        webviewPath: Capacitor.convertFileSrc(image.image),
      }));
      setSavedPhotos(photosConverted);
      setReviewHasPhotos(photosConverted.length > 0);
    } catch (error) {
      console.error(error);
      throw error; // Permitir que el efecto maneje el error
    }
  };

  useEffect(() => {
    // Resetear el estado antes de cargar una nueva reseña
    resetButtonStates();
    setItemName("");
    setRating(0);
    setComment("");
    setSavedPhotos([]);
    setSelectedOption(null);
    setSelectedCategory(null);
    setCategoryRatings([]);

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
          history.push("/app/reviews");
          showToast(t('manage-item-review.error-message.review-not-found'));
        });
      return;
    }

    if (itemId) {
      // Si se está creando una reseña desde un ítem específico
      setSelectedOptionByItemId(parseInt(itemId));
      return;
    }

    getFirstCategory().then((category) => {
      if (!category) {
        console.error("❌ No se encontró ninguna categoría");
        setSelectedCategory(notFoundAnyCategories);
        return;
      }

      setSelectedCategoryById(category.id);
    }).catch((error) => {
      console.error("❌ Error al obtener la primera categoría:", error);
      setSelectedCategory(notFoundAnyCategories);
    });
    setIsInitialLoad(false);

  }, [location.pathname, id, editMode, reviewDeleted]);


  useEffect(() => {
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-item-review.create-review'));
  }, [editMode]);


  useEffect(() => {
    if (!selectedOption) return;

    // Si el ítem seleccionado ya tiene una categoría, usarla
    if (selectedOption.category_id && selectedOption.category_id !== 0) {
      setSelectedCategoryById(selectedOption.category_id);
      return;
    }

    // Si no hay categoría seleccionada, buscar la categoría del ítem
    setSelectedCategory(notFoundAnyCategories);
  }, [selectedOption]);


  useEffect(() => {
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
  }, [selectedCategory]);

  const handleTakePhoto = async () => {
    const newPhoto = await takePhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
  }

  const setSelectedOptionByItemId = async (itemId: number) => {
    try {
      const item = await getItemById(itemId);
      if (!item) {
        console.error("❌ Error: Item not found");
        return;
      }

      setSelectedOption({
        id: item.id,
        name: item.name,
        category_id: item.category_id,
        category_icon: '',
      });
      setItemName(item.name);
    } catch (error) {
      console.error("❌ Error al obtener el ítem:", error);
    }
  }

  const setSelectedCategoryById = async (categoryId: number) => {
    try {
      const category = await getCategoryById(categoryId);

      if (!category) {
        console.error("❌ Error: Category not found");
        return;
      }

      setSelectedCategory(category);
    } catch (error) {
      console.error("❌ Error al obtener la categoría:", error);
    }
  }

  const handleGetPhotoFromGallery = async () => {
    const newPhoto = await importPhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
  }

  const resetButtonStates = () => {
    setIsSaveButtonDisabled(false);
    setIsDeleteButtonDisabled(false);
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-item-review.create-review'));
    setDeleteButtonText(t('manage-item-review.delete-review'));
  }

  // Funciones para manejar el input y su desplegable
  /**
   * Maneja el evento de scroll del contenido principal.
   * Ajusta la posición y animación del botón de guardar ("save-review") dependiendo de si el usuario está cerca del fondo del contenido.
   * Si el usuario no está en la parte inferior, el botón se fija en la pantalla y se aplica una animación.
   * Si el usuario está en la parte inferior, el botón vuelve a su posición normal.
   *
   * @param event Evento de scroll personalizado de Ionic.
   */
  const handleParentScroll = async (event: CustomEvent) => {
    if (!contentRef.current) return;

    const scrollEl = await contentRef.current.getScrollElement();
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight;
    const clientHeight = scrollEl.clientHeight;

    const btnEl = saveButtonRef.current;
    if (!btnEl) return;

    // Calcular el porcentaje de scroll (0 = arriba, 1 = abajo)
    const scrollPercent = scrollTop / (scrollHeight - clientHeight);

    // Si el usuario ha hecho scroll al menos al 50%, ocultar el botón
    const shouldHide = scrollPercent >= 0.5;

    btnEl.classList.remove("downToNormal-animation-1");

    if (!shouldHide) {
      btnEl.classList.add("downToNormal-animation-1");
      btnEl.style.display = "block";
    }else {
      btnEl.style.display = "none";
    }
  };

  const validateForm = () => {
    if (itemName.trim() === "") {
      showError(t("manage-item-review.error-message.empty-title"));
      return false;
    }

    if (selectedCategory == null || selectedCategory.id === 0) {
      showError(t("manage-item-review.error-message.empty-category"));
      return false;
    }

    return true;
  }

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorAlert(true);

    setIsSaveButtonDisabled(false);
    setIsDeleteButtonDisabled(false);
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
          category_id: selectedCategory ? selectedCategory.id : 0,
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

        console.log("🔍 Guardando rating:", rating.id);

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

    setIsSaveButtonDisabled(true);
    setIsDeleteButtonDisabled(true);
    setSaveButtonText(t('manage-item-review.saving-review'));

    try {
      const item: Item = {
        id: 0,
        name: itemName,
        image: savedPhotos.length > 0 ? savedPhotos[0].filepath : '',
        category_id: selectedCategory ? selectedCategory.id : 0,
        is_origin: false,
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
        history.push('/app/reviews');
        showToast(t('manage-item-review.saving-review-success'));
      }, 500);
    } catch (error) {
      showError((error as Error).message);
      resetButtonStates();
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
    setIsSaveButtonDisabled(true);
    setIsDeleteButtonDisabled(true);
    setDeleteButtonText(t('manage-item-review.deleting-review'));

    const reviewId = parseInt(id);
    setDeleteButtonText(t('manage-item-review.deleting-review'));
    const success = await deleteReview(reviewId);
    setReviewDeleted(true); // Set the review as deleted
    console.log("🔍 Reseña eliminada:", reviewDeleted);
    if (!success) {
      resetButtonStates();
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
    }

    setDeleteButtonText(t('manage-item-review.delete-review-success'));
    setTimeout(() => {
      history.push('/app/reviews');
      showToast(t('manage-item-review.delete-review-success'));
    }, 500);
  }

  return (
    <IonPage>
      <IonContent scrollEvents={true} onIonScroll={handleParentScroll} ref={contentRef}>
        <IonGrid>

          <IonRow className="relative">
            <CategorySelectorHeader selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            <div className="flex absolute safe-area-top top-0 p-3">
              <IonBackButton defaultHref="/app/reviews" color="tertiary" />
            </div>
          </IonRow>


          <IonRow className="px-5 py-10">
            <IonGrid className="flex flex-col gap-12">
              <IonRow className="gap-2 w-full">
                <IonLabel className="section-title">{t("common.item")}</IonLabel>
                <ItemSelector selectedOption={selectedOption} setSelectedOption={setSelectedOption} itemName={itemName} setItemName={setItemName} isInitialLoad={isInitialLoad} />

                {selectedOption != null && (
                  <div className="text-sm font-medium px-4 pt-5 rounded flex items-center gap-2">
                    <InfoIcon className="w-4 h-4" />
                    {t("manage-item-review.used-item-exists")}
                  </div>
                )}
              </IonRow>

              <IonRow className="flex flex-col gap-2">
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

              <IonRow className="flex flex-col gap-2">
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

              <IonRow className="flex flex-col gap-2 ">
                <IonLabel className="section-title">{t("common.images")}</IonLabel>

                <div className={`gap-x-3 gap-y-6 w-full grid grid-cols-[repeat(auto-fit,minmax(100px,max-content))] items-center`}>
                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={async () => { handleTakePhoto(); }}>
                    <Camera size={40} />
                  </div>

                  <div className="w-25 h-25 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center" onClick={async () => { handleGetPhotoFromGallery(); }}>
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

              <div className="flex flex-col gap-4">
                <IonButton
                  className="z-[1000] bottom-0 right-0 mt-10 mb-5 ml-5 mr-5 fixed"
                  ref={saveButtonRef}
                  id="save-review"
                  color="tertiary"
                  expand="full"
                  disabled={isSaveButtonDisabled}
                  onClick={handleSaveReview}
                >
                  {saveButtonText}
                </IonButton>

                <IonButton
                  id="save-review"
                  color="tertiary"
                  expand="full"
                  disabled={isSaveButtonDisabled}
                  onClick={handleSaveReview}
                >
                  {saveButtonText}
                </IonButton>

                {editMode && (
                  <IonButton
                    id="delete-review"
                    color="danger"
                    expand="full"
                    onClick={() => setIsDeleteAlertOpen(true)}
                    disabled={isDeleteButtonDisabled}
                  >
                    {deleteButtonText}
                  </IonButton>
                )}
              </div>
            </IonGrid>

          </IonRow>
        </IonGrid>
      </IonContent>

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
        onDidDismiss={() => resetButtonStates()}
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