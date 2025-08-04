"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useSidebarManagement,
  useSidebarPermissions,
  SidebarConfig,
  SidebarMenuItem,
} from "@/hooks/useSidebarConfig";
import { AdminGuard } from "./RoleGuard";

interface EditingItem extends SidebarMenuItem {
  isEditing?: boolean;
}

const SidebarConfigManager: React.FC = () => {
  const {
    isAdmin,
    loading: managementLoading,
    error: managementError,
    getCurrentConfig,
    updateMenuItem,
    addMenuItem,
    removeMenuItem,
    reorderItems,
  } = useSidebarManagement();
  const { permissions } = useSidebarPermissions();

  const [config, setConfig] = useState<SidebarConfig | null>(null);
  const [items, setItems] = useState<EditingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load the single sidebar config
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentConfig = await getCurrentConfig();
      setConfig(currentConfig);
      setItems(
        currentConfig.items.map((item) => ({ ...item, isEditing: false }))
      );
    } catch (error) {
      console.error("Error loading config:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentConfig]);

  useEffect(() => {
    if (isAdmin) {
      loadConfig();
    }
  }, [isAdmin, loadConfig]);

  // Start editing an item
  const startEdit = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, isEditing: true }
          : { ...item, isEditing: false }
      )
    );
  };

  // Cancel editing
  const cancelEdit = (itemId: string) => {
    if (!config) return;

    // Restore original data
    const originalItem = config.items.find((item) => item.id === itemId);
    if (originalItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...originalItem, isEditing: false } : item
        )
      );
    }
    setHasChanges(false);
  };

  // Save item changes
  const saveItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const itemData = { ...item };
      delete itemData.isEditing;
      await updateMenuItem(itemId, itemData);

      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isEditing: false } : i))
      );

      setHasChanges(false);
      await loadConfig(); // Reload to get latest data
    } catch (error) {
      console.error("Error saving item:", error);
      setError(error instanceof Error ? error.message : "Lỗi khi lưu");
    }
  };

  // Update item field during editing
  const updateItemField = (
    itemId: string,
    field: keyof SidebarMenuItem,
    value: string | number | boolean | string[]
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setHasChanges(true);
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    const itemName = item?.title || "mục này";

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa "${itemName}"?${
          item?.metadata?.isGroup ? " (Tất cả mục con cũng sẽ bị xóa)" : ""
        }`
      )
    )
      return;

    try {
      await removeMenuItem(itemId);
      await loadConfig();
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(error instanceof Error ? error.message : "Lỗi khi xóa");
    }
  };

  // Add new item
  const handleAddItem = async (parentId?: string) => {
    const isGroup = !parentId;
    const newItem: Omit<SidebarMenuItem, "id"> = {
      title: isGroup ? "Nhóm mới" : "Mục con mới",
      path: isGroup ? "/admin/new-group" : "/admin/new-item",
      parentId: parentId,
      order:
        items.filter((i) =>
          isGroup ? i.metadata?.isGroup : i.parentId === parentId
        ).length + 1,
      isVisible: true,
      allowedRoles: ["admin"],
      metadata: isGroup ? { isGroup: true } : {},
    };

    try {
      await addMenuItem(newItem);
      await loadConfig();
    } catch (error) {
      console.error("Error adding item:", error);
      setError(error instanceof Error ? error.message : "Lỗi khi thêm");
    }
  };

  // Toggle group collapse
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Toggle all groups collapse
  const toggleAllGroups = () => {
    const allGroupIds = groups.map((g) => g.id);
    if (collapsedGroups.size === allGroupIds.length) {
      // All are collapsed, expand all
      setCollapsedGroups(new Set());
    } else {
      // Collapse all
      setCollapsedGroups(new Set(allGroupIds));
    }
  };

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = items.find((item) => item.id === activeId);
    const overItem = items.find((item) => item.id === overId);

    if (!activeItem || !overItem) return;

    // Check if both items are at the same level (both groups or both children of same parent)
    const bothAreGroups =
      activeItem.metadata?.isGroup && overItem.metadata?.isGroup;
    const bothAreChildren =
      activeItem.parentId === overItem.parentId &&
      !activeItem.metadata?.isGroup &&
      !overItem.metadata?.isGroup;

    if (!bothAreGroups && !bothAreChildren) {
      return; // Don't allow drag between different levels
    }

    // Get the appropriate items list for reordering
    const itemsToReorder = items
      .filter((item) => {
        if (bothAreGroups) {
          return item.metadata?.isGroup;
        } else {
          return (
            item.parentId === activeItem.parentId && !item.metadata?.isGroup
          );
        }
      })
      .sort((a, b) => a.order - b.order);

    const activeIndex = itemsToReorder.findIndex(
      (item) => item.id === activeId
    );
    const overIndex = itemsToReorder.findIndex((item) => item.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    // Create new order
    const reorderedItems = arrayMove(itemsToReorder, activeIndex, overIndex);

    // Create reorder data with new order values
    const reorderData = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    try {
      await reorderItems(reorderData);
      await loadConfig();
    } catch (error) {
      console.error("Error reordering items:", error);
      setError(error instanceof Error ? error.message : "Lỗi khi sắp xếp");
    }
  };

  // Categorize items
  const groups = items
    .filter((item) => item.metadata?.isGroup)
    .sort((a, b) => a.order - b.order);
  const children = items.filter((item) => item.parentId);

  if (!permissions.canViewSidebar) {
    return (
      <div className="p-6 text-center text-red-600">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  if (isLoading || managementLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-2 text-sm text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || managementError) {
    return (
      <div className="p-6 text-center text-red-600">
        <div className="text-lg font-medium">Có lỗi xảy ra</div>
        <div className="mt-2">{error || managementError}</div>
        <button
          onClick={loadConfig}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex justify-end">
          <div className="flex space-x-2">
            <button
              onClick={() => handleAddItem()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm nhóm
            </button>
            <button
              onClick={toggleAllGroups}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title={
                collapsedGroups.size === groups.length
                  ? "Mở rộng tất cả"
                  : "Thu gọn tất cả"
              }
            >
              {collapsedGroups.size === groups.length
                ? "📂 Mở rộng"
                : "📁 Thu gọn"}
            </button>
            <button
              onClick={loadConfig}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Làm mới
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800">
              Bạn có thay đổi chưa lưu. Nhớ bấm &quot;Lưu&quot; để áp dụng thay
              đổi.
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            <SortableContext
              items={groups.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              {groups.map((group) => (
                <SortableItem
                  key={group.id}
                  item={group}
                  onStartEdit={() => startEdit(group.id)}
                  onCancelEdit={() => cancelEdit(group.id)}
                  onSave={() => saveItem(group.id)}
                  onDelete={() => handleDeleteItem(group.id)}
                  onUpdateField={(field, value) =>
                    updateItemField(group.id, field, value)
                  }
                  isGroup={true}
                  isCollapsed={collapsedGroups.has(group.id)}
                  onToggleCollapse={() => toggleGroupCollapse(group.id)}
                >
                  {/* Add Item Button and Children - only show when not collapsed */}
                  {!collapsedGroups.has(group.id) && (
                    <>
                      {/* Add Item Button */}
                      <div className="px-4 pb-2">
                        <button
                          onClick={() => handleAddItem(group.id)}
                          className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Thêm mục con
                        </button>
                      </div>

                      {/* Group Children */}
                      <div className="p-4 space-y-2">
                        <SortableContext
                          items={children
                            .filter((child) => child.parentId === group.id)
                            .map((child) => child.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {children
                            .filter((child) => child.parentId === group.id)
                            .sort((a, b) => a.order - b.order)
                            .map((child) => (
                              <div key={child.id} className="ml-4">
                                <SortableItem
                                  item={child}
                                  onStartEdit={() => startEdit(child.id)}
                                  onCancelEdit={() => cancelEdit(child.id)}
                                  onSave={() => saveItem(child.id)}
                                  onDelete={() => handleDeleteItem(child.id)}
                                  onUpdateField={(field, value) =>
                                    updateItemField(child.id, field, value)
                                  }
                                  isGroup={false}
                                />
                              </div>
                            ))}
                        </SortableContext>

                        {children.filter((child) => child.parentId === group.id)
                          .length === 0 && (
                          <div className="ml-4 text-gray-500 text-sm italic">
                            Chưa có mục con nào. Nhấn &quot;Thêm mục con&quot;
                            để thêm.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </SortableItem>
              ))}
            </SortableContext>

            {groups.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-lg">Chưa có nhóm menu nào</div>
                <div className="text-sm mt-2">
                  Nhấn &quot;Thêm nhóm&quot; để bắt đầu tạo menu
                </div>
              </div>
            )}
          </div>
        </DndContext>
      </div>
    </AdminGuard>
  );
};

// Sortable Item Component
interface SortableItemProps {
  item: EditingItem;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdateField: (
    field: keyof SidebarMenuItem,
    value: string | number | boolean | string[]
  ) => void;
  isGroup: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  children?: React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onUpdateField,
  isGroup,
  isCollapsed,
  onToggleCollapse,
  children,
}) => {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={`border border-gray-200 rounded-lg ${
          isDragging ? "shadow-lg" : ""
        }`}
      >
        {/* Group Header or Item */}
        <div
          className={`${
            isGroup ? "bg-gray-50 p-4 border-b border-gray-200" : "p-3"
          }`}
        >
          <ItemEditor
            item={item}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSave={onSave}
            onDelete={onDelete}
            onUpdateField={onUpdateField}
            isGroup={isGroup}
            isCollapsed={isCollapsed}
            onToggleCollapse={onToggleCollapse}
            dragHandleProps={listeners}
          />
        </div>

        {/* Children for groups */}
        {children}
      </div>
    </div>
  );
};

interface ItemEditorProps {
  item: EditingItem;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdateField: (
    field: keyof SidebarMenuItem,
    value: string | number | boolean | string[]
  ) => void;
  isGroup: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const ItemEditor: React.FC<ItemEditorProps> = ({
  item,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onUpdateField,
  isGroup,
  isCollapsed,
  onToggleCollapse,
  dragHandleProps,
}) => {
  if (item.isEditing) {
    return (
      <div className="space-y-3 p-3 bg-white border border-blue-200 rounded">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdateField("title", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Đường dẫn
            </label>
            <input
              type="text"
              value={item.path}
              onChange={(e) => onUpdateField("path", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thứ tự
            </label>
            <input
              type="number"
              value={item.order}
              onChange={(e) =>
                onUpdateField("order", parseInt(e.target.value) || 0)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hiển thị
            </label>
            <select
              value={item.isVisible ? "true" : "false"}
              onChange={(e) =>
                onUpdateField("isVisible", e.target.value === "true")
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="true">Có</option>
              <option value="false">Không</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quyền truy cập
            </label>
            <select
              multiple
              value={item.allowedRoles}
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                ) as ("admin" | "employee")[];
                onUpdateField("allowedRoles", values);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Lưu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
      <div className="flex items-center space-x-2">
        {/* Drag Handle - moved to front */}
        <button
          {...dragHandleProps}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-move"
          title="Kéo để di chuyển"
        >
          ⋮⋮
        </button>

        {/* Collapse Toggle for Groups */}
        {isGroup && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isCollapsed ? "▶" : "▼"}
          </button>
        )}

        {/* Content */}
        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {isGroup && "📁 "}
            {item.title}
          </div>
          <div className="text-sm text-gray-500">{item.path}</div>
          <div className="text-xs text-gray-400">
            Thứ tự: {item.order} | Hiển thị: {item.isVisible ? "Có" : "Không"} |
            Quyền: {item.allowedRoles.join(", ")}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={onStartEdit}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sửa
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default SidebarConfigManager;
