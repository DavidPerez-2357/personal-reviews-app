import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";

interface PreviewPhotoModalProps {
    photoUrl: string;
    isOpen: boolean;
    onClose?: () => void;
}

const PreviewPhotoModal = ({
    photoUrl,
    isOpen,
    onClose = () => { },
}: PreviewPhotoModalProps) => {
    const { t } = useTranslation();
    return (
        <IonModal
            isOpen={isOpen}
            onIonModalDidDismiss={onClose}
            breakpoints={[0, 0.25, 0.5, 0.75, 1]}
            initialBreakpoint={0.5}
            canDismiss={true}
            className="preview-photo-modal"
        >
            <IonHeader className="ion-no-border ion-padding">
                <IonToolbar>
                    <IonTitle className="font-bold text-start text-2xl">{t("common.preview")}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>{t("common.close")}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="max-h-full overflow-y-scroll">
                <img src={photoUrl} alt="Preview" className="preview" />
            </IonContent>
        </IonModal>
    );
};

export default PreviewPhotoModal;
