import React, { useEffect, useState } from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet, IonRippleEffect } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, useLocation } from 'react-router';

import { Box, Ellipsis, Star } from 'lucide-react';

import '@styles/FooterTabBar.css';
import { useTranslation } from 'react-i18next';
import ManageItemReview from '@/app/manage-review/ManageItemReview';
import ViewAllReviews from '@/app/view-all-reviews/ViewAllReviews';
import { MoreOptions } from '@/app/more-options/moreOptions';
import ViewItem from '@/app/view-item/ViewItem';
import ManageItem from '@/app/manage-item/ManageItem';
import ViewAllItems from './view-all-items/ViewAllItems';
import ManageCategory from './manage-category/ManageCategory';

const FooterTabBar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState(location.pathname.split('/')[2] || 'reviews');

  useEffect(() => {
    if (location.pathname.startsWith('/app/reviews')) {
      setSelectedTab('reviews');
    } else if (location.pathname.startsWith('/app/items')) {
      setSelectedTab('items');
    } else if (location.pathname.startsWith('/app/more')) {
      setSelectedTab('more');
    }
  }, [location]);


  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet id="main">
          <Route path="/app/reviews" component={ViewAllReviews} exact={true} />
          <Route path="/app/reviews/create" component={ManageItemReview} exact={true} />
          <Route path="/app/reviews/:id/edit" component={ManageItemReview} exact={true} />
          <Route path="/app/reviews/create/item/:itemId" component={ManageItemReview} exact={true} />

          <Route path="/app/items/:id/viewItem" component={ViewItem} exact={true} />
          <Route path="/app/items/create" component={ManageItem} exact={true} />
          <Route path="/app/items/:id/edit" component={ManageItem} exact={true} />

          <Route path="/app/more/categories/create" component={ManageCategory} exact={true} />
          <Route path="/app/more/categories/:id/edit" component={ManageCategory} exact={true} />
          <Route path="/app/more/categories/:id/subcategories/create" component={ManageCategory} exact={true} />

          <Route path="/app/items" exact={true} component={ViewAllItems} />
          <Route path="/app/more" exact={true} component={MoreOptions} />
          <Redirect path="/app" to="/app/reviews" exact={true} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom" className='tab-bar'>
          <IonTabButton tab="home" href="/app/reviews" onClick={() => setSelectedTab('reviews')} className='ion-activatable ripple-parent circle'>
            <Star size={selectedTab === 'reviews' ? 40 : 35} />
            {selectedTab !== 'reviews' && <IonLabel>{t('common.reviews')}</IonLabel>}
            <IonRippleEffect></IonRippleEffect>
          </IonTabButton>

          <IonTabButton tab="items" href="/app/items" onClick={() => setSelectedTab('items')} className='ion-activatable ripple-parent circle'>
            <Box size={selectedTab === 'items' ? 40 : 35} />
            {selectedTab !== 'items' && <IonLabel>{t('common.items')}</IonLabel>}
            <IonRippleEffect></IonRippleEffect>
          </IonTabButton>

          <IonTabButton tab="more" href="/app/more" onClick={() => setSelectedTab('more')} className='ion-activatable ripple-parent circle'>
            <Ellipsis size={selectedTab === 'more' ? 40 : 35} />
            {selectedTab !== 'more' && <IonLabel>{t('common.more')}</IonLabel>}
            <IonRippleEffect></IonRippleEffect>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
}

export default FooterTabBar;