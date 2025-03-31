import React, { use } from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonRippleEffect, IonFooter, IonContent, IonToolbar } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { Route, Redirect, useLocation } from 'react-router';

import Home from '@pages/Home';
import { Box, Ellipsis, Star } from 'lucide-react';

import '@styles/FooterTabBar.css';
import { useTranslation } from 'react-i18next';



function FooterTabBar() {
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = React.useState(useLocation().pathname.split('/')[2] || 'reviews');

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/app/reviews" component={Home} exact={true} />
          <Route path="/app/items" component={Home} exact={true} />
          <Route path="/app/more" component={Home} exact={true} />
          <Redirect path="/app" to="/app/reviews" exact={true} />
        </IonRouterOutlet>
        
        <IonTabBar slot="bottom" className='tab-bar'>
          <IonTabButton tab="home" href="/app/reviews" onClick={() => setSelectedTab('reviews')} className='ion-activatable ripple-parent circle'>
            <Star size={selectedTab === 'reviews' ? 40 : 35} />
            {selectedTab !== 'reviews' && <IonLabel><h3>{t('words.reviews')}</h3></IonLabel>}
            <IonRippleEffect></IonRippleEffect>
          </IonTabButton>

          <IonTabButton tab="items" href="/app/items" onClick={() => setSelectedTab('items')} className='ion-activatable ripple-parent circle'>
            <Box size={selectedTab === 'items' ? 40 : 35} />
            {selectedTab !== 'items' && <IonLabel><h3>{t('words.items')}</h3></IonLabel>}
            <IonRippleEffect></IonRippleEffect>
          </IonTabButton>

          <IonTabButton tab="more" href="/app/more" onClick={() => setSelectedTab('more')} className='ion-activatable ripple-parent circle'>
            <Ellipsis size={selectedTab === 'more' ? 40 : 35} />
            {selectedTab !== 'more' && <IonLabel><h3>{t('common.more')}</h3></IonLabel>}
            <IonRippleEffect></IonRippleEffect>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
}

export default FooterTabBar;