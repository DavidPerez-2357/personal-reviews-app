import { IonModal } from "@ionic/react";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import SpainFlag from "../assets/ES-Spain.svg";
import UKFlag from "../assets/UK-UnitedKingdom.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Check } from "lucide-react";
import { Storage } from "@ionic/storage"; // Import Storage

interface changeLenguageModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const changeLenguageModal: React.FC<changeLenguageModalProps> = ({
  isOpen,
  onDismiss,
}: changeLenguageModalProps) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const { t, i18n } = useTranslation();
  const storage = new Storage(); // Create storage instance

  useEffect(() => {
    const loadLanguage = async () => {
      await storage.create(); // Ensure storage is ready
      const storedLang = await storage.get("language");
      if (storedLang) {
        i18n.changeLanguage(storedLang);
      }
    };
    loadLanguage();
  }, [i18n, storage]);

  const handleChangeLanguage = async (lang: string) => {
    await storage.create(); // Ensure storage is ready
    i18n.changeLanguage(lang);
    await storage.set("language", lang); // Save the language preference
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
      <div className="flex flex-col gap-5 p-5">
        <h1 className="text-4xl font-bold text-start text-[var(--ion-text-color)]">
          {t("more-options.change-language")}
        </h1>
        <div
          className="flex flex-col gap-5 overflow-y-auto"
          style={{ maxHeight: "60vh" }}
        >
          <div
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer bg-[var(--ion-background-color-step-50)] hover:bg-[var(--ion-background-color-step-100)]"
            onClick={() => handleChangeLanguage("es")}
          >
            <img src={SpainFlag} alt="Spanish Flag" className="w-8 h-auto rounded-md" />
            <span className="text-lg text-[var(--ion-text-color)] flex-grow">
              {t("more-options.spanish")}
            </span>
            {i18n.language === "es" && <Check size={24} className="text-[var(--ion-color-primary)]" />}
          </div>

          <div
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer bg-[var(--ion-background-color-step-50)] hover:bg-[var(--ion-background-color-step-100)]"
            onClick={() => handleChangeLanguage("en")}
          >
            <img src={UKFlag} alt="UK Flag" className="w-8 h-auto rounded-md" />
            <span className="text-lg text-[var(--ion-text-color)] flex-grow">
              {t("more-options.english")}
            </span>
            {i18n.language === "en" && <Check size={24} className="text-[var(--ion-color-primary)]" />}
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default changeLenguageModal;
