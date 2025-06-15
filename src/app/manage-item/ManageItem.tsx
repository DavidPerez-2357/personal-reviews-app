import { usePhotoGallery } from "@/hooks/usePhotoGallery";
import CategorySelectorHeader from "@/shared/components/CategorySelectorHeader";
import PreviewPhotoModal from "@/shared/components/PreviewPhotoModal";
import { Category } from "@/shared/dto/Category";
import { Item, ItemFull, Origin } from "@/shared/dto/Item";
import { UserPhoto } from "@/shared/dto/Photo";
import {
  getCategoryById,
  getChildrenCategories,
  getFirstCategory,
  getParentCategory,
} from "@/shared/services/category-service";
import {
  deleteItem,
  deleteItemRelations,
  deleteOriginRelations,
  editItem,
  getItemById,
  getItemFull,
  getItemsByOriginId,
  getOriginByItemId,
  insertItem,
  insertOrigin,
} from "@/shared/services/item-service";
import { Capacitor } from "@capacitor/core";
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
} from "@ionic/react";
import { Box, Building2, Camera, Images, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router";
import ItemsSelectorModal from "./components/ItemsSelectorModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { CategoryColors } from "@/shared/enums/colors";
import {
  deleteReview,
  deleteReviewImages,
  getReviewImagesbyId,
  getReviewsByItemId,
} from "@/shared/services/review-service";
import { useToast } from "../ToastContext";

const ManageItem = () => {
  // Estado para saber si es la primera carga del componente
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // i18n translation
  const { t } = useTranslation();

  const { showToast } = useToast();

  // Default category if none found
  const notFoundAnyCategories: Category = {
    id: 0,
    name: t("common.no-categories-found"),
    type: 1,
    color: "darkgray",
    icon: "circle-exclamation",
    parent_id: null,
  };

  // Category and item state
  const [item, setItem] = useState<Item | null>(null);
  const [oldItem, setOldItem] = useState<Item | null>(null);
  const [parentCategory, setParentCategory] = useState<Category>(
    notFoundAnyCategories
  );
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] =useState<Category | null>(null);
  // Modal state
  const [isItemsSelectorModalOpen, setItemsSelectorModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [buttomDisabled, setButtomDisabled] = useState(false);

  // Photo preview state
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

  // Hooks para la galería de fotos (tomar, importar, guardar, eliminar fotos)
  const {
    savedPhotos,
    setSavedPhotos,
    takePhoto,
    importPhoto,
    savePhoto,
    deletePhoto,
  } = usePhotoGallery();

  /**
   * Toma una foto usando la cámara, la guarda y la añade al estado.
   */
  const handleTakePhoto = async () => {
    const newPhoto = await takePhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
    if (item) setItem({ ...item, image: savedPhoto.filepath }); // <-- Añadido
  };

  /**
   * Importa una foto desde la galería, la guarda y la añade al estado.
   */
  const handleGetPhotoFromGallery = async () => {
    const newPhoto = await importPhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    if (savedPhotos.length > 0) {
      setSavedPhotos([savedPhoto]);
    } else {
      setSavedPhotos([...savedPhotos, savedPhoto]);
    }
    if (item) setItem({ ...item, image: savedPhoto.filepath }); // <-- Añadido
  };

  /**
   * Elimina una foto seleccionada del estado y del sistema de archivos.
   */
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
      const updatedPhotos = prevPhotos.filter(
        (p) => p.filepath !== photo.filepath
      );
      console.log(
        "🔍 Fotos guardadas después de eliminar:",
        updatedPhotos.length
      );
      return updatedPhotos;
    });
  };

  // React Router hooks
  let { id } = useParams<{ id: string }>();
  const { idOrigin } = useParams<{ idOrigin: string }>();
  const history = useHistory();
  const location = useLocation();

  // Edit mode flag
  const editMode = Boolean(id);

  /**
   * Busca y selecciona una categoría por su ID.
   */
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
  };

  const setOrigin = async (originId: number) => {
    if (!originId) {
      console.error("❌ Error: Origin ID is required");
      return;
    }

    const origin = await getItemFull(originId);
    if (!origin) {
      console.error("❌ Error: Origin not found for ID", originId);
      return;
    }
    setSelectedOriginItems([origin]);
  }

  /**
   * Carga los datos del item a editar, incluyendo su categoría y foto.
   */
  const setEditData = async (itemId: number) => {
    try {
      const item: Item | null = await getItemById(itemId);
      if (item) setOldItem(item); // Guardar el item original para comparaciones
      setItem(item);
      if (!item) throw new Error(t("manage-item.error-message.item-not-found"));
      const category: Category | null = await getCategoryById(item.category_id);
      if (!category)
        throw new Error(t("manage-item.error-message.category-not-found"));
      const parentCategoryResolved = category.parent_id
        ? (await getParentCategory(category.parent_id)) || notFoundAnyCategories
        : category;
      if (category.parent_id) {
        setParentCategory(parentCategoryResolved ?? notFoundAnyCategories);
        setSelectedSubcategory(category);
      } else {
        setParentCategory(category ?? notFoundAnyCategories);
        setSelectedSubcategory(null);
      }
      if (parentCategory) {
        const children = await getChildrenCategories(parentCategory.id);
        setChildrenCategories(children);
      }
      if (item.is_origin) {
        // Si es un item de origen, obtenemos los items relacionados
        const originItems = await getItemsByOriginId(item.id);
        console.log("originItems1:", JSON.stringify(originItems, null, 2));
        setSelectedOriginItems(Array.isArray(originItems) ? originItems : []);
      } else {
        const origin = await getOriginByItemId(item.id);
        console.log("origin:", JSON.stringify(origin, null, 2));
        const originItem = await getItemFull(origin?.origin_id || 0);
        console.log("originItem2:", JSON.stringify(originItem, null, 2));
        if (originItem) {
          setSelectedOriginItems([originItem]);
        } else {
          setSelectedOriginItems([]);
        }
      }

      // Manejar categorías padre e hija
      if (category.parent_id) {
        setParentCategory(parentCategory);
        setSelectedSubcategory(category);
      } else {
        setParentCategory(category);
        setSelectedSubcategory(null);
      }

      // Carga la foto del item si existe
      const photoSrc: string | undefined = item.image
        ? Capacitor.convertFileSrc(item.image)
        : undefined;
      setSavedPhotos([
        {
          filepath: item.image || "",
          webviewPath: photoSrc || "",
          id: item.id,
        } as UserPhoto,
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  /**
   * Reemplaza una foto existente por una nueva tomada con la cámara.
   */
  const handleReplacePhoto = async (photo: UserPhoto) => {
    try {
      await deletePhoto(photo); // Elimina la foto anterior
    } catch (error) {
      console.error("❌ Error al eliminar la foto:", error);
    }

    if (isPreviewOpen) {
      handlePreviewClose();
    }

    const newPhoto = await takePhoto(); // Toma la nueva foto
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto); // Guarda la nueva foto
    if (!savedPhoto) return;
    setSavedPhotos(
      savedPhotos.map((p) => (p.filepath === photo.filepath ? savedPhoto : p))
    );
    if (item) setItem({ ...item, image: savedPhoto.filepath }); // <-- Añadido
  };

  // Estado para los items seleccionados en el modal
  const [selectedOriginItems, setSelectedOriginItems] = useState<ItemFull[]>(
    []
  );

  const handleSaveNewItem = async () => {
    console.log("🔵 handleSaveNewItem called");
    if (!item) {
      console.error("❌ No hay item para guardar");
      return;
    }

    // Validar que el item tenga un nombre
    if (!item.name.trim()) {
      showToast(t("manage-item.error-missing-name"));
      console.error("❌ El item debe tener un nombre");
      return;
    }

    // Validar que el item tenga una categoría seleccionada
    if (!selectedCategory) {
      showToast(t("manage-item.error-missing-category"));
      console.error("❌ El item debe tener una categoría");
      return;
    }

    const newItem: Item = {
      id: item.id,
      name: item.name,
      category_id: selectedCategory.id,
      is_origin: item.is_origin,
      image: savedPhotos[0]?.filepath,
    };

    try {
      console.log("modo edición:", editMode);
      let currentItemId = item.id;
      if (editMode) {
        await editItem(newItem);
      } else {
        const insertedId = await insertItem(newItem);
        if (insertedId === null) {
          throw new Error("Failed to insert item: insertItem returned null");
        }
        currentItemId = insertedId;
      }

      if (oldItem && oldItem.is_origin) {
        await deleteOriginRelations(currentItemId);
      } else if (oldItem) {
        await deleteItemRelations(currentItemId);
      }

      const originItems: Origin[] = selectedOriginItems.map((originItem) => ({
        origin_id: item.is_origin ? currentItemId : originItem.id,
        item_id: item.is_origin ? originItem.id : currentItemId,
      }));

      for (const originItem of originItems) {
        await insertOrigin(originItem);
      }
      showToast(t("manage-item.save-item-success"));
      history.push("/app/items");
    } catch (error) {
      console.error("❌ Error al guardar el item:", error);
      return;
    }
  };

  const handleDeleteItem = async () => {
    setButtomDisabled(true);
    try {
      const reviews = await getReviewsByItemId(Number(id));
      // 1. Eliminar imágenes y reseñas asociadas
      for (const review of reviews) {
        // Obtener imágenes de la reseña
        const reviewImages = await getReviewImagesbyId(review.id);
        // Eliminar cada imagen del sistema de archivos
        for (const img of reviewImages) {
          try {
            await deletePhoto({ filepath: img.image });
          } catch (e) {
            console.warn(
              "No se pudo eliminar la imagen del sistema de archivos:",
              img.image,
              e
            );
          }
        }
        // Eliminar imágenes de la base de datos
        await deleteReviewImages(review.id);
        // Eliminar la reseña
        await deleteReview(review.id);
      }
      // 2. Eliminar imagen del ítem si existe
      if (item && item.image) {
        try {
          await deletePhoto({ filepath: item.image });
        } catch (e) {
          console.warn(
            "No se pudo eliminar la imagen del ítem:",
            item.image,
            e
          );
        }
      }

      // 3. Eliminar relaciones de origen si el ítem es de origen
      if (item && item.is_origin) {
        await deleteOriginRelations(item.id);
      } else if (item) {
        await deleteItemRelations(item.id);
      }

      // 4. Eliminar el ítem
      if (!item) {
        setShowErrorAlert(true);
        setButtomDisabled(true);
        return;
      }
      const success = await deleteItem(item.id);
      if (!success) {
        setShowErrorAlert(true);
        setButtomDisabled(true);
        return;
      }
      setIsDeleteAlertOpen(false);
      showToast(t("manage-item.delete-item-success"));
      history.push("/app/items");
    } catch (error) {
      console.error("Error deleting item:", error);
      setShowErrorAlert(true);
      setButtomDisabled(true);
    }
  };

  /**
   * useEffect principal:
   * Si está en modo edición, carga los datos del item a editar.
   * Si no, selecciona la primera categoría y crea un item por defecto.
   */
  useEffect(() => {
    if (editMode && id) {
      setEditData(parseInt(id)).catch((error) => {
        console.error("Error al cargar los datos de edición:", error);
        history.replace("/app/items");
      });
    } else {
      // Limpiar los items seleccionados de origen y de item en origen
      setSelectedOriginItems([]);
      // Limpiar las imagenes guardadas
      setSavedPhotos([]);
      // Iniciamos el item por defecto
      setItem({
        id: 0,
        name: "",
        category_id: 0,
        is_origin: false,
        image: "",
      });
      getFirstCategory()
        .then((category) => {
          if (!category) {
            console.error("❌ No se encontró ninguna categoría");
            setSelectedCategory(notFoundAnyCategories);
            return;
          }
          setSelectedCategoryById(category.id);
        })
        .catch((error) => {
          console.error("❌ Error al obtener la primera categoría:", error);
          setSelectedCategory(notFoundAnyCategories);
        });
      setIsInitialLoad(false);
    }

    if (idOrigin) {
      setOrigin(parseInt(idOrigin)).catch((error) => {
        console.error("Error al cargar el origen:", error);
        history.replace("/app/items");
      });
    }
  }, [location.pathname, id, editMode]);

  /**
   * useEffect para actualizar la categoría padre y subcategoría
   * cuando cambia la categoría seleccionada.
   */
  useEffect(() => {
    // Evitar sobrescribir los ratings si estás en modo edición y ya se cargaron
    if (editMode && isInitialLoad) return;

    if (
      selectedCategory &&
      selectedCategory.parent_id &&
      parentCategory?.id !== selectedCategory.parent_id
    ) {
      getCategoryById(selectedCategory.parent_id)
        .then((category) => {
          setParentCategory(category ?? notFoundAnyCategories);
          setSelectedSubcategory(selectedCategory);
          console.log("Parent category fetched:", category?.name);
          console.log("Selected subcategory set:", selectedCategory?.name);
        })
        .catch((error) => {
          console.error("Error fetching parent category:", error);
        });
    } else if (
      selectedCategory &&
      !selectedCategory.parent_id &&
      parentCategory?.id !== selectedCategory.id
    ) {
      setParentCategory(selectedCategory);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory]);

  /**
   * useEffect para mantener sincronizada la categoría seleccionada
   * con la subcategoría o la categoría padre.
   */
  useEffect(() => {
    if (selectedSubcategory) {
      setSelectedCategory(selectedSubcategory);
    } else if (parentCategory) {
      setSelectedCategory(parentCategory);
    } else {
      setSelectedCategory(null);
    }
  }, [parentCategory, selectedSubcategory]);

  /**
   * useEffect para limpiar la subcategoría si la categoría padre cambia.
   */
  useEffect(() => {
    if (
      !parentCategory ||
      selectedSubcategory?.parent_id !== parentCategory.id
    ) {
      setSelectedSubcategory(null);
    }
  }, [parentCategory]);

  /**
   * Navega hacia atrás en el historial del navegador.
   */
  const goBack = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    window.history.back();
  };

  return (
    <IonPage>
      <IonContent>
        <IonGrid className="flex flex-col gap-12 pb-10">
          <IonRow>
            <CategorySelectorHeader
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <div
              className="flex absolute safe-area-top top-0 p-3"
              onClick={goBack}
            >
              <IonBackButton defaultHref="/app/items" color="tertiary" />
            </div>
          </IonRow>
          <IonRow className="flex flex-col gap-2 px-5">
            <span className="text-2xl font-bold flex gap-2 items-center">
              {item?.is_origin ? (
                <>
                  <Building2 size={30} />
                  {t("common.origin")}
                </>
              ) : (
                <>
                  <Box size={30} />
                  {t("common.item")}
                </>
              )}
            </span>
            <IonInput
              fill="solid"
              value={item?.name || ""}
              placeholder={t("manage-item.item-input-placeholder")}
              onIonInput={(e) => {
                if (item) {
                  setItem({ ...item, name: e.detail.value || "" });
                }
              }}
            />
          </IonRow>
          <IonRow className="flex flex-col gap-2 mx-5">
            <IonLabel className="section-title">{t("common.image")}</IonLabel>

            {!savedPhotos.length || !item?.image || item?.image == "" ? (
              // Si no hay foto guardada ni en el item, mostrar botones para tomar o importar
              <div className="w-full h-25 flex gap-2">
                <div
                  className="flex-1 rounded-l-lg bg-[var(--ion-color-secondary)] flex items-center justify-center"
                  onClick={async () => {
                    handleTakePhoto();
                  }}
                >
                  <Camera size={40} />
                </div>
                <div
                  className="flex-1 rounded-r-lg bg-[var(--ion-color-secondary)] flex items-center justify-center"
                  onClick={async () => {
                    handleGetPhotoFromGallery();
                  }}
                >
                  <Images size={40} />
                </div>
              </div>
            ) : (
              // Si hay foto, mostrar la imagen y los botones para reemplazarla
              <div className="relative flex gap-2 mb-10">
                <img
                  src={Capacitor.convertFileSrc(savedPhotos[0].filepath!)}
                  alt="Image"
                  className="w-full rounded-lg object-cover cursor-pointer"
                  onClick={() => handlePreviewOpen(savedPhotos[0])}
                />
                <div className="absolute bottom-1 left-1 cursor-pointer flex gap-4">
                  <div
                    className="w-25 h-10 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center"
                    onClick={async () => {
                      handleGetPhotoFromGallery();
                    }}
                  >
                    <Images size={30} />
                  </div>
                  <div
                    className="w-25 h-10 rounded-lg bg-[var(--ion-color-secondary)] flex items-center justify-center"
                    onClick={async () => {
                      handleReplacePhoto(savedPhotos[0]);
                    }}
                  >
                    <Camera size={30} />
                  </div>
                </div>
              </div>
            )}
          </IonRow>

          <IonRow className="flex flex-col gap-2 mx-5">
            <IonLabel className="section-title">
              {t("manage-item.change-is-origin")}
            </IonLabel>
            <div className="flex gap-2 w-full justify-between items-center">
              <IonButton
                fill={item?.is_origin ? "solid" : "outline"}
                color={item?.is_origin ? "tertiary" : "medium"}
                className={`w-1/2 ${item?.is_origin
                    ? "text-[var(--ion-color-tertiary-contrast)]"
                    : ""
                  }`}
                onClick={() => {
                  if (item && !item.is_origin) {
                    setItem({ ...item, is_origin: true });
                    setSelectedOriginItems([]); // <-- Reset selected items al cambiar a origen
                  } else {
                    console.log("item ya era origen o no existe", item);
                  }
                }}
              >
                {t("common.yes")}
              </IonButton>
              <IonButton
                fill={!item?.is_origin ? "solid" : "outline"}
                color={!item?.is_origin ? "tertiary" : "medium"}
                className={`w-1/2 ${!item?.is_origin
                    ? "text-[var(--ion-color-tertiary-contrast)]"
                    : ""
                  }`}
                onClick={() => {
                  if (item && item.is_origin) {
                    setItem({ ...item, is_origin: false });
                    setSelectedOriginItems([]); // <-- Reset selected items al cambiar a item
                  } else {
                    console.log("item ya no era origen o no existe", item);
                  }
                }}
              >
                {t("common.no")}
              </IonButton>
            </div>
          </IonRow>

          <IonRow className="flex flex-col gap-2 mx-5 justify-between">
            <div className="flex gap-2 items-center justify-between">
              <IonLabel className="section-title break-normal">
                {item?.is_origin ? (
                  <>
                    {t("manage-item.origin-items") + " "}
                    <span className="text-[var(--ion-color-primary)]">
                      {item?.name.trim() ? item.name : "..."}
                    </span>
                  </>
                ) : (
                  t("manage-item.item-origin")
                )}
              </IonLabel>

              <IonButton
                fill="solid"
                color="secondary"
                onClick={() => {
                  setItemsSelectorModalOpen(true);
                }}
              >
                {item?.is_origin ? <Plus size={20} /> : <Search size={20} />}
              </IonButton>
            </div>

            {selectedOriginItems.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                {t("manage-item.no-origin-items")}
              </div>
            ) : (
              <IonList lines="none">
                {selectedOriginItems.map((item: ItemFull) => {
                  return (
                    <IonItem key={item.id}>
                      <div className="flex items-center gap-2">
                        {item.image ? (
                          <div className="flex relative items-center justify-center size-10 rounded-md overflow-hidden">
                            <img
                              src={Capacitor.convertFileSrc(item.image)}
                              alt={item.name}
                              className="object-cover w-full h-full"
                            />
                            <div
                              className="absolute bottom-0 right-0 size-4 rounded-md flex items-center justify-center p-1"
                              style={{
                                backgroundColor:
                                  CategoryColors[item.category_color],
                              }}
                            >
                              <FontAwesomeIcon
                                icon={item.category_icon as IconName}
                                className="fa-xs text-[var(--ion-color-primary-contrast)]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-center size-10 rounded-md p-2"
                            style={{
                              backgroundColor:
                                CategoryColors[item.category_color],
                            }}
                          >
                            <FontAwesomeIcon
                              icon={item.category_icon as IconName}
                              className="fa-xl text-[var(--ion-color-primary-contrast)]"
                            />
                          </div>
                        )}
                        {item.name}
                      </div>
                    </IonItem>
                  );
                })}
              </IonList>
            )}
          </IonRow>
          <IonRow className="flex flex-col gap-4 mx-5">
            <IonButton
              className="large"
              expand="block"
              color="tertiary"
              onClick={handleSaveNewItem}
            >
              {editMode
                ? t("common.save-changes")
                : t("view-all-items.create-item")}
            </IonButton>
            {editMode && (
              <IonButton
                className="large"
                expand="block"
                color="danger"
                onClick={() => setIsDeleteAlertOpen(true)}
                disabled={buttomDisabled}
              >
                {t("manage-item.delete-item")}
              </IonButton>
            )}
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

      <IonAlert
        isOpen={isDeleteAlertOpen}
        onDidDismiss={() => setIsDeleteAlertOpen(false)}
        header={t("common.delete")}
        message={t("manage-item.delete-item-confirm")}
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
              handleDeleteItem();
            },
          },
        ]}
      />

      <ItemsSelectorModal
        isOpen={isItemsSelectorModalOpen}
        onDismiss={() => setItemsSelectorModalOpen(false)}
        isOrigin={item?.is_origin || false}
        itemId={item?.id || 0}
        itemsOfOrigin={selectedOriginItems}
        onSave={(items) => setSelectedOriginItems(items)}
      />
    </IonPage>
  );
};

export default ManageItem;
