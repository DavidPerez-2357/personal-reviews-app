import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import '@styles/global.css';

import FooterTabBar from './FooterTabBar';

import { SafeArea } from '@capacitor-community/safe-area';
import { useEffect, useState } from 'react';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons';
import { initDB } from '@/database-service';
import { insertTestCategories, insertTestCategoryRating } from '../shared/services/category-service';
import { insertTestItems } from '../shared/services/item-service';

library.add(fas);

setupIonicReact();

const App: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await SafeArea.enable({
          config: {
            customColorsForSystemBars: true,
            statusBarColor: '#00000000',
            statusBarContent: 'light',
            navigationBarColor: '#00000000',
            navigationBarContent: 'light',
          },
        });

        await initDB(); // Esperamos a que termine de inicializar la DB
        /* await insertTestCategories(); // Insertamos categorías de prueba
        await insertTestCategoryRating(); // Insertamos ratings de prueba
        await insertTestItems(); // Insertamos ítems de prueba */
        console.log('Base de datos inicializada y datos de prueba insertados');
      } catch (error) {
        console.error('Error during app init');
      } finally {
        setDbReady(true);
      }
    };

    init();
  }, []);

  if (!dbReady) {
    return (
      <IonApp>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Inicializando base de datos...</div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/app" component={FooterTabBar} />
          <Route exact path="/">
            <Redirect to="/app" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
