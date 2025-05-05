import { IonModal } from "@ionic/react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next"; // Importar useTranslation
import SpainFlag from "../assets/ES-Spain.svg";
import UKFlag from "../assets/UK-UnitedKingdom.svg";

interface changeLenguageModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const changeLenguageModal: React.FC<changeLenguageModalProps> = ({
  isOpen,
  onDismiss,
}: changeLenguageModalProps) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const { t, i18n } = useTranslation(); // Obtener t y i18n

  // Función para cambiar el idioma
  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    onDismiss(); // Cerrar el modal después de cambiar el idioma
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
        <div className="flex flex-col gap-5">
          <div
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer" // Añadir cursor-pointer
            onClick={() => handleChangeLanguage("es")} // Llamar a handleChangeLanguage con 'es'
          >
            {/* Usar etiqueta img con la URL importada */}
            <img src={SpainFlag} alt="Spanish Flag" className="w-8 h-auto rounded-md" /> 
            <span className="text-2xl text-[var(--ion-text-color)]">
              {t("more-options.spanish")}
            </span>
          </div>
          <div
            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer" // Añadir cursor-pointer
            onClick={() => handleChangeLanguage("en")} // Llamar a handleChangeLanguage con 'en'
          >
            {/* Usar etiqueta img con la URL importada */}
            <img src={UKFlag} alt="UK Flag" className="w-8 h-auto rounded-md" /> 
            <span className="text-2xl text-[var(--ion-text-color)]">
              {t("more-options.english")}
            </span>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default changeLenguageModal;
