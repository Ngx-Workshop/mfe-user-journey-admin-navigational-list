import { Route } from '@angular/router';
import App from './app';
import { MenuManagementComponent } from './features/navigation/components/menu-management.component';
import { MenuHierarchyPageComponent } from './features/navigation/pages/menu-hierarchy-page.component';
import {
  MenuItemPageComponent,
  menuItemSavingGuard,
} from './features/navigation/pages/menu-item-page.component';

export const Routes: Route[] = [
  {
    path: '',
    component: App,
    children: [
      { path: '', component: MenuManagementComponent },
      { path: 'hierarchy', component: MenuHierarchyPageComponent },
      {
        path: 'create',
        component: MenuItemPageComponent,
        data: { mode: 'create' },
        canDeactivate: [menuItemSavingGuard],
      },
      {
        path: 'edit/:id',
        component: MenuItemPageComponent,
        data: { mode: 'edit' },
        canDeactivate: [menuItemSavingGuard],
      },
    ],
  },
];
