"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import { permissionService } from "@/services/permissionService";
import { toast } from "sonner";

// Global cache for permissions to avoid multiple API calls
const permissionCache = new Map<
  string,
  { permissions: string[]; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook để kiểm tra quyền trong component
 * @returns Các hàm và state liên quan đến quyền
 */
export function usePermissions() {
  const { user } = useAuth();
  const { flatMenuItems } = useSidebar();
  const pathname = usePathname();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef<boolean>(false); // Prevent multiple concurrent fetches
  const lastUserRef = useRef<{ id?: string; role?: string }>({});

  // Thông tin trang hiện tại
  const currentPage = useMemo(() => {
    return flatMenuItems.find((item) => item.path === pathname) || null;
  }, [flatMenuItems, pathname]);

  // Kiểm tra có phải admin không
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  // Lấy danh sách quyền của người dùng từ API với caching
  useEffect(() => {
    // Kiểm tra xem user có thay đổi thực sự không
    const currentUserId = user?.id;
    const currentUserRole = user?.role;

    if (
      lastUserRef.current.id === currentUserId &&
      lastUserRef.current.role === currentUserRole
    ) {
      // User không thay đổi, không cần fetch lại
      return;
    }

    // Cập nhật reference
    lastUserRef.current = { id: currentUserId, role: currentUserRole };

    console.log("🔍 usePermissions useEffect:", {
      userId: currentUserId,
      userRole: currentUserRole,
    });

    const fetchUserPermissions = async () => {
      // Nếu chưa có user (chưa login), set loading false và empty permissions
      if (!user) {
        console.log("👤 No user, setting empty permissions and loading false");
        setUserPermissions([]);
        setIsLoading(false);
        return;
      }

      // Admin có tất cả quyền, không cần fetch
      if (isAdmin) {
        console.log("🔑 Admin user, setting loading false");
        setUserPermissions([]);
        setIsLoading(false);
        return;
      }

      // Prevent multiple concurrent fetches
      if (fetchingRef.current) {
        return;
      }

      const userId = user.id;
      const cacheKey = `permissions_${userId}`;
      const now = Date.now();

      // Check cache first
      const cachedData = permissionCache.get(cacheKey);
      if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
        setUserPermissions(cachedData.permissions);
        setIsLoading(false);
        return;
      }

      try {
        fetchingRef.current = true;
        setIsLoading(true);

        const response = await permissionService.getUserPermissions(userId);

        if (response.success && response.data.permissions) {
          const permissions = response.data.permissions;
          setUserPermissions(permissions);
          // Update cache
          permissionCache.set(cacheKey, { permissions, timestamp: now });
        } else {
          console.warn("Không thể lấy quyền người dùng:", response.message);
          setUserPermissions([]);
        }
      } catch {
        toast.error("Lỗi khi lấy danh sách quyền");
        setUserPermissions([]);
      } finally {
        console.log("📋 usePermissions finally: setting loading false");
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchUserPermissions();
  }, [user, isAdmin]); // Include full dependencies

  // Kiểm tra quyền truy cập trang
  const canAccessPage = useMemo(() => {
    if (!user || !currentPage) return false;

    // Admin luôn có quyền
    if (isAdmin) return true;

    // Kiểm tra vai trò người dùng - mô hình cũ
    const hasRoleAccess = currentPage.allowedRoles.includes(
      user.role as "admin" | "employee"
    );

    // Kiểm tra theo mô hình phân quyền mới - Nếu trang yêu cầu quyền view_X
    if (currentPage.metadata && "requiredPermission" in currentPage.metadata) {
      const requiredPerm = currentPage.metadata.requiredPermission as string;
      return userPermissions.includes(requiredPerm);
    }

    return hasRoleAccess;
  }, [user, currentPage, isAdmin, userPermissions]);

  /**
   * Kiểm tra quyền thực hiện hành động (mô hình mới)
   * @param action Tên hành động cần kiểm tra quyền
   * @returns True nếu có quyền
   */
  const can = useMemo(() => {
    return (action: string): boolean => {
      // Admin luôn có quyền
      if (isAdmin) return true;

      // Không có user
      if (!user) return false;

      // Kiểm tra theo mô hình phân quyền mới
      return userPermissions.includes(action);
    };
  }, [isAdmin, user, userPermissions]);

  /**
   * Kiểm tra các quyền truy cập
   * @param actions Danh sách các hành động cần kiểm tra
   * @returns True nếu có tất cả quyền
   */
  const canAll = useMemo(() => {
    return (actions: string[]): boolean => {
      return actions.every((action) => can(action));
    };
  }, [can]);

  /**
   * Kiểm tra ít nhất một trong các quyền
   * @param actions Danh sách các hành động cần kiểm tra
   * @returns True nếu có ít nhất một quyền
   */
  const canAny = useMemo(() => {
    return (actions: string[]): boolean => {
      return actions.some((action) => can(action));
    };
  }, [can]);

  return {
    isAdmin,
    canAccessPage,
    can,
    canAll,
    canAny,
    userPermissions,
    isLoading,
    currentPage,
  };
}
