import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MenuManagementComponent } from './components/menu-management.component';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [MatButtonModule, MenuManagementComponent],
  template: ` <ngx-menu-management></ngx-menu-management> `,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      :root {
        .cdk-drop-list.cdk-drop-list-dragging
          .tree-item.cdk-drag-placeholder {
          outline: 2px dashed var(--mat-sys-primary);
        }
        .cdk-drop-list.cdk-drop-list-dragging
          .tree-item:not(.cdk-drag-placeholder) {
          opacity: 0.8;
        }
      }
    `,
  ],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
