/**
 * RBAC (Role-Based Access Control) Type Definitions
 * 
 * This file defines all types for the permission system.
 * The system is designed to be extensible - new permissions can be added
 * for future features without breaking existing code.
 */

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * Permission type - follows the pattern: feature.action
 * 
 * To add new features (e.g., maps, analytics), simply add new permissions here.
 * The permission matrix UI will automatically display them.
 */
export type Permission =
   // Rider Management
   | 'rider.add'
   | 'rider.edit'
   | 'rider.delete'
   | 'rider.view'
   | 'rider.status'
   // Category Management
   | 'category.add'
   | 'category.edit'
   | 'category.delete'
   | 'category.view'
   | 'category.assign'
   // Standing Management
   | 'standing.edit'
   | 'standing.view'
   | 'standing.lock'
   // Race Management
   | 'race.create'
   | 'race.edit'
   | 'race.delete'
   | 'race.start'
   | 'race.finish'
   | 'race.schedule'
   // Timing
   | 'timing.record'
   | 'timing.adjust'
   | 'timing.view'
   // Results
   | 'results.edit'
   | 'results.publish'
   | 'results.view'
// FUTURE: Add new permissions here as features are added
// | 'maps.add'
// | 'maps.edit'
// | 'maps.view'
// | 'analytics.view'
// | 'reports.generate'
// etc.

/**
 * For extensibility, we support string permissions beyond the typed ones.
 * This allows adding new permissions without updating the type definition.
 */
export type PermissionString = Permission | string;

// ============================================================================
// ROLES
// ============================================================================

/**
 * Default role types - these are pre-configured and cannot be deleted
 */
export type DefaultRoleType =
   | 'admin'
   | 'start-commissaire'
   | 'finish-commissaire'
   | 'timer-commissaire'
   | 'viewer';

/**
 * Role interface - supports both default and custom roles
 */
export interface Role {
   id: string;
   name: string; // Can be DefaultRoleType or any custom name
   displayName: string;
   description: string;
   permissions: PermissionString[];
   isDefault: boolean; // true for default roles (cannot be deleted)
   createdAt: Date;
   updatedAt: Date;
   color?: string; // Optional color for UI display
   icon?: string; // Optional icon for UI display
}

// ============================================================================
// USERS
// ============================================================================

/**
 * User/Commissaire with assigned role
 */
export interface User {
   id: string;
   name: string;
   email?: string;
   roleId: string;
   token: string;
   raceUuid?: string; // Optional: scope user to specific race
   isActive: boolean;
   createdAt: Date;
   expiresAt?: Date; // Optional token expiry
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Authentication token structure
 */
export interface AuthToken {
   token: string;
   userId: string;
   roleId: string;
   roleName: string;
   permissions: PermissionString[];
   raceUuid?: string; // Optional race scoping
   issuedAt: Date;
   expiresAt?: Date;
}

/**
 * Decoded token payload
 */
export interface TokenPayload {
   userId: string;
   roleId: string;
   roleName: string;
   permissions: PermissionString[];
   raceUuid?: string;
   iat: number; // Issued at (timestamp)
   exp?: number; // Expiry (timestamp)
}

// ============================================================================
// VIEW MODES
// ============================================================================

/**
 * View mode for pages - determines if user can interact or just watch
 */
export type ViewMode = 'watch' | 'edit';

/**
 * Page permissions - what user can do on a specific page
 */
export interface PagePermissions {
   canView: boolean;
   canEdit: boolean;
   mode: ViewMode;
   allowedActions: PermissionString[];
}

// ============================================================================
// PERMISSION REGISTRY (for extensibility)
// ============================================================================

/**
 * Permission definition with metadata
 */
export interface PermissionDefinition {
   key: PermissionString;
   label: string;
   description: string;
   requiresAdmin?: boolean; // Some permissions only for admin
}

/**
 * Group of related permissions (e.g., all rider permissions)
 */
export interface PermissionGroup {
   category: string; // e.g., "Rider Management", "Maps", "Analytics"
   description: string;
   permissions: PermissionDefinition[];
   isActive: boolean; // false if feature not yet implemented
   comingSoon?: boolean; // true for planned features
}

// ============================================================================
// STORE STATE TYPES
// ============================================================================

/**
 * Auth store state
 */
export interface AuthState {
   currentUser: User | null;
   token: string | null;
   isAuthenticated: boolean;
   permissions: PermissionString[];
   viewMode: ViewMode;

   // Actions
   login: (token: string) => Promise<boolean>;
   logout: () => void;
   hasPermission: (permission: PermissionString) => boolean;
   hasAnyPermission: (permissions: PermissionString[]) => boolean;
   hasAllPermissions: (permissions: PermissionString[]) => boolean;
   setViewMode: (mode: ViewMode) => void;
   checkTokenExpiry: () => boolean;
}

/**
 * RBAC store state (for admin management of roles/users)
 */
export interface RBACState {
   roles: Role[];
   users: User[];
   isLoading: boolean;
   error: string | null;

