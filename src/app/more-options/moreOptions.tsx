import { IonCol, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Globe, Palette } from "lucide-react";
import { useState, useRef } from "react"; // Importar useState y useRef
import ChangeLanguageModal from "./components/ChangeLanguageModal"; // Importar el modal
import ChangeThemeModal from "./components/ChangeThemeModal"; // Importar el modal
import { useTranslation } from "react-i18next";

export const MoreOptions = () => {
    // Estado para controlar la visibilidad del modal
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false); // Estado para el modal de tema

     const { t } = useTranslation();

    // Función para abrir el modal
    const openLanguageModal = () => {
        setIsLanguageModalOpen(true);
    };

    // Función para cerrar el modal
    const closeLanguageModal = () => {
        setIsLanguageModalOpen(false);
    };

    // Función para abrir el modal de tema
    const openThemeModal = () => {
        setIsThemeModalOpen(true);
    };

    // Función para cerrar el modal de tema
    const closeThemeModal = () => {
        setIsThemeModalOpen(false);
    };

    

    return (
        <IonPage className="safe-area-top p-5">
            <IonContent>
                <div className="flex flex-col gap-5">
                    <IonHeader className="ion-no-border ion-padding-top">
                        <IonToolbar>
                            <IonTitle className="text-4xl font-bold text-start text-[var(--ion-text-color)]">
                                {t("more-options.more-options")}
                            </IonTitle>
                        </IonToolbar>
                    </IonHeader>

                    <div className="flex flex-col gap-5">
                        <div 
                            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md cursor-pointer" // Añadir cursor-pointer para indicar que es clickeable
                            onClick={openLanguageModal}
                        >
                            <Globe size={30}></Globe>
                            <span className="text-2xl text-[var(--ion-text-color)]"> {t("more-options.language")}</span>
                        </div>
                        <div 
                            className="flex items-center gap-5 p-5 border-2 border-[var(--ion-color-secondary)] rounded-md"
                            onClick={openThemeModal}
                        >
                            <Palette size={30}></Palette>
                            <span className="text-2xl text-[var(--ion-text-color)]"> {t("more-options.theme")}</span>
                        </div>
                    </div>
                </div>

                <ChangeLanguageModal 
                    isOpen={isLanguageModalOpen} 
                    onDismiss={closeLanguageModal}
                />

                <ChangeThemeModal
                    isOpen={isThemeModalOpen} 
                    onDismiss={closeThemeModal}
                />

            </IonContent>
        </IonPage>
    );
};