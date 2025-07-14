"use client";

import { useState, useEffect, useCallback } from "react";
import {
  packageService,
  Package,
  PackageFormData,
} from "@/services/packageService";

// Simple toast replacement
const showToast = (message: string, type: "success" | "error" = "success") => {
  if (type === "success") {
    alert(`✅ ${message}`);
  } else {
    alert(`❌ ${message}`);
  }
};

const PackageManagement = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const result = await packageService.admin.getAllPackages();

      if (result.success) {
        setPackages(result.data.packages);
      } else {
        showToast("Lỗi khi tải danh sách gói", "error");
      }
    } catch (error) {
      console.error("Fetch packages error:", error);
      showToast("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create package
  const createPackage = async (packageData: PackageFormData) => {
    try {
      const result = await packageService.admin.createPackage(packageData);

      if (result.success) {
        showToast("Tạo gói thành công!");
        fetchPackages();
        setShowCreateForm(false);
        resetForm();
      } else {
        showToast(result.message || "Lỗi khi tạo gói", "error");
      }
    } catch (error) {
      showToast("Lỗi kết nối server", "error");
      console.error("Create package error:", error);
    }
  };

  // Update package
  const updatePackage = async (id: string, packageData: PackageFormData) => {
    try {
      const result = await packageService.admin.updatePackage(id, packageData);

      if (result.success) {
        showToast("Cập nhật gói thành công!");
        fetchPackages();
        setEditingPackage(null);
        resetForm();
      } else {
        showToast(result.message || "Lỗi khi cập nhật gói", "error");
      }
    } catch (error) {
      showToast("Lỗi kết nối server", "error");
      console.error("Update package error:", error);
    }
  };

  // Delete package
  const deletePackage = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa gói này?")) return;

    try {
      const result = await packageService.admin.deletePackage(id);

      if (result.success) {
        showToast("Xóa gói thành công!");
        fetchPackages();
      } else {
        showToast(result.message || "Lỗi khi xóa gói", "error");
      }
    } catch (error) {
      showToast("Lỗi kết nối server", "error");
      console.error("Delete package error:", error);
    }
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

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPackage) {
      updatePackage(editingPackage.id, formData);
    } else {
      createPackage(formData);
    }
  };

  const startEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
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
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingPackage(null);
    setShowCreateForm(false);
    resetForm();
  };

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý Gói Thanh Toán
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tạo Gói Mới
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">
            {editingPackage ? "Chỉnh Sửa Gói" : "Tạo Gói Mới"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Gói *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Gói Cơ Bản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VNĐ) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời Hạn (ngày) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ Ưu Tiên *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as "normal" | "premium" | "vip",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tính Năng
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Hiển thị tin VIP"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Thêm Tính Năng
                </button>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Kích hoạt gói
              </label>
            </div>

            {/* Advanced Settings */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cài Đặt Nâng Cao
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ Tự Hiển Thị
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức Hỗ Trợ
                  </label>
                  <select
                    value={formData.supportLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportLevel: e.target.value as
                          | "basic"
                          | "standard"
                          | "premium",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Cơ Bản</option>
                    <option value="standard">Tiêu Chuẩn</option>
                    <option value="premium">Cao Cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm Giá (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Giá gốc (hiển thị khi có giảm giá) */}
              {(formData.discountPercentage || 0) > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá Gốc
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Giá trước khi giảm"
                  />
                </div>
              )}

              {/* Tính năng đặc biệt */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tính Năng Đặc Biệt
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canPin"
                      checked={formData.canPin}
                      onChange={(e) =>
                        setFormData({ ...formData, canPin: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canPin"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Có thể ghim bài
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canHighlight"
                      checked={formData.canHighlight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          canHighlight: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canHighlight"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Có thể làm nổi bật
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canUseAI"
                      checked={formData.canUseAI}
                      onChange={(e) =>
                        setFormData({ ...formData, canUseAI: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="canUseAI"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Có thể sử dụng AI
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={formData.isPopular}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPopular: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isPopular"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Gói phổ biến
                    </label>
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô Tả Chi Tiết
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết về gói dịch vụ..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingPackage ? "Cập Nhật" : "Tạo Gói"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Packages List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh Sách Gói ({packages.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên Gói
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời Hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ưu Tiên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pkg.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.features.slice(0, 2).join(", ")}
                        {pkg.features.length > 2 && "..."}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(pkg.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pkg.duration} ngày
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pkg.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pkg.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pkg.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => startEdit(pkg)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {packages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Chưa có gói thanh toán nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageManagement;
