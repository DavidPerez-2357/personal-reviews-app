import CategoryCard from "@/shared/components/CategoryCard";
import { CategoryColors } from "@/shared/enums/colors";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonAlert, IonBackButton, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonRow } from "@ionic/react";
import { InfoIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router";
import SelectIconModal from "./components/SelectIconModal";
import { Category, CategoryRating } from "@/shared/dto/Category";
import { deleteCategory, deleteCategoryRating, getCategoryById, getCategoryRatingsByCategoryId, getChildrenCategories, insertCategory, insertCategoryRating, updateCategory } from "@/shared/services/category-service";
import ErrorAlert from "@/shared/components/ErrorAlert";
import { trash } from 'ionicons/icons';
import CreateRatingModal from "./components/CreateRatingModal";
import { Dialog } from "@capacitor/dialog";
import { useToast } from "../ToastContext";


const ManageCategory = () => {
  const { t } = useTranslation();
  let { id } = useParams<{ id: string }>();
  const location = useLocation();
  const history = useHistory();
  const { showToast } = useToast();

  const [isSubcategory, setIsSubcategory] = useState(false);
  const [editMode, setEditMode] = useState(!!id);
  const [icon, setIcon] = useState<IconName>("burger");
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(Object.keys(CategoryColors)[0]);
  const selectedColorElement = useRef<HTMLDivElement | null>(null);
  const saveButtonRef = useRef<HTMLIonButtonElement | null>(null);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [ratings, setRatings] = useState<string[]>([]);
  const [existingRatings, setExistingRatings] = useState<CategoryRating[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [parentCategoryName, setParentCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);

  // State for buttons
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState(t('manage-category.create-category'));
  const [deleteButtonText, setDeleteButtonText] = useState(t('manage-category.delete-category'));
  const [errorMessage, setErrorMessage] = useState('');

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isCreateRatingModalOpen, setIsCreateRatingModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [categoryDeleted, setCategoryDeleted] = useState(false);

  useEffect(() => {
    if (icon) {
      setIsIconModalOpen(false);
    }
  }, [icon]);

  useEffect(() => {
    if (id) {
      // Fetch category data by id and set initial state
      // This is a placeholder, replace with actual fetch logic
      setCategoryName("Example Category");
      setSelectedColor("blue");
      setIcon("burger");
    }
  }, [id]);

  useEffect(() => {
    setEditMode(location.pathname.includes('/edit'));
    setIsSubcategory(location.pathname.includes('/subcategories'));
  }, [location.pathname]);

  useEffect(() => {
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-category.create-category'));
    setIsSaveButtonDisabled(false);
    setIsDeleteButtonDisabled(false);
    setDeleteButtonText(t('manage-category.delete-category'));
    setIcon("burger");
    setCategoryName('');
    setSelectedColor(Object.keys(CategoryColors)[0]);
    setRatings([]);
    setExistingRatings([]);
    setSubcategories([]);
    setParentCategoryId(null);

    if (categoryDeleted) {
      return;
    }

    if ((editMode || isSubcategory) && id) {
      setEditData(parseInt(id));
    }
  }, [location.pathname, editMode, isSubcategory, id]);

  const scrollToSelectedColor = () => {
    if (selectedColorElement.current) {
      selectedColorElement.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  useEffect(() => {
    scrollToSelectedColor();
  }, [selectedColorElement, selectedColor]);

  const setEditData = async (categoryId: number) => {
    const category = await getCategoryById(categoryId);
    const existingRatings = await getCategoryRatingsByCategoryId(categoryId);

    if (!category) {
      showError(t('manage-category.error-message.category-not-found'));
      return;
    }

    if (category.parent_id) {
      setIsSubcategory(true);
      await getCategoryById(category.parent_id).then(parentCategory => {
        if (parentCategory) {
          setParentCategoryName(parentCategory.name);
        } else {
          setParentCategoryName(t('manage-category.unknown-parent-category'));
        }
      }).catch((error) => {
        showError(t('manage-category.error-message.error-fetching-parent-category'));
      });
    }

    if (!isSubcategory || category.parent_id) {
      setCategoryName(category.name);
      setExistingRatings(existingRatings);
      setParentCategoryId(category.parent_id || null);
    }else {
      setParentCategoryId(category.id);
      setParentCategoryName(category.name);
      setCategoryName('');
      setExistingRatings([]);
    }

    setIcon(category.icon as IconName);
    setSelectedColor(category.color);
    setRatings(existingRatings.map(r => r.name));
  }

  useEffect(() => {
    // Get subcategories if the current category is not a subcategory
    if (editMode && !isSubcategory && id) {
      getChildrenCategories(parseInt(id)).then(setSubcategories).catch((error) => {
        console.error("Error fetching subcategories:", error);
        showError(t('manage-category.error-message.error-fetching-subcategories'));
      });
    }
  }, [editMode, isSubcategory, id, location.pathname]);


  const resetButtonStates = () => {
    setIsSaveButtonDisabled(false);
    setIsDeleteButtonDisabled(false);
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-category.create-category'));
    setDeleteButtonText(t('manage-category.delete-category'));
  }

  const addCategoryRating = (ratingName: string) => {
    if (!ratingName.trim()) {
      showError(t('manage-category.rating-name-empty'));
      return;
    }

    if (ratings.includes(ratingName)) {
      showError(t('manage-category.rating-already-exists'));
      return;
    }
    setRatings([...ratings, ratingName]);
    setIsCreateRatingModalOpen(false);
    console.log("Rating added:", ratingName);
  }

  const createOrUpdateCategory = async (category: Category): Promise<number> => {
    try {
      if (editMode) {
        const success = await updateCategory(category);
        if (!success) {
          throw new Error();
        }
        return category.id;
      }

      console.log("Category created:", category.id, category.name, category.icon, category.color, category.type, category.parent_id);
      return await insertCategory(category);
    } catch (error) {
      console.error(editMode ? "Error updating category:" : "Error creating category:", error);
      return 0;
    }
  }

  const updateCategoryRatings = (categoryId: number, ratings: string[]) => {
    // Delete ratings that are not in the new list but exist in the category
    const existingRatingsSet = new Set(existingRatings.map(r => r.name));
    const ratingsToDelete = existingRatings.filter(r => !ratings.includes(r.name));

    try {
      if (ratingsToDelete.length > 0) {
        ratingsToDelete.forEach(async (rating) => {
          const success = await deleteCategoryRating(rating);
          if (!success) {
            throw new Error();
          }
          console.log("Rating deleted:", rating.name);
        });
      }

      // Insert new ratings that are not already in the category
      const newRatings = ratings.filter(r => !existingRatingsSet.has(r));

      if (newRatings.length > 0) {
        newRatings.forEach(async (rating) => {
          const newRating: CategoryRating = {
            id: 0,
            category_id: categoryId,
            name: rating
          };

          const success = await insertCategoryRating(newRating);
          if (!success) {
            throw new Error();
          }
          console.log("Rating added:", rating);
        });
      }

      return true;

    } catch (error) {
      console.error("Error deleting ratings:", error);
      return false;
    }
  }

  const handleSavecategory = async () => {
    console.log("Saving category:");
    setSaveButtonText(t('manage-category.saving-category'));
    setIsSaveButtonDisabled(true);

    // Logic to save the category
    const category: Category = {
      id: id ? parseInt(id) : 0,
      name: categoryName,
      icon: icon,
      color: selectedColor,
      type: 0,
      parent_id: parentCategoryId || null,
    }

    if (!categoryName.trim()) {
      showError(t('manage-category.error-message.category-name-empty'));
      return;
    }

    const categoryId = await createOrUpdateCategory(category);

    if (!categoryId) {
      showError(editMode ? t('manage-category.error-message.error-saving-category') : t('manage-category.error-message.error-creating-category'));
      return;
    }

    if (ratings.length > 0 || existingRatings.length > 0) {
      if (!updateCategoryRatings(categoryId, ratings)) {
        showError(t('manage-category.error-message.error-saving-category-ratings'));
        return;
      }
    }

    setSaveButtonText(t('manage-category.saving-category-success'));
    setTimeout(() => {
      if (isSubcategory) {
        history.goBack();
      }else {
        history.push('/app/more/categories');
        showToast(t('manage-category.saving-category-success'));
      }
    }, 500);
  };

  const handleDeleteCategory = async () => {
    setIsDeleteButtonDisabled(true);
    setDeleteButtonText(t('manage-category.deleting-category'));

    try {
      if (id) {
        const success = await deleteCategory(parseInt(id));
        if (!success) {
          throw new Error();
        }
        console.log("Category deleted:", id);
        setCategoryDeleted(true);
      }

      setDeleteButtonText(t('manage-category.delete-category-success'));
      if (isSubcategory && parentCategoryId) {
        setTimeout(() => {
          history.goBack();
        }, 500);
      } else {
        setTimeout(() => {
          history.push('/app/more/categories');
          showToast(t('manage-category.delete-category-success'));
        }, 500);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showError(t('manage-category.error-message.error-deleting-category'));
    } finally {
      resetButtonStates();
    }
  }

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorAlert(true);

    resetButtonStates();
  }

  const handleDeleteRating = async (index: number) => {
    const ratingName = ratings[index];
    const isExisting = existingRatings.some(r => r.name === ratingName);

    if (isExisting) {
      const { value } = await Dialog.confirm({
      title: t('common.confirm'),
      message: t('manage-category.delete-rating-confirm', { ratingName }),
      });

      if (!value) return;
    }

    const newRatings = [...ratings];
    newRatings.splice(index, 1);
    setRatings(newRatings);
  }

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
    const shouldHide = scrollPercent >= 0.6;

    btnEl.classList.remove("downToNormal-animation-1");

    if (!shouldHide) {
      btnEl.classList.add("downToNormal-animation-1");
      btnEl.style.display = "block";
    } else {
      btnEl.style.display = "none";
    }
  };

  return (
    <IonPage>
      <IonContent onIonScroll={handleParentScroll} ref={contentRef} class="ion-no-padding" scrollEvents={true}>
        <div className="safe-area-top relative w-full" onClick={() => setIsIconModalOpen(true)}>
          <div className="flex flex-col items-center justify-center px-5 py-2 gap-2">
            <FontAwesomeIcon icon={icon} size="4x" className="mt-7" />
            <IonLabel className="text-base text-center">
              {t('manage-category.select-icon')}
            </IonLabel>
          </div>

          <div className="flex absolute safe-area-top top-0 p-3">
            <IonBackButton defaultHref="/app/more/categories" color="tertiary" />
          </div>
        </div>

        <IonGrid className="flex flex-col gap-12 p-5 pb-10">
          <IonRow>
            <IonInput
              value={categoryName}
              onIonInput={(e) => {
                setCategoryName(e.detail.value!);
              }}
              placeholder={t("manage-category.category-input-placeholder")}
              className="w-full"
              fill="solid"
            />
          </IonRow>

          <IonRow className="flex flex-col gap-2">
            <IonLabel className="section-title">
              {t('common.color')}
            </IonLabel>
            <div className="block gap-4 overflow-x-auto w-full whitespace-nowrap">
              {Object.entries(CategoryColors).map(([color, hex]) => (
                <div
                  key={color}
                  ref={selectedColor === color ? selectedColorElement : null}
                  className={`size-20 inline-block rounded-full ${selectedColor === color ? 'border-4' : ''} [&:not(:last-child)]:mr-2`}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: hex }}
                >
                </div>
              ))}
            </div>
          </IonRow>

          <IonRow className="flex flex-col gap-2">
            <IonLabel className="section-title">
              {t('common.ratings')}
            </IonLabel>
            <IonButton
              color="tertiary"
              fill="solid"
              className="w-full mb-2"
              onClick={() => setIsCreateRatingModalOpen(true)}
            >
              {t('manage-category.add-rating')}
            </IonButton>
            {ratings.length > 0 ? (
              <IonList className="w-full ion-no-padding">
                {ratings.map((rating, idx) => (
                  <IonItem lines="full" className="ion-no-padding" key={idx}>
                    <IonLabel className="text-lg px-4" slot="start">
                      {rating}
                    </IonLabel>
                    <IonIcon
                      slot="end"
                      icon={trash}
                      color="tertiary"
                      onClick={() => {
                        handleDeleteRating(idx);
                      }}
                    />
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <IonLabel className="text-lg" color="secondary">
                {t('manage-category.no-ratings')}
              </IonLabel>
            )}
          </IonRow>

          {id && !isSubcategory && (
            <IonRow className="flex flex-col gap-2 pb-5">
              <IonLabel className="section-title">
                {t('common.subcategories')}
              </IonLabel>
              <IonButton color="tertiary" fill="solid" className="w-full" routerLink={`/app/more/categories/${id}/subcategories/create`}>
                {t('manage-category.create-subcategory')}
              </IonButton>
              <div className="w-full flex flex-col gap-4 pt-5">
                {subcategories.length > 0 ? (
                  subcategories.map((subcategory) => (
                    <CategoryCard
                      key={subcategory.id}
                      category={subcategory}
                    />
                  ))
                ) : (
                  <IonLabel className="text-lg" color="secondary">
                    {t('manage-category.no-subcategories')}
                  </IonLabel>
                )}
              </div>
            </IonRow>
          )}

          {!id && !isSubcategory && (
            <IonRow className="grid grid-cols-[auto_1fr] py-6 items-center gap-4">
              <IonCol className="">
                <InfoIcon size={35} />
              </IonCol>

              <IonCol className="w-full">
                <IonLabel className="text-lg">
                  {t('manage-category.create-category-info')}
                </IonLabel>
              </IonCol>
            </IonRow>
          )}

          {isSubcategory && (
            <IonRow className="grid grid-cols-[auto_1fr] py-6 items-center gap-4">
              <IonCol className="">
                <InfoIcon size={35} />
              </IonCol>

              <IonCol className="w-full">
                <IonLabel className="text-lg">
                  {t("manage-category.this-subcategory-belongs-to")}
                  <span className="text-[var(--ion-color-primary)] ml-2 font-semibold">
                    {parentCategoryName || t('manage-category.unknown-parent-category')}
                  </span>
                </IonLabel>
              </IonCol>
            </IonRow>
          )}

          <div className="flex flex-col gap-4">
            <IonButton
              className="z-[1000] bottom-0 right-0 mt-10 mb-5 ml-5 mr-5 fixed"
              ref={saveButtonRef}
              id="save-review"
              color="tertiary"
              expand="full"
              disabled={isSaveButtonDisabled}
              onClick={handleSavecategory}
            >
              {saveButtonText}
            </IonButton>

            <IonButton
              id="save-review"
              color="tertiary"
              expand="full"
              disabled={isSaveButtonDisabled}
              onClick={handleSavecategory}
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

        <IonAlert
          isOpen={isDeleteAlertOpen}
          onDidDismiss={() => setIsDeleteAlertOpen(false)}
          header={t("common.delete")}
          message={t("manage-category.delete-review-confirm")}
          buttons={[
            {
              text: t("common.cancel"),
              role: "cancel",
              cssClass: "secondary",
              handler: () => {
                setIsDeleteAlertOpen(false);
              },
            },
            {
              text: t("common.delete"),
              cssClass: "danger",
              handler: () => {
                setIsDeleteAlertOpen(true);
              },
            },
          ]}
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
          message={t("manage-category.delete-category-confirm")}
          buttons={[
            {
              text: t("common.cancel"),
              role: "cancel",
              cssClass: "secondary",
              handler: () => {
                setIsDeleteAlertOpen(false);
              },
            },
            {
              text: t("common.delete"),
              cssClass: "danger",
              handler: () => {
                handleDeleteCategory();
              },
            },
          ]}
        />

        <SelectIconModal isOpen={isIconModalOpen} setIsOpen={setIsIconModalOpen} selectedIcon={icon} setSelectedIcon={setIcon} />
        <CreateRatingModal isOpen={isCreateRatingModalOpen} setIsOpen={setIsCreateRatingModalOpen} onSubmit={addCategoryRating} />
      </IonContent>
    </IonPage>
  );
}

export default ManageCategory;