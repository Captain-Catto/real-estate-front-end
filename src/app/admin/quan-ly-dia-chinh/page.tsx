"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MapIcon,
  HomeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  locationService,
  AdminProvince,
  AdminWard,
} from "@/services/locationService";

type ModalType = "province" | "ward" | "delete" | null;
type ActionType = "add" | "edit" | "delete";

interface FormData {
  name: string;
  code?: string;
  slug?: string;
  type?: string;
  name_with_type?: string;
  path?: string;
  path_with_type?: string;
  parent_code?: string;
  // Fields only for frontend UI compatibility
  codename?: string;
  division_type?: string;
  short_codename?: string;
}

function AdminLocationPageInternal() {
  // State management
  const [provinces, setProvinces] = useState<AdminProvince[]>([]);
  const [selectedProvince, setSelectedProvince] =
    useState<AdminProvince | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [actionType, setActionType] = useState<ActionType>("add");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    slug: "",
    type: "",
    name_with_type: "",
    path: "",
    path_with_type: "",
    parent_code: "",
    // UI fields
    codename: "",
    division_type: "",
    short_codename: "",
  });
  const [editingItem, setEditingItem] = useState<
    AdminProvince | AdminWard | null
  >(null);

  // Fetch initial data
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const result = await locationService.admin.getProvinces();
      console.log("Fetched provinces:", result);
      if (result.success) {
        setProvinces(result.data);
      } else {
        console.error("Failed to fetch provinces");
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const openModal = (
    type: ModalType,
    action: ActionType,
    item?: AdminProvince | AdminWard
  ) => {
    setModalType(type);
    setActionType(action);
    setEditingItem(item || null);

    if (action === "edit" && item) {
      const existingType = "type" in item ? (item as AdminProvince).type : "";
      const existingNameWithType =
        "name_with_type" in item ? (item as AdminProvince).name_with_type : "";

      setFormData({
        name: item.name,
        code: String(item.code),
        codename: item.codename,
        division_type: item.division_type || "",
        short_codename: "short_codename" in item ? item.short_codename : "",
        // Thêm các trường mới cho province
        type: existingType || "",
        name_with_type:
          existingNameWithType ||
          (existingType && item.name
            ? existingType === "tinh"
              ? `Tỉnh ${item.name}`
              : `Thành phố ${item.name}`
            : ""),
      });
    } else {
      setFormData({
        name: "",
        code: "",
        codename: "",
        division_type: type === "province" ? "province" : "ward",
        short_codename: "",
        type: "",
        name_with_type: "",
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setActionType("add");
    setEditingItem(null);
    setFormData({
      name: "",
      code: "",
      codename: "",
      division_type: "",
      short_codename: "",
      type: "",
      name_with_type: "",
    });
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let result;

      if (modalType === "province") {
        if (actionType === "add") {
          result = await locationService.admin.addProvince({
            name: formData.name,
            code: formData.code,
            codename: formData.codename,
            division_type: formData.division_type,
            type: formData.type,
            name_with_type: formData.name_with_type,
          });
        } else {
          result = await locationService.admin.updateProvince(
            editingItem!._id,
            {
              name: formData.name,
              code: formData.code,
              codename: formData.codename,
              division_type: formData.division_type,
              type: formData.type,
              name_with_type: formData.name_with_type,
            }
          );
        }
      } else if (modalType === "ward") {
        if (actionType === "add") {
          result = await locationService.admin.addWard(
            selectedProvince!._id,
            "", // Không cần district ID
            {
              name: formData.name,
              code: formData.code,
              codename: formData.codename,
              division_type: formData.division_type,
              short_codename: formData.short_codename,
            }
          );
        } else {
          result = await locationService.admin.updateWard(
            selectedProvince!._id,
            "", // Không cần district ID
            editingItem!._id,
            {
              name: formData.name,
              code: formData.code,
              codename: formData.codename,
              division_type: formData.division_type,
              short_codename: formData.short_codename,
            }
          );
        }
      }

      if (result?.success) {
        // Refresh data
        const provincesResult = await locationService.admin.getProvinces();
        if (provincesResult.success) {
          setProvinces(provincesResult.data);
          if (selectedProvince) {
            const updatedProvince = provincesResult.data.find(
              (p: AdminProvince) => p._id === selectedProvince._id
            );
            setSelectedProvince(updatedProvince || null);
          }
        }
        closeModal();
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Delete function
  const handleDelete = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      let result;

      if (editingItem && "districts" in editingItem) {
        // Province (có districts property)
        result = await locationService.admin.deleteProvince(editingItem._id);
      } else if (selectedProvince) {
        // Ward
        result = await locationService.admin.deleteWard(
          selectedProvince._id,
          "", // Không cần district ID
          editingItem._id
        );
      }

      if (result?.success) {
        // Refresh data and reset selections
        const provincesResult = await locationService.admin.getProvinces();
        if (provincesResult.success) {
          setProvinces(provincesResult.data);
          if (editingItem && "districts" in editingItem) {
            // If deleted a province, clear all selections
            setSelectedProvince(null);
          }
        }
        closeModal();
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Get wards from selected province (direct from province, no districts)
  const getWardsFromProvince = (province: AdminProvince): AdminWard[] => {
    // Trong cấu trúc mới, wards có thể được lưu trực tiếp trong province
    // hoặc trong districts[0] để tương thích
    if (province.districts && province.districts.length > 0) {
      // Lấy tất cả wards từ tất cả districts
      return province.districts.flatMap((district) => district.wards || []);
    }
    return [];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý địa chính
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý cấu trúc 2 tầng: Tỉnh/Thành phố → Phường/Xã
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="lg:col-span-3 flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải dữ liệu địa chính...</p>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                {/* Provinces Column */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MapIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Tỉnh/Thành phố ({provinces.length})
                      </h2>
                      <button
                        onClick={() => openModal("province", "add")}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Thêm
                      </button>
                    </div>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {provinces.map((province) => (
                      <div
                        key={province._id}
                        className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                          selectedProvince?._id === province._id
                            ? "bg-blue-50 border-2 border-blue-200"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedProvince(province)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {province.name}
                            </h3>
                            {province.name_with_type && (
                              <p className="text-sm text-gray-600">
                                {province.name_with_type}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              Mã: {province.code}
                              {province.type && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {province.type === "thanh-pho"
                                    ? "Thành phố"
                                    : "Tỉnh"}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-blue-600">
                              {getWardsFromProvince(province).length} phường/xã
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal("province", "edit", province);
                              }}
                              className="p-1 text-gray-500 hover:text-blue-600"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(province);
                                setModalType("delete");
                              }}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {provinces.length === 0 && (
                      <div className="text-center py-8">
                        <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Chưa có tỉnh/thành phố nào
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wards Column (Direct from Province) */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <HomeIcon className="w-5 h-5 mr-2 text-green-600" />
                        Phường/Xã{" "}
                        {selectedProvince && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            - {selectedProvince.name}
                          </span>
                        )}
                      </h2>
                      <button
                        onClick={() => openModal("ward", "add")}
                        disabled={!selectedProvince}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Thêm phường/xã
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {selectedProvince ? (
                      <div className="max-h-96 overflow-y-auto">
                        {getWardsFromProvince(selectedProvince).map(
                          (ward: AdminWard) => (
                            <div
                              key={ward._id}
                              className="p-3 bg-gray-50 rounded-lg mb-2 flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {ward.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Mã: {ward.code} | {ward.codename}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() =>
                                    openModal("ward", "edit", ward)
                                  }
                                  className="p-1 text-gray-500 hover:text-green-600"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingItem(ward);
                                    setModalType("delete");
                                  }}
                                  className="p-1 text-gray-500 hover:text-red-600"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        )}
                        {getWardsFromProvince(selectedProvince).length ===
                          0 && (
                          <div className="text-center py-8">
                            <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              Chưa có phường/xã nào trong{" "}
                              {selectedProvince.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Vui lòng chọn một tỉnh/thành phố để xem phường/xã
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modalType === "province" || modalType === "ward") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {actionType === "add" ? "Thêm" : "Chỉnh sửa"}{" "}
                  {modalType === "province" ? "tỉnh/thành phố" : "phường/xã"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({
                        ...formData,
                        name: newName,
                        // Tự động cập nhật name_with_type khi tên thay đổi
                        name_with_type:
                          formData.type && newName
                            ? formData.type === "tinh"
                              ? `Tỉnh ${newName}`
                              : `Thành phố ${newName}`
                            : "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      modalType === "province"
                        ? "Hồ Chí Minh"
                        : "Phường Bến Nghé"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã số
                  </label>
                  <input
                    type="text"
                    value={formData.code || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Codename *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codename}
                    onChange={(e) =>
                      setFormData({ ...formData, codename: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      modalType === "province"
                        ? "thanh_pho_ho_chi_minh"
                        : "phuong_ben_nghe"
                    }
                  />
                </div>

                {modalType === "province" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại *
                      </label>
                      <select
                        required
                        value={formData.type || ""}
                        onChange={(e) => {
                          const selectedType = e.target.value;
                          setFormData({
                            ...formData,
                            type: selectedType,
                            // Tự động tạo name_with_type dựa trên type và name
                            name_with_type: formData.name
                              ? selectedType === "tinh"
                                ? `Tỉnh ${formData.name}`
                                : `Thành phố ${formData.name}`
                              : "",
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn loại</option>
                        <option value="thanh-pho">Thành phố</option>
                        <option value="tinh">Tỉnh</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên đầy đủ
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.name_with_type || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        placeholder="Sẽ tự động tạo dựa trên loại và tên"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tự động tạo dựa trên loại và tên đã nhập
                      </p>
                    </div>
                  </>
                )}

                {modalType === "ward" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short codename
                    </label>
                    <input
                      type="text"
                      value={formData.short_codename || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          short_codename: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ben_nghe"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === "delete" && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
                  Xác nhận xóa
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa{" "}
                {"districts" in editingItem ? "tỉnh/thành phố" : "phường/xã"}{" "}
                <strong>{editingItem.name}</strong>?
                {editingItem && "districts" in editingItem && (
                  <span className="block text-red-600 text-sm mt-2">
                    ⚠️ Việc này sẽ xóa tất cả phường/xã thuộc tỉnh/thành phố
                    này!
                  </span>
                )}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
                >
                  {saving ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap component with AdminGuard
export default function ProtectedAdminLocationPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.LOCATION.MANAGE]}>
      <AdminLocationPageInternal />
    </AdminGuard>
  );
}
