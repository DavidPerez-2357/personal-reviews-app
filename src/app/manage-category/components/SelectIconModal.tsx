import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonLabel, IonModal, IonRow, IonTitle, IonToolbar } from "@ionic/react";
import { useTranslation } from "react-i18next";
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";
import {InfoIcon, X } from "lucide-react";

interface SelectIconModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedIcon: IconName;
    setSelectedIcon: (iconName: IconName) => void;
}


const SelectIconModal = ({ isOpen, setIsOpen, selectedIcon, setSelectedIcon }: SelectIconModalProps) => {
    const { t } = useTranslation();
    const [icons, setIcons] = useState<any[]>([]);
    const [filteredIcons, setFilteredIcons] = useState<any[]>([]);
    const selectedIconElement = useRef<HTMLDivElement | null>(null);
    const [iconSearch, setIconSearch] = useState<string>('');

    useEffect(() => {
        const iconsMap = new Map<string, any>();
        Object.values(SolidIcons).forEach((icon: any) => {
            if (icon?.iconName && !iconsMap.has(icon.iconName)) {
                iconsMap.set(icon.iconName, icon);
            }
        });
        setIcons(Array.from(iconsMap.values()));
    }, []);

    useEffect(() => {
        if (iconSearch.trim() === '') {
            setFilteredIcons(icons);
        } else {
            const searchFormatted = iconSearch.toLowerCase().replace(/\s+/g, '-');
            const filtered = icons.filter(icon => icon.iconName.toLowerCase().includes(searchFormatted));
            setFilteredIcons(filtered);
        }
    }, [iconSearch, icons]);

    const scrollToSelectedIcon = () => {
        if (selectedIconElement.current) {
            selectedIconElement.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    return (
        <IonModal isOpen={isOpen}>
            <IonHeader className="ion-no-border ion-padding-top mt-5">
                <IonToolbar>
                    <IonTitle className="ion-padding text-2xl text-start font-bold">{t('manage-category.select-icon')}</IonTitle>
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
                <IonGrid className="flex flex-col gap-4">
                    <IonInput
                        value={iconSearch}
                        onIonInput={(e) => {
                            setIconSearch(e.detail.value!);
                        }}
                        placeholder={t("manage-category.search-icon-placeholder")}
                        className="w-full"
                        fill="solid"
                    />

                    <IonRow className="flex w-full">
                        <IonCol className="flex w-full">
                            <IonButton
                                color="tertiary"
                                className="w-full"
                                onClick={() => scrollToSelectedIcon()}
                            >
                                {t('manage-category.scroll-to-selected-icon')}
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    <IonRow className="grid grid-cols-[auto_1fr] py-6 items-center gap-4">
                        <IonCol className="">
                            <InfoIcon size={35} />
                        </IonCol>

                        <IonCol className="w-full">
                            <IonLabel className="text-lg">
                                {t('manage-category.all-icons-are-in-english')}
                            </IonLabel>
                        </IonCol>
                    </IonRow>

                    <div className="grid grid-cols-[repeat(auto-fill,minmax(75px,1fr))] gap-4">
                        {filteredIcons.map((icon) => (
                            <div
                                key={icon.iconName}
                                className={`flex flex-col justify-center gap-2 items-center px-4 py-2 rounded-lg ${selectedIcon === icon.iconName ? 'border-2 text-[var(--ion-color-primary)]' : ''}`}
                                onClick={() => setSelectedIcon(icon.iconName)}
                                ref={selectedIcon === icon.iconName ? selectedIconElement : null}
                            >
                                <FontAwesomeIcon icon={icon} size="3x" />
                                <span className="text-xs text-center">{icon.iconName.replace(/-/g, ' ')}</span>
                            </div>
                        ))}
                    </div>

                    <IonRow className="flex w-full">
                        <IonCol className="flex w-full">
                            <IonLabel className="text-sm text-center mt-2 w-full" color="secondary">
                                {t('manage-category.all-icons-are-from-fontawesome')}
                            </IonLabel>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonModal>
    );
};

export default SelectIconModal;