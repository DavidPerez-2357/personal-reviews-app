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
import { Ban, Boxes } from "lucide-react";
import { getCategories } from "@services/category-service";
import { useTranslation } from "react-i18next";
import "../styles/reviewPage.css";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CategoryColors } from "@/shared/enums/colors";

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

  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        
        const cats = await getCategories();
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
      // Case 2: no parent selected
      categoryFilter = null;
    } else {
      const children = childList;
      if (children.length === 0) {
        // Case 1: parent with no children
        categoryFilter = [parent.name];
      } else {
        switch (subcatMode) {
          case "auto":
            // Case 3: parent + automatic subcategories
            categoryFilter = [parent.name, ...children.map((c) => c.name)];
            break;
          case "all":
            // Case 5: parent + all subcategories
            categoryFilter = [parent.name, ...children.map((c) => c.name)];
            break;
          case "none":
            // Case 6: parent + no subcategories
            categoryFilter = [parent.name];
            break;
          case "specific":
            // Case 4: parent + specific subcategories
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
    onApply(resetFilters);
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
            {t("review-page.filter")}
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
              <IonLabel className="truncate max-w-full text-xs">{t('review-page.all')}</IonLabel>
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
                  {t('review-page.all')}
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
                    {t('review-page.none')}
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
                  style={{ backgroundColor: CategoryColors[sub.color] }}
                >
                  <FontAwesomeIcon icon={sub.icon as IconName} className="fa-xl"/>
                </div>
                <IonLabel className="truncate max-w-full text-xs">
                  {sub.name}
                </IonLabel>
              </div>
            ))}
          </div>
        </div>

        <div>
          <IonLabel position="stacked">{t('review-page.rating')}</IonLabel>
          <div className="px-4">
            <IonRange
              aria-label={t("review-page.rating")}
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
            {t('review-page.reset')}
          </IonButton>
          <IonButton
            onClick={handleApply}
            color="tertiary"
            expand="block"
            size="large"
            className="flex-1"
          >
            {t('review-page.apply')}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default React.memo(ReviewCardFilterModal);
