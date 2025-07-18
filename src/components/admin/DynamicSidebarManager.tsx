"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export interface SidebarMenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: ("admin" | "employee")[];
  description?: string;
  parentId?: string;
  children?: SidebarMenuItem[];
  groupId?: string; // ID của group mà item này thuộc về
}

export interface SidebarGroup {
  id: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
  isExpanded: boolean;
  description?: string;
}

// Predefined icons mapping
const iconMap = {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
  BuildingOfficeIcon,
};

// Default groups
const defaultGroups: SidebarGroup[] = [
  {
    id: "dashboard",
    name: "Tổng quan",
    icon: "HomeIcon",
    order: 1,
    isActive: true,
    isExpanded: true,
    description: "Dashboard và thống kê tổng quan",
  },
  {
    id: "content-management",
    name: "Quản lý nội dung",
    icon: "DocumentTextIcon",
    order: 2,
    isActive: true,
    isExpanded: true,
    description: "Quản lý tin đăng, tin tức và nội dung",
  },
  {
    id: "user-management",
    name: "Quản lý người dùng",
    icon: "UserGroupIcon",
    order: 3,
    isActive: true,
    isExpanded: true,
    description: "Quản lý người dùng, chủ đầu tư",
  },
  {
    id: "data-management",
    name: "Quản lý dữ liệu",
    icon: "MapIcon",
    order: 4,
    isActive: true,
    isExpanded: true,
    description: "Quản lý địa chính, dự án, danh mục",
  },
  {
    id: "financial",
    name: "Tài chính",
    icon: "CurrencyDollarIcon",
    order: 5,
    isActive: true,
    isExpanded: true,
    description: "Quản lý giao dịch, thống kê tài chính",
  },
  {
    id: "system",
    name: "Cài đặt hệ thống",
    icon: "CogIcon",
    order: 6,
    isActive: true,
    isExpanded: false,
    description: "Cài đặt và cấu hình hệ thống",
  },
];

// Default menu items
const defaultMenuItems: SidebarMenuItem[] = [
  {
    id: "dashboard",
    name: "Tổng quan",
    href: "/admin",
    icon: "HomeIcon",
    order: 1,
    isActive: true,
    roles: ["admin", "employee"],
    description: "Dashboard chính với thống kê tổng quan",
    groupId: "dashboard",
  },
  {
    id: "posts",
    name: "Quản lý tin đăng",
    href: "/admin/quan-ly-tin-dang",
    icon: "DocumentTextIcon",
    order: 2,
    isActive: true,
    roles: ["admin", "employee"],
    description: "Quản lý và duyệt các tin đăng bất động sản",
    groupId: "content-management",
  },
  {
    id: "users",
    name: "Quản lý người dùng",
    href: "/admin/quan-ly-nguoi-dung",
    icon: "UserGroupIcon",
    order: 3,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý tài khoản người dùng",
    groupId: "user-management",
  },
  {
    id: "news",
    name: "Tin tức",
    href: "/admin/quan-ly-tin-tuc",
    icon: "NewspaperIcon",
    order: 4,
    isActive: true,
    roles: ["admin", "employee"],
    description: "Quản lý bài viết tin tức",
    groupId: "content-management",
  },
  {
    id: "transactions",
    name: "Giao dịch",
    href: "/admin/quan-ly-giao-dich",
    icon: "CurrencyDollarIcon",
    order: 5,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý giao dịch và thanh toán",
    groupId: "financial",
  },
  {
    id: "stats",
    name: "Thống kê",
    href: "/admin/thong-ke",
    icon: "ChartBarIcon",
    order: 6,
    isActive: true,
    roles: ["admin"],
    description: "Báo cáo và thống kê chi tiết",
    groupId: "financial",
  },
  {
    id: "settings",
    name: "Cài đặt",
    href: "/admin/cai-dat",
    icon: "CogIcon",
    order: 7,
    isActive: true,
    roles: ["admin"],
    description: "Cài đặt hệ thống",
    groupId: "system",
  },
  {
    id: "locations",
    name: "Quản lý địa chính",
    href: "/admin/quan-ly-dia-chinh",
    icon: "MapIcon",
    order: 8,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý tỉnh thành, quận huyện",
    groupId: "data-management",
  },
  {
    id: "projects",
    name: "Quản lý dự án",
    href: "/admin/quan-ly-du-an",
    icon: "BuildingOfficeIcon",
    order: 9,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý các dự án bất động sản",
    groupId: "data-management",
  },
  {
    id: "developers",
    name: "Quản lý chủ đầu tư",
    href: "/admin/quan-ly-chu-dau-tu",
    icon: "UserGroupIcon",
    order: 10,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý thông tin chủ đầu tư",
    groupId: "user-management",
  },
  {
    id: "categories",
    name: "Quản lý danh mục",
    href: "/admin/quan-ly-danh-muc",
    icon: "DocumentTextIcon",
    order: 11,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý danh mục bất động sản",
    groupId: "data-management",
  },
  {
    id: "areas",
    name: "Quản lý diện tích",
    href: "/admin/quan-ly-dien-tich",
    icon: "DocumentTextIcon",
    order: 12,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý khoảng diện tích",
    groupId: "data-management",
  },
  {
    id: "prices",
    name: "Quản lý giá",
    href: "/admin/quan-ly-gia",
    icon: "DocumentTextIcon",
    order: 13,
    isActive: true,
    roles: ["admin"],
    description: "Quản lý khoảng giá",
    groupId: "data-management",
  },
  {
    id: "sidebar-config",
    name: "Cấu hình Sidebar",
    href: "/admin/cau-hinh-sidebar",
    icon: "CogIcon",
    order: 14,
    isActive: true,
    roles: ["admin"],
    description: "Cấu hình menu sidebar",
    groupId: "system",
  },
];

