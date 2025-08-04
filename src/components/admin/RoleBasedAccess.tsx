"use client";

import React from "react";
import { useAuth } from "../../hooks/useAuth";

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "employee")[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export default function RoleBasedAccess({
  children,
  allowedRoles,
  fallback = null,
  showFallback = false,
}: RoleBasedAccessProps) {
  const { hasRole } = useAuth();

  // Check if user has any of the allowed roles
  const hasRequiredRole = allowedRoles.some((role) => hasRole(role));

  if (!hasRequiredRole) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

// Helper component for admin-only content
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleBasedAccess allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

// Helper component for employee-accessible content
export function EmployeeAccess({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleBasedAccess allowedRoles={["admin", "employee"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}
