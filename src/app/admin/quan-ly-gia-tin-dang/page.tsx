"use client";
import { useState, useEffect, useCallback } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  packageService,
  Package,
  PackageFormData,
} from "@/services/packageService";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";

function AdminPackagesPageInternalContent() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    price: 0,
    duration: 30,
    features: [],
    priority: "normal",
    isActive: true,
    description: "",
    canPin: false,
    canHighlight: false,
    canUseAI: false,
    supportLevel: "basic",
    displayOrder: 0,
    isPopular: false,
    discountPercentage: 0,
    originalPrice: 0,
  });

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await packageService.admin.getAllPackages();
      if (result.success) {
        setPackages(result.data.packages);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleCreatePackage = async () => {
    try {
      const result = await packageService.admin.createPackage(formData);
      if (result.success) {
        alert("Tạo gói dịch vụ thành công!");
        setShowCreateModal(false);
        resetForm();
        fetchPackages();
      } else {
        alert(result.message || "Có lỗi xảy ra khi tạo gói dịch vụ!");
      }
    } catch (err) {
      console.error("Error creating package:", err);
      alert("Có lỗi xảy ra khi tạo gói dịch vụ!");
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const result = await packageService.admin.updatePackage(
        editingPackage.id,
        formData
      );
      if (result.success) {
        alert("Cập nhật gói dịch vụ thành công!");
        setShowEditModal(false);
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      } else {
        alert(result.message || "Có lỗi xảy ra khi cập nhật gói dịch vụ!");
      }
    } catch (err) {
      console.error("Error updating package:", err);
      alert("Có lỗi xảy ra khi cập nhật gói dịch vụ!");
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa gói dịch vụ này?")) {
      try {
        const result = await packageService.admin.deletePackage(packageId);
        if (result.success) {
          alert("Xóa gói dịch vụ thành công!");
          fetchPackages();
        } else {
          alert(result.message || "Có lỗi xảy ra khi xóa gói dịch vụ!");
        }
      } catch (err) {
        console.error("Error deleting package:", err);
        alert("Có lỗi xảy ra khi xóa gói dịch vụ!");
      }
    }
  };

  const handleTogglePackageStatus = async (
    packageId: string,
    currentStatus: boolean
  ) => {
    try {
      // Tìm package hiện tại để lấy thông tin
      const currentPackage = packages.find((pkg) => pkg.id === packageId);
      if (!currentPackage) {
        alert("Không tìm thấy gói dịch vụ!");
        return;
      }

      // Tạo data để update với trạng thái mới
      const updateData: PackageFormData = {
        name: currentPackage.name,
        price: currentPackage.price,
        duration: currentPackage.duration,
        features: currentPackage.features,
        priority: currentPackage.priority,
        isActive: !currentStatus, // Đổi trạng thái
        description: currentPackage.description || "",
        canPin: currentPackage.canPin || false,
        canHighlight: currentPackage.canHighlight || false,
        canUseAI: currentPackage.canUseAI || false,
        supportLevel: currentPackage.supportLevel || "basic",
        displayOrder: currentPackage.displayOrder || 0,
        isPopular: currentPackage.isPopular || false,
        discountPercentage: currentPackage.discountPercentage || 0,
        originalPrice: currentPackage.originalPrice || 0,
      };

      const result = await packageService.admin.updatePackage(
        packageId,
        updateData
      );
      if (result.success) {
        alert(
          `${!currentStatus ? "Kích hoạt" : "Tạm dừng"} gói dịch vụ thành công!`
        );
        fetchPackages();
      } else {
        alert(result.message || "Có lỗi xảy ra khi cập nhật trạng thái!");
      }
    } catch (err) {
      console.error("Error toggling package status:", err);
      alert("Có lỗi xảy ra khi cập nhật trạng thái!");
    }
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      features: pkg.features,
      priority: pkg.priority,
      isActive: pkg.isActive,
      description: pkg.description || "",
      canPin: pkg.canPin || false,
      canHighlight: pkg.canHighlight || false,
      canUseAI: pkg.canUseAI || false,
      supportLevel: pkg.supportLevel || "basic",
      displayOrder: pkg.displayOrder || 0,
      isPopular: pkg.isPopular || false,
      discountPercentage: pkg.discountPercentage || 0,
      originalPrice: pkg.originalPrice || 0,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      duration: 30,
      features: [],
      priority: "normal",
      isActive: true,
      description: "",
      canPin: false,
      canHighlight: false,
      canUseAI: false,
      supportLevel: "basic",
      displayOrder: 0,
      isPopular: false,
      discountPercentage: 0,
      originalPrice: 0,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "vip":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            VIP
          </span>
        );
      case "premium":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
            Premium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý giá tin đăng
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Quản lý giá cả và gói dịch vụ tin đăng bất động sản
              </p>
            </div>

            {/* Add Package Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Thêm gói dịch vụ mới
              </button>
            </div>

            {/* Packages Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Danh sách gói dịch vụ
                </h3>
              </div>

              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Đang tải...</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Chưa có gói dịch vụ nào
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên gói
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời hạn
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {packages.map((pkg) => (
                        <tr key={pkg.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {pkg.name}
                            </div>
                            {pkg.description && (
                              <div className="text-sm text-gray-500">
                                {pkg.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatPrice(pkg.price)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {pkg.duration} ngày
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPriorityBadge(pkg.priority)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                handleTogglePackageStatus(pkg.id, pkg.isActive)
                              }
                              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                pkg.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                              title={
                                pkg.isActive
                                  ? "Bấm để tạm dừng gói"
                                  : "Bấm để kích hoạt gói"
                              }
                            >
                              {pkg.isActive ? "Hoạt động" : "Tạm dừng"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditPackage(pkg)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Create Package Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Thêm gói dịch vụ mới
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên gói
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Giá (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: parseInt(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thời hạn (ngày)
                        </label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Loại gói
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: e.target.value as
                                | "normal"
                                | "premium"
                                | "vip",
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="normal">Normal</option>
                          <option value="premium">Premium</option>
                          <option value="vip">VIP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mô tả
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Kích hoạt gói
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleCreatePackage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tạo gói
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Package Modal */}
            {showEditModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Chỉnh sửa gói dịch vụ
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên gói
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Giá (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: parseInt(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thời hạn (ngày)
                        </label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Loại gói
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: e.target.value as
                                | "normal"
                                | "premium"
                                | "vip",
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="normal">Normal</option>
                          <option value="premium">Premium</option>
                          <option value="vip">VIP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mô tả
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Kích hoạt gói
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingPackage(null);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdatePackage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrap component with AdminGuard
// Wrap component with AdminGuard
export default function ProtectedAdminPackagesPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.LOCATION.MANAGE_PRICES]}>
      <AdminPackagesPageInternalContent />
    </AdminGuard>
  );
}
