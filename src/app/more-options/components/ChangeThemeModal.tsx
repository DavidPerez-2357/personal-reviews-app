import { IonModal } from "@ionic/react";
import { Moon, Sun } from "lucide-react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Storage } from '@ionic/storage'; // Import Storage

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

  // Function to change the theme using Ionic's dark class and save preference
  const handleChangeTheme = async (theme: 'light' | 'dark') => {
    await storage.create(); // Ensure storage is ready
    document.body.classList.toggle('ion-palette-dark', theme === 'dark');
    await storage.set('appTheme', theme); // Save the theme preference
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
        <div className="flex flex-col gap-5">
          <div
            // Style using Ionic variables or standard CSS for consistency
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer bg-[var(--ion-background-color-step-50)] hover:bg-[var(--ion-background-color-step-100)]"
            onClick={() => handleChangeTheme("light")}
          >
            <Sun size={30} className="text-[var(--ion-text-color)]" />
            <span className="text-2xl text-[var(--ion-text-color)]">
              {t("more-options.light-mode")}
            </span>
          </div>
          <div
            // Style using Ionic variables or standard CSS for consistency
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer bg-[var(--ion-background-color-step-50)] hover:bg-[var(--ion-background-color-step-100)]"
            onClick={() => handleChangeTheme("dark")}
          >
            <Moon size={30} className="text-[var(--ion-text-color)]" />
            <span className="text-2xl text-[var(--ion-text-color)]">
              {t("more-options.dark-mode")}
            </span>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default ChangeThemeModal;
