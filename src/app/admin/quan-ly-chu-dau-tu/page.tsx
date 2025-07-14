"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  DeveloperService,
  DeveloperListItem,
  CreateDeveloperRequest,
  UpdateDeveloperRequest,
} from "@/services/developerService";
import { UploadService } from "@/services/uploadService";

export default function AdminDeveloperPage() {
  const [developers, setDevelopers] = useState<DeveloperListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDeveloper, setEditingDeveloper] =
    useState<DeveloperListItem | null>(null);

  const [form, setForm] = useState<Partial<CreateDeveloperRequest>>({
    name: "",
    logo: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    description: "",
    foundedYear: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const data = await DeveloperService.getAdminDevelopers();
      setDevelopers(data.developers);
    } catch (error) {
      console.error("Error fetching developers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (developer?: DeveloperListItem) => {
    if (developer) {
      setEditingDeveloper(developer);
      setForm({
        name: developer.name,
        logo: developer.logo,
        phone: developer.phone,
        email: developer.email,
        website: developer.website || "",
        address: developer.address || "",
        description: developer.description || "",
        foundedYear: developer.foundedYear || new Date().getFullYear(),
      });
    } else {
      setEditingDeveloper(null);
      setForm({
        name: "",
        logo: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        description: "",
        foundedYear: new Date().getFullYear(),
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDeveloper(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "foundedYear"
          ? parseInt(value) || new Date().getFullYear()
          : value,
    }));
  };

  // Handle logo upload
  const handleLogoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadResults = await UploadService.uploadImages(files);
      const successfulUpload = uploadResults.find((result) => result.success);

      if (successfulUpload?.data?.url) {
        setForm((prev) => ({
          ...prev,
          logo: successfulUpload.data!.url,
        }));
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Có lỗi xảy ra khi upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validationErrors: string[] = [];

    if (!form.name?.trim()) {
      validationErrors.push("Tên chủ đầu tư");
    }

    if (!form.phone?.trim()) {
      validationErrors.push("Số điện thoại");
    }

    if (!form.email?.trim()) {
      validationErrors.push("Email");
    }

    if (validationErrors.length > 0) {
      alert(
        `Vui lòng điền đầy đủ thông tin bắt buộc:\\n• ${validationErrors.join(
          "\\n• "
        )}`
      );
      return;
    }

    try {
      if (editingDeveloper) {
        await DeveloperService.updateDeveloper({
          ...form,
          _id: editingDeveloper._id,
        } as UpdateDeveloperRequest);
      } else {
        await DeveloperService.createDeveloper(form as CreateDeveloperRequest);
      }
      handleCloseModal();
      fetchDevelopers();
    } catch (error) {
      console.error("Error saving developer:", error);
      alert("Có lỗi xảy ra khi lưu thông tin chủ đầu tư");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chủ đầu tư "${name}"?`)) {
      try {
        await DeveloperService.deleteDeveloper(id);
        fetchDevelopers();
      } catch (error) {
        console.error("Error deleting developer:", error);
        alert("Có lỗi xảy ra khi xóa chủ đầu tư");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý chủ đầu tư
                </h1>
                <p className="text-gray-600">
                  Thêm, sửa, xóa thông tin các chủ đầu tư bất động sản
                </p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5" />
                Thêm chủ đầu tư
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Logo & Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Năm thành lập
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {developers.map((developer) => (
                      <tr key={developer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {developer.logo && (
                              <div className="relative w-12 h-12 mr-4">
                                <Image
                                  src={developer.logo}
                                  alt={developer.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-contain rounded-lg"
                                  unoptimized
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {developer.name}
                              </div>
                              {developer.website && (
                                <div className="text-sm text-blue-600">
                                  <a
                                    href={developer.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {developer.website}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {developer.phone}
                          </div>
                          <div className="text-sm text-gray-500">
                            {developer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {developer.foundedYear || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              developer.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {developer.isActive ? "Hoạt động" : "Tạm ngưng"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(developer)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(developer._id, developer.name)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      {editingDeveloper
                        ? "Sửa chủ đầu tư"
                        : "Thêm chủ đầu tư mới"}
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên chủ đầu tư *
                      </label>
                      <input
                        name="name"
                        value={form.name || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo
                      </label>

                      {form.logo && (
                        <div className="mb-3">
                          <div className="relative w-24 h-16 border border-gray-300 rounded-lg overflow-hidden">
                            <Image
                              src={form.logo}
                              alt="Logo preview"
                              width={96}
                              height={64}
                              className="w-full h-full object-contain bg-gray-50"
                              unoptimized
                            />
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center py-2">
                            <svg
                              className="w-6 h-6 mb-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-xs text-gray-500">
                              Click để upload logo
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoUpload(e.target.files)}
                          />
                        </label>
                      </div>

                      <div>
                        <input
                          name="logo"
                          value={form.logo || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Hoặc nhập URL logo"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        name="phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        name="website"
                        value={form.website || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ
                      </label>
                      <input
                        name="address"
                        value={form.address || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Năm thành lập
                      </label>
                      <input
                        name="foundedYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={form.foundedYear || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        value={form.description || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Mô tả về chủ đầu tư..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {uploading
                          ? "Đang upload..."
                          : editingDeveloper
                          ? "Cập nhật"
                          : "Tạo mới"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
