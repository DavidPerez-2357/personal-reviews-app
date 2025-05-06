import { IonModal } from "@ionic/react";
import { Moon, Sun, Check } from "lucide-react"; // Import Check
import React, { useRef, useEffect, useState } from "react"; // Import useEffect and useState
import { useTranslation } from "react-i18next";
import { Storage } from "@ionic/storage"; // Import Storage

interface ChangeThemeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const ChangeThemeModal: React.FC<ChangeThemeModalProps> = ({
  isOpen,
  onDismiss,
}: ChangeThemeModalProps) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const { t } = useTranslation();
  const storage = new Storage(); // Create storage instance
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light"); // State for current theme

  useEffect(() => {
    const loadTheme = async () => {
      await storage.create();
      const savedTheme = await storage.get("appTheme");
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        // Apply the theme immediately when the modal opens if it's already saved
        document.body.classList.toggle("ion-palette-dark", savedTheme === "dark");
      }
    };
    if (isOpen) {
      loadTheme();
    }
  }, [isOpen]); // Reload theme when modal opens

  // Function to change the theme using Ionic's dark class and save preference
  const handleChangeTheme = async (theme: "light" | "dark") => {
    await storage.create(); // Ensure storage is ready
    document.body.classList.toggle("ion-palette-dark", theme === "dark");
    await storage.set("appTheme", theme); // Save the theme preference
    setCurrentTheme(theme); // Update current theme state
    onDismiss();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      ref={modal}
      initialBreakpoint={0.8}
      breakpoints={[0, 0.8]}
    >
      {/* Apply Ionic variables for consistent styling */}
      <div className="flex flex-col gap-5 p-5 bg-[var(--ion-background-color)]">
        <h1 className="text-4xl font-bold text-start text-[var(--ion-text-color)]">
          {t("more-options.change-theme")}
        </h1>
        <div
          className="flex flex-col gap-5 overflow-y-auto"
          style={{ maxHeight: "60vh" }}
        >
          {/* Use consistent styling for theme options */}
          <div
            // Style using Ionic variables or standard CSS for consistency
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer bg-[var(--ion-background-color-step-50)] hover:bg-[var(--ion-background-color-step-100)]"
            onClick={() => handleChangeTheme("light")}
          >
            <Sun size={30} className="text-[var(--ion-text-color)]" />
            <span className="text-lg text-[var(--ion-text-color)] flex-grow">
              {t("more-options.light-mode")}
            </span>
            {currentTheme === "light" && <Check size={24} className="text-[var(--ion-color-primary)]" />}
          </div>
          <div
            // Style using Ionic variables or standard CSS for consistency
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer bg-[var(--ion-background-color-step-50)] hover:bg-[var(--ion-background-color-step-100)]"
            onClick={() => handleChangeTheme("dark")}
          >
            <Moon size={30} className="text-[var(--ion-text-color)]" />
            <span className="text-lg text-[var(--ion-text-color)] flex-grow">
              {t("more-options.dark-mode")}
            </span>
            {currentTheme === "dark" && <Check size={24} className="text-[var(--ion-color-primary)]" />}
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default ChangeThemeModal;
