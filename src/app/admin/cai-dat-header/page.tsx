"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminGuard from "@/components/auth/AdminGuard";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import {
  headerSettingsService,
  HeaderMenu,
  DropdownItem,
} from "@/services/headerSettingsService";
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

// Component cho menu item có thể kéo thả
interface SortableMenuItemProps {
  menu: HeaderMenu;
  expandedMenus: Set<string>;
  onToggleExpansion: (menuId: string) => void;
  onEdit: (menu: HeaderMenu) => void;
  onDelete: (menuId: string, menuLabel: string) => void;
}

function SortableMenuItem({
  menu,
  expandedMenus,
  onToggleExpansion,
  onEdit,
  onDelete,
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: menu.id,
    data: {
      type: "HeaderMenu",
      menu,
    },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border-l-4 transition-all duration-200 ${
        isDragging
          ? "bg-blue-50 border-blue-400 shadow-lg"
          : "bg-white border-transparent hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-2 rounded transition-colors flex-shrink-0"
            title="Kéo để sắp xếp"
            style={{ touchAction: "none" }}
          >
            <Bars3Icon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            {menu.hasDropdown && (
              <button
                onClick={() => onToggleExpansion(menu.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedMenus.has(menu.id) ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{menu.label}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    menu.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {menu.isActive ? "Hiển thị" : "Ẩn"}
                </span>
                {menu.hasDropdown && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {menu.dropdownItems.length} mục con
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {menu.href} • Thứ tự: {menu.order}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard permission={PERMISSIONS.SETTINGS.EDIT}>
            <button
              onClick={() => onEdit(menu)}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title="Chỉnh sửa"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.SETTINGS.EDIT}>
            <button
              onClick={() => onDelete(menu.id, menu.label)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Xóa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Dropdown Items */}
      {menu.hasDropdown && expandedMenus.has(menu.id) && (
        <div className="mt-4 ml-8 space-y-2">
          {menu.dropdownItems
            .sort((a, b) => a.order - b.order)
            .map((item, index) => (
              <div
                key={item.id || `dropdown-${menu.id}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {item.label}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.isActive ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.href} • Thứ tự: {item.order}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function HeaderSettingsManagementInternal() {
  const [headerMenus, setHeaderMenus] = useState<HeaderMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<HeaderMenu | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Drag and drop sensors
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

  // Form states
  const [formData, setFormData] = useState({
    label: "",
    href: "",
    order: 0,
    isActive: true,
    hasDropdown: false,
    dropdownItems: [] as DropdownItem[],
  });

  // Authentication check
  // Load header menus data
  useEffect(() => {
    loadHeaderMenus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHeaderMenus = async () => {
    try {
      setLoading(true);
      // Try to use real API service first
      const response = await headerSettingsService.getHeaderMenus();
      if (response.success) {
        // Convert MongoDB _id to id if needed
        const processedData = response.data.map(
          (menu: HeaderMenu & { _id?: string }) => ({
            ...menu,
            id:
              menu.id ||
              menu._id?.toString() ||
              `menu-${Date.now()}-${Math.random()}`,
          })
        );
        console.log("Loaded header menus:", processedData);
        setHeaderMenus(processedData);
      } else {
        console.warn(
          "API returned unsuccessful response, using mock data:",
          response.message
        );
        loadMockData();
      }
    } catch {
      // API not available yet, silently fall back to mock data
      console.info(
        "API endpoint not available, using mock data for development"
      );
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock data - fallback when API is not available
    const mockData: HeaderMenu[] = [
      {
        id: "1",
        label: "Trang chủ",
        href: "/",
        order: 1,
        isActive: true,
        hasDropdown: false,
        dropdownItems: [],
      },
      {
        id: "2",
        label: "Mua bán",
        href: "/mua-ban",
        order: 2,
        isActive: true,
        hasDropdown: true,
        dropdownItems: [
          {
            id: "2-1",
            label: "Nhà riêng",
            href: "/mua-ban/nha-rieng",
            order: 1,
            isActive: true,
          },
          {
            id: "2-2",
            label: "Chung cư",
            href: "/mua-ban/chung-cu",
            order: 2,
            isActive: true,
          },
          {
            id: "2-3",
            label: "Đất nền",
            href: "/mua-ban/dat-nen",
            order: 3,
            isActive: true,
          },
          {
            id: "2-4",
            label: "Biệt thự",
            href: "/mua-ban/biet-thu",
            order: 4,
            isActive: true,
          },
        ],
      },
      {
        id: "3",
        label: "Cho thuê",
        href: "/cho-thue",
        order: 3,
        isActive: true,
        hasDropdown: true,
        dropdownItems: [
          {
            id: "3-1",
            label: "Nhà riêng",
            href: "/cho-thue/nha-rieng",
            order: 1,
            isActive: true,
          },
          {
            id: "3-2",
            label: "Chung cư",
            href: "/cho-thue/chung-cu",
            order: 2,
            isActive: true,
          },
          {
            id: "3-3",
            label: "Phòng trọ",
            href: "/cho-thue/phong-tro",
            order: 3,
            isActive: true,
          },
          {
            id: "3-4",
            label: "Văn phòng",
            href: "/cho-thue/van-phong",
            order: 4,
            isActive: true,
          },
        ],
      },
      {
        id: "4",
        label: "Dự án",
        href: "/du-an",
        order: 4,
        isActive: true,
        hasDropdown: true,
        dropdownItems: [
          {
            id: "4-1",
            label: "Căn hộ",
            href: "/du-an/can-ho",
            order: 1,
            isActive: true,
          },
          {
            id: "4-2",
            label: "Nhà phố",
            href: "/du-an/nha-pho",
            order: 2,
            isActive: true,
          },
          {
            id: "4-3",
            label: "Biệt thự",
            href: "/du-an/biet-thu",
            order: 3,
            isActive: true,
          },
        ],
      },
      {
        id: "5",
        label: "Tin tức",
        href: "/tin-tuc",
        order: 5,
        isActive: true,
        hasDropdown: true,
        dropdownItems: [
          {
            id: "5-1",
            label: "Thị trường",
            href: "/tin-tuc/thi-truong",
            order: 1,
            isActive: true,
          },
          {
            id: "5-2",
            label: "Phân tích",
            href: "/tin-tuc/phan-tich",
            order: 2,
            isActive: true,
          },
          {
            id: "5-3",
            label: "Xu hướng",
            href: "/tin-tuc/xu-huong",
            order: 3,
            isActive: true,
          },
        ],
      },
      {
        id: "6",
        label: "Liên hệ",
        href: "/lien-he",
        order: 6,
        isActive: true,
        hasDropdown: false,
        dropdownItems: [],
      },
    ];

    setHeaderMenus(mockData);
  };

  const toggleMenuExpansion = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  // Xử lý khi kết thúc drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("Drag ended:", { active: active.id, over: over?.id });

    if (active.id !== over?.id && over) {
      setHeaderMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        console.log("Moving from index", oldIndex, "to", newIndex);

        if (oldIndex === -1 || newIndex === -1) {
          console.warn("Could not find menu items for drag operation");
          return items;
        }

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Cập nhật lại order cho tất cả items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));

        // Gọi API để lưu thứ tự mới
        updateMenuOrder(updatedItems);

        return updatedItems;
      });
    }
  };

  // Hàm cập nhật thứ tự menu trên server
  const updateMenuOrder = async (menus: HeaderMenu[]) => {
    try {
      // Gọi API để cập nhật thứ tự
      const menuOrder = menus.map((m) => ({ id: m.id, order: m.order }));
      const response = await headerSettingsService.updateMenuOrder(menuOrder);

      if (response.success) {
        console.log("Menu order updated successfully");
      } else {
        console.warn("Failed to update menu order:", response.message);
      }
    } catch (error) {
      console.error("Error updating menu order:", error);
    }
  };

  const handleAddMenu = () => {
    setFormData({
      label: "",
      href: "",
      order: headerMenus.length + 1,
      isActive: true,
      hasDropdown: false,
      dropdownItems: [],
    });
    setSelectedMenu(null);
    setShowAddModal(true);
  };

  const handleEditMenu = (menu: HeaderMenu) => {
    setFormData({
      label: menu.label,
      href: menu.href,
      order: menu.order,
      isActive: menu.isActive,
      hasDropdown: menu.hasDropdown,
      dropdownItems: menu.dropdownItems,
    });
    setSelectedMenu(menu);
    setShowEditModal(true);
  };

  const handleDeleteMenu = async (menuId: string, menuLabel: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa menu "${menuLabel}"?`)) return;

    try {
      // Try API first
      const response = await headerSettingsService.deleteHeaderMenu(menuId);
      if (response.success) {
        setHeaderMenus((prev) => prev.filter((menu) => menu.id !== menuId));
        alert("Đã xóa menu thành công!");
      } else {
        alert(response.message || "Có lỗi xảy ra khi xóa menu");
      }
    } catch {
      // API not available, just update local state
      console.info("API not available, updating local state only");
      setHeaderMenus((prev) => prev.filter((menu) => menu.id !== menuId));
      alert(
        "Đã xóa menu thành công! (Chỉ cập nhật local, cần API để lưu vĩnh viễn)"
      );
    }
  };

  const handleSaveMenu = async () => {
    try {
      if (selectedMenu) {
        // Update existing menu
        try {
          const response = await headerSettingsService.updateHeaderMenu({
            id: selectedMenu.id,
            ...formData,
          });
          if (response.success) {
            setHeaderMenus((prev) =>
              prev.map((menu) =>
                menu.id === selectedMenu.id ? { ...menu, ...formData } : menu
              )
            );
            setShowEditModal(false);
            alert("Đã cập nhật menu thành công!");
          } else {
            alert(response.message || "Có lỗi xảy ra khi cập nhật menu");
          }
        } catch {
          // API not available, just update local state
          console.info("API not available, updating local state only");
          setHeaderMenus((prev) =>
            prev.map((menu) =>
              menu.id === selectedMenu.id ? { ...menu, ...formData } : menu
            )
          );
          setShowEditModal(false);
          alert(
            "Đã cập nhật menu! (Chỉ cập nhật local, cần API để lưu vĩnh viễn)"
          );
        }
      } else {
        // Add new menu
        try {
          const response = await headerSettingsService.createHeaderMenu(
            formData
          );
          if (response.success && response.data && response.data.length > 0) {
            // Use ID from API response
            setHeaderMenus((prev) => [...prev, response.data[0]]);
          } else {
            throw new Error("Invalid API response");
          }
          setShowAddModal(false);
          alert("Đã thêm menu thành công!");
        } catch {
          // API not available, just update local state with generated ID
          console.info("API not available, updating local state only");
          const newMenu: HeaderMenu = {
            id: Date.now().toString(),
            ...formData,
          };
          setHeaderMenus((prev) => [...prev, newMenu]);
          setShowAddModal(false);
          alert("Đã thêm menu! (Chỉ cập nhật local, cần API để lưu vĩnh viễn)");
        }
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Có lỗi xảy ra khi lưu menu");
    }
  };

  const addDropdownItem = () => {
    const newItem: DropdownItem = {
      id: `dropdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: "",
      href: "",
      order: formData.dropdownItems.length + 1,
      isActive: true,
    };
    setFormData((prev) => ({
      ...prev,
      dropdownItems: [...prev.dropdownItems, newItem],
    }));
  };

  const removeDropdownItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      dropdownItems: prev.dropdownItems.filter((_, i) => i !== index),
    }));
  };

  const updateDropdownItem = (
    index: number,
    field: keyof DropdownItem,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      dropdownItems: prev.dropdownItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100 animate-fade-in">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Cài đặt Header
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Quản lý các menu và dropdown trong header website. Kéo thả
                    icon <Bars3Icon className="w-4 h-4 inline mx-1" /> để sắp
                    xếp thứ tự menu.
                  </p>
                </div>
                <PermissionGuard permission={PERMISSIONS.SETTINGS.EDIT}>
                  <button
                    onClick={handleAddMenu}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Thêm menu
                  </button>
                </PermissionGuard>
              </div>
            </div>

            {/* Menu List */}
            <div className="bg-white rounded-lg shadow animate-fade-in">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Đang tải cài đặt header...
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={headerMenus.map((menu) => menu.id).filter(Boolean)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="divide-y divide-gray-200">
                      {headerMenus
                        .sort((a, b) => a.order - b.order)
                        .map((menu, index) => {
                          const menuId = menu.id || `menu-${index}`;
                          return (
                            <SortableMenuItem
                              key={menuId}
                              menu={{ ...menu, id: menuId }}
                              expandedMenus={expandedMenus}
                              onToggleExpansion={toggleMenuExpansion}
                              onEdit={handleEditMenu}
                              onDelete={handleDeleteMenu}
                            />
                          );
                        })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedMenu ? "Chỉnh sửa menu" : "Thêm menu mới"}
            </h3>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên menu
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ví dụ: Mua bán"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đường dẫn
                  </label>
                  <input
                    type="text"
                    value={formData.href}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, href: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ví dụ: /mua-ban"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Hiển thị
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasDropdown}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hasDropdown: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Có dropdown
                  </label>
                </div>
              </div>

              {/* Dropdown Items */}
              {formData.hasDropdown && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Các mục dropdown
                    </label>
                    <button
                      type="button"
                      onClick={addDropdownItem}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Thêm mục
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.dropdownItems.map((item, index) => (
                      <div
                        key={item.id || `form-dropdown-${index}`}
                        className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              updateDropdownItem(index, "label", e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Tên mục"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={item.href}
                            onChange={(e) =>
                              updateDropdownItem(index, "href", e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Đường dẫn"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.order}
                            onChange={(e) =>
                              updateDropdownItem(
                                index,
                                "order",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="STT"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) =>
                              updateDropdownItem(
                                index,
                                "isActive",
                                e.target.checked
                              )
                            }
                            className="text-blue-600"
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => removeDropdownItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveMenu}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedMenu ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap component with AdminGuard
export default function ProtectedHeaderSettingsPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.SETTINGS.EDIT]}>
      <HeaderSettingsManagementInternal />
    </AdminGuard>
  );
}
