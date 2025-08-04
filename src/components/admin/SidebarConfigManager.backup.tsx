"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useSidebarConfig,
  useSidebarPermissions,
  useSidebarManagement,
  type SidebarConfig,
  type SidebarMenuItem,
  type ProcessedSidebarGroup,
} from "@/hooks/useSidebarConfig";
import { UserRole } from "@/store/slices/authSlice";
import UserRoleDisplay, { RoleBadge } from "./UserRoleDisplay";
import { AdminGuard } from "./RoleGuard";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChartBarIcon,
  Bars3Icon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SidebarConfigManager() {
  const { user } = useAuth();
  const {
    sidebarConfig,
    updateSidebarConfig,
    resetSidebarConfig,
    isLoading,
    error,
  } = useSidebarConfig();
  const { permissions } = useSidebarPermissions();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [localConfig, setLocalConfig] = useState(sidebarConfig);
  const [isSaving, setIsSaving] = useState(false);

  // Sync localConfig với sidebarConfig khi nó thay đổi
  useEffect(() => {
    setLocalConfig(sidebarConfig);
  }, [sidebarConfig]);

  // Hàm để di chuyển item lên
  const moveItemUp = useCallback((groupId: string, itemId: string) => {
    setLocalConfig((prev) => {
      const newConfig = [...prev];
      const groupIndex = newConfig.findIndex((g) => g.id === groupId);
      if (groupIndex === -1) return prev;

      const group = { ...newConfig[groupIndex] };
      const itemIndex = group.items.findIndex(
        (item: SidebarMenuItem) => item.id === itemId
      );

      if (itemIndex > 0) {
        const newItems = [...group.items];
        [newItems[itemIndex - 1], newItems[itemIndex]] = [
          newItems[itemIndex],
          newItems[itemIndex - 1],
        ];
        group.items = newItems;
        newConfig[groupIndex] = group;
      }

      return newConfig;
    });
  }, []);

  // Hàm để di chuyển item xuống
  const moveItemDown = useCallback((groupId: string, itemId: string) => {
    setLocalConfig((prev) => {
      const newConfig = [...prev];
      const groupIndex = newConfig.findIndex((g) => g.id === groupId);
      if (groupIndex === -1) return prev;

      const group = { ...newConfig[groupIndex] };
      const itemIndex = group.items.findIndex(
        (item: SidebarMenuItem) => item.id === itemId
      );

      if (itemIndex < group.items.length - 1) {
        const newItems = [...group.items];
        [newItems[itemIndex], newItems[itemIndex + 1]] = [
          newItems[itemIndex + 1],
          newItems[itemIndex],
        ];
        group.items = newItems;
        newConfig[groupIndex] = group;
      }

      return newConfig;
    });
  }, []);

  // Hàm để cập nhật thông tin của item
  const updateItemData = useCallback(
    (groupId: string, itemId: string, newData: Partial<SidebarMenuItem>) => {
      setLocalConfig((prev) => {
        const newConfig = [...prev];
        const groupIndex = newConfig.findIndex((g) => g.id === groupId);
        if (groupIndex === -1) return prev;

        const group = { ...newConfig[groupIndex] };
        const itemIndex = group.items.findIndex(
          (item: SidebarMenuItem) => item.id === itemId
        );
        if (itemIndex === -1) return prev;

        const newItems = [...group.items];
        newItems[itemIndex] = { ...newItems[itemIndex], ...newData };
        group.items = newItems;
        newConfig[groupIndex] = group;

        return newConfig;
      });
    },
    []
  );

  // Hàm để lưu thay đổi vào backend API
  const saveChanges = useCallback(async () => {
    try {
      setIsSaving(true);

      // Gọi API để lưu config
      await updateSidebarConfig(localConfig);

      // Hiển thị thông báo thành công
      alert("✅ Đã lưu thay đổi thành công! Config được lưu vào backend.");
    } catch (error) {
      console.error("Error saving config:", error);
      alert(
        `❌ Lỗi khi lưu: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  }, [localConfig, updateSidebarConfig]);

  // Loading state
  if (isLoading) {
    return (
      <AdminGuard>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải cấu hình...</p>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminGuard>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Lỗi tải cấu hình
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto">
        {/* Header with Save Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý cấu hình Sidebar
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Điều chỉnh vị trí, quyền truy cập và cấu hình menu sidebar
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (confirm("Bạn có chắc muốn reset về cấu hình mặc định?")) {
                  resetSidebarConfig();
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Role hiện tại
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  <RoleBadge role={user?.role || "user"} />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cog6ToothIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Menu items</p>
                <p className="text-lg font-semibold text-gray-900">
                  {localConfig.reduce(
                    (total, group) => total + group.items.length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Nhóm menu</p>
                <p className="text-lg font-semibold text-gray-900">
                  {localConfig.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Quyền truy cập
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {permissions?.accessPercentage || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin User
          </h2>
          <UserRoleDisplay showFullInfo={true} />
        </div>

        {/* Sidebar Groups Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Quản lý Sidebar Groups
              </h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Thêm Group
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {localConfig.map((group, groupIndex) => (
                <SidebarGroupCard
                  key={`config-${group.id}-${groupIndex}`}
                  group={group}
                  groupIndex={groupIndex}
                  isSelected={selectedGroup === group.id}
                  onSelect={() =>
                    setSelectedGroup(
                      selectedGroup === group.id ? null : group.id
                    )
                  }
                  onEdit={(itemId) => setEditingItem(itemId)}
                  editingItem={editingItem}
                  onStopEditing={() => setEditingItem(null)}
                  onMoveItemUp={moveItemUp}
                  onMoveItemDown={moveItemDown}
                  onUpdateItemData={updateItemData}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Role Permissions Overview */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quyền hạn theo Role
            </h2>
          </div>
          <div className="p-6">
            <RolePermissionsTable localConfig={localConfig} />
          </div>
        </div>

        {/* Add Group Form Modal */}
        {showAddForm && (
          <AddGroupModal
            onClose={() => setShowAddForm(false)}
            onSave={() => {
              setShowAddForm(false);
              // Refresh data logic here
            }}
          />
        )}
      </div>
    </AdminGuard>
  );
}

// Sidebar Group Card Component
function SidebarGroupCard({
  group,
  isSelected,
  onSelect,
  onEdit,
  editingItem,
  onStopEditing,
  onMoveItemUp,
  onMoveItemDown,
  onUpdateItemData,
}: {
  group: SidebarGroup;
  groupIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (itemId: string) => void;
  editingItem: string | null;
  onStopEditing: () => void;
  onMoveItemUp: (groupId: string, itemId: string) => void;
  onMoveItemDown: (groupId: string, itemId: string) => void;
  onUpdateItemData: (
    groupId: string,
    itemId: string,
    newData: Partial<SidebarMenuItem>
  ) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <div
        className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Cog6ToothIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {group.name}
              </h3>
              <p className="text-xs text-gray-500">
                {group.items.length} items •{" "}
                {group.isCollapsible ? "Collapsible" : "Fixed"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {group.id}
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              {isSelected ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => (
              <SidebarItemCard
                key={`${group.id}-${item.id}-${itemIndex}`}
                item={item}
                itemIndex={itemIndex}
                groupId={group.id}
                totalItems={group.items.length}
                isEditing={editingItem === item.id}
                onEdit={() => onEdit(item.id)}
                onStopEditing={onStopEditing}
                onMoveUp={() => onMoveItemUp(group.id, item.id)}
                onMoveDown={() => onMoveItemDown(group.id, item.id)}
                onUpdateRoles={(newRoles) =>
                  onUpdateItemData(group.id, item.id, { roles: newRoles })
                }
                onUpdateData={(newData) =>
                  onUpdateItemData(group.id, item.id, newData)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar Item Card Component
function SidebarItemCard({
  item,
  itemIndex,
  totalItems,
  isEditing,
  onEdit,
  onStopEditing,
  onMoveUp,
  onMoveDown,
  onUpdateRoles,
  onUpdateData,
}: {
  item: SidebarMenuItem;
  itemIndex: number;
  groupId: string;
  totalItems: number;
  isEditing: boolean;
  onEdit: () => void;
  onStopEditing: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateRoles: (newRoles: UserRole[]) => void;
  onUpdateData?: (newData: Partial<SidebarMenuItem>) => void;
}) {
  const [editForm, setEditForm] = useState({
    name: item.name,
    href: item.href,
    description: item.description || "",
    isActive: item.isActive,
    roles: item.roles,
  });

  const allRoles: UserRole[] = ["admin", "employee", "user"];

  const handleSave = () => {
    // Cập nhật item với dữ liệu mới
    if (onUpdateData) {
      onUpdateData({
        name: editForm.name,
        href: editForm.href,
        description: editForm.description,
        isActive: editForm.isActive,
        roles: editForm.roles,
      });
    }
    console.log("Saving item:", { ...item, ...editForm });
    onStopEditing();
  };

  const toggleRole = (role: UserRole) => {
    const newRoles = editForm.roles.includes(role)
      ? editForm.roles.filter((r) => r !== role)
      : [...editForm.roles, role];

    setEditForm({ ...editForm, roles: newRoles });
    onUpdateRoles(newRoles);
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên menu
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đường dẫn
            </label>
            <input
              type="text"
              value={editForm.href}
              onChange={(e) =>
                setEditForm({ ...editForm, href: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={2}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quyền truy cập
            </label>
            <div className="flex flex-wrap gap-2">
              {allRoles.map((role, roleIndex) => (
                <button
                  key={`${item.id}-edit-role-${role}-${roleIndex}`}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    editForm.roles.includes(role)
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) =>
                setEditForm({ ...editForm, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Kích hoạt
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Lưu
            </button>
            <button
              onClick={onStopEditing}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
      <div className="flex items-center space-x-3">
        {/* Move buttons */}
        <div className="flex flex-col items-center space-y-1">
          <button
            onClick={onMoveUp}
            disabled={itemIndex === 0}
            className={`text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed ${
              itemIndex === 0 ? "cursor-not-allowed" : ""
            }`}
            title="Di chuyển lên"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={itemIndex === totalItems - 1}
            className={`text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed ${
              itemIndex === totalItems - 1 ? "cursor-not-allowed" : ""
            }`}
            title="Di chuyển xuống"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
            {!item.isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Inactive
              </span>
            )}
            <span className="text-xs text-gray-400">#{itemIndex + 1}</span>
          </div>
          <p className="text-xs text-gray-500">{item.href}</p>
          {item.description && (
            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
          )}
          <div className="flex items-center space-x-1 mt-1">
            {item.roles.map((role, roleIndex) => (
              <RoleBadge
                key={`${item.id}-role-${role}-${roleIndex}`}
                role={role}
                className="text-xs"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-blue-600"
          title="Chỉnh sửa"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-red-600" title="Xóa">
          <TrashIcon className="h-4 w-4" />
        </button>
        <Bars3Icon
          className="h-4 w-4 text-gray-300 cursor-move"
          title="Kéo thả"
        />
      </div>
    </div>
  );
}

// Role Permissions Table
function RolePermissionsTable({
  localConfig,
}: {
  localConfig: SidebarGroup[];
}) {
  const roles: UserRole[] = ["admin", "employee", "user"];

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Menu Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vị trí
            </th>
            {roles.map((role, roleIndex) => (
              <th
                key={`table-header-${role}-${roleIndex}`}
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <RoleBadge role={role} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {localConfig.map((group) =>
            group.items.map((item, itemIndex) => (
              <tr
                key={`${group.id}-${item.id}-${itemIndex}`}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500">{item.href}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {group.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{itemIndex + 1}
                </td>
                {roles.map((role, roleIndex) => (
                  <td
                    key={`${group.id}-${item.id}-${role}-${roleIndex}`}
                    className="px-6 py-4 whitespace-nowrap text-center"
                  >
                    {item.roles.includes(role) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Add Group Modal
function AddGroupModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    icon: "HomeIcon",
    isCollapsible: true,
    defaultExpanded: false,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thêm Sidebar Group
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="group-id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Tên nhóm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="HomeIcon">HomeIcon</option>
                <option value="CogIcon">CogIcon</option>
                <option value="UserGroupIcon">UserGroupIcon</option>
                <option value="DocumentTextIcon">DocumentTextIcon</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCollapsible"
                checked={form.isCollapsible}
                onChange={(e) =>
                  setForm({ ...form, isCollapsible: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="isCollapsible"
                className="ml-2 text-sm text-gray-700"
              >
                Có thể thu gọn
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="defaultExpanded"
                checked={form.defaultExpanded}
                onChange={(e) =>
                  setForm({ ...form, defaultExpanded: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="defaultExpanded"
                className="ml-2 text-sm text-gray-700"
              >
                Mở rộng mặc định
              </label>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <button
              onClick={() => {
                console.log("Creating group:", form);
                onSave();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Tạo
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
