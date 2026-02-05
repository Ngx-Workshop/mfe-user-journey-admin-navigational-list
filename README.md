# Navigational List<br><sup>MFE User Journey - Admin</sup>

<img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/angular-gradient-wordmark.gif?raw=true" height="132" alt="Angular Logo" /> <img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/module-federation-logo.svg?raw=true" height="132" style="max-width: 100%;height: 132px;" alt="Module Federation" />

Angular micro-frontend (remote) for the **Admin Navigational List** user journey in the NGX Workshop ecosystem.

This Angular MFE provides a comprehensive menu management system for the Ngx-Workshop platform. It enables the creation, editing, and organization of navigational menus across different domains, structural subtypes, and states.

## Features

### 🎯 Core Functionality

- **CRUD Operations**: Create, read, update, delete, archive, and unarchive menu items
- **Advanced Filtering**: Filter by domain, structural subtype, state, authentication requirement, and search text
- **Hierarchical View**: Visualize menu structure organized by domain → structural subtype → state
- **Statistics Dashboard**: View comprehensive statistics about menu items
- **Real-time Updates**: Automatic refresh after operations

### 🏗️ Menu Hierarchy Structure

```
Domain (ADMIN | WORKSHOP)
└── Structural Subtype (HEADER | NAV | FOOTER)
    └── State (FULL | RELAXED | COMPACT)
        └── Menu Items (sorted by sortId)
```

### 📱 User Interface

- **List View**: Comprehensive table with filtering and search capabilities
- **Hierarchy View**: Tree-like visualization of the menu structure
- **Statistics View**: Dashboard showing menu statistics and distributions
- **Modal Forms**: User-friendly forms for creating and editing menu items

## Architecture

### Components

- **MenuManagementComponent**: Main container with tabs for different views
- **MenuListComponent**: Displays menu items in a filtered list/grid
- **MenuItemFormComponent**: Modal form for creating/editing menu items

### Services

- **MenuApiService**: Handles all API communication with the backend

### Types

- **menu.types.ts**: Comprehensive type definitions and constants

## API Integration

The system integrates with the NestJS backend using the `@tmdjr/service-navigational-list-contracts` package, which provides:

- Type-safe DTOs for all operations
- Complete OpenAPI schema integration
- Standardized request/response interfaces

### Supported Endpoints

- `GET /menu` - List menu items with filters
- `POST /menu` - Create new menu item
- `GET /menu/:id` - Get specific menu item
- `PATCH /menu/:id` - Update menu item
- `DELETE /menu/:id` - Delete menu item
- `PATCH /menu/:id/archive` - Archive menu item
- `PATCH /menu/:id/unarchive` - Unarchive menu item
- `GET /menu/hierarchy/:domain` - Get hierarchical view
- `POST /menu/domain/:domain/structural-subtype/:subtype/state/:state/reorder` - Reorder items

## Menu Item Properties

Each menu item includes:

- **Basic Info**: Text, route path, description, tooltip
- **Classification**: Domain, structural subtype, state
- **Configuration**: Sort ID, auth requirement, archived status
- **Icons**: Optional SVG paths for navigation and header display
- **Metadata**: Timestamps, version, database ID

## Development

### Running the Application

```bash
npm run dev:bundle
```

The application will be available at `http://localhost:4201`

### Building for Production

```bash
npm run build
```

### Key Dependencies

- **Angular 20**: Latest Angular framework
- **Angular Material**: UI component library
- **@tmdjr/service-navigational-list-contracts**: API contracts
- **Module Federation**: For micro-frontend architecture

## Usage Examples

### Creating a Menu Item

1. Navigate to the "List View" tab
2. Click "New Menu Item"
3. Fill in required fields:
   - Menu Item Text
   - Route Path
   - Domain
   - Structural Subtype
   - State
   - Sort ID
4. Optionally add description, tooltip, and SVG paths
5. Save to create the item

### Filtering Menu Items

- Use the filter section to narrow down results
- Combine multiple filters for precise results
- Use text search to find items by name, route, or description
- Toggle "Include Archived" to show/hide archived items

### Managing Menu Hierarchy

1. Switch to "Hierarchy View" tab
2. View organized structure by domain → subtype → state
3. Expand sections to see menu items
4. Items are automatically sorted by their Sort ID

### Viewing Statistics

1. Go to "Statistics" tab
2. See comprehensive metrics about your menu system
3. Track distribution across domains and structural types

## Best Practices

### Sort ID Management

- Use consistent increments (e.g., 10, 20, 30) to allow for easy insertion
- Reserve ranges for different types of menu items
- Consider logical grouping when assigning sort IDs

### Route Path Conventions

- Use consistent naming patterns
- Follow Angular route conventions
- Consider deep-linking requirements

### Domain Organization

- **ADMIN**: Administrative interfaces and tools
- **WORKSHOP**: User-facing workshop content and features

### Structural Subtype Usage

- **HEADER**: Top-level navigation and branding
- **NAV**: Main navigation menus
- **FOOTER**: Footer links and secondary navigation

### State Management

- **FULL**: Complete menu with all items visible
- **RELAXED**: Reduced menu with less critical items hidden
- **COMPACT**: Minimal menu for mobile or constrained spaces

## Troubleshooting

### Common Issues

1. **API Connection**: Ensure the backend service is running and accessible
2. **CORS Issues**: Verify CORS configuration on the backend
3. **Form Validation**: Check all required fields are filled correctly
4. **Route Conflicts**: Ensure route paths don't conflict with existing routes

### Error Handling

- All API errors are caught and displayed via snack bar notifications
- Form validation provides real-time feedback
- Network errors are handled gracefully with fallback states

## Contributing

When adding new features:

1. Follow the existing component structure
2. Use Angular Material components consistently
3. Implement proper error handling
4. Add TypeScript types for new data structures
5. Update this documentation

## License

This project is part of the Ngx-Workshop ecosystem.
