"use client";

import { getAccessToken } from "./authService";
import { showErrorToast } from "@/utils/errorHandler";
import { API_BASE_URL } from "@/services/authService";

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return getAccessToken();
  }
  return null;
};

export interface UserPermission {
  userId: string;
  username: string;
  permissions: string[];
}

export interface Employee {
  _id: string;
  username: string;
  email: string;
  status: string;
  createdAt: string;
  permissions: string[];
  defaultPermissions: string[];
  enabledPermissions: string[];
  manageablePermissions: string[];
}

export interface PermissionGroup {
  [key: string]: string[];
}

export interface PermissionResponse {
  success: boolean;
  data: {
    permissions?: string[];
    permissionGroups?: PermissionGroup;
    manageableEmployeePermissions?: string[];
    users?: Array<{
      _id: string;
      username: string;
      email: string;
      role: string;
      status: string;
      createdAt: string;
      permissions: string[];
    }>;
    employees?: Employee[];
    manageablePermissions?: string[];
    defaultPermissions?: string[];
    userId?: string;
    addedPermissions?: string[];
  };
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  status?: number;
  statusText?: string;
}

export const permissionService = {
  // Lấy danh sách quyền có sẵn
  async getAvailablePermissions(): Promise<PermissionResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/permissions/available`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      showErrorToast("Lỗi khi tải danh sách quyền");
      throw error;
    }
  },

  // Lấy danh sách người dùng và quyền
  async getUsersAndPermissions(): Promise<PermissionResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/permissions/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      showErrorToast("Lỗi khi tải danh sách người dùng và quyền");
      throw error;
    }
  },

  // Lấy quyền của người dùng
  async getUserPermissions(userId: string): Promise<PermissionResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/permissions/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      showErrorToast("Lỗi khi tải quyền người dùng");
      throw error;
    }
  },

  // Cập nhật quyền cho người dùng
  async updateUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<PermissionResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/permissions/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      showErrorToast("Lỗi khi cập nhật quyền người dùng");
      throw error;
    }
  },

  // Tạo quyền cho người dùng
  async createUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<PermissionResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/permissions/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, permissions }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      showErrorToast("Lỗi khi tạo quyền người dùng");
      throw error;
    }
  },

  // Xóa quyền của người dùng
  async deleteUserPermissions(userId: string): Promise<PermissionResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/permissions/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      showErrorToast("Lỗi khi xóa quyền người dùng");
      throw error;
    }
  },
};

export default permissionService;
