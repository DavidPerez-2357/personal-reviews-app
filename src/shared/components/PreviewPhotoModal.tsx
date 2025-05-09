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
import { Capacitor } from '@capacitor/core';
import { use, useEffect, useState } from "react";

interface PreviewPhotoModalProps {
    photoUrl: string;
    isOpen: boolean;
    onClose?: () => void;
    showActions?: boolean;
    onReplace?: () => void;
    onDelete?: () => void;
}

const PreviewPhotoModal = ({
    photoUrl,
    isOpen,
    onClose = () => { },
    showActions = false,
    onReplace = () => { },
    onDelete = () => { },
}: PreviewPhotoModalProps) => {
    const { t } = useTranslation();
    const [imageSrc, setImageSrc] = useState<string>("");
    
    useEffect(() => {
        // The photo is a file path on the device, so we need to convert it to a URL
        const filePath = Capacitor.convertFileSrc(photoUrl) ?? "";

        // Use the file path as the source for the image
        setImageSrc(filePath);
        console.log("Image Source:", imageSrc);
        }
    , [photoUrl]);
    

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
                {showActions && (
                    <div className="flex justify-between gap-4 pb-10 pt-1 px-5">
                        <IonButton
                            onClick={onDelete}
                            color="danger"
                            expand="block"
                            className="flex-1 text-lg h-12"
                        >
                        {t('common.delete')}
                        </IonButton>
                        <IonButton
                        onClick={onReplace}
                        color="tertiary"
                        expand="block"
                        className="flex-1 text-lg h-12"
                        >
                        {t('common.replace')}
                        </IonButton>
                    </div>
                )}
                <img src={imageSrc} alt="Preview" className="preview" />
            </IonContent>
        </IonModal>
    );
};

export default PreviewPhotoModal;
