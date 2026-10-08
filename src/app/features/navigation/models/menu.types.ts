import {
  MenuHierarchyResponseDto,
  MenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';

export type MenuItemWithChildren = MenuItemDto & {
  children?: MenuItemWithChildren[];
};

export type MenuHierarchyWithChildren = Omit<
  MenuHierarchyResponseDto,
  'structuralSubtypes'
> & {
  structuralSubtypes: Record<
    string,
    {
      states?: Record<string, MenuItemWithChildren[]>;
    }
  >;
};

// Domain enum
export const ROLE: Record<string, MenuItemDto['role']> = {
  ADMIN: 'admin',
  PUBLISHER: 'publisher',
  REGULAR: 'regular',
  NONE: 'none',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

// Domain enum
export const DOMAIN: Record<string, MenuItemDto['domain']> = {
  ADMIN: 'ADMIN',
  WORKSHOP: 'WORKSHOP',
} as const;

export type Domain = (typeof DOMAIN)[keyof typeof DOMAIN];

// Structural Subtype enum
export const STRUCTURAL_SUBTYPE: Record<
  string,
  MenuItemDto['structuralSubtype']
> = {
  HEADER: 'HEADER',
  NAV: 'NAV',
  FOOTER: 'FOOTER',
} as const;

export type StructuralSubtype =
  (typeof STRUCTURAL_SUBTYPE)[keyof typeof STRUCTURAL_SUBTYPE];

// State enum
export const STATE: Record<string, MenuItemDto['state']> = {
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
  role?: Role;
  searchText?: string;
}

// Options for display purposes
export interface RoleOption {
  value: Role;
  label: string;
}

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

export const ROLE_OPTIONS: RoleOption[] = [
  { value: ROLE['NONE'], label: 'None' },
  { value: ROLE['ADMIN'], label: 'Admin' },
  { value: ROLE['PUBLISHER'], label: 'Publisher' },
  { value: ROLE['REGULAR'], label: 'Regular' },
];

// Constants for dropdown options
export const DOMAIN_OPTIONS: DomainOption[] = [
  { value: DOMAIN['ADMIN'], label: 'Admin' },
  { value: DOMAIN['WORKSHOP'], label: 'Workshop' },
];

export const STRUCTURAL_SUBTYPE_OPTIONS: StructuralSubtypeOption[] = [
  { value: STRUCTURAL_SUBTYPE['HEADER'], label: 'Header' },
  { value: STRUCTURAL_SUBTYPE['NAV'], label: 'Navigation' },
  { value: STRUCTURAL_SUBTYPE['FOOTER'], label: 'Footer' },
];

export const STATE_OPTIONS: StateOption[] = [
  { value: STATE['FULL'], label: 'Full' },
  { value: STATE['RELAXED'], label: 'Relaxed' },
  { value: STATE['COMPACT'], label: 'Compact' },
];

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
  domain: Domain;
  structuralSubtype: StructuralSubtype;
  state: State;
  description?: string;
  archived: boolean;
  parentId?: string;
  role: Role;
}
