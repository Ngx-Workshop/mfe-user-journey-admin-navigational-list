import { Route } from '@angular/router';
import App from './app';
import { MenuManagementComponent } from './features/navigation/components/menu-management.component';
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
      { path: 'hierarchy', redirectTo: '', pathMatch: 'full' },
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
