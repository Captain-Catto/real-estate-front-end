"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/store/slices/authSlice";

interface UserRoleDisplayProps {
  showFullInfo?: boolean;
  className?: string;
}

export default function UserRoleDisplay({
  showFullInfo = false,
  className = "",
}: UserRoleDisplayProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          label: "Quản trị viên",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "👑",
        };
      case "employee":
        return {
          label: "Nhân viên",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "👨‍💼",
        };
      case "user":
        return {
          label: "Người dùng",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "👤",
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "❓",
        };
    }
  };

  const roleInfo = getRoleDisplay(user.role);

  if (showFullInfo) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-lg">{roleInfo.icon}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.username}
          </p>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleInfo.color}`}
            >
              {roleInfo.label}
            </span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleInfo.color} ${className}`}
    >
      <span className="mr-1">{roleInfo.icon}</span>
      {roleInfo.label}
    </span>
  );
}

// Component để hiển thị role badge
export function RoleBadge({
  role,
  className = "",
}: {
  role: UserRole;
  className?: string;
}) {
  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "👑",
        };
      case "employee":
        return {
          label: "Employee",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "👨‍💼",
        };
      case "user":
        return {
          label: "User",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "👤",
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "❓",
        };
    }
  };

  const roleInfo = getRoleDisplay(role);

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleInfo.color} ${className}`}
    >
      <span className="mr-1">{roleInfo.icon}</span>
      {roleInfo.label}
    </span>
  );
}

// Component để hiển thị quyền của user
export function UserPermissions({ className = "" }: { className?: string }) {
  const { user, canAccessAdmin, canAccessEmployee } = useAuth();

  if (!user) return null;

  const permissions = [];

  if (canAccessAdmin()) {
    permissions.push("Quản lý hệ thống");
  }

  if (canAccessEmployee()) {
    permissions.push("Quản lý nội dung");
  }

  if (user.role === "user") {
    permissions.push("Đăng tin", "Tìm kiếm BĐS");
  }

  return (
    <div className={`${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-2">
        Quyền truy cập:
      </h4>
      <div className="space-y-1">
        {permissions.map((permission, index) => (
          <div key={index} className="flex items-center text-sm text-gray-600">
            <span className="mr-2 text-green-500">✓</span>
            {permission}
          </div>
        ))}
      </div>
    </div>
  );
}
