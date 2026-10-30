import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MenuManagementComponent } from './features/navigation/components/menu-management.component';

@Component({
  selector: 'ngx-seed-mfe',
  host: { class: 'menu-app ngx-design-system' },
  imports: [RouterOutlet, MenuManagementComponent],
  template: `
    @if (routed) {
      <router-outlet />
    } @else {
      <ngx-menu-management />
    }
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .menu-app {
        display: block;
        min-width: 0;
        min-height: 100dvh;
        color: var(--ngx-color-text);
        background: var(--ngx-color-canvas);
        .cdk-drop-list.cdk-drop-list-dragging
          .menu-tree__tree-item.cdk-drag-placeholder {
          outline: 2px dashed var(--ngx-color-primary);
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
  readonly routed =
    !!inject(ActivatedRoute).routeConfig?.children?.length;
}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
