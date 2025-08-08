# Frontend Auth Component Migration Guide

## Overview

The frontend authentication components have been consolidated into a unified `ProtectionGuard` system. This guide explains the migration from the old fragmented system to the new unified approach.

## What Changed

### Before (Old System)

- `PagePermissionGuard` - Page-level permission protection with redirects
- `PermissionGuard` - Component-level permission protection
- `RoleGuard` - Role-based protection with redirects
- `RoleBasedAccess` - Simple role-based conditional rendering

### After (New Unified System)

- `ProtectionGuard` - Single configurable component for all protection needs
- Convenience components for common patterns

## New Unified Protection System

### Core Component

```typescript
<ProtectionGuard
  requireAuth?: boolean;           // Require authentication (default: true)
  roles?: UserRole[];             // Required roles
  requireAllRoles?: boolean;      // ALL vs ANY roles (default: false = ANY)
  permissions?: string[];         // Required permissions
  requireAllPermissions?: boolean; // ALL vs ANY permissions (default: true = ALL)
  redirectTo?: string;            // Redirect target (default: "/admin")
  showToast?: boolean;            // Show error toast (default: true)
  fallback?: ReactNode;           // Fallback content for component-level guards
  isPageGuard?: boolean;          // Page mode (redirect) vs Component mode (fallback)
>
  <YourContent />
</ProtectionGuard>
```

### Convenience Components

```typescript
// Page-level guards (with redirects)
<PageProtectionGuard roles={["admin"]}>        // Page-level role protection
<PagePermissionGuard permission="users.view">  // Page-level permission protection

// Component-level guards (with fallbacks)
<AuthGuard>                    // Basic authentication
<AdminGuard>                   // Admin only
<EmployeeGuard>               // Admin + Employee
<PermissionGuard permission="users.edit">     // Single permission
<OptionalAuthGuard>           // Optional authentication
```

## Migration Examples

### 1. Page Permission Guard Migration

```tsx
// OLD
import { PagePermissionGuard } from "@/components/auth/PagePermissionGuard";

export default function ProtectedPage() {
  return (
    <PagePermissionGuard
      permissions={["users.view", "users.edit"]}
      requireAll={true}
      showToast={true}
    >
      <UserManagementPage />
    </PagePermissionGuard>
  );
}

// NEW - Option 1: Using unified component
import { ProtectionGuard } from "@/components/auth/ProtectionGuard";

export default function ProtectedPage() {
  return (
    <ProtectionGuard
      permissions={["users.view", "users.edit"]}
      requireAllPermissions={true}
      isPageGuard
      showToast={true}
    >
      <UserManagementPage />
    </ProtectionGuard>
  );
}

// NEW - Option 2: Using convenience component
import { PagePermissionGuard } from "@/components/auth/ProtectionGuard";

export default function ProtectedPage() {
  return (
    <PagePermissionGuard
      permissions={["users.view", "users.edit"]}
      requireAllPermissions={true}
    >
      <UserManagementPage />
    </ProtectionGuard>
  );
}
```

### 2. Component Permission Guard Migration

```tsx
// OLD
import PermissionGuard from "@/components/auth/PermissionGuard";

function UserActions() {
  return (
    <div>
      <PermissionGuard permission="users.edit">
        <EditButton />
      </PermissionGuard>

      <PermissionGuard
        permissions={["users.delete", "users.archive"]}
        requireAll={false}
        fallback={<span>No permission</span>}
      >
        <DeleteButton />
      </PermissionGuard>
    </div>
  );
}

// NEW - Option 1: Using unified component
import { ProtectionGuard } from "@/components/auth/ProtectionGuard";

function UserActions() {
  return (
    <div>
      <ProtectionGuard permissions={["users.edit"]}>
        <EditButton />
      </ProtectionGuard>

      <ProtectionGuard
        permissions={["users.delete", "users.archive"]}
        requireAllPermissions={false}
        fallback={<span>No permission</span>}
      >
        <DeleteButton />
      </ProtectionGuard>
    </div>
  );
}

// NEW - Option 2: Using convenience component
import { PermissionGuard } from "@/components/auth/ProtectionGuard";

function UserActions() {
  return (
    <div>
      <PermissionGuard permission="users.edit">
        <EditButton />
      </PermissionGuard>

      <ProtectionGuard
        permissions={["users.delete", "users.archive"]}
        requireAllPermissions={false}
        fallback={<span>No permission</span>}
      >
        <DeleteButton />
      </ProtectionGuard>
    </div>
  );
}
```

### 3. Role Guard Migration