   // Actions
   getRoles: () => Promise<void>;
   getUsers: () => Promise<void>;
   createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Role>;
   updateRole: (roleId: string, updates: Partial<Role>) => Promise<void>;
   deleteRole: (roleId: string) => Promise<void>;
   createUser: (user: Omit<User, 'id' | 'token' | 'createdAt'>) => Promise<User>;
   generateUserToken: (userId: string, roleId: string, expiresIn?: number) => Promise<string>;
   revokeUser: (userId: string) => Promise<void>;
   deleteUser: (userId: string) => Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Token generation options
 */
export interface TokenGenerationOptions {
   userId?: string;
   roleId: string;
   name: string;
   email?: string;
   raceUuid?: string;
   expiresIn?: number; // milliseconds (e.g., 7 * 24 * 60 * 60 * 1000 = 7 days)
}

/**
 * Login credentials
 */
export interface LoginCredentials {
   token: string;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
   allowed: boolean;
   reason?: string;
   requiredPermission?: PermissionString;
}

// ============================================================================
// DEFAULT ROLES
// ============================================================================

/**
 * Default role definitions (used for seeding database)
 */
export const DEFAULT_ROLES: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
   {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full access to all features and settings',
      permissions: ['*'], // Wildcard = all permissions
      isDefault: true,
      color: '#EF4444',
      icon: '🔐'
   },
   {
      name: 'start-commissaire',
      displayName: 'Start Commissaire',
      description: 'Manages race start, standing, and pre-race operations',
      permissions: [
         'rider.view',
         'rider.status',
         'category.view',
         'category.assign',
         'standing.view',
         'standing.edit',
         'race.start',
         'race.schedule',
         'timing.view'
      ],
      isDefault: true,
      color: '#10B981',
      icon: '🚦'
   },
   {
      name: 'finish-commissaire',
      displayName: 'Finish Commissaire',
      description: 'Records finish times and manages race results',
      permissions: [
         'rider.view',
         'rider.status',
         'category.view',
         'timing.record',
         'timing.adjust',
         'timing.view',
         'results.view',
         'results.edit',
         'race.finish'
      ],
      isDefault: true,
      color: '#3B82F6',
      icon: '🏁'
   },
   {
      name: 'timer-commissaire',
      displayName: 'Timer Commissaire',
      description: 'Records and manages timing data',
      permissions: [
         'rider.view',
         'timing.record',
         'timing.view'
      ],
      isDefault: true,
      color: '#F59E0B',
      icon: '⏱️'
   },
   {
      name: 'viewer',
      displayName: 'Viewer',
      description: 'Read-only access to race information',
      permissions: [
         'rider.view',
         'category.view',
         'standing.view',
         'timing.view',
         'results.view'
      ],
      isDefault: true,
      color: '#6B7280',
      icon: '👁️'
   }
];

// ============================================================================
// PERMISSION GROUPS (for UI organization)
// ============================================================================

/**
 * Default permission groups - organizes permissions in the UI
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
   {
      category: 'Rider Management',
      description: 'Manage race participants',
      isActive: true,
      permissions: [
         { key: 'rider.view', label: 'View Riders', description: 'View rider list and details' },
         { key: 'rider.add', label: 'Add Riders', description: 'Add new riders to race' },
         { key: 'rider.edit', label: 'Edit Riders', description: 'Modify rider information' },
         { key: 'rider.delete', label: 'Delete Riders', description: 'Remove riders from race' },
         { key: 'rider.status', label: 'Update Status', description: 'Change rider status (DNS, DNF, DSQ)' }
      ]
   },
   {
      category: 'Category Management',
      description: 'Manage race categories',
      isActive: true,
      permissions: [
         { key: 'category.view', label: 'View Categories', description: 'View category list' },
         { key: 'category.add', label: 'Add Categories', description: 'Create new categories' },
         { key: 'category.edit', label: 'Edit Categories', description: 'Modify categories' },
         { key: 'category.delete', label: 'Delete Categories', description: 'Remove categories' },
         { key: 'category.assign', label: 'Assign Categories', description: 'Assign riders to categories' }
      ]
   },
   {
      category: 'Standing/Grid Management',
      description: 'Manage race starting positions',
      isActive: true,
      permissions: [
         { key: 'standing.view', label: 'View Standing', description: 'View starting grid positions' },
         { key: 'standing.edit', label: 'Edit Standing', description: 'Modify starting positions' },
         { key: 'standing.lock', label: 'Lock Standing', description: 'Finalize and lock starting grid' }
      ]
   },
   {
      category: 'Race Management',
      description: 'Control race operations',
      isActive: true,
      permissions: [
         { key: 'race.create', label: 'Create Races', description: 'Create new race events' },
         { key: 'race.edit', label: 'Edit Races', description: 'Modify race details' },
         { key: 'race.delete', label: 'Delete Races', description: 'Remove races', requiresAdmin: true },
         { key: 'race.start', label: 'Start Race', description: 'Start race and waves' },
         { key: 'race.finish', label: 'Finish Race', description: 'End race and finalize' },
         { key: 'race.schedule', label: 'Edit Schedule', description: 'Manage race schedule and waves' }
      ]
   },
   {
      category: 'Timing',
      description: 'Record and manage race times',
      isActive: true,
      permissions: [
         { key: 'timing.view', label: 'View Times', description: 'View lap and finish times' },
         { key: 'timing.record', label: 'Record Times', description: 'Record lap and finish times' },
         { key: 'timing.adjust', label: 'Adjust Times', description: 'Correct timing data' }
      ]
   },
   {
      category: 'Results',
      description: 'Manage race results',
      isActive: true,
      permissions: [
         { key: 'results.view', label: 'View Results', description: 'View race results' },
         { key: 'results.edit', label: 'Edit Results', description: 'Modify race results' },
         { key: 'results.publish', label: 'Publish Results', description: 'Publish official results' }
      ]
   }
];
