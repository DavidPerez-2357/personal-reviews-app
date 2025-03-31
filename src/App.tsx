import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

import '@styles/global.css';

import FooterTabBar from './components/FooterTabBar';

import { SafeArea } from '@capacitor-community/safe-area';
import { useEffect } from 'react';
import { StatusBar } from '@capacitor/status-bar';


setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    SafeArea.enable({
      config: {
        customColorsForSystemBars: true,
        statusBarColor: '#00000000', // transparent
        statusBarContent: 'light',
        navigationBarColor: '#00000000', // transparent
        navigationBarContent: 'light',
      },
    });
    

    StatusBar.setOverlaysWebView({ overlay: true });
    StatusBar.setBackgroundColor({ color: '#00000000' });
  }, []);

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
