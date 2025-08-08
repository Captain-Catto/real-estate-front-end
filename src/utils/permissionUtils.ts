"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { useMemo } from "react";

/**
 * Utility function to verify if a user has specific permissions
 * @param requiredPermissions - Array of permissions needed
 * @param userHasPermission - Function that checks if user has a specific permission
 * @returns boolean - True if user has all required permissions
 */
export const verifyPermissions = (
  requiredPermissions: string[],
  userHasPermission: (permission: string) => boolean
): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No permissions required
  }

  // Check if user has all required permissions
  return requiredPermissions.every((permission) =>
    userHasPermission(permission)
  );
};

/**
 * Helper type to define permission keys to check
 */
export interface PermissionObject {
  [key: string]: boolean;
}

/**
 * Hook that checks if user has specific action permissions
 * @param permissionKeys - Array of permission keys to check
 * @returns object with boolean values for each permission
 */
export const useActionPermissions = (permissionKeys: string[]) => {
  const { can, isAdmin } = usePermissions();

  return useMemo(() => {
    const permissionStatus: Record<string, boolean> = {};

    // If user is admin, they have all permissions
    if (isAdmin) {
      permissionKeys.forEach((key) => {
        permissionStatus[key] = true;
      });
      return permissionStatus;
    }

    // Check each permission individually
    permissionKeys.forEach((key) => {
      permissionStatus[key] = can(key);
    });

    return permissionStatus;
  }, [permissionKeys, can, isAdmin]);
};

/**
 * Utility to check if user has all permissions from a list
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * Utility to check if user has any of the permissions from a list
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * Utility to group permissions by module for UI display
 */
export function groupPermissionsByModule(
  permissions: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  permissions.forEach((perm) => {
    const [module] = perm.split("_");
    if (!result[module]) {
      result[module] = [];
    }
    result[module].push(perm);
  });

  return result;
}
