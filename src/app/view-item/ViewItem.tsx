import React from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';

export const ViewItem = ({ id }: { id: number }) => {

    console.log("ViewItem component rendered with ID:", id);

    return (
        <IonPage className="ion-padding review-page">
            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow className="ion-justify-content-center ion-align-items-center">
                        <IonCol size="12" className="ion-text-center">
                            <h1>View Item</h1>
                            <p>Item ID: {id}</p>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default ViewItem;