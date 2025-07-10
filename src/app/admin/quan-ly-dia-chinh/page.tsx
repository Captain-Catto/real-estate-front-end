"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MapIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import {
  locationService,
  AdminProvince,
  AdminDistrict,
  AdminWard,
} from "@/services/locationService";

type ModalType = "province" | "district" | "ward" | "delete" | null;
type ActionType = "add" | "edit" | "delete";

interface FormData {
  name: string;
  code?: number;
  codename: string;
  division_type?: string;
  phone_code?: number;
  short_codename?: string;
}

export default function AdminLocationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State management
  const [provinces, setProvinces] = useState<AdminProvince[]>([]);
  const [selectedProvince, setSelectedProvince] =
    useState<AdminProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<AdminDistrict | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [actionType, setActionType] = useState<ActionType>("add");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: undefined,
    codename: "",
    division_type: "",
    phone_code: undefined,
    short_codename: "",
  });
  const [editingItem, setEditingItem] = useState<
    AdminProvince | AdminDistrict | AdminWard | null
  >(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dang-nhap");
    }
  }, [user, authLoading, router]);

  // Fetch initial data
  useEffect(() => {
    if (user?.role === "admin") {
      fetchProvinces();
    }
  }, [user]);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const result = await locationService.admin.getProvinces();
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
    item?: AdminProvince | AdminDistrict | AdminWard
  ) => {
    setModalType(type);
    setActionType(action);
    setEditingItem(item || null);

    if (action === "edit" && item) {
      setFormData({
        name: item.name,
        code: item.code,
        codename: item.codename,
        division_type: item.division_type || "",
        phone_code: "phone_code" in item ? item.phone_code : undefined,
        short_codename: "short_codename" in item ? item.short_codename : "",
      });
    } else {
      setFormData({
        name: "",
        code: undefined,
        codename: "",
        division_type:
          modalType === "province"
            ? "province"
            : modalType === "district"
            ? "district"
            : "ward",
        phone_code: undefined,
        short_codename: "",
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setActionType("add");
    setEditingItem(null);
    setFormData({
      name: "",
      code: undefined,
      codename: "",
      division_type: "",
      phone_code: undefined,
      short_codename: "",
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
          result = await locationService.admin.addProvince(formData);
        } else {
          result = await locationService.admin.updateProvince(
            editingItem!._id,
            formData
          );
        }
      } else if (modalType === "district") {
        if (actionType === "add") {
          result = await locationService.admin.addDistrict(
            selectedProvince!._id,
            formData
          );
        } else {
          result = await locationService.admin.updateDistrict(
            selectedProvince!._id,
            editingItem!._id,
            formData
          );
        }
      } else if (modalType === "ward") {
        if (actionType === "add") {
          result = await locationService.admin.addWard(
            selectedProvince!._id,
            selectedDistrict!._id,
            formData
          );
        } else {
          result = await locationService.admin.updateWard(
            selectedProvince!._id,
            selectedDistrict!._id,
            editingItem!._id,
            formData
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
            if (selectedDistrict && updatedProvince) {
              const updatedDistrict = updatedProvince.districts.find(
                (d: AdminDistrict) => d._id === selectedDistrict._id
              );
              setSelectedDistrict(updatedDistrict || null);
            }
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
        // Province
        result = await locationService.admin.deleteProvince(editingItem._id);
      } else if (editingItem && "wards" in editingItem && selectedProvince) {
        // District
        result = await locationService.admin.deleteDistrict(
          selectedProvince._id,
          editingItem._id
        );
      } else if (selectedProvince && selectedDistrict) {
        // Ward
        result = await locationService.admin.deleteWard(
          selectedProvince._id,
          selectedDistrict._id,
          editingItem._id
        );
      }

      if (result?.success) {
        // Refresh data and reset selections
        const provincesResult = await locationService.admin.getProvinces();
        if (provincesResult.success) {
          setProvinces(provincesResult.data);
          if (editingItem && "districts" in editingItem) {
            setSelectedProvince(null);
            setSelectedDistrict(null);
          } else if (editingItem && "wards" in editingItem) {
            const updatedProvince = provincesResult.data.find(
              (p: AdminProvince) => p._id === selectedProvince?._id
            );
            setSelectedProvince(updatedProvince || null);
            setSelectedDistrict(null);
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

  // Show loading or redirect if not admin
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý địa chính
            </h1>
            <div className="text-sm text-gray-600">
              Tổng: {provinces.length} tỉnh/thành phố
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Danh sách tỉnh/thành */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">
                    Tỉnh/Thành phố
                  </h2>
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => openModal("province", "add")}
                  title="Thêm tỉnh/thành"
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {provinces.map((province) => (
                  <div
                    key={province._id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProvince?._id === province._id
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "hover:bg-gray-50 border border-gray-200"
                    }`}
                    onClick={() => {
                      setSelectedProvince(province);
                      setSelectedDistrict(null);
                    }}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {province.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {province.codename} • Code: {province.code}
                        {province.phone_code &&
                          ` • Phone: ${province.phone_code}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        {province.division_type} • {province.districts.length}{" "}
                        quận/huyện
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("province", "edit", province);
                        }}
                        title="Sửa"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-red-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(province);
                          setModalType("delete");
                        }}
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {provinces.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có tỉnh/thành phố nào</p>
                </div>
              )}
            </div>

            {/* Danh sách quận/huyện */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
                  <h2 className="font-semibold text-gray-900">Quận/Huyện</h2>
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() => openModal("district", "add")}
                  disabled={!selectedProvince}
                  title="Thêm quận/huyện"
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm
                </button>
              </div>

              {selectedProvince ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedProvince.districts.map((district) => (
                    <div
                      key={district._id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDistrict?._id === district._id
                          ? "bg-green-50 border-2 border-green-200"
                          : "hover:bg-gray-50 border border-gray-200"
                      }`}
                      onClick={() => setSelectedDistrict(district)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {district.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {district.codename} • Code: {district.code}
                        </div>
                        <div className="text-xs text-gray-400">
                          {district.division_type} • {district.wards.length}{" "}
                          phường/xã
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal("district", "edit", district);
                          }}
                          title="Sửa"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-100 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(district);
                            setModalType("delete");
                          }}
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chọn tỉnh/thành phố để xem quận/huyện</p>
                </div>
              )}

              {selectedProvince && selectedProvince.districts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có quận/huyện nào</p>
                </div>
              )}
            </div>

            {/* Danh sách phường/xã */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-5 h-5 text-orange-600" />
                  <h2 className="font-semibold text-gray-900">Phường/Xã</h2>
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() => openModal("ward", "add")}
                  disabled={!selectedDistrict}
                  title="Thêm phường/xã"
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm
                </button>
              </div>

              {selectedDistrict ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedDistrict.wards.map((ward) => (
                    <div
                      key={ward._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {ward.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ward.codename} • Code: {ward.code}
                        </div>
                        <div className="text-xs text-gray-400">
                          {ward.division_type} • {ward.short_codename}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded"
                          onClick={() => openModal("ward", "edit", ward)}
                          title="Sửa"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-100 rounded"
                          onClick={() => {
                            setEditingItem(ward);
                            setModalType("delete");
                          }}
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HomeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chọn quận/huyện để xem phường/xã</p>
                </div>
              )}

              {selectedDistrict && selectedDistrict.wards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HomeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có phường/xã nào</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal for Add/Edit */}
      {(modalType === "province" ||
        modalType === "district" ||
        modalType === "ward") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {actionType === "add" ? "Thêm" : "Sửa"}{" "}
                {modalType === "province"
                  ? "tỉnh/thành phố"
                  : modalType === "district"
                  ? "quận/huyện"
                  : "phường/xã"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Nhập tên ${
                    modalType === "province"
                      ? "tỉnh/thành phố"
                      : modalType === "district"
                      ? "quận/huyện"
                      : "phường/xã"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã (Code)
                </label>
                <input
                  type="number"
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Để trống để tự động tạo mã"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codename <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.codename}
                  onChange={(e) =>
                    setFormData({ ...formData, codename: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập codename (ví dụ: thanh_pho_ho_chi_minh)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hành chính
                </label>
                <select
                  value={formData.division_type}
                  onChange={(e) =>
                    setFormData({ ...formData, division_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {modalType === "province" && (
                    <>
                      <option value="province">Tỉnh</option>
                      <option value="city">Thành phố trung ương</option>
                    </>
                  )}
                  {modalType === "district" && (
                    <>
                      <option value="district">Quận</option>
                      <option value="town">Huyện</option>
                      <option value="city">Thành phố</option>
                      <option value="township">Thị xã</option>
                    </>
                  )}
                  {modalType === "ward" && (
                    <>
                      <option value="ward">Phường</option>
                      <option value="commune">Xã</option>
                      <option value="township">Thị trấn</option>
                    </>
                  )}
                </select>
              </div>

              {modalType === "province" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã điện thoại
                  </label>
                  <input
                    type="number"
                    value={formData.phone_code || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone_code: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ví dụ: 28 (cho TP.HCM)"
                  />
                </div>
              )}

              {(modalType === "district" || modalType === "ward") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên viết tắt
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Để trống để sử dụng codename"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  saving || !formData.name.trim() || !formData.codename.trim()
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving
                  ? "Đang lưu..."
                  : actionType === "add"
                  ? "Thêm"
                  : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === "delete" && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-red-600">
                Xác nhận xóa
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium">Bạn có chắc chắn muốn xóa?</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>{editingItem.name}</strong>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Hành động này không thể hoàn tác.
                {"districts" in editingItem &&
                  ` Tất cả ${editingItem.districts.length} quận/huyện sẽ bị xóa.`}
                {"wards" in editingItem &&
                  ` Tất cả ${editingItem.wards.length} phường/xã sẽ bị xóa.`}
              </p>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
