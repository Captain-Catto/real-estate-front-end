"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// Mock service
const ProjectService = {
  getProjects: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return [
      {
        id: "1",
        name: "Vinhomes Central Park",
        location: "Bình Thạnh, TP.HCM",
        developer: "Vingroup",
        status: "Đã bàn giao",
        totalUnits: 2800,
        area: "25.5 ha",
      },
      {
        id: "2",
        name: "Masteri An Phú",
        location: "Quận 2, TP.HCM",
        developer: "Masterise Homes",
        status: "Đang bán",
        totalUnits: 1200,
        area: "10 ha",
      },
    ];
  },
  addProject: async (project: any) => {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },
  updateProject: async (project: any) => {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },
  deleteProject: async (id: string) => {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },
};

export default function AdminProjectPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    developer: "",
    status: "Đang bán",
    totalUnits: "",
    area: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await ProjectService.getProjects();
    setProjects(data);
    setLoading(false);
  };

  const handleOpenModal = (project?: any) => {
    if (project) {
      setEditingProject(project);
      setForm({
        name: project.name,
        location: project.location,
        developer: project.developer,
        status: project.status,
        totalUnits: project.totalUnits,
        area: project.area,
      });
    } else {
      setEditingProject(null);
      setForm({
        name: "",
        location: "",
        developer: "",
        status: "Đang bán",
        totalUnits: "",
        area: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (editingProject) {
      await ProjectService.updateProject({ ...editingProject, ...form });
    } else {
      await ProjectService.addProject(form);
    }
    handleCloseModal();
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dự án này?")) {
      await ProjectService.deleteProject(id);
      fetchProjects();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý dự án
              </h1>
              <p className="text-gray-600">
                Thêm, sửa, xóa các dự án bất động sản để người dùng chọn khi
                đăng tin
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm dự án
            </button>
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
                        Tên dự án
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vị trí
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Chủ đầu tư
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tổng căn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Diện tích
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{project.name}</td>
                        <td className="px-6 py-4">{project.location}</td>
                        <td className="px-6 py-4">{project.developer}</td>
                        <td className="px-6 py-4">{project.status}</td>
                        <td className="px-6 py-4">{project.totalUnits}</td>
                        <td className="px-6 py-4">{project.area}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenModal(project)}
                            className="p-1 text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
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
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingProject ? "Chỉnh sửa dự án" : "Thêm dự án"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên dự án *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vị trí *
                    </label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chủ đầu tư *
                    </label>
                    <input
                      name="developer"
                      value={form.developer}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Đang bán">Đang bán</option>
                      <option value="Đã bàn giao">Đã bàn giao</option>
                      <option value="Sắp mở bán">Sắp mở bán</option>
                      <option value="Đang cập nhật">Đang cập nhật</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổng số căn
                    </label>
                    <input
                      name="totalUnits"
                      value={form.totalUnits}
                      onChange={handleChange}
                      type="number"
                      min={0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diện tích
                    </label>
                    <input
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingProject ? "Lưu thay đổi" : "Thêm mới"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
