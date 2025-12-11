import { IonButton, IonContent, IonHeader, IonInput, IonLabel, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface CreateRatingModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSubmit: (name: string) => void;
}

const CreateRatingModal = ({ isOpen, setIsOpen, onSubmit }: CreateRatingModalProps) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const input = useRef<HTMLIonInputElement>(null);

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={() => setIsOpen(false)}
            breakpoints={[0, 0.3, 0.5]}
            initialBreakpoint={0.5}
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
                        value={name}
                        ref={input}
                        onIonInput={(e) => setName(e.detail.value!)}
                        required
                    />
                    <IonButton
                        expand="block"
                        color="tertiary"
                        className="mt-5"
                        onClick={() => {
                            // Handle the creation of the rating here
                            setIsOpen(false);
                            onSubmit(name);
                            setName('');
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