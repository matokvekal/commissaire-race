/**
 * useAuth Hook
 * 
 * Convenient hook for accessing authentication state and methods in components.
 * Provides easy access to user, permissions, and auth actions.
 */

import { useAuthStore } from '@/stores/authStore';
import type { PermissionString, ViewMode } from '@/types/rbac.types';

/**
 * Hook return type
 */
export interface UseAuthReturn {
   // State
   user: ReturnType<typeof useAuthStore>['currentUser'];
   token: string | null;
   isAuthenticated: boolean;
   permissions: PermissionString[];
   viewMode: ViewMode;
   isWatchMode: boolean;
   isEditMode: boolean;
   canEdit: boolean;

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
 * useAuth Hook
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, hasPermission, user } = useAuth();
 * 
 * if (!hasPermission('rider.edit')) {
 *   return <p>No permission to edit riders</p>;
 * }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
   // Get all auth state and actions
   const {
      currentUser,
      token,
      isAuthenticated,
      permissions,
      viewMode,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      setViewMode,
      checkTokenExpiry
   } = useAuthStore();

   // Computed values
   const isWatchMode = viewMode === 'watch';
   const isEditMode = viewMode === 'edit';
   const canEdit = isAuthenticated && isEditMode;

   return {
      // State
      user: currentUser,
      token,
      isAuthenticated,
      permissions,
      viewMode,
      isWatchMode,
      isEditMode,
      canEdit,

      // Actions
      login,
      logout,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      setViewMode,
      checkTokenExpiry
   };
};

/**
 * usePermission Hook
 * 
 * Simplified hook for checking a single permission.
 * Returns boolean indicating if user has the permission.
 * 
 * @example
 * ```tsx
 * const canEditRiders = usePermission('rider.edit');
 * 
 * if (!canEditRiders) {
 *   return null;
 * }
 * ```
 */
export const usePermission = (permission: PermissionString): boolean => {
   const hasPermission = useAuthStore(state => state.hasPermission);
   return hasPermission(permission);
};

/**
 * usePermissions Hook
 * 
 * Check multiple permissions at once.
 * Returns an object with the result for each permission.
 * 
 * @example
 * ```tsx
 * const { canAdd, canEdit, canDelete } = usePermissions({
 *   canAdd: 'rider.add',
 *   canEdit: 'rider.edit',
 *   canDelete: 'rider.delete'
 * });
 * ```
 */
export const usePermissions = <T extends Record<string, PermissionString>>(
   permissionMap: T
): Record<keyof T, boolean> => {
   const hasPermission = useAuthStore(state => state.hasPermission);

   const result = {} as Record<keyof T, boolean>;

   for (const key in permissionMap) {
      result[key] = hasPermission(permissionMap[key]);
   }

   return result;
};

/**
 * useViewMode Hook
 * 
 * Hook specifically for view mode management.
 * Useful for components that need to toggle between watch/edit modes.
 * 
 * @example
 * ```tsx
 * const { mode, isEditMode, setViewMode, canEdit } = useViewMode();
 * 
 * return (
 *   <div>
 *     {canEdit && (
 *       <button onClick={() => setViewMode(isEditMode ? 'watch' : 'edit')}>
 *         {isEditMode ? 'Switch to Watch' : 'Switch to Edit'}
 *       </button>
 *     )}
 *   </div>
 * );
 * ```
 */
export const useViewMode = () => {
   const viewMode = useAuthStore(state => state.viewMode);
   const setViewMode = useAuthStore(state => state.setViewMode);
   const isAuthenticated = useAuthStore(state => state.isAuthenticated);

   const isWatchMode = viewMode === 'watch';
   const isEditMode = viewMode === 'edit';
   const canEdit = isAuthenticated && isEditMode;

   return {
      mode: viewMode,
      isWatchMode,
      isEditMode,
      canEdit,
      setViewMode,
      toggleMode: () => setViewMode(isEditMode ? 'watch' : 'edit')
   };
};

export default useAuth;
