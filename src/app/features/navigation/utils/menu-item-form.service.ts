import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  CreateMenuItemDto,
  MenuItemDto
} from '@tmdjr/service-navigational-list-contracts';
import {
  Domain,
  MenuItemFormData,
  ParentOption,
  State,
  StructuralSubtype,
} from '../models/menu.types';
import { descendantIds } from './menu-projections';

@Injectable()
export class MenuItemFormService {
  private readonly fb = inject(FormBuilder);

  /**
   * Creates a reactive form for menu item with all required validators
   */
  createMenuItemForm() {
    return this.fb.nonNullable.group({
      menuItemText: ['', Validators.required],
      routePath: ['', Validators.required],
      description: [''],
      tooltipText: [''],
      domain: new FormControl<Domain | ''>('', { nonNullable: true, validators: [Validators.required] }),
      structuralSubtype: new FormControl<StructuralSubtype | ''>('', { nonNullable: true, validators: [Validators.required] }),
      state: new FormControl<State | ''>('', { nonNullable: true, validators: [Validators.required] }),
      sortId: [0, [Validators.required, Validators.min(0)]],
      role: new FormControl<MenuItemDto['role']>('none', { nonNullable: true }),
      archived: [false],
      navSvgPath: [''],
      headerSvgPath: [''],
      parentId: [''], // Optional parent selection
    });
  }

  /**
   * Populates form with existing menu item data
   */
  populateForm(form: MenuItemForm, item: MenuItemDto): void {
    form.patchValue({
      menuItemText: item.menuItemText,
      routePath: item.routePath,
      description: item.description || '',
      tooltipText: item.tooltipText || '',
      domain: item.domain,
      structuralSubtype: item.structuralSubtype,
      state: item.state,
      sortId: item.sortId,
      role: item.role,
      archived: item.archived,
      navSvgPath: item.navSvgPath || '',
      headerSvgPath: item.headerSvgPath || '',
      parentId: item.parentId || '',
    });
  }

  /**
   * Validates form and marks all fields as touched if invalid
   * @returns true if form is valid, false otherwise
   */
  validateForm(form: MenuItemForm): boolean {
    if (form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    return true;
  }

  toDto(formData: MenuItemFormData): CreateMenuItemDto {
    return {
      ...formData,
      description: formData.description || undefined,
      tooltipText: formData.tooltipText || undefined,
      navSvgPath: formData.navSvgPath || undefined,
      headerSvgPath: formData.headerSvgPath || undefined,
      // Root moves for existing children are orchestrated by MenuStore via /sort.
      parentId: formData.parentId || undefined,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Gets available parent options for a menu item
   * Filters out the current item being edited and its descendants to prevent circular references
   */
  getParentOptions(
    domain: Domain | '',
    structuralSubtype: StructuralSubtype | '',
    state: State | '',
    allItems: MenuItemDto[],
    currentItemId?: string
  ): ParentOption[] {
    const excluded = currentItemId ? descendantIds(allItems, currentItemId) : new Set<string>();
    return [
      { value: '', label: 'None (Root Level)' },
      ...allItems.filter(item => item.domain === domain && item.structuralSubtype === structuralSubtype
        && item.state === state && !item.archived && !excluded.has(item._id))
        .map(item => ({ value: item._id, label: `${item.menuItemText} (${item.routePath})` })),
    ];
  }
}

export type MenuItemForm = ReturnType<MenuItemFormService['createMenuItemForm']>;