interface SortableItemProps {
  item: SidebarMenuItem;
  groups: SidebarGroup[];
  onEdit: (item: SidebarMenuItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleRole: (id: string, role: "admin" | "employee") => void;
  onUngroup: (id: string) => void;
  onMoveToGroup: (id: string, groupId: string) => void;
}

function SortableItem({
  item,
  groups,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleRole,
  onUngroup,
  onMoveToGroup,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || HomeIcon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${
        isDragging ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className="fill-current"
          >
            <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </div>

        {/* Icon and Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
            <IconComponent className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <span className="text-xs text-gray-500">#{item.order}</span>
            </div>
            <p className="text-sm text-gray-500">{item.description}</p>
            <div className="text-xs text-gray-400 mt-1">{item.href}</div>
          </div>
        </div>

        {/* Group Actions */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">Nhóm:</div>
          <select
            value={item.groupId || "ungrouped"}
            onChange={(e) => {
              const newGroupId = e.target.value;
              if (newGroupId === "ungrouped") {
                onUngroup(item.id);
              } else {
                onMoveToGroup(item.id, newGroupId);
              }
            }}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            <option value="ungrouped">Không nhóm</option>
            {groups
              .filter((g) => g.isActive)
              .sort((a, b) => a.order - b.order)
              .map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
        </div>

        {/* Role Toggles */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 mb-1">Quyền truy cập:</div>
          <div className="flex gap-1">
            <button
              onClick={() => onToggleRole(item.id, "admin")}
              className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                item.roles.includes("admin")
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => onToggleRole(item.id, "employee")}
              className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                item.roles.includes("employee")
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              Employee
            </button>
          </div>
        </div>

        {/* Status Toggle */}
        <button
          onClick={() => onToggleStatus(item.id)}
          className={`p-2 rounded-lg transition-colors ${
            item.isActive
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-400 hover:bg-gray-50"
          }`}
          title={item.isActive ? "Ẩn mục menu" : "Hiển thị mục menu"}
        >
          {item.isActive ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Chỉnh sửa"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Xóa"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SortableGroupProps {
  group: SidebarGroup;
  groupItems: SidebarMenuItem[];
  groups: SidebarGroup[];
  isExpanded: boolean;
  onToggleGroup: (groupId: string) => void;
  onEditGroup: (group: SidebarGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onEdit: (item: SidebarMenuItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleRole: (id: string, role: "admin" | "employee") => void;
  onUngroup: (id: string) => void;
  onMoveToGroup: (id: string, groupId: string) => void;
}

function SortableGroup({
  group,
  groupItems,
  groups,
  isExpanded,
  onToggleGroup,
  onEditGroup,
  onDeleteGroup,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleRole,
  onUngroup,
  onMoveToGroup,
}: SortableGroupProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const GroupIcon = iconMap[group.icon as keyof typeof iconMap] || HomeIcon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-lg ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1">
          {/* Drag Handle for Group */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            title="Kéo để sắp xếp nhóm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              className="fill-current"
            >
              <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            </svg>
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 flex-1 p-2 rounded"
            onClick={() => onToggleGroup(group.id)}
          >
            <GroupIcon className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {groupItems.length} mục
          </span>
          <button
            onClick={() => onEditGroup(group)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Chỉnh sửa nhóm"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Xóa nhóm"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <div
            className={`transition-transform cursor-pointer ${
              isExpanded ? "rotate-90" : ""
            }`}
            onClick={() => onToggleGroup(group.id)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 space-y-3">
          {groupItems
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                groups={groups}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onToggleRole={onToggleRole}
                onUngroup={onUngroup}
                onMoveToGroup={onMoveToGroup}
              />
            ))}
          {groupItems.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Không có mục menu nào trong nhóm này
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DynamicSidebarManager() {
  // Sử dụng Redux hook thay vì local state
  const {
    menuItems,
    groups,
    loading,
    isInitialized,
    updateMenuItems,
    updateGroups,
    saveConfig,
    refetchConfig,
  } = useSidebar();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SidebarMenuItem | null>(null);
  const [editingGroup, setEditingGroup] = useState<SidebarGroup | null>(null);
  const [previewRole, setPreviewRole] = useState<"admin" | "employee">("admin");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>(
    {}
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize group expanded state
  useEffect(() => {
    const initialExpandedState = groups.reduce((acc, group) => {
      acc[group.id] = group.isExpanded;
      return acc;
    }, {} as Record<string, boolean>);
    setGroupExpanded(initialExpandedState);
  }, [groups]);

  const toggleGroup = (groupId: string) => {
    setGroupExpanded((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const getMenuItemsByGroup = () => {
    const groupedItems = menuItems.reduce((acc, item) => {
      const groupId = item.groupId || "ungrouped";
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(item);
      return acc;
    }, {} as Record<string, SidebarMenuItem[]>);

    return groupedItems;
  };

  const getPreviewItemsByGroup = () => {
    const filteredItems = menuItems
      .filter((item) => item.isActive && item.roles.includes(previewRole))
      .sort((a, b) => a.order - b.order);

    return filteredItems.reduce((acc, item) => {
      const groupId = item.groupId || "ungrouped";
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(item);
      return acc;
    }, {} as Record<string, SidebarMenuItem[]>);
  };

  const getPreviewItems = () => {
    return menuItems
      .filter((item) => item.isActive && item.roles.includes(previewRole))
      .sort((a, b) => a.order - b.order);
  };

  // Group management functions
  const handleAddGroup = () => {
    setEditingGroup(null);
    setShowGroupModal(true);
  };

  const handleEditGroup = (group: SidebarGroup) => {
    setEditingGroup(group);
    setShowGroupModal(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (
      confirm(
        "Bạn có chắc muốn xóa nhóm này? Các mục menu trong nhóm sẽ được chuyển về 'Không nhóm'."
      )
    ) {
      // Move all items in this group to ungrouped
      const updatedItems = menuItems.map((item) =>
        item.groupId === groupId ? { ...item, groupId: "ungrouped" } : item
      );
      updateMenuItems(updatedItems);

      // Remove the group
      const updatedGroups = groups.filter((g) => g.id !== groupId);
      updateGroups(updatedGroups);
    }
  };

  const handleUngroupItem = (itemId: string) => {
    const updatedItems = menuItems.map((item) =>
      item.id === itemId ? { ...item, groupId: "ungrouped" } : item
    );
    updateMenuItems(updatedItems);
  };

  const handleMoveItemToGroup = (itemId: string, newGroupId: string) => {
    const updatedItems = menuItems.map((item) =>
      item.id === itemId ? { ...item, groupId: newGroupId } : item
    );
    updateMenuItems(updatedItems);
  };

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((group) => group.id === active.id);
      const newIndex = groups.findIndex((group) => group.id === over.id);

      const newOrder = arrayMove(groups, oldIndex, newIndex);
      // Update order numbers
      const updatedOrder = newOrder.map((group, index) => ({
        ...group,
        order: index + 1,
      }));
      updateGroups(updatedOrder);
    }
  };

  // Load menu items from backend or localStorage
  // Load menu items - Redux đã handle việc này, chỉ cần minimal check
  useEffect(() => {
    // Redux đã tự động load data khi component mount
    // Chỉ cần đảm bảo data được loaded
    if (!isInitialized && !loading) {
      refetchConfig().catch(console.error);
    }
  }, [isInitialized, loading, refetchConfig]);

  // Save to both localStorage and backend
  const saveMenuItems = useCallback(async () => {
    try {
      setSaving(true);

      // Sử dụng Redux action để save
      await saveConfig();
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error saving menu items:", error);
    } finally {
      setSaving(false);
    }
  }, [saveConfig]);

  // Manual save function
  const handleManualSave = async () => {
    await saveMenuItems();
  };

  // Loại bỏ auto-save để tránh vòng lặp vô tận
  // User sẽ cần click "Lưu cấu hình" để save changes

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuItems.findIndex((item) => item.id === active.id);
      const newIndex = menuItems.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(menuItems, oldIndex, newIndex);
      // Update order numbers
      const updatedOrder = newOrder.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
      updateMenuItems(updatedOrder);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updatedItems = menuItems.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    updateMenuItems(updatedItems);
  };

  const handleToggleRole = (id: string, role: "admin" | "employee") => {
    const updatedItems = menuItems.map((item) => {
      if (item.id === id) {
        const roles = item.roles.includes(role)
          ? item.roles.filter((r) => r !== role)
          : [...item.roles, role];
        return { ...item, roles };
      }
      return item;
    });
    updateMenuItems(updatedItems);
  };

  const handleEdit = (item: SidebarMenuItem) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa mục menu này?")) {
      const updatedItems = menuItems.filter((item) => item.id !== id);
      updateMenuItems(updatedItems);
    }
  };

  const handleResetToDefault = async () => {
    if (
      confirm(
        "Bạn có chắc muốn khôi phục cấu hình mặc định? Tất cả thay đổi sẽ bị mất."
      )
    ) {
      try {
        // Reset to default items
        updateMenuItems(defaultMenuItems);
        updateGroups(defaultGroups);
        // Save the default configuration to backend
        await saveConfig();
      } catch (error) {
        console.error("Error resetting to default:", error);
        // Fallback to local reset
        updateMenuItems(defaultMenuItems);
        updateGroups(defaultGroups);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm mục menu
          </button>
          <button
            onClick={handleAddGroup}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm nhóm
          </button>
          <button
            onClick={handleManualSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Khôi phục mặc định
          </button>
        </div>

        <div className="flex items-center gap-4">
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Lưu lần cuối: {lastSaved}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Xem trước cho:</span>
            <select
              value={previewRole}
              onChange={(e) =>
                setPreviewRole(e.target.value as "admin" | "employee")
              }
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Quản lý mục menu (Theo nhóm)
              </h2>
              <div className="text-sm text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                Kéo thả để sắp xếp nhóm và mục menu
              </div>
            </div>

            {/* Dual drag context - Groups and Items */}
            <div className="space-y-6">
              {/* Group Drag Context */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGroupDragEnd}
              >
                <SortableContext
                  items={groups
                    .filter((g) => g.isActive)
                    .map((group) => group.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {groups
                      .filter((group) => group.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((group) => {
                        const groupItems =
                          getMenuItemsByGroup()[group.id] || [];
                        const isExpanded = groupExpanded[group.id];

                        return (
                          <SortableGroup
                            key={group.id}
                            group={group}
                            groupItems={groupItems}
                            groups={groups}
                            isExpanded={isExpanded}
                            onToggleGroup={toggleGroup}
                            onEditGroup={handleEditGroup}
                            onDeleteGroup={handleDeleteGroup}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                            onToggleRole={handleToggleRole}
                            onUngroup={handleUngroupItem}
                            onMoveToGroup={handleMoveItemToGroup}
                          />
                        );
                      })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Ungrouped items with separate item drag context */}
              {(() => {
                const ungroupedItems = getMenuItemsByGroup()["ungrouped"] || [];
                if (ungroupedItems.length > 0) {
                  return (
                    <div
                      key="ungrouped"
                      className="border border-gray-200 rounded-lg"
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">
                          Mục không nhóm
                        </h3>
                        <p className="text-sm text-gray-600">
                          Các mục menu chưa được phân nhóm
                        </p>
                      </div>
                      <div className="p-4 space-y-3">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={ungroupedItems.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {ungroupedItems
                              .sort((a, b) => a.order - b.order)
                              .map((item) => (
                                <SortableItem
                                  key={item.id}
                                  item={item}
                                  groups={groups}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  onToggleStatus={handleToggleStatus}
                                  onToggleRole={handleToggleRole}
                                  onUngroup={handleUngroupItem}
                                  onMoveToGroup={handleMoveItemToGroup}
                                />
                              ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xem trước Sidebar ({previewRole})
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 text-white">
              <div className="text-lg font-bold mb-4">
                🏠 BĐS {previewRole === "admin" ? "Admin" : "Employee"}
              </div>
              <nav className="space-y-2">
                {groups
                  .filter((group) => group.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((group) => {
                    const groupItems = getPreviewItemsByGroup()[group.id] || [];
                    const GroupIcon =
                      iconMap[group.icon as keyof typeof iconMap] || HomeIcon;

                    if (groupItems.length === 0) return null;

                    return (
                      <div key={group.id} className="mb-3">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                          <GroupIcon className="w-3 h-3" />
                          <span>{group.name}</span>
                        </div>
                        <div className="space-y-1 ml-2">
                          {groupItems.map((item) => {
                            const IconComponent =
                              iconMap[item.icon as keyof typeof iconMap] ||
                              HomeIcon;
                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 text-sm"
                              >
                                <IconComponent className="w-4 h-4" />
                                <span>{item.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                {/* Ungrouped items */}
                {(() => {
                  const ungroupedItems =
                    getPreviewItemsByGroup()["ungrouped"] || [];
                  if (ungroupedItems.length > 0) {
                    return (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                          <span>Khác</span>
                        </div>
                        <div className="space-y-1 ml-2">
                          {ungroupedItems.map((item) => {
                            const IconComponent =
                              iconMap[item.icon as keyof typeof iconMap] ||
                              HomeIcon;
                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 text-sm"
                              >
                                <IconComponent className="w-4 h-4" />
                                <span>{item.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </nav>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Tổng mục hiển thị:</span>
                <span className="font-medium">{getPreviewItems().length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {menuItems.length}
          </div>
          <div className="text-sm text-gray-600">Tổng mục menu</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {menuItems.filter((item) => item.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Mục đang hiển thị</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {menuItems.filter((item) => item.roles.includes("admin")).length}
          </div>
          <div className="text-sm text-gray-600">Mục cho Admin</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {menuItems.filter((item) => item.roles.includes("employee")).length}
          </div>
          <div className="text-sm text-gray-600">Mục cho Employee</div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingItem ? "Chỉnh sửa mục menu" : "Thêm mục menu mới"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <MenuItemForm
              item={editingItem}
              groups={groups}
              onSave={(item) => {
                if (editingItem) {
                  // Update existing item
                  const updatedItems = menuItems.map((i) =>
                    i.id === editingItem.id ? item : i
                  );
                  updateMenuItems(updatedItems);
                } else {
                  // Add new item
                  const newItem = {
                    ...item,
                    id: `item-${Date.now()}`,
                    order: menuItems.length + 1,
                  };
                  const updatedItems = [...menuItems, newItem];
                  updateMenuItems(updatedItems);
                }
                setShowAddModal(false);
                setEditingItem(null);
              }}
              onCancel={() => {
                setShowAddModal(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingGroup ? "Chỉnh sửa nhóm" : "Thêm nhóm mới"}
              </h2>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setEditingGroup(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <GroupForm
              group={editingGroup}
              onSave={(group) => {
                if (editingGroup) {
                  // Update existing group
                  const updatedGroups = groups.map((g) =>
                    g.id === editingGroup.id ? group : g
                  );
                  updateGroups(updatedGroups);
                } else {
                  // Add new group
                  const newGroup = {
                    ...group,
                    id: `group-${Date.now()}`,
                    order: groups.length + 1,
                  };
                  const updatedGroups = [...groups, newGroup];
                  updateGroups(updatedGroups);
                }
                setShowGroupModal(false);
                setEditingGroup(null);
              }}
              onCancel={() => {
                setShowGroupModal(false);
                setEditingGroup(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuItemFormProps {
  item?: SidebarMenuItem | null;
  groups: SidebarGroup[];
  onSave: (item: SidebarMenuItem) => void;
  onCancel: () => void;
}

function MenuItemForm({ item, groups, onSave, onCancel }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    href: item?.href || "",
    icon: item?.icon || "DocumentTextIcon",
    description: item?.description || "",
    roles: item?.roles || ["admin"],
    isActive: item?.isActive ?? true,
    groupId: item?.groupId || "data-management",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.href) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    onSave({
      id: item?.id || "",
      name: formData.name,
      href: formData.href,
      icon: formData.icon,
      description: formData.description,
      roles: formData.roles as ("admin" | "employee")[],
      isActive: formData.isActive,
      order: item?.order || 0,
      groupId: formData.groupId,
    });
  };

  const handleRoleToggle = (role: "admin" | "employee") => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên menu *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: Quản lý tin đăng"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Đường dẫn *
        </label>
        <input
          type="text"
          value={formData.href}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, href: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: /admin/quan-ly-tin-dang"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nhóm
        </label>
        <select
          value={formData.groupId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, groupId: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ungrouped">Không nhóm</option>
          {groups
            .filter((g) => g.isActive)
            .sort((a, b) => a.order - b.order)
            .map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon
        </label>
        <select
          value={formData.icon}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, icon: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(iconMap).map((iconName) => (
            <option key={iconName} value={iconName}>
              {iconName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Mô tả chức năng của menu..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quyền truy cập
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.roles.includes("admin")}
              onChange={() => handleRoleToggle("admin")}
              className="mr-2"
            />
            Admin
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.roles.includes("employee")}
              onChange={() => handleRoleToggle("employee")}
              className="mr-2"
            />
            Employee
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="mr-2"
          />
          Hiển thị menu
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          {item ? "Cập nhật" : "Thêm mới"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

interface GroupFormProps {
  group?: SidebarGroup | null;
  onSave: (group: SidebarGroup) => void;
  onCancel: () => void;
}

function GroupForm({ group, onSave, onCancel }: GroupFormProps) {
  const [formData, setFormData] = useState({
    name: group?.name || "",
    icon: group?.icon || "DocumentTextIcon",
    description: group?.description || "",
    isActive: group?.isActive ?? true,
    isExpanded: group?.isExpanded ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Vui lòng điền tên nhóm");
      return;
    }

    onSave({
      id: group?.id || "",
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      isActive: formData.isActive,
      isExpanded: formData.isExpanded,
      order: group?.order || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên nhóm *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: Quản lý nội dung"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon
        </label>
        <select
          value={formData.icon}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, icon: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(iconMap).map((iconName) => (
            <option key={iconName} value={iconName}>
              {iconName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Mô tả nhóm menu..."
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="mr-2"
          />
          Hiển thị nhóm
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isExpanded}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isExpanded: e.target.checked }))
            }
            className="mr-2"
          />
          Mở rộng mặc định
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          {group ? "Cập nhật" : "Thêm mới"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
