// Re-export from contracts for convenience
export type {
  AuthTestDto,
  CreateMenuItemDto,
  MenuItemDto,
  ReorderDto,
  UpdateMenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';

// Hierarchical reorder DTOs for the new API endpoints
export interface HierarchicalReorderItemDto {
  id: string; // Menu item ID
  sortId: number; // New position in the list
  parentId?: string; // New parent ID (null for root level)
  children?: HierarchicalReorderItemDto[]; // Child items
}

export interface HierarchicalReorderDto {
  items: HierarchicalReorderItemDto[];
}

// Import for local use
import type { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';

// Domain enum
export const DOMAIN = {
  ADMIN: 'ADMIN',
  WORKSHOP: 'WORKSHOP',
} as const;

export type Domain = (typeof DOMAIN)[keyof typeof DOMAIN];

// Structural Subtype enum
export const STRUCTURAL_SUBTYPE = {
  HEADER: 'HEADER',
  NAV: 'NAV',
  FOOTER: 'FOOTER',
} as const;

export type StructuralSubtype =
  (typeof STRUCTURAL_SUBTYPE)[keyof typeof STRUCTURAL_SUBTYPE];

// State enum
export const STATE = {
  FULL: 'FULL',
  RELAXED: 'RELAXED',
  COMPACT: 'COMPACT',
} as const;

export type State = (typeof STATE)[keyof typeof STATE];

// Filter interface for the menu list
export interface MenuFilter {
  domain?: Domain;
  structuralSubtype?: StructuralSubtype;
  state?: State;
  archived?: boolean;
  authRequired?: boolean;
  searchText?: string;
}

// Options for display purposes
export interface DomainOption {
  value: Domain;
  label: string;
}

export interface StructuralSubtypeOption {
  value: StructuralSubtype;
  label: string;
}

export interface StateOption {
  value: State;
  label: string;
}

// Parent selection option for form dropdown
export interface ParentOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Constants for dropdown options
export const DOMAIN_OPTIONS: DomainOption[] = [
  { value: DOMAIN.ADMIN, label: 'Admin' },
  { value: DOMAIN.WORKSHOP, label: 'Workshop' },
];

export const STRUCTURAL_SUBTYPE_OPTIONS: StructuralSubtypeOption[] = [
  { value: STRUCTURAL_SUBTYPE.HEADER, label: 'Header' },
  { value: STRUCTURAL_SUBTYPE.NAV, label: 'Navigation' },
  { value: STRUCTURAL_SUBTYPE.FOOTER, label: 'Footer' },
];

export const STATE_OPTIONS: StateOption[] = [
  { value: STATE.FULL, label: 'Full' },
  { value: STATE.RELAXED, label: 'Relaxed' },
  { value: STATE.COMPACT, label: 'Compact' },
];

// Menu hierarchy interface for displaying hierarchical data
export interface MenuHierarchy {
  domain: Domain;
  structuralSubtypes: {
    [key in StructuralSubtype]?: {
      states: {
        [key in State]?: MenuItemDto[];
      };
    };
  };
}

// Form mode for create/edit operations
export type FormMode = 'create' | 'edit';

// Form data interface
export interface MenuItemFormData {
  menuItemText: string;
  routePath: string;
  tooltipText?: string;
  navSvgPath?: string;
  headerSvgPath?: string;
  sortId: number;
  authRequired: boolean;
  domain: Domain;
  structuralSubtype: StructuralSubtype;
  state: State;
  description?: string;
  archived: boolean;
  parentId?: string;
}
