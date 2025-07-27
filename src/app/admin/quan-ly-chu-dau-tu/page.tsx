"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Pagination } from "@/components/common/Pagination";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DeveloperService } from "@/services/developerService";
import {
  DeveloperListItem,
  CreateDeveloperRequest,
  UpdateDeveloperRequest,
} from "@/types/developer";
import { UploadService } from "@/services/uploadService";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDeveloperPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [developers, setDevelopers] = useState<DeveloperListItem[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<
    DeveloperListItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDeveloper, setEditingDeveloper] =
    useState<DeveloperListItem | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedDevelopers, setPaginatedDevelopers] = useState<
    DeveloperListItem[]
  >([]);

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

  // Authentication check
  useEffect(() => {
    if (user !== undefined) {
      setAccessChecked(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && accessChecked && isAuthenticated && hasRole("admin")) {
      fetchDevelopers();
    }
  }, [user, accessChecked, isAuthenticated, hasRole]);

  useEffect(() => {
    if (developers.length > 0) {
      const filtered = developers.filter((developer) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          developer.name.toLowerCase().includes(searchTermLower) ||
          developer.phone.toLowerCase().includes(searchTermLower) ||
          developer.email.toLowerCase().includes(searchTermLower)
        );
      });
      setFilteredDevelopers(filtered);
    } else {
      setFilteredDevelopers([]);
    }
  }, [searchTerm, developers]);

  // Calculate pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedDevelopers(filteredDevelopers.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredDevelopers.length / itemsPerPage));
  }, [filteredDevelopers, currentPage, itemsPerPage]);

  // Reset to first page when itemsPerPage or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const data = await DeveloperService.getAdminDevelopers();
      setDevelopers(data.developers);
      setFilteredDevelopers(data.developers);
    } catch (error) {
      console.error("Error fetching developers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (developer?: DeveloperListItem) => {
    if (developer) {
      setEditingDeveloper(developer);
      try {
        // Fetch full developer data for editing
        const fullData = await DeveloperService.getDeveloperById(developer._id);
        if (fullData) {
          setForm({
            name: fullData.name,
            logo: fullData.logo,
            phone: fullData.phone,
            email: fullData.email,
            website: fullData.website || "",
            address: fullData.address || "",
            description: fullData.description || "",
            foundedYear: fullData.foundedYear || new Date().getFullYear(),
          });
        } else {
          // Fallback to limited data
          setForm({
            name: developer.name,
            logo: developer.logo,
            phone: developer.phone,
            email: developer.email,
            website: "",
            address: "",
            description: "",
            foundedYear: developer.foundedYear || new Date().getFullYear(),
          });
        }
      } catch (error) {
        console.error("Error fetching full developer data:", error);
        // Fallback to limited data
        setForm({
          name: developer.name,
          logo: developer.logo,
          phone: developer.phone,
          email: developer.email,
          website: "",
          address: "",
          description: "",
          foundedYear: developer.foundedYear || new Date().getFullYear(),
        });
      }
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
    setForm((prev: Partial<CreateDeveloperRequest>) => ({
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
        setForm((prev: Partial<CreateDeveloperRequest>) => ({
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

  if (!accessChecked) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa đăng nhập
              </h2>
              <p className="text-gray-600">
                Vui lòng đăng nhập để truy cập trang này.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hasRole("admin")) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Không có quyền truy cập
              </h2>
              <p className="text-gray-600">
                Bạn không có quyền truy cập vào trang này.
              </p>
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

          <div className="mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 whitespace-nowrap">
                    Số lượng/trang:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : paginatedDevelopers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500 mb-2">
                    Không tìm thấy chủ đầu tư phù hợp
                  </p>
                  {searchTerm && (
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => setSearchTerm("")}
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in">
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
                      {paginatedDevelopers.map((developer) => (
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
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/quan-ly-chu-dau-tu/${developer._id}`
                                    )
                                  }
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                                >
                                  {developer.name}
                                </button>
                                <div className="text-sm text-gray-500">
                                  ID: {developer._id}
                                </div>
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
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && filteredDevelopers.length > 0 && (
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredDevelopers.length
                    )}{" "}
                    trong tổng số {filteredDevelopers.length} chủ đầu tư
                  </span>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
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
