"use client";

import React, { useState, useEffect } from "react";
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
import { useSidebar, useSidebarManagement } from "@/hooks/useSidebar";
import { type SidebarMenuItem } from "@/store/slices/sidebarSlice";
import { AdminGuard } from "@/components/auth/ProtectionGuard";
import { toast } from "sonner";

interface EditingItem extends SidebarMenuItem {
  isEditing?: boolean;
}

const SidebarConfigManager: React.FC = () => {
  const { config, loading: configLoading, error: configError } = useSidebar();
  const {
    loading: managementLoading,
    error: managementError,
    updateItem,
    addItem,
    removeItem,
    reorderItems,
  } = useSidebarManagement();

  const [items, setItems] = useState<EditingItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    isGroup: boolean;
  }>({
    isOpen: false,
    itemId: "",
    itemName: "",
    isGroup: false,
  });

  // Combine loading states
  const isLoading = configLoading || managementLoading;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update items when config changes from Redux
  useEffect(() => {
    if (config) {
      setItems(
        config.items.map((item: SidebarMenuItem) => ({
          ...item,
          isEditing: false,
        }))
      );
    }
  }, [config]);

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
      await updateItem(itemId, itemData);

      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isEditing: false } : i))
      );

      setHasChanges(false);
    } catch {
      toast.error("Lỗi không lưu được mục");
    }
  };

  // Update item field during editing
  const updateItemField = (
    itemId: string,
    field: keyof SidebarMenuItem,
    value: string | number | boolean | string[] | Record<string, unknown>
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setHasChanges(true);
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    const itemName = item?.title || "mục này";
    const isGroup = item?.metadata?.isGroup || false;

    setDeleteModal({
      isOpen: true,
      itemId,
      itemName,
      isGroup,
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await removeItem(deleteModal.itemId);
      setDeleteModal({
        isOpen: false,
        itemId: "",
        itemName: "",
        isGroup: false,
      });
    } catch (error) {
      toast.error("Xóa mục sidebar thất bại");
      // Error will be shown via managementError from Redux
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      itemId: "",
      itemName: "",
      isGroup: false,
    });
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
      allowedRoles: ["admin"], // 🔐 Only admin by default - need explicit permission for employees
      metadata: isGroup
        ? { isGroup: true, permissions: [] }
        : { permissions: [] },
    };

    try {
      await addItem(newItem);
    } catch (error) {
      toast.error("Thêm mục sidebar thất bại");
      // Error will be shown via managementError from Redux
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
    } catch (error) {
      toast.error("Sắp xếp lại mục sidebar thất bại");
      // Error will be shown via managementError from Redux
    }
  };

  // Categorize items
  const groups = items
    .filter((item) => item.metadata?.isGroup)
    .sort((a, b) => {
      // If item is being edited, use original order from config to maintain position
      const aOrder =
        a.isEditing && config
          ? config.items.find((orig) => orig.id === a.id)?.order || a.order
          : a.order;
      const bOrder =
        b.isEditing && config
          ? config.items.find((orig) => orig.id === b.id)?.order || b.order
          : b.order;
      return aOrder - bOrder;
    });
  const children = items.filter((item) => item.parentId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-2 text-sm text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (configError || managementError) {
    return (
      <div className="p-6 text-center text-red-600">
        <div className="text-lg font-medium">Có lỗi xảy ra</div>
        <div className="mt-2">{configError || managementError}</div>
        <button
          onClick={() => window.location.reload()}
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
                      <div className="px-4 py-2">
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
                            .sort((a, b) => {
                              // If item is being edited, use original order from config to maintain position
                              const aOrder =
                                a.isEditing && config
                                  ? config.items.find(
                                      (orig) => orig.id === a.id
                                    )?.order || a.order
                                  : a.order;
                              const bOrder =
                                b.isEditing && config
                                  ? config.items.find(
                                      (orig) => orig.id === b.id
                                    )?.order || b.order
                                  : b.order;
                              return aOrder - bOrder;
                            })
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

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn xóa &quot;{deleteModal.itemName}&quot;?
                {deleteModal.isGroup && (
                  <span className="text-red-600 font-medium">
                    {" "}
                    (Tất cả mục con cũng sẽ bị xóa)
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={managementLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {managementLoading ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
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
    value: string | number | boolean | string[] | Record<string, unknown>
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
    value: string | number | boolean | string[] | Record<string, unknown>
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
              title="Ctrl+Click để chọn nhiều roles"
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              💡 Tip: Ctrl+Click để chọn nhiều roles
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permissions yêu cầu (để employee xem được menu này)
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={(item.metadata?.permissions || []).join(", ")}
              onChange={(e) => {
                const permissions = e.target.value
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0);

                const newMetadata = {
                  ...item.metadata,
                  permissions: permissions,
                };

                onUpdateField("metadata", newMetadata);
              }}
              placeholder="vd: view_posts, view_users, manage_prices"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500">
              🔐 Nhập các permission cách nhau bởi dấu phẩy. Employee cần có ít
              nhất 1 permission này để thấy menu.
            </div>
            <div className="text-xs text-blue-600">
              📝 Ví dụ: view_posts, view_users, manage_prices, view_statistics
            </div>
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
          {item.metadata?.permissions &&
            item.metadata.permissions.length > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                🔐 Permissions: {item.metadata.permissions.join(", ")}
              </div>
            )}
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
