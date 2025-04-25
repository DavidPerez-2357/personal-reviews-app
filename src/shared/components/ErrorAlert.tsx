import { IonAlert, IonModal } from "@ionic/react";

interface ErrorAlertProps {
    title?: string;
    subTitle?: string;
    message?: string;
    buttons?: string[];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onDidDismiss?: () => void;
}

const ErrorAlert = ({isOpen, setIsOpen , title, subTitle, message, buttons, onDidDismiss}: ErrorAlertProps) => {
    return (
        <IonAlert
        isOpen={isOpen}
        onDidDismiss={() => {setIsOpen(false) ; onDidDismiss && onDidDismiss()}}
        header={title}
        subHeader={subTitle}
        message={message}
        buttons={buttons ? buttons : ["OK"]}
      />
    );
}

export default ErrorAlert;