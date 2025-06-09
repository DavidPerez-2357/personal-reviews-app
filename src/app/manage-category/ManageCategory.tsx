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
import { Category } from "@/shared/dto/Category";
import { getCategoryById, insertCategory, updateCategory } from "@/shared/services/category-service";
import ErrorAlert from "@/shared/components/ErrorAlert";
import { trash } from 'ionicons/icons';
import CreateRatingModal from "./components/CreateRatingModal";
import { Dialog } from "@capacitor/dialog";


const ManageCategory = () => {
  const { t } = useTranslation();
  let { id } = useParams<{ id: string }>();
  const location = useLocation();
  const history = useHistory();

  const [isSubcategory, setIsSubcategory] = useState(false);
  const [editMode, setEditMode] = useState(!!id);
  const [icon, setIcon] = useState<IconName>("burger");
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(Object.keys(CategoryColors)[0]);
  const selectedColorElement = useRef<HTMLDivElement | null>(null);
  const saveButtonRef = useRef<HTMLIonButtonElement | null>(null);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [ratings, setRatings] = useState<string[]>([
    "5 stars",
    "4 stars",
    "3 stars",
    "2 stars",
    "1 star"
  ]);

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
    if (location.pathname.includes('/edit')) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }

    // Check if the current path indicates a subcategory
    if (location.pathname.includes('/subcategories')) {
      setIsSubcategory(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-category.create-category'));
    setDeleteButtonText(t('manage-category.delete-category'));
    setIcon("burger");
    setCategoryName('');
    setSelectedColor(Object.keys(CategoryColors)[0]);

    if (editMode && id) {
      setEditData(parseInt(id));
    }
  }, [editMode, id]);

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

    if (category) {
      setCategoryName(category.name);
      setIcon(category.icon as IconName);
      setSelectedColor(category.color);
      setIsSubcategory(category.parent_id !== null);
    } else {
      console.error("Category not found");
    }
  }


  const resetButtonStates = () => {
    setIsSaveButtonDisabled(false);
    setIsDeleteButtonDisabled(false);
    setSaveButtonText(editMode ? t('common.save-changes') : t('manage-category.create-category'));
    setDeleteButtonText(t('manage-category.delete-category'));
  }

  const createOrUpdateCategory = (category: Category) => {
    if (editMode) {
      // Update existing category
      updateCategory(category).then(() => {
        console.log("Category updated:", category);
        resetButtonStates();
      }).catch((error) => {
        console.error("Error updating category:", error);
        setShowErrorAlert(true);
      });
    } else {
      // Create new category
      insertCategory(category).then(() => {
        console.log("Category created:", category);
        resetButtonStates();
      }).catch((error) => {
        console.error("Error creating category:", error);
        setShowErrorAlert(true);
      });
    }
  }

  const handleSavecategory = () => {
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
      parent_id: isSubcategory ? parseInt(id) : null // If it's a subcategory, set parent_id to the current category id
    }

    if (!categoryName.trim()) {
      showError(t('manage-category.category-name-empty'));
      return;
    }

    createOrUpdateCategory(category);
    setSaveButtonText(t('manage-category.category-saved'));
    setTimeout(() => {
      history.push('/app/reviews', { toast: t('manage-item-review.saving-review-success') });
    }, 500);
  };

  const handleDeleteCategory = async () => {
    console.log("Deleting category:", id);
  }

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorAlert(true);

    resetButtonStates();
  }

  const handleDeleteRating = async (index: number) => {
    const { value } = await Dialog.confirm({
      title: t('common.confirm'),
      message: t('manage-category.delete-rating-confirm', { ratingName: ratings[index] }),
    });

    if (value) {
      const newRatings = [...ratings];
      newRatings.splice(index, 1);
      setRatings(newRatings);
    }
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
    const shouldHide = scrollPercent >= 0.5;

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
              <div className="w-full flex flex-col gap-2 pt-5">
                <CategoryCard category={{
                  id: 1,
                  name: "Subcategory Example",
                  icon: "cat" as any, // Replace with actual icon
                  color: selectedColor,
                  type: 0,
                  parent_id: null
                }} />
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
                  {
                    // TODO: Replace with actual parent category name
                  }
                  {t("manage-category.this-subcategory-belongs-to")}
                  <span className="text-[var(--ion-color-primary)] ml-2 font-semibold">
                    PONER ALGO AQUI
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
        <CreateRatingModal isOpen={isCreateRatingModalOpen} setIsOpen={setIsCreateRatingModalOpen} />
      </IonContent>
    </IonPage>
  );
}

export default ManageCategory;