```tsx
// OLD
import RoleGuard from "@/components/admin/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["admin"]} redirectTo="/unauthorized">
      <AdminDashboard />
    </RoleGuard>
  );
}

// NEW - Option 1: Using unified component
import { ProtectionGuard } from "@/components/auth/ProtectionGuard";

export default function AdminPage() {
  return (
    <ProtectionGuard roles={["admin"]} isPageGuard redirectTo="/unauthorized">
      <AdminDashboard />
    </ProtectionGuard>
  );
}

// NEW - Option 2: Using convenience component
import { AdminGuard } from "@/components/auth/ProtectionGuard";

export default function AdminPage() {
  return (
    <AdminGuard isPageGuard redirectTo="/unauthorized">
      <AdminDashboard />
    </AdminGuard>
  );
}
```

### 4. RoleBasedAccess Migration

```tsx
// OLD
import RoleBasedAccess, {
  AdminOnly,
  EmployeeAccess,
} from "@/components/admin/RoleBasedAccess";

function Toolbar() {
  return (
    <div>
      <AdminOnly>
        <SystemSettings />
      </AdminOnly>

      <EmployeeAccess fallback={<span>Employee only</span>}>
        <ManageUsers />
      </EmployeeAccess>

      <RoleBasedAccess allowedRoles={["admin", "employee"]}>
        <Reports />
      </RoleBasedAccess>
    </div>
  );
}

// NEW
import {
  AdminGuard,
  EmployeeGuard,
  ProtectionGuard,
} from "@/components/auth/ProtectionGuard";

function Toolbar() {
  return (
    <div>
      <AdminGuard>
        <SystemSettings />
      </AdminGuard>

      <EmployeeGuard fallback={<span>Employee only</span>}>
        <ManageUsers />
      </EmployeeGuard>

      <ProtectionGuard roles={["admin", "employee"]}>
        <Reports />
      </ProtectionGuard>
    </div>
  );
}
```

### 5. Complex Protection Scenarios

```tsx
// Complex permission logic with the new system
import { ProtectionGuard } from "@/components/auth/ProtectionGuard";

function UserManagement() {
  return (
    <div>
      {/* Admin OR has specific permission */}
      <ProtectionGuard
        roles={["admin"]}
        permissions={["users.delete"]}
        requireAllRoles={false}
        requireAllPermissions={false}
      >
        <DeleteAllButton />
      </ProtectionGuard>

      {/* Must be admin AND have permission */}
      <ProtectionGuard
        roles={["admin"]}
        permissions={["system.config"]}
        requireAllRoles={true}
        requireAllPermissions={true}
      >
        <SystemConfig />
      </ProtectionGuard>

      {/* Optional auth - show different content for logged in users */}
      <ProtectionGuard requireAuth={false}>
        <UserContent />
      </ProtectionGuard>
    </div>
  );
}
```

## Benefits of New System

1. **Single Source of Truth**: One component handles all protection logic
2. **Consistent API**: Same interface for all protection types
3. **Flexible Combinations**: Easy to combine roles and permissions
4. **Better Performance**: Single component vs multiple nested guards
5. **Type Safety**: Full TypeScript support with better type inference
6. **Easier Testing**: Single component to test vs multiple components

## Migration Strategy

### Phase 1: Install New System

1. ✅ Create `ProtectionGuard.tsx`
2. ✅ Export convenience components

### Phase 2: Migrate High-Priority Pages

1. Admin dashboard and main pages
2. User management pages
3. Permission-sensitive pages

### Phase 3: Migrate Component-Level Guards

1. Replace inline permission checks
2. Replace role-based conditional rendering
3. Update shared components

### Phase 4: Cleanup Legacy Components

1. Mark old components as deprecated
2. Remove unused imports
3. Delete old component files

## Backward Compatibility

The old components will remain available during the migration period but are marked as deprecated. They should be gradually replaced with the new system.

## Testing

After migration, test:

1. Authentication flows
2. Role-based access control
3. Permission-based restrictions
4. Redirect behavior
5. Fallback content display
6. Toast notifications

## Common Patterns

```typescript
// Page-level protection with multiple requirements
<ProtectionGuard
  roles={["admin", "employee"]}
  permissions={["users.view"]}
  isPageGuard
>
  <UsersPage />
</ProtectionGuard>

// Component-level with fallback
<ProtectionGuard
  permissions={["users.edit"]}
  fallback={<ReadOnlyView />}
>
  <EditableUserForm />
</ProtectionGuard>

// Optional features for authenticated users
<ProtectionGuard requireAuth={false}>
  {user ? <PersonalizedContent /> : <PublicContent />}
</ProtectionGuard>
```
