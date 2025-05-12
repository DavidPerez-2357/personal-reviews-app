import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Storage } from '@ionic/storage'; // Import Storage

import '@styles/global.css';

import FooterTabBar from './FooterTabBar';

import { SafeArea } from '@capacitor-community/safe-area';
import { useEffect, useState } from 'react';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons';
import { openDatabase } from '@/shared/database/database-service';

library.add(fas);

setupIonicReact();

const App: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const storage = new Storage(); // Instantiate Storage

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Storage
        await storage.create();

        // Determine and apply theme
        let currentAppTheme = await storage.get('appTheme');
        if (!currentAppTheme) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          currentAppTheme = prefersDark ? 'dark' : 'light';
          await storage.set('appTheme', currentAppTheme); // Save the detected/default theme
        }
        document.body.classList.toggle('ion-palette-dark', currentAppTheme === 'dark');

        // Initialize Safe Area
        await SafeArea.enable({
          config: {
            customColorsForSystemBars: true,
            statusBarColor: '#00000000',
            statusBarContent: currentAppTheme === 'dark' ? 'light' : 'dark', // Adjust status bar content based on theme
            navigationBarColor: '#00000000',
            navigationBarContent: currentAppTheme === 'dark' ? 'light' : 'dark', // Adjust nav bar content based on theme
          },
        });

        // Initialize Database
        await openDatabase();
        console.log('Base de datos inicializada');

        // Uncomment if you need test data
        /*
        await insertTestCategories();
        await insertTestCategoryRating();
        await insertTestItems();
        console.log('Datos de prueba insertados');
        */

      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setDbReady(true);
      }
    };

    initializeApp();
  }, []); // Empty dependency array ensures this runs only once on mount

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
