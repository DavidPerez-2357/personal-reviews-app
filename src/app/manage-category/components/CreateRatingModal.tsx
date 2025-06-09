import { IonButton, IonContent, IonHeader, IonInput, IonLabel, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreateRatingModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const CreateRatingModal = ({ isOpen, setIsOpen }: CreateRatingModalProps) => {
    const { t } = useTranslation();
    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={() => setIsOpen(false)}
        >
            <IonHeader className="ion-no-border ion-padding-top">
                <IonToolbar>
                    <IonTitle className="ion-padding text-2xl text-start font-bold">{t('manage-category.create-rating')}</IonTitle>
                    <IonButton
                        slot="end"
                        fill="clear"
                        color="tertiary"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={25} />
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div className="flex flex-col gap-2">
                    <IonLabel>
                        {t('common.name')}
                    </IonLabel>
                    <IonInput
                        placeholder={t('manage-category.rating-name-placeholder')}
                        type="text"
                        fill="solid"
                        required
                    />
                    <IonButton
                        expand="block"
                        color="tertiary"
                        className="mt-5"
                        onClick={() => {
                            // Handle the creation of the rating here
                            setIsOpen(false);
                        }}
                    >
                        {t('common.create')}
                    </IonButton>
                </div>

            </IonContent>
        </IonModal>
    );
}

export default CreateRatingModal;