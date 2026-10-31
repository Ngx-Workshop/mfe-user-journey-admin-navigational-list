import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import {
  NgxBackground,
  NgxButton,
  NgxEntrance,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { MenuItemBasicInfoComponent } from '../components/menu-item-form/menu-item-basic-info.component';
import { MenuItemClassificationComponent } from '../components/menu-item-form/menu-item-classification.component';
import { MenuItemConfigurationComponent } from '../components/menu-item-form/menu-item-configuration.component';
import { MenuItemParentSelectionComponent } from '../components/menu-item-form/menu-item-parent-selection.component';
import { MenuItemPositionComponent } from '../components/menu-item-form/menu-item-position.component';
import { MenuItemSvgIconsComponent } from '../components/menu-item-form/menu-item-svg-icons.component';
import {
  DOMAIN_OPTIONS,
  ROLE_OPTIONS,
  STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS,
} from '../models/menu.types';
import { MenuItemFormService } from '../utils/menu-item-form.service';
import { MenuItemFormViewModel } from '../view-models/menu-item-form.view-model';
import { CreateMenuItemViewModel } from './create-menu-item-view-model';

@Component({
  selector: 'ngx-create-menu-item-page',
  providers: [
    MenuItemFormService,
    MenuItemFormViewModel,
    CreateMenuItemViewModel,
  ],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatStepperModule,
    NgxBackground,
    NgxButton,
    NgxEntrance,
    NgxPanel,
    MenuItemBasicInfoComponent,
    MenuItemClassificationComponent,
    MenuItemParentSelectionComponent,
    MenuItemConfigurationComponent,
    MenuItemSvgIconsComponent,
    MenuItemPositionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-background placement="viewport" />
    <ngx-panel
      ngxEntrance="fade"
      [heading]="model.heading()"
      [tone]="model.archived() ? 'secondary' : 'primary'"
      eyebrow="NAVIGATION CONFIGURATION"
      shape="stepped"
      background="glass"
    >
      <div ngxPanelHeader class="menu-create__header-actions">
        @if (model.editing) {
        <mat-checkbox
          [checked]="model.archived()"
          [disabled]="model.busy()"
          (change)="model.setArchived($event.checked)"
        >Archived</mat-checkbox>
        }
      </div>
      @if (model.editor.store.error()) {
      <div class="menu-create__error" role="alert">
        <p>
          {{ model.editor.store.error() }} Your entries are retained.
        </p>
        <button
          mat-flat-button
          ngxButton
          surface="outline"
          type="button"
          [disabled]="model.busy()"
          (click)="model.editor.store.refresh()"
        >
          Reload catalog
        </button>
      </div>
      }
      <form
        [id]="model.editor.formId"
        [formGroup]="model.form"
        (ngSubmit)="model.submit()"
      >
        <mat-stepper
          linear
          orientation="vertical"
          [selectedIndex]="model.step()"
          (selectionChange)="model.selectStep($event.selectedIndex)"
        >
          <mat-step
            label="Identity and access"
            [completed]="model.identityValid()"
            [editable]="!model.busy()"
          >
            <ng-template matStepContent>
              <p>
                Name the item, choose its navigation scope and set who
                can access it.
              </p>
              <div class="menu-create__fields">
                <ngx-menu-item-basic-info
                  [form]="model.form"
                  [embedded]="true"
                  [fields]="['menuItemText']"
                />
                <div class="menu-create__paired">
                  <ngx-menu-item-classification
                    [form]="model.form"
                    [embedded]="true"
                    [fields]="['domain']"
                    [domainOptions]="domainOptions"
                    [structuralSubtypeOptions]="placementOptions"
                    [stateOptions]="stateOptions"
                  />
                  <ngx-menu-item-configuration
                    [form]="model.form"
                    [embedded]="true"
                    [fields]="['role']"
                    [roleOptions]="roleOptions"
                  />
                </div>
                <ngx-menu-item-classification
                  [form]="model.form"
                  [embedded]="true"
                  [fields]="['structuralSubtype', 'state']"
                  [domainOptions]="domainOptions"
                  [structuralSubtypeOptions]="placementOptions"
                  [stateOptions]="stateOptions"
                />
              </div>
            </ng-template>
          </mat-step>
          <mat-step
            label="Route and position"
            [completed]="model.routingValid()"
            [editable]="!model.busy()"
          >
            <ng-template matStepContent>
              <p>
                Choose a route for the selected domain, then its
                parent and position.
              </p>
              <div class="menu-create__fields">
                <ngx-menu-item-basic-info
                  [form]="model.form"
                  [embedded]="true"
                  [fields]="['routePath']"
                  [routeState]="model.editor.routes.state()"
                  (retryRoutes)="model.editor.routes.reload()"
                />
                <div class="menu-create__paired">
                  <ngx-menu-item-parent-selection
                    [form]="model.form"
                    [embedded]="true"
                    [parentOptions]="model.editor.parentOptions()"
                    [loading]="model.editor.store.loading()"
                  />
                  <ngx-menu-item-position
                    [form]="model.form"
                    [options]="model.positionOptions()"
                  />
                </div>
              </div>
            </ng-template>
          </mat-step>
          <mat-step label="Presentation" [editable]="!model.busy()">
            <ng-template matStepContent>
              <p>Add optional icons and a description.</p>
              <div class="menu-create__fields">
                <!-- <ngx-menu-item-basic-info
                  [form]="model.form"
                  [embedded]="true"
                  [fields]="['tooltipText']"
                /> -->
                <ngx-menu-item-svg-icons
                  [form]="model.form"
                  [embedded]="true"
                  [columns]="2"
                />
                <ngx-menu-item-basic-info
                  [form]="model.form"
                  [embedded]="true"
                  [fields]="['description']"
                />
              </div>
            </ng-template>
          </mat-step>
        </mat-stepper>
      </form>
      <div ngxPanelActions class="menu-create__actions">
        @if (model.step() < 2) {
        <button
          mat-flat-button
          ngxButton
          shape="chevron"
          type="button"
          [disabled]="!model.canContinue()"
          (click)="model.next()"
        >
          {{
            model.step() === 0
              ? 'Continue to routing'
              : 'Continue to presentation'
          }}
        </button>
        } @else {
        <button
          mat-flat-button
          ngxButton
          shape="chevron"
          type="submit"
          [attr.form]="model.editor.formId"
          [disabled]="!model.canSave()"
        >
          {{
            model.editor.saving()
              ? model.savingLabel
              : model.submitLabel
          }}
        </button>
        }
      </div>
    </ngx-panel>
  `,
  styles: [
    `
      @use '@angular/material' as mat;

      :host {
        // @include mat.form-field-density(-3);

        // @include mat.form-field-overrides(
        //   (
        //     container-text-size: 14px,
        //     container-text-line-height: 20px,
        //   )
        // );

        position: relative;
        isolation: isolate;
        display: block;
        width: 100%;
        max-width: 765px;
        min-width: 0;
        margin-inline: auto;
      }
      mat-stepper {
        background: transparent;
        color: var(--ngx-color-text);
      }
      p {
        color: var(--ngx-color-muted);
        font-size: 0.8rem;
        line-height: 1.6;
      }
      .menu-create__header-actions {
        display: flex;
        justify-content: flex-end;
        white-space: nowrap;
      }
      .menu-create__fields {
        display: grid;
        gap: var(--ngx-space-6);
      }
      .menu-create__actions {
        display: flex;
        justify-content: flex-end;
        width: 100%;
      }
      .menu-create__error {
        margin-bottom: 16px;
        padding: 12px;
        border: 1px solid var(--ngx-color-error);
      }
      .menu-create__error p {
        color: var(--ngx-color-error);
        margin: 0 0 8px;
      }
      .menu-create__paired {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--ngx-space-4);
      }
      .menu-create__fields > :not(.menu-create__paired),
      .menu-create__paired > * {
        display: block;
        min-width: 0;
      }
      @media (max-width: 768px) {
        .menu-create__paired {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `,
  ],
})
export class CreateMenuItemPage {
  readonly model = inject(CreateMenuItemViewModel);
  readonly domainOptions = DOMAIN_OPTIONS;
  readonly placementOptions = STRUCTURAL_SUBTYPE_OPTIONS;
  readonly stateOptions = STATE_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
}
