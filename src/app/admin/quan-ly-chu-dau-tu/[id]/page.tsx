"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { DeveloperService } from "@/services/developerService";
import { Developer, UpdateDeveloperRequest } from "@/types/developer";
import { UploadService } from "@/services/uploadService";

interface DeveloperDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DeveloperDetailPage({
  params,
}: DeveloperDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<UpdateDeveloperRequest>>({
    name: "",
    logo: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    description: "",
    foundedYear: new Date().getFullYear(),
    isActive: true,
  });

  useEffect(() => {
    const fetchDeveloper = async () => {
      setLoading(true);
      try {
        const data = await DeveloperService.getDeveloperById(id);
        if (data) {
          setDeveloper(data);
          setForm({
            _id: data._id,
            name: data.name,
            logo: data.logo,
            phone: data.phone,
            email: data.email,
            website: data.website || "",
            address: data.address || "",
            description: data.description || "",
            foundedYear: data.foundedYear || new Date().getFullYear(),
            isActive: data.isActive,
          });
        }
      } catch (error) {
        console.error("Error fetching developer:", error);
        // If developer not found, redirect back
        router.push("/admin/quan-ly-chu-dau-tu");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDeveloper();
    }
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "foundedYear"
          ? parseInt(value) || new Date().getFullYear()
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

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

  const handleSave = async () => {
    if (!form.name?.trim() || !form.phone?.trim() || !form.email?.trim()) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSaving(true);
    try {
      await DeveloperService.updateDeveloper(form as UpdateDeveloperRequest);
      // Refresh data by calling API again
      const data = await DeveloperService.getDeveloperById(id);
      if (data) {
        setDeveloper(data);
      }
      setEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating developer:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!developer) return;

    if (confirm(`Bạn có chắc chắn muốn xóa chủ đầu tư "${developer.name}"?`)) {
      try {
        await DeveloperService.deleteDeveloper(developer._id);
        router.push("/admin/quan-ly-chu-dau-tu");
      } catch (error) {
        console.error("Error deleting developer:", error);
        alert("Có lỗi xảy ra khi xóa chủ đầu tư");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy chủ đầu tư
              </h2>
              <button
                onClick={() => router.push("/admin/quan-ly-chu-dau-tu")}
                className="text-blue-600 hover:text-blue-800"
              >
                Quay lại danh sách
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/admin/quan-ly-chu-dau-tu")}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                  title="Quay lại"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Chi tiết chủ đầu tư
                  </h1>
                  <p className="text-gray-600">{developer.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chủ đầu tư *
                    </label>
                    {editing ? (
                      <input
                        name="name"
                        value={form.name || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {developer.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    {editing ? (
                      <input
                        name="email"
                        type="email"
                        value={form.email || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {developer.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    {editing ? (
                      <input
                        name="phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {developer.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    {editing ? (
                      <input
                        name="website"
                        value={form.website || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {developer.website ? (
                          <a
                            href={developer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {developer.website}
                          </a>
                        ) : (
                          "Chưa có"
                        )}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    {editing ? (
                      <input
                        name="address"
                        value={form.address || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {developer.address || "Chưa có"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm thành lập
                    </label>
                    {editing ? (
                      <input
                        name="foundedYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={form.foundedYear || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {developer.foundedYear || "Chưa có"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    {editing ? (
                      <label className="flex items-center px-3 py-2">
                        <input
                          name="isActive"
                          type="checkbox"
                          checked={form.isActive}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        Hoạt động
                      </label>
                    ) : (
                      <div className="px-3 py-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            developer.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {developer.isActive ? "Hoạt động" : "Tạm ngưng"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    {editing ? (
                      <textarea
                        name="description"
                        value={form.description || ""}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Mô tả về chủ đầu tư..."
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg min-h-[100px]">
                        {developer.description || "Chưa có mô tả"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Logo */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Logo</h2>

                {form.logo && (
                  <div className="mb-4">
                    <div className="relative w-full h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={form.logo}
                        alt="Logo"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                {editing && (
                  <>
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
                            {uploading ? "Đang upload..." : "Click để upload"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => handleLogoUpload(e.target.files)}
                        />
                      </label>
                    </div>

                    <input
                      name="logo"
                      value={form.logo || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Hoặc nhập URL logo"
                    />
                  </>
                )}
              </div>

              {/* Metadata */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Thông tin hệ thống
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <span className="ml-2 font-mono">{developer._id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="ml-2">
                      {new Date(developer.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cập nhật lần cuối:</span>
                    <span className="ml-2">
                      {new Date(developer.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
