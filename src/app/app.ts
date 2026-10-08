import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MenuManagementComponent } from './features/navigation/components/menu-management.component';
import { MenuManagenmentHeader } from './features/navigation/components/menu-managenment-header.component';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [
    RouterOutlet,
    MenuManagementComponent,
    MenuManagenmentHeader,
  ],
  template: `
    <ngx-menu-managenment-header></ngx-menu-managenment-header>
    @if (routed) { <router-outlet /> }
    @else { <ngx-menu-management /> }
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      :root {
        .cdk-drop-list.cdk-drop-list-dragging
          .menu-tree__tree-item.cdk-drag-placeholder {
          outline: 2px dashed var(--mat-sys-primary);
        }
        .cdk-drop-list.cdk-drop-list-dragging
          .menu-tree__tree-item:not(.cdk-drag-placeholder) {
          opacity: 0.8;
        }
      }
    `,
  ],
})
export class App {
  // Retain direct Component rendering for existing federation consumers.
  readonly routed = !!inject(ActivatedRoute).routeConfig?.children?.length;
}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
