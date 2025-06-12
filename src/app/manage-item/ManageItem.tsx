import { usePhotoGallery } from "@/hooks/usePhotoGallery";
import CategorySelectorHeader from "@/shared/components/CategorySelectorHeader";
import PreviewPhotoModal from "@/shared/components/PreviewPhotoModal";
import { Category } from "@/shared/dto/Category";
import { Item, ItemOption } from "@/shared/dto/Item";
import { UserPhoto } from "@/shared/dto/Photo";
import {
  getCategoryById,
  getChildrenCategories,
  getFirstCategory,
  getParentCategory,
} from "@/shared/services/category-service";
import { getItemById } from "@/shared/services/item-service";
import { Capacitor } from "@capacitor/core";
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonGrid,
  IonInput,
  IonLabel,
  IonPage,
  IonRow,
} from "@ionic/react";
import { Box, Building2, Camera, Images, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router";
import ItemsSelectorModal from "./components/ItemsSelectorModal";

const ManageItem = () => {
  // Estado para saber si es la primera carga del componente
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
  };

  /**
   * Importa una foto desde la galería, la guarda y la añade al estado.
   */
  const handleGetPhotoFromGallery = async () => {
    const newPhoto = await importPhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
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
  const history = useHistory();
  const location = useLocation();

  // i18n translation
  const { t } = useTranslation();

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
  const [parentCategory, setParentCategory] = useState<Category>(
    notFoundAnyCategories
  );
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Category | null>(null);
  const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
  // Modal state
  const [isItemsSelectorModalOpen, setItemsSelectorModalOpen] = useState(false);

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

  /**
   * Carga los datos del item a editar, incluyendo su categoría y foto.
   */
  const setEditData = async (itemId: number) => {
    try {
      const item: Item | null = await getItemById(itemId);
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

      // Iniciamos el item por defecto
      setItem({
        id: 0,
        name: "",
        category_id: 0,
        is_origin: false,
        image: ""
      });
    }
  }, [editMode, id, history]);

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
        <IonGrid className="flex flex-col gap-12">
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
              placeholder={t("manage-item.placeholder.item-name")}
              onIonChange={(e) => {
                if (item) {
                  setItem({ ...item, name: e.detail.value || "" });
                }
              }}
            />
          </IonRow>
          <IonRow className="flex flex-col gap-2 mx-5">
            <IonLabel className="section-title">{t("common.image")}</IonLabel>

            {!savedPhotos.length ? (
              // Si no hay foto, mostrar botón para agregar
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
                      handleTakePhoto();
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
              {t("manage-item.change-is_origin")}
            </IonLabel>
            <div className="flex gap-2">
              <IonButton
                fill={item?.is_origin ? "solid" : "outline"}
                color={item?.is_origin ? "success" : "medium"}
                onClick={() => {
                  console.log("Botón SÍ pulsado");
                  if (item && !item.is_origin) {
                    setItem({ ...item, is_origin: true });
                    console.log("item.is_origin cambiado a true", {
                      ...item,
                      is_origin: true,
                    });
                  } else {
                    console.log("item ya era origen o no existe", item);
                  }
                }}
              >
                {t("common.yes")}
              </IonButton>
              <IonButton
                fill={!item?.is_origin ? "solid" : "outline"}
                color={!item?.is_origin ? "danger" : "medium"}
                onClick={() => {
                  console.log("Botón NO pulsado");
                  if (item && item.is_origin) {
                    setItem({ ...item, is_origin: false });
                    console.log("item.is_origin cambiado a false", {
                      ...item,
                      is_origin: false,
                    });
                  } else {
                    console.log("item ya no era origen o no existe", item);
                  }
                }}
              >
                {t("common.no")}
              </IonButton>
            </div>
          </IonRow>

          <IonRow className="flex gap-2 mx-5">
            <IonLabel className="section-title">
              {t("manage-item.item-origin")} {item?.name}
            </IonLabel>

            <IonButton
              fill="solid"
              color="secondary"
              onClick={() => {
                setItemsSelectorModalOpen(true);
              }}
            >
              <Plus size={20} />
            </IonButton>
            <ItemsSelectorModal
              isOpen={isItemsSelectorModalOpen}
              onDismiss={() => setItemsSelectorModalOpen(false)}
              isOrigin={item?.is_origin || false}
            />
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
    </IonPage>
  );
};

export default ManageItem;
