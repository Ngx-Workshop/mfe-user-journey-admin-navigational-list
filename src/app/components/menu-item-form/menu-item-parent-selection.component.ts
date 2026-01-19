
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { Subject, combineLatest, startWith, takeUntil } from 'rxjs';
import { MenuApiService } from '../../services/menu-api.service';
import { MenuItemFormService } from '../../services/menu-item-form.service';
import {
  Domain,
  ParentOption,
  State,
  StructuralSubtype,
} from '../../types/menu.types';

@Component({
  selector: 'ngx-menu-item-parent-selection',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
],
  template: `
    <div class="form-section" [formGroup]="form">
      <h3>Hierarchy</h3>

      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Parent Item</mat-label>
          <mat-select
            formControlName="parentId"
            [disabled]="loading()"
          >
            @for (option of parentOptions(); track option.value) {
            <mat-option
              [value]="option.value"
              [disabled]="option.disabled"
            >
              {{ option.label }}
            </mat-option>
            }
          </mat-select>
          <mat-hint>
            Select a parent item to create a hierarchical
            relationship, or choose "None" for a root-level item.
          </mat-hint>
          @if (loading()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
          }
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
      .form-section {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
        padding: 1rem;
      }

      .form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--mat-sys-primary);
      }

      .form-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .form-row mat-form-field {
        flex: 1;
        min-width: 300px;
      }

      mat-spinner {
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
        }

        .form-row mat-form-field {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemParentSelectionComponent
  implements OnInit, OnDestroy
{
  @Input({ required: true }) form!: FormGroup;
  @Input() currentItemId?: string; // For edit mode to prevent circular references

  private readonly menuApiService = inject(MenuApiService);
  private readonly formService = inject(MenuItemFormService);
  private readonly destroy$ = new Subject<void>();

  loading = signal(false);
  parentOptions = signal<ParentOption[]>([
    { value: '', label: 'None (Root Level)' },
  ]);

  ngOnInit(): void {
    // Watch for changes in domain, structuralSubtype, and state to update parent options
    combineLatest([
      this.form
        .get('domain')!
        .valueChanges.pipe(startWith(this.form.get('domain')!.value)),
      this.form
        .get('structuralSubtype')!
        .valueChanges.pipe(
          startWith(this.form.get('structuralSubtype')!.value)
        ),
      this.form
        .get('state')!
        .valueChanges.pipe(startWith(this.form.get('state')!.value)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([domain, structuralSubtype, state]) => {
        if (domain && structuralSubtype && state) {
          this.loadParentOptions(domain, structuralSubtype, state);
        } else {
          // Reset to default if any required field is empty
          this.parentOptions.set([
            { value: '', label: 'None (Root Level)' },
          ]);
          this.form.get('parentId')?.setValue('');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadParentOptions(
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State
  ): void {
    this.loading.set(true);

    this.menuApiService
      .findByDomainStructuralSubtypeAndState$(
        domain,
        structuralSubtype,
        state,
        false
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: MenuItemDto[]) => {
          const options = this.formService.getParentOptions(
            domain,
            structuralSubtype,
            state,
            items,
            this.currentItemId
          );
          this.parentOptions.set(options);
          this.loading.set(false);

          // If the current parentId is no longer valid, reset it
          const currentParentId = this.form.get('parentId')?.value;
          const isValidParent = options.some(
            (option) =>
              option.value === currentParentId && !option.disabled
          );

          if (currentParentId && !isValidParent) {
            this.form.get('parentId')?.setValue('');
          }
        },
        error: (error) => {
          console.error('Error loading parent options:', error);
          this.parentOptions.set([
            { value: '', label: 'None (Root Level)' },
          ]);
          this.loading.set(false);
        },
      });
  }
}
