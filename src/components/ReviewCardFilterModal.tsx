import React, { useEffect, useRef, useState } from "react";
import {
  IonModal,
  IonButton,
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { getCategories } from "@services/category-service";
import { Category } from "@dto/category/Category";
import { initDB } from "@/database-service";

interface FilterModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onApply: (filters: {
    keyword: string;
    rating?: number;
    category?: string;
  }) => void;
}

const ReviewCardFilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onDismiss,
  onApply,
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  // Estados locales para los filtros adicionales
  const [keyword, setKeyword] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<string>("");

  const [categoriesDatabase, setCategoriesDatabase] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then((categories: Category[]) => {
        setCategoriesDatabase(categories.map((cat: Category) => cat.name));
      })
      .catch((err) => {
        console.error("Error al obtener categorías:", err);
        setError("Error al cargar categorías.");
      });
  }, []);

  // Se incluyen todos los filtros en el callback onApply
  const handleApply = () => {
    onApply({ keyword, rating, category });
    onDismiss();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      ref={modal}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 0.75, 1]}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Filtros</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="p-4">
        <IonItem>
          <IonLabel position="stacked">Categoría</IonLabel>
          <IonSelect
            value={category}
            placeholder="Selecciona una categoría"
            onIonChange={(e) => setCategory(e.detail.value)}
          >
            <IonSelectOption value="">Todas</IonSelectOption>
            {categoriesDatabase.map((cat, index) => (
              <IonSelectOption key={index} value={cat}>
                {cat}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Palabra clave</IonLabel>
          <IonInput
            value={keyword}
            placeholder="Buscar..."
            onIonChange={(e) => setKeyword(e.detail.value!)}
          />
        </IonItem>
        <IonItem className="mt-4">
          <IonLabel position="stacked">Calificación mínima</IonLabel>
          <IonInput
            type="number"
            value={rating}
            placeholder="1-5"
            onIonChange={(e) =>
              setRating(e.detail.value ? parseInt(e.detail.value, 10) : undefined)
            }
          />
        </IonItem>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end mt-6 space-x-3">
          <IonButton onClick={onDismiss} color="medium">
            Reiniciar
          </IonButton>
          <IonButton onClick={handleApply} color="primary">
            Aplicar
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default React.memo(ReviewCardFilterModal);
