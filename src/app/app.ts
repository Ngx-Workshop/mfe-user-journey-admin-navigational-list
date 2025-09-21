import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MenuManagementComponent } from './components/menu-management.component';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [MatButtonModule, MenuManagementComponent],
  template: ` <ngx-menu-management></ngx-menu-management> `,
  styles: [``],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
