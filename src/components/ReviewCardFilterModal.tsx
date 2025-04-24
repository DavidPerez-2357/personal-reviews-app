import React, { useEffect, useRef, useState } from "react";
import {
  IonModal,
  IonButton,
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonIcon,
  IonRange,
} from "@ionic/react";
import { initDB } from "@/database-service";
import { Category } from "@/dto/Category";
import "@pages/reviewPage.css";
import { Ban, Boxes } from "lucide-react";
import { getCategories } from "@/services/category-service";

interface FilterModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onApply: (filters: {
    rating?: { lower: number; upper: number };
    category?: string[] | null;
  }) => void;
}

type SubcatMode = "auto" | "all" | "none" | "specific";

const ReviewCardFilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onDismiss,
  onApply,
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [ratingFilter, setRating] = useState<
    { lower: number; upper: number } | undefined
  >({ lower: 0, upper: 5 });

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parent, setParent] = useState<Category | null>(null);
  const [subcatMode, setSubcatMode] = useState<SubcatMode>("auto");
  const [specificSubs, setSpecificSubs] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // const cats = await getCategories();
        const cats: Category[] = [
          { id: 1, name: "Comida", type: 1, color: "#FF0000", icon: "accessibility-outline", parent_id: null, created_at: "2023-01-01T10:00:00Z", updated_at: "2023-01-01T10:00:00Z" },
          { id: 2, name: "Electrónica", type: 2, color: "#0000FF", icon: "people", parent_id: null, created_at: "2023-02-01T11:00:00Z", updated_at: "2023-02-01T11:00:00Z" },
          { id: 3, name: "Ambiente", type: 3, color: "#008000", icon: "leaf", parent_id: null, created_at: "2023-03-01T12:00:00Z", updated_at: "2023-03-01T12:00:00Z" },
          { id: 4, name: "Precio", type: 4, color: "#FFFF00", icon: "cash", parent_id: null, created_at: "2023-04-01T13:00:00Z", updated_at: "2023-04-01T13:00:00Z" },
          { id: 5, name: "Limpieza", type: 5, color: "#800080", icon: "water", parent_id: null, created_at: "2023-05-01T14:00:00Z", updated_at: "2023-05-01T14:00:00Z" },
          { id: 6, name: "Atención", type: 6, color: "#FFA500", icon: "hand", parent_id: null, created_at: "2023-06-01T15:00:00Z", updated_at: "2023-06-01T15:00:00Z" },
          { id: 8, name: "Postres", type: 1, color: "#FFB6C1", icon: "ice-cream", parent_id: 1, created_at: "2023-08-01T10:00:00Z", updated_at: "2023-08-01T10:00:00Z" },
          { id: 9, name: "Bebidas", type: 1, color: "#ADD8E6", icon: "wine", parent_id: 1, created_at: "2023-08-02T10:00:00Z", updated_at: "2023-08-02T10:00:00Z" },
          { id: 10, name: "Móviles", type: 2, color: "#87CEEB", icon: "phone-portrait", parent_id: 2, created_at: "2023-08-03T10:00:00Z", updated_at: "2023-08-03T10:00:00Z" },
          { id: 11, name: "Ordenadores", type: 2, color: "#4682B4", icon: "laptop", parent_id: 2, created_at: "2023-08-04T10:00:00Z", updated_at: "2023-08-04T10:00:00Z" },
        ];
        setAllCategories(cats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSelectParent = (cat: Category | null) => {
    setParent(cat);
    setSubcatMode("auto");
    setSpecificSubs([]);
  };

  const childList = parent
    ? allCategories.filter((c) => c.parent_id === parent.id)
    : [];

  const handleSelectSub = (sub: Category) => {
    setSpecificSubs([sub]);
    setSubcatMode("specific");
  };

  const handleApply = () => {
    let categoryFilter: string[] | null;

    if (!parent) {
      // Caso 2: todas las categorías
      categoryFilter = null;
    } else {
      const children = childList;
      if (children.length === 0) {
        // Caso 1: categoría sin subcategorías
        categoryFilter = [parent.name];
      } else {
        switch (subcatMode) {
          case "auto":
            // Caso 3: padre + todas las subcategorías
            categoryFilter = [parent.name, ...children.map((c) => c.name)];
            break;
          case "all":
            // Caso 5: padre + todas las subcategorías
            categoryFilter = [parent.name, ...children.map((c) => c.name)];
            break;
          case "none":
            // Caso 6: sólo padre
            categoryFilter = [parent.name];
            break;
          case "specific":
            // Caso 4: subcategoría específica
            categoryFilter = specificSubs.map((c) => c.name);
            break;
        }
      }
    }

    onApply({
      rating: ratingFilter,
      category: categoryFilter,
    });
    onDismiss();
  };

  const handleReset = () => {
    const resetFilters = {
      rating: { lower: 0, upper: 5 },
      category: null,
    };

    setRating(resetFilters.rating);
    setParent(null);
    setSubcatMode("auto");
    setSpecificSubs([]);
    onApply(resetFilters); // Asegúrate de pasar los valores reseteados
    onDismiss();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      ref={modal}
      initialBreakpoint={0.80}
      breakpoints={[0, 0.80]}
      className="modal-filter"
    >
      <IonHeader className="ion-no-border ion-padding-top">
        <IonToolbar>
          <IonTitle className="text-2xl font-bold text-start ion-padding">
            Filtros
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ">
        <div className="pb-5 w-full">
          <div className="flex gap-x-4 items-center overflow-x-auto pb-3 pt-2 ps-2">
            <div
              className="flex flex-col items-center gap-2 justify-center w-23"
              onClick={() => handleSelectParent(null)}
            >
              <div
                className={`size-23 rounded-2xl flex items-center bg-[var(--ion-color-secondary)] justify-center ${
                  !parent ? "selected" : ""
                }`}
              >
                <Boxes size={40}></Boxes>
              </div>
              <IonLabel className="truncate max-w-full text-xs">Todos</IonLabel>
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
                      parent?.id === cat.id ? "selected" : ""
                    }`}
                    style={{ backgroundColor: cat.color }}
                  >
                    <IonIcon name={cat.icon}></IonIcon>
                  </div>
                  <IonLabel className="truncate max-w-full text-xs">
                    {cat.name}
                  </IonLabel>
                </div>
              ))}
          </div>

          <div
            className={`subcategories flex gap-x-4 items-center overflow-x-auto whitespace-nowrap pb-3 pt-2 ps-2 ${
              childList.length > 0 ? "show" : ""
            }`}
          >
            {childList.length > 0 && (
              <>
                <div
                  className="flex flex-col items-center gap-2 justify-center min-w-[5.5rem]"
                  onClick={() => setSubcatMode("all")}
                >
                  <div
                    className={`size-23 rounded-2xl flex items-center justify-center ${
                      (subcatMode === "all" ||
                        (parent && subcatMode === "auto")) &&
                      childList.length > 0
                        ? "selected"
                        : ""
                    }`}
                    style={{ backgroundColor: "var(--ion-color-secondary)" }}
                  >
                    <Boxes size={40}></Boxes>
                  </div>
                  <IonLabel className="truncate max-w-full text-xs">
                    Todas
                  </IonLabel>
                </div>

                <div
                  className="flex flex-col items-center gap-2 justify-center min-w-[5.5rem]"
                  onClick={() => setSubcatMode("none")}
                >
                  <div
                    className={`size-23 rounded-2xl flex items-center justify-center ${
                      subcatMode === "none" ? "selected" : ""
                    }`}
                    style={{ backgroundColor: "var(--ion-color-secondary)" }}
                  >
                    <Ban size={40}></Ban>
                  </div>
                  <IonLabel className="truncate max-w-full text-xs">
                    Solo {parent?.name}
                  </IonLabel>
                </div>
              </>
            )}

            {childList.map((sub) => (
              <div
                className="flex flex-col items-center gap-2 justify-center min-w-[5.5rem]"
                key={sub.id}
                onClick={() => handleSelectSub(sub)}
              >
                <div
                  className={`size-23 rounded-2xl flex items-center justify-center ${
                    subcatMode === "specific" && specificSubs[0]?.id === sub.id
                      ? "selected"
                      : ""
                  }`}
                  style={{ backgroundColor: sub.color }}
                >
                  <IonIcon name={sub.icon}></IonIcon>
                </div>
                <IonLabel className="truncate max-w-full text-xs">
                  {sub.name}
                </IonLabel>
              </div>
            ))}
          </div>
        </div>

        <div>
          <IonLabel position="stacked">Calificación</IonLabel>
          <div className="px-4">
            <IonRange
              aria-label="Calificación"
              dualKnobs={true}
              ticks={true}
              snaps={true}
              min={0}
              max={5}
              pin={true}
              pinFormatter={(value: number) => `${value}`}
              value={ratingFilter || { lower: 0, upper: 5 }}
              onIonChange={(e) =>
                setRating(e.detail.value as { lower: number; upper: number })
              }
            ></IonRange>
          </div>
        </div>

        <div className="flex justify-between mt-6 gap-4">
          <IonButton
            onClick={handleReset}
            color="secondary"
            expand="block"
            size="large"
            className="flex-1"
          >
            Reiniciar
          </IonButton>
          <IonButton
            onClick={handleApply}
            color="tertiary"
            expand="block"
            size="large"
            className="flex-1"
          >
            Aplicar
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default React.memo(ReviewCardFilterModal);
