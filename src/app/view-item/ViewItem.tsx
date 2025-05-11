import React, { useEffect } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonBackButton } from '@ionic/react';
import { useParams } from 'react-router';
import { getItems } from '@/shared/services/item-service';
import { Item, ItemFull } from '@/shared/dto/Item';
import { Category } from '@/shared/dto/Category';

export const ViewItem = () => {

    const { id } = useParams<{ id: string }>();

    const [item, setItem] = React.useState<Item | null>(null);

    async function initializeData() {
      try {
        // const itemsFromDB = await getItems();

        const categories: Category[] = [
            { id: 1, name: "Electrónica", type: 1, color: "red", icon: "computer", parent_id: null },
            { id: 2, name: "Ropa", type: 2, color: "green", icon: "shirt", parent_id: null},
            { id: 3, name: "Hogar", type: 3, color: "blue", icon: "house", parent_id: null},
            { id: 4, name: "Juguetes", type: 4, color: "yellow", icon: "chess-knight", parent_id: null},
            { id: 5, name: "Deportes", type: 5, color: "gray", icon: "football", parent_id: null},
            { id: 6, name: "Libros", type: 6, color: "darkgray", icon: "book", parent_id: null},
            { id: 7, name: "Salud", type: 7, color: "turquoise", icon: "staff-snake", parent_id: null},
            { id: 8, name: "Belleza", type: 8, color: "purple", icon: "bath", parent_id: null},
            { id: 9, name: "Automóviles", type: 9, color: "red", icon: "car", parent_id: null},
            { id: 10, name: "Oficina", type: 10, color: "darkgray", icon: "file", parent_id: null},
            // Subcategorías
            { id: 11, name: "Smartphones", type: 1, color: "darkgray", icon: "mobile", parent_id: 1},
            { id: 12, name: "Portátiles", type: 1, color: "purple", icon: "laptop", parent_id: 1},
            { id: 13, name: "Zapatillas", type: 2, color: "green", icon: "shoe-prints", parent_id: 2},
            { id: 14, name: "Vestidos", type: 2, color: "red", icon: "person-dress", parent_id: 2},
            { id: 15, name: "Muebles", type: 3, color: "turquoise", icon: "couch", parent_id: 3},
            { id: 16, name: "Cocina", type: 3, color: "red", icon: "kitchen-set", parent_id: 3},
            { id: 17, name: "Libros Infantiles", type: 6, color: "purple", icon: "book-skull", parent_id: 6},
            { id: 18, name: "Maquillaje", type: 8, color: "green", icon: "soap", parent_id: 8},
            { id: 19, name: "Suplementos", type: 7, color: "blue", icon: "prescription-bottle", parent_id: 7},
            { id: 20, name: "Sillas", type: 3, color: "yellow", icon: "chair", parent_id: 3},
        ];

    const items: Item[] = [
        { id: 1, name: "iPhone 13", image: "iphone-13.jpg", category_id: 11 },
        { id: 2, name: "MacBook Air M1", image: "macbook-air.jpg", category_id: 12 },
        { id: 3, name: "Nike Air Force 1", image: "nike-airforce.jpg", category_id: 13 },
        { id: 4, name: "Zapatillas Adidas Ultraboost", image: "adidas-ultraboost.jpg", category_id: 13 },
        { id: 5, name: "Silla de oficina ergonómica", image: "silla-oficina.jpg",  category_id: 10 },
        { id: 6, name: "Cafetera Nespresso", image: "cafetera-nespresso.jpg", category_id: 15 },
        { id: 7, name: "Kindle Paperwhite", image: "kindle-paperwhite.jpg", category_id: 6 },
        { id: 8, name: "Mochila para portátil", image: "mochila-portatil.jpg", category_id: 10 },
        { id: 9, name: "Reloj Garmin Forerunner", image: "garmin-forerunner.jpg", category_id: 5 },
        { id: 10, name: "Sony WH-1000XM4", image: "sony-headphones.jpg", category_id: 1 },
        { id: 11, name: "Teclado mecánico Logitech", image: "logitech-teclado.jpg", category_id: 1 },
        { id: 12, name: "Guitarra Fender Stratocaster", image: "fender-guitarra.jpg", category_id: 4 },
        { id: 13, name: "Mueble modular para oficina", image: "mueble-oficina.jpg", category_id: 15 },
        { id: 14, name: "Silla gaming DXRacer", image: "dxracer-silla.jpg", category_id: 10 },
        { id: 15, name: "Suplemento Omega-3", image: "suplemento-omega3.jpg", category_id: 19 },
        { id: 16, name: "Lámpara de escritorio LED", image: "lampara-escritorio.jpg", category_id: 10 },
        { id: 17, name: "Smartwatch Samsung Galaxy", image: "samsung-smartwatch.jpg", category_id: 9 },
        { id: 18, name: "Juego de platos Corelle", image: "platos-corelle.jpg", category_id: 3 },
        { id: 19, name: "Silla ergonómica para oficina", image: "silla-ergonomica.jpg", category_id: 15 },
        { id: 20, name: "Altavoces Bose SoundLink", image: "bose-altavoces.jpg", category_id: 1 },
        { id: 21, name: "Auriculares Beats Studio", image: "beats-audifonos.jpg", category_id: 1 },
        { id: 22, name: "Sofá 3 plazas", image: "sofa-3-plazas.jpg", category_id: 15 },
        { id: 23, name: "Plancha de vapor Philips", image: "plancha-philips.jpg", category_id: 14 },
        { id: 24, name: "Cámara GoPro Hero 10", image: "gopro-hero10.jpg", category_id: 1 },
        { id: 25, name: "Pantalla LED 4K LG", image: "pantalla-lg.jpg", category_id: 1 }
        ];  

        const itemFromDB: ItemFull = {
            id: 1,
            name: "iPhone 13",
            image: "iphone-13.jpg",
            created_at: "2023-10-01",
            updated_at: "2023-10-01",
            category_id: 11,
            category_name: "Smartphones",
            category_icon: "mobile",
            category_color: "darkgray"
        }


        setItem(itemFromDB);
      } catch (err) {
        console.error("Error initializing data:", err);
      }
    }
    initializeData();

    return (
        <IonPage className="ion-padding review-page">
            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow className="ion-justify-content-center ion-align-items-center">
                        <IonCol size="12" className="ion-text-center">
                            <IonBackButton defaultHref="/app/items" color="tertiary" />
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