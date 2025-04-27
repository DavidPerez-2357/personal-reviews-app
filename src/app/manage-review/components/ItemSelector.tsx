import { ItemOption } from "@dto/Item";
import { getItemOptions } from "@/shared/services/item-service";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IonInput, IonItem, IonLabel, IonList } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ItemSelectorProps {
    selectedOption: ItemOption | null;
    setSelectedOption: (option: ItemOption | null) => void;
    itemName: string;
    setItemName: (name: string) => void;
}

export const ItemSelector = ({selectedOption, setSelectedOption, itemName, setItemName  }: ItemSelectorProps) => {
    const { t } = useTranslation();
    const [showOptions, setShowOptions] = useState(false);
    
    const [filteredOptions, setFilteredOptions] = useState<ItemOption[]>([]);
    const blurTimeout = useRef<NodeJS.Timeout>(null!);

    // Funcion que se ejecuta cada vez que cambia el valor del input o la opción seleccionada
    useEffect(() => {
    getItemOptions(itemName)
        .then((items) => {
            // Quitar la opción seleccionada de la lista de opciones
            if (selectedOption) {
                const index = items.findIndex(
                (option) => option.id === selectedOption.id
                );
                if (index !== -1) {
                items.splice(index, 1);
                }
            }
            setFilteredOptions(items);
        }).catch((error) => {
            console.error("Error fetching items");
        });
    }, [itemName, selectedOption]);

    const handleOptionClick = (option: ItemOption) => {
        setItemName(option.name);
        setSelectedOption(option);
        setShowOptions(false);
      };
    
      const handleBlur = () => {
        blurTimeout.current = setTimeout(() => setShowOptions(false), 150);
      };
    
      const handleFocus = () => {
        clearTimeout(blurTimeout.current);
        setShowOptions(true);
      };

    return (
        <div className="relative w-full">
            <IonInput
            value={itemName}
            onIonInput={(e) => {
                setItemName(e.detail.value!);
                setSelectedOption(null);
            }}
            onIonFocus={handleFocus}
            onIonBlur={handleBlur}
            placeholder={t("manage-item-review.item-input-placeholder")}
            className="w-full"
            fill="solid"
            />

            {showOptions && filteredOptions.length > 0 && (
            <IonList
                style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                }}
            >
                {filteredOptions.map((option) => (
                <IonItem
                    button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                >
                    {option.parent_category_icon && (<FontAwesomeIcon
                    icon={
                        option.parent_category_icon as IconName
                    }
                    className="mb-0.5"
                    />)}
                    <IonLabel className="text-sm ps-2">
                    {option.name}
                    </IonLabel>
                </IonItem>
                ))}
            </IonList>
            )}
        </div>
    )
}

export default ItemSelector;