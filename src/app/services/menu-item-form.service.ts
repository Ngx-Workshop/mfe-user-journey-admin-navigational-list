import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CreateMenuItemDto,
  MenuItemDto,
  UpdateMenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MenuItemFormData } from '../types/menu.types';
import { MenuApiService } from './menu-api.service';

@Injectable({
  providedIn: 'root',
})
export class MenuItemFormService {
  private readonly fb = inject(FormBuilder);
  private readonly menuApi = inject(MenuApiService);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Creates a reactive form for menu item with all required validators
   */
  createMenuItemForm(): FormGroup {
    return this.fb.group({
      menuItemText: ['', Validators.required],
      routePath: ['', Validators.required],
      description: [''],
      tooltipText: [''],
      domain: ['', Validators.required],
      structuralSubtype: ['', Validators.required],
      state: ['', Validators.required],
      sortId: [0, [Validators.required, Validators.min(0)]],
      authRequired: [false],
      archived: [false],
      navSvgPath: [''],
      headerSvgPath: [''],
    });
  }

  /**
   * Populates form with existing menu item data
   */
  populateForm(form: FormGroup, item: MenuItemDto): void {
    form.patchValue({
      menuItemText: item.menuItemText,
      routePath: item.routePath,
      description: item.description || '',
      tooltipText: item.tooltipText || '',
      domain: item.domain,
      structuralSubtype: item.structuralSubtype,
      state: item.state,
      sortId: item.sortId,
      authRequired: item.authRequired,
      archived: item.archived,
      navSvgPath: item.navSvgPath || '',
      headerSvgPath: item.headerSvgPath || '',
    });
  }

  /**
   * Validates form and marks all fields as touched if invalid
   * @returns true if form is valid, false otherwise
   */
  validateForm(form: FormGroup): boolean {
    if (form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    return true;
  }

  /**
   * Transforms form data to CreateMenuItemDto
   */
  private transformToCreateDto(
    formData: MenuItemFormData
  ): CreateMenuItemDto {
    return {
      menuItemText: formData.menuItemText,
      routePath: formData.routePath,
      description: formData.description || undefined,
      tooltipText: formData.tooltipText || undefined,
      domain: formData.domain,
      structuralSubtype: formData.structuralSubtype,
      state: formData.state,
      sortId: formData.sortId,
      authRequired: formData.authRequired,
      archived: formData.archived,
      navSvgPath: formData.navSvgPath || undefined,
      headerSvgPath: formData.headerSvgPath || undefined,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Transforms form data to UpdateMenuItemDto
   */
  private transformToUpdateDto(
    formData: MenuItemFormData
  ): UpdateMenuItemDto {
    return {
      menuItemText: formData.menuItemText,
      routePath: formData.routePath,
      description: formData.description || undefined,
      tooltipText: formData.tooltipText || undefined,
      domain: formData.domain,
      structuralSubtype: formData.structuralSubtype,
      state: formData.state,
      sortId: formData.sortId,
      authRequired: formData.authRequired,
      archived: formData.archived,
      navSvgPath: formData.navSvgPath || undefined,
      headerSvgPath: formData.headerSvgPath || undefined,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Creates a new menu item with proper error handling and notifications
   */
  createMenuItem(
    formData: MenuItemFormData
  ): Observable<MenuItemDto> {
    const createDto = this.transformToCreateDto(formData);

    return this.menuApi.create$(createDto).pipe(
      tap({
        next: () => {
          this.snackBar.open(
            'Menu item created successfully',
            'Close',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error creating menu item:', error);
          this.snackBar.open('Failed to create menu item', 'Close', {
            duration: 5000,
          });
        },
      })
    );
  }

  /**
   * Updates an existing menu item with proper error handling and notifications
   */
  updateMenuItem(
    id: string,
    formData: MenuItemFormData
  ): Observable<MenuItemDto> {
    const updateDto = this.transformToUpdateDto(formData);

    return this.menuApi.update$(id, updateDto).pipe(
      tap({
        next: () => {
          this.snackBar.open(
            'Menu item updated successfully',
            'Close',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error updating menu item:', error);
          this.snackBar.open('Failed to update menu item', 'Close', {
            duration: 5000,
          });
        },
      })
    );
  }

  /**
   * Handles the save operation for both create and update modes
   */
  saveMenuItem(
    form: FormGroup,
    mode: 'create' | 'edit',
    existingItemId?: string
  ): Observable<MenuItemDto> {
    const formData = form.value as MenuItemFormData;

    if (mode === 'create') {
      return this.createMenuItem(formData);
    } else if (mode === 'edit' && existingItemId) {
      return this.updateMenuItem(existingItemId, formData);
    } else {
      throw new Error(
        'Invalid save operation: missing item ID for edit mode'
      );
    }
  }

  /**
   * Gets form validation error messages for display
   */
  getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field.errors['min']) {
      return `${this.getFieldDisplayName(
        fieldName
      )} must be 0 or greater`;
    }

    return 'Invalid value';
  }

  /**
   * Maps field names to display names for error messages
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      menuItemText: 'Menu item text',
      routePath: 'Route path',
      domain: 'Domain',
      structuralSubtype: 'Structural subtype',
      state: 'State',
      sortId: 'Sort ID',
      description: 'Description',
      tooltipText: 'Tooltip text',
      navSvgPath: 'Navigation SVG path',
      headerSvgPath: 'Header SVG path',
      authRequired: 'Authentication required',
      archived: 'Archived',
    };

    return displayNames[fieldName] || fieldName;
  }

  /**
   * Resets form to initial state
   */
  resetForm(form: FormGroup): void {
    form.reset();
    form.patchValue({
      menuItemText: '',
      routePath: '',
      description: '',
      tooltipText: '',
      domain: '',
      structuralSubtype: '',
      state: '',
      sortId: 0,
      authRequired: false,
      archived: false,
      navSvgPath: '',
      headerSvgPath: '',
    });
  }
}
