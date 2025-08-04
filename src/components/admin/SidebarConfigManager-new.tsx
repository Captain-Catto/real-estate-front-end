"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useSidebarConfig,
  useSidebarManagement,
  useSidebarPermissions,
  type SidebarConfig,
} from "@/hooks/useSidebarConfig";
import { AdminGuard } from "./RoleGuard";
import {
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function SidebarConfigManager() {
  const { user } = useAuth();
  const { processedGroups, loading, error, refreshConfig } = useSidebarConfig();
  const { permissions } = useSidebarPermissions();
  const {
    getAllConfigs,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    reorderItems,
    loading: managementLoading,
  } = useSidebarManagement();

  const [allConfigs, setAllConfigs] = useState<SidebarConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SidebarConfig | null>(
    null
  );

  // Load all configs on mount
  const loadAllConfigs = useCallback(async () => {
    try {
      const configs = await getAllConfigs();
      setAllConfigs(configs);
      if (!selectedConfig && configs.length > 0) {
        setSelectedConfig(configs.find((c) => c.isDefault) || configs[0]);
      }
    } catch (error) {
      console.error("Error loading configs:", error);
    }
  }, [getAllConfigs, selectedConfig]);

  useEffect(() => {
    if (permissions.canEditConfig) {
      loadAllConfigs();
    }
  }, [permissions.canEditConfig, loadAllConfigs]);

  const handleSetDefault = async (configId: string) => {
    try {
      await setDefaultConfig(configId);
      await loadAllConfigs();
      await refreshConfig();
    } catch (error) {
      console.error("Error setting default config:", error);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm("Bạn có chắc muốn xóa cấu hình này?")) return;

    try {
      await deleteConfig(configId);
      await loadAllConfigs();
      if (selectedConfig?._id === configId) {
        setSelectedConfig(null);
      }
    } catch (error) {
      console.error("Error deleting config:", error);
    }
  };

  const handleMoveItem = async (itemId: string, direction: "up" | "down") => {
    if (!selectedConfig) return;

    const items = [...selectedConfig.items];
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) return;

    const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap items
    [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];

    // Update order numbers
    const reorderData = items.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    try {
      await reorderItems(selectedConfig._id, reorderData);
      await loadAllConfigs();
    } catch (error) {
      console.error("Error reordering items:", error);
    }
  };

  const handleToggleItemVisibility = async (itemId: string) => {
    if (!selectedConfig) return;

    const item = selectedConfig.items.find((i) => i.id === itemId);
    if (!item) return;

    const updatedItems = selectedConfig.items.map((i) =>
      i.id === itemId ? { ...i, isVisible: !i.isVisible } : i
    );

    try {
      await updateConfig(selectedConfig._id, {
        ...selectedConfig,
        items: updatedItems,
      });
      await loadAllConfigs();
    } catch (error) {
      console.error("Error updating item visibility:", error);
    }
  };

  if (!permissions.canViewSidebar) {
    return (
      <div className="p-6 text-center text-red-600">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  if (loading || managementLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-2 text-sm text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <div className="text-lg font-medium">Có lỗi xảy ra</div>
        <div className="mt-2">{error}</div>
        <button
          onClick={refreshConfig}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Quản lý Cấu hình Sidebar
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Tùy chỉnh menu sidebar cho admin và employee
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500">
                Role:{" "}
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Config Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Danh sách Cấu hình
          </h3>

          <div className="space-y-3">
            {allConfigs.map((configItem) => (
              <div
                key={configItem._id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    selectedConfig?._id === configItem._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
                onClick={() => setSelectedConfig(configItem)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {configItem.name}
                      {configItem.isDefault && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {configItem.items.length} menu items • Cập nhật:{" "}
                      {new Date(configItem.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {permissions.canEditConfig && (
                    <div className="flex items-center space-x-2">
                      {!configItem.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(configItem._id);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConfig(configItem._id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        disabled={configItem.isDefault}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Menu Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Menu Hiện tại ({user?.role})
          </h3>

          <div className="space-y-2">
            {processedGroups.map((group) => (
              <div
                key={group.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="font-medium text-gray-900 mb-2">
                  {group.title}
                </div>
                <div className="space-y-1 ml-4">
                  {group.children.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm text-gray-600">
                        {item.title}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {item.path}
                        </span>
                        {permissions.canEditConfig && selectedConfig && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() =>
                                handleToggleItemVisibility(item.id)
                              }
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {item.isVisible ? (
                                <EyeIcon className="w-4 h-4" />
                              ) : (
                                <EyeSlashIcon className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleMoveItem(item.id, "up")}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <ArrowUpIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveItem(item.id, "down")}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <ArrowDownIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Config Details */}
        {selectedConfig && permissions.canEditConfig && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Chi tiết: {selectedConfig.name}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tổng menu items:</span>
                  <span className="ml-2 font-medium">
                    {selectedConfig.items.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className="ml-2 font-medium">
                    {selectedConfig.isDefault ? "Mặc định" : "Phụ"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Tạo lúc:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedConfig.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Cập nhật:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedConfig.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Menu Items</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedConfig.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <span className="font-medium">{item.title}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({item.path})
                          </span>
                          {item.parentId && (
                            <span className="text-xs text-blue-600 ml-2">
                              [Child of {item.parentId}]
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-500">
                            Order: {item.order}
                          </div>
                          {!item.isVisible && (
                            <span className="text-xs text-red-600">Hidden</span>
                          )}
                          <div className="text-xs text-gray-500">
                            Roles: {item.allowedRoles.join(", ")}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
