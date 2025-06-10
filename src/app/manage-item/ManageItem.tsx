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
  IonContent,
  IonGrid,
  IonInput,
  IonLabel,
  IonPage,
  IonRow,
} from "@ionic/react";
import { Box, Building2, Camera, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router";

const ManageItem = () => {

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Photo gallery hooks
  const {
    savedPhotos,
    setSavedPhotos,
    takePhoto,
    importPhoto,
    savePhoto,
    deletePhoto,
  } = usePhotoGallery();

  const handleTakePhoto = async () => {
    const newPhoto = await takePhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
  };

  const handleGetPhotoFromGallery = async () => {
    const newPhoto = await importPhoto();
    if (!newPhoto) return;
    const savedPhoto = await savePhoto(newPhoto);
    if (!savedPhoto) return;
    setSavedPhotos([...savedPhotos, savedPhoto]);
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
  const [parentCategory, setParentCategory] = useState<Category>(notFoundAnyCategories);
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);

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

  const setEditData = async (itemId: number) => {
    try {
      // Datos de prueba estáticos
      // const item: Item = {
      //   id: itemId,
      //   name: "iPhone 13 Pro",
      //   image: "https://example.com/items/iphone13pro.jpg",
      //   category_id: 2,
      //   is_origin: true,
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

      // const category: Category = {
      //   id: 2,
      //   name: "Móviles",
      //   icon: "mobile",
      //   color: "green",
      //   type: 1,
      //   parent_id: 1,
      // };

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
    setSavedPhotos(
      savedPhotos.map((p) => (p.filepath === photo.filepath ? savedPhoto : p))
    );
  };

  // Cargar datos de edición si estamos en modo edición
  useEffect(() => {

    if (editMode && id) {
      setEditData(parseInt(id)).catch((error) => {
        console.error("Error al cargar los datos de edición:", error);
        history.replace("/app/items");
      });
    } else {
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
    }
  }, [editMode, id, history]);

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

  useEffect(() => {
    if (selectedSubcategory) {
      setSelectedCategory(selectedSubcategory);
    } else if (parentCategory) {
      setSelectedCategory(parentCategory);
    } else {
      setSelectedCategory(null);
    }
  }, [parentCategory, selectedSubcategory]);

  useEffect(() => {
    if (
      !parentCategory ||
      selectedSubcategory?.parent_id !== parentCategory.id
    ) {
      setSelectedSubcategory(null);
    }
  }, [parentCategory]);

  const goBack = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    window.history.back();
  };

  return (
    <IonPage>
      <IonContent>
        <IonGrid>
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
          <IonRow className="flex flex-col gap-2 px-5 py-10">
            <span className="text-2xl font-bold flex gap-2 items-center">
              {item?.is_origin ? (
                <>
                  <Building2 size={24} />
                  {t("common.origin")}
                </>
              ) : (
                <>
                  <Box size={24} />
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
              // Si hay foto, mostrar la imagen y botón para reemplazarla
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