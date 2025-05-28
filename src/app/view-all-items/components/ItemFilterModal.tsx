import React, { useEffect, useRef, useState } from "react";
import {
  IonModal,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonRange,
} from "@ionic/react";
import { Category } from "@dto/Category";
import { useTranslation } from "react-i18next";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CategoryColors } from "@/shared/enums/colors";
import { getCategories } from "@/shared/services/category-service";
import { Box, Building2 } from "lucide-react";
import { ItemType, SubCategoryFilterMode } from "@/shared/dto/Filter";

interface FilterModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onApplyFilters: (filters: {
    category?: string[] | null;
    type: ItemType
  }) => void;
}


const ItemFilterModal = ({
  isOpen,
  onDismiss,
  onApplyFilters: applyFilters,
}: FilterModalProps) => {
  // Refs
  const modal = useRef<HTMLIonModalElement>(null);

  // Categories state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subcategoryMode, setSubcategoryMode] = useState<SubCategoryFilterMode>("auto");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [itemType, setItemType] = useState<ItemType>('all');

  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();
        setAllCategories(categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

    // Handle parent category selection
    const filteredChildCategories = selectedCategory
    ? allCategories.filter((c) => c.parent_id === selectedCategory.id)
    : [];

  // Close modal when it is dismissed
  const handleSelectParent = (cat: Category | null) => {
    setSelectedCategory(cat);
    setSubcategoryMode("auto");
    setSelectedCategories([]);
  };

  // Handle subcategory selection
  const handleSelectSub = (subcategory: Category) => {
    setSelectedCategories([subcategory]);
    setSubcategoryMode("specific");
  };

  const handleApplyFilter = () => {
    // Determinar las categorías seleccionadas
    const selectedCategories = getSelectedCategories();
  
    // Aplicar los filtros con los valores seleccionados
    applyFilters({
      category: selectedCategories,
      type: itemType
    });
  
    // Cerrar el modal o panel de filtros
    onDismiss();
  };
  
  /**
   * Determina qué categorías deben aplicarse como filtro,
   * según la selección del usuario y el modo de subcategorías.
   */
  const getSelectedCategories = (): string[] | null => {
    if (!selectedCategory) {
      // Caso 2: Sin categoría padre seleccionada
      return null;
    }
  
    const hasNoChildren = filteredChildCategories.length === 0;
  
    if (hasNoChildren) {
      // Caso 1: Categoría padre sin subcategorías
      return [selectedCategory.name];
    }
  
    switch (subcategoryMode) {
      case "auto":
      case "all":
        // Caso 3 y 5: incluir padre + todas las subcategorías
        return [selectedCategory.name, ...filteredChildCategories.map((child) => child.name)];
  
      case "none":
        // Caso 6: solo la categoría padre
        return [selectedCategory.name];
  
      case "specific":
        // Caso 4: subcategorías específicas
        return selectedCategories.map((subcategory) => subcategory.name);
  
      default:
        // Si el modo no es reconocido, devolver solo la categoría padre como fallback seguro
        console.warn(`Modo de subcategoría no reconocido: ${subcategoryMode}`);
        return [selectedCategory.name];
    }
  };  

  // Handle reset button click
  const handleResetFilter = () => {
    const resetFilters: {category?: string[] | null, type: ItemType} = {
      category: null,
      type: 'all'
    };

    setSelectedCategory(null);
    setSubcategoryMode("auto");
    setSelectedCategories([]);
    setItemType('all');
    applyFilters(resetFilters);
    onDismiss();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      ref={modal}
      initialBreakpoint={0.70}
      breakpoints={[0, 0.70]}
      className="ion-no-padding ion-no-border"
    >
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{ paddingTop: 0, marginTop: 0 }}
        >
          <IonTitle className="text-2xl font-bold text-start p-5">
            {t("common.filter")}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4">
            <IonButton
              size="large"
              expand="block"
              style={{
                border: `4px solid ${itemType === 'item' ? 'var(--ion-color-tertiary)' : 'transparent'}`,
                borderRadius: '12px',
                transition: 'border-color 0.2s'
              }}
              color='secondary'
              onClick={() => itemType === 'item' ? setItemType('all') : setItemType('item')}
            >
              <div className="flex items-center flex-col text-sm gap-2 w-full">
                <Box size={30} />
                Solo elementos
              </div>
            </IonButton>

            <IonButton
              size="large"
              expand="block"
              style={{
                border: `4px solid ${itemType === 'origin' ? 'var(--ion-color-tertiary)' : 'transparent'}`,
                borderRadius: '12px',
                transition: 'border-color 0.2s'
              }}
              color='secondary'
              onClick={() => itemType === 'origin' ? setItemType('all') : setItemType('origin')}
            >
              <div className="flex items-center flex-col text-sm gap-2 w-full">
                <Building2 size={30} />
                Solo orígenes
              </div>
            </IonButton>
          </div>

          <div className="w-full">
            <div className="flex gap-x-4 items-center overflow-x-auto pb-3 pt-2 ps-2">
              <div
                className="flex flex-col items-center gap-2 justify-center w-23"
                onClick={() => handleSelectParent(null)}
              >
                <div
                  className={`size-23 rounded-2xl flex items-center bg-[var(--ion-color-secondary)] justify-center ${
                    !selectedCategory ? "selected" : ""
                  }`}
                >
                  <FontAwesomeIcon icon="boxes-stacked" className="fa-xl" />
                </div>
                <IonLabel className="truncate max-w-full text-xs">{t('common.all')}</IonLabel>
              </div>
              {allCategories
                .filter((c) => !c.parent_id)
                .map((cat) => (
                  <div
                    className="flex flex-col items-center gap-2 justify-center w-23"
                    key={cat.id}
                    onClick={() => handleSelectParent(cat)}
                  >
                    <div
                      className={`size-23 rounded-2xl flex items-center justify-center ${
                        selectedCategory?.id === cat.id ? "selected" : ""
                      }`}
                      style={{ backgroundColor: CategoryColors[cat.color] }}
                    >
                      <FontAwesomeIcon icon={cat.icon as IconName} className="fa-xl"/>
                    </div>
                    <IonLabel className="truncate max-w-full text-xs">
                      {cat.name}
                    </IonLabel>
                  </div>
                ))}
            </div>

            <div
              className={`subcategories flex gap-x-4 items-center overflow-x-auto whitespace-nowrap pb-3 pt-2 ps-2 ${
                filteredChildCategories.length > 0 ? "show" : ""
              }`}
            >
              {filteredChildCategories.length > 0 && (
                <>
                  <div
                    className="flex flex-col items-center gap-2 justify-center min-w-[5.5rem]"
                    onClick={() => setSubcategoryMode("all")}
                  >
                    <div
                      className={`size-23 rounded-2xl flex items-center justify-center ${
                        (subcategoryMode === "all" ||
                          (selectedCategory && subcategoryMode === "auto")) &&
                        filteredChildCategories.length > 0
                          ? "selected"
                          : ""
                      }`}
                      style={{ backgroundColor: "var(--ion-color-secondary)" }}
                    >
                      <FontAwesomeIcon icon="boxes-stacked" className="fa-xl" />
                    </div>
                    <IonLabel className="truncate max-w-full text-xs">
                    {t('common.all')}
                    </IonLabel>
                  </div>

                  <div
                    className="flex flex-col items-center gap-2 justify-center min-w-[5.5rem]"
                    onClick={() => setSubcategoryMode("none")}
                  >
                    <div
                      className={`size-23 rounded-2xl flex items-center justify-center ${
                        subcategoryMode === "none" ? "selected" : ""
                      }`}
                      style={{ backgroundColor: "var(--ion-color-secondary)" }}
                    >
                      <FontAwesomeIcon icon="ban" className="fa-xl" />
                    </div>
                    <IonLabel className="truncate max-w-full text-xs">
                      {t('review-page.none')}
                    </IonLabel>
                  </div>
                </>
              )}

              {filteredChildCategories.map((subcategory) => (
                <div
                  className="flex flex-col items-center gap-2 justify-center min-w-[5.5rem]"
                  key={subcategory.id}
                  onClick={() => handleSelectSub(subcategory)}
                >
                  <div
                    className={`size-23 rounded-2xl flex items-center justify-center ${
                      subcategoryMode === "specific" && selectedCategories[0]?.id === subcategory.id
                        ? "selected"
                        : ""
                    }`}
                    style={{ backgroundColor: CategoryColors[subcategory.color] }}
                  >
                    <FontAwesomeIcon icon={subcategory.icon as IconName} className="fa-xl"/>
                  </div>
                  <IonLabel className="truncate max-w-full text-xs">
                    {subcategory.name}
                  </IonLabel>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-4 h-12">
            <IonButton
              onClick={handleResetFilter}
              color="secondary"
              expand="block"
              size="default"
              className="flex-1 text-base"
            >
              {t('common.clear')}
            </IonButton>
            <IonButton
              onClick={handleApplyFilter}
              color="tertiary"
              expand="block"
              size="default"
              className="flex-1 text-base"
            >
              {t('common.apply')}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ItemFilterModal;
