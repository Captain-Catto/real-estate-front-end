"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ProjectService } from "@/services/projectService";
import { UploadService } from "@/services/uploadService";
import { locationService, Location } from "@/services/locationService";
import {
  ProjectListItem,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project";

export default function AdminProjectPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [modalStep, setModalStep] = useState(1);

  // Location states
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState<{
    provinces: boolean;
    districts: boolean;
  }>({
    provinces: false,
    districts: false,
  });
  const [form, setForm] = useState<Partial<CreateProjectRequest>>({
    name: "",
    slug: "",
    address: "",
    location: {
      provinceCode: "",
      districtCode: "",
    },
    latitude: 0,
    longitude: 0,
    developer: {
      name: "",
      logo: "",
      phone: "",
      email: "",
    },
    images: [],
    videos: [],
    totalUnits: 0,
    area: "",
    numberOfTowers: 0,
    density: "",
    status: "Đang bán",
    priceRange: "",
    description: "",
    facilities: [],
    specifications: {},
    locationInsights: {
      schools: [],
      hospitals: [],
      supermarkets: [],
      parks: [],
      restaurants: [],
    },
    faqs: [],
    contact: {
      hotline: "",
      email: "",
    },
    map: {
      lat: 0,
      lng: 0,
    },
  });

  useEffect(() => {
    fetchProjects();
    fetchProvinces();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await ProjectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch location data
  const fetchProvinces = async () => {
    setLocationLoading((prev) => ({ ...prev, provinces: true }));
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLocationLoading((prev) => ({ ...prev, provinces: false }));
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    if (!provinceCode) return;
    setLocationLoading((prev) => ({ ...prev, districts: true }));
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLocationLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "provinceCode") {
      setSelectedProvince(value);
      setSelectedDistrict("");
      fetchDistricts(value);

      setForm((prev) => ({
        ...prev,
        location: {
          provinceCode: value,
          districtCode: "",
        },
      }));
    } else if (name === "districtCode") {
      setSelectedDistrict(value);

      setForm((prev) => ({
        ...prev,
        location: {
          provinceCode: prev.location?.provinceCode || "",
          districtCode: value,
        },
      }));
    }
  };

  // Load location data for editing
  const loadLocationData = async (project: Project) => {
    if (project.location) {
      const { provinceCode, districtCode } = project.location;

      if (provinceCode) {
        setSelectedProvince(provinceCode);
        await fetchDistricts(provinceCode);

        if (districtCode) {
          setSelectedDistrict(districtCode);
        }
      }
    }
  };

  // Handle opening the modal to add or edit a project
  const handleOpenModal = async (project?: ProjectListItem) => {
    if (project) {
      setModalLoading(true);
      try {
        // Fetch full project details
        const fullProject = await ProjectService.getProjectById(project.id);
        if (fullProject) {
          setEditingProject(fullProject);
          setForm(fullProject);

          // Load location data when editing
          if (fullProject.location) {
            await loadLocationData(fullProject);
          }
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setModalLoading(false);
      }
    } else {
      setEditingProject(null);
      setForm({
        name: "",
        slug: "",
        address: "",
        location: {
          provinceCode: "",
          districtCode: "",
        },
        latitude: 0,
        longitude: 0,
        developer: {
          name: "",
          logo: "",
          phone: "",
          email: "",
        },
        images: [],
        videos: [],
        totalUnits: 0,
        area: "",
        numberOfTowers: 0,
        density: "",
        status: "Đang bán",
        priceRange: "",
        description: "",
        facilities: [],
        specifications: {},
        locationInsights: {
          schools: [],
          hospitals: [],
          supermarkets: [],
          parks: [],
          restaurants: [],
        },
        faqs: [],
        contact: {
          hotline: "",
          email: "",
        },
        map: {
          lat: 0,
          lng: 0,
        },
      });

      // Reset location selections
      setSelectedProvince("");
      setSelectedDistrict("");
      setDistricts([]);
    }
    setShowModal(true);
    setModalStep(1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setModalStep(1);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof typeof prev] as Record<string, unknown>) ||
            {}),
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]:
          name === "totalUnits" ||
          name === "numberOfTowers" ||
          name === "latitude" ||
          name === "longitude"
            ? Number(value)
            : value,
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setForm((prev) => {
      const array = (prev[field as keyof typeof prev] as string[]) || [];
      const newArray = [...array];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const addArrayItem = (
    field: string,
    defaultValue: string | { question: string; answer: string } = ""
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: [
        ...((prev[field as keyof typeof prev] as unknown[]) || []),
        defaultValue,
      ],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setForm((prev) => {
      const array = (prev[field as keyof typeof prev] as unknown[]) || [];
      return {
        ...prev,
        [field]: array.filter((_, i: number) => i !== index),
      };
    });
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadResults = await UploadService.uploadImages(files);
      const successfulUploads = uploadResults
        .filter((result) => result.success)
        .map((result) => result.data?.url)
        .filter(Boolean) as string[];

      if (successfulUploads.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...successfulUploads],
        }));
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Có lỗi xảy ra khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const removeImage = async (index: number, imageUrl: string) => {
    try {
      // Remove from form first
      setForm((prev) => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index) || [],
      }));

      // Try to delete from server (optional, don't block UI if fails)
      await UploadService.deleteImage(imageUrl);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await ProjectService.updateProject({
          ...form,
          id: editingProject.id,
        } as UpdateProjectRequest);
        handleCloseModal();
        fetchProjects();

        // Ask if user wants to go to detail page for more editing
        if (
          confirm(
            "Lưu thành công! Bạn có muốn chuyển đến trang chi tiết để chỉnh sửa thêm không?"
          )
        ) {
          router.push(`/admin/quan-ly-du-an/${editingProject.id}`);
        }
      } else {
        // Create new project and redirect to detail page
        const result = await ProjectService.addProject(
          form as CreateProjectRequest
        );
        if (result.success && result.data) {
          handleCloseModal();
          // Redirect to project detail page for further editing
          router.push(`/admin/quan-ly-du-an/${result.data.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dự án này?")) {
      try {
        await ProjectService.deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  // Handle specifications
  const handleSpecificationChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [key]: value,
      },
    }));
  };

  const addSpecification = () => {
    const timestamp = Date.now();
    const newKey = `Thông số ${timestamp}`;
    setForm((prev) => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [newKey]: "",
      },
    }));
  };

  const removeSpecification = (key: string) => {
    setForm((prev) => {
      const newSpecs = { ...(prev.specifications || {}) };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
  };

  const handleSpecificationKeyChange = (oldKey: string, newKey: string) => {
    if (newKey.trim() === oldKey) return;

    setForm((prev) => {
      const specs = { ...(prev.specifications || {}) };
      const value = specs[oldKey] || "";
      delete specs[oldKey];
      specs[newKey.trim()] = value;
      return {
        ...prev,
        specifications: specs,
      };
    });
  };

  const renderModalStep = () => {
    switch (modalStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên dự án *
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug URL *
                </label>
                <input
                  name="slug"
                  value={form.slug || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="vinhomes-central-park"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ *
                </label>
                <input
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Vị trí dự án *
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {" "}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="provinceCode"
                      value={selectedProvince}
                      onChange={handleLocationChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {locationLoading.provinces && (
                      <span className="text-xs text-gray-500">Đang tải...</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện *
                    </label>
                    <select
                      name="districtCode"
                      value={selectedDistrict}
                      onChange={handleLocationChange}
                      required
                      disabled={!selectedProvince || locationLoading.districts}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {locationLoading.districts && (
                      <span className="text-xs text-gray-500">Đang tải...</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vĩ độ
                  </label>
                  <input
                    name="latitude"
                    value={form.latitude || 0}
                    onChange={handleChange}
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kinh độ
                  </label>
                  <input
                    name="longitude"
                    value={form.longitude || 0}
                    onChange={handleChange}
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={form.status || "Đang bán"}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Đang bán">Đang bán</option>
                  <option value="Đã bàn giao">Đã bàn giao</option>
                  <option value="Sắp mở bán">Sắp mở bán</option>
                  <option value="Đang cập nhật">Đang cập nhật</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin dự án</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tổng số căn
                  </label>
                  <input
                    name="totalUnits"
                    value={form.totalUnits || 0}
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
                    value={form.area || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="25.5 ha"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tòa nhà
                  </label>
                  <input
                    name="numberOfTowers"
                    value={form.numberOfTowers || 0}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật độ xây dựng
                  </label>
                  <input
                    name="density"
                    value={form.density || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="30%"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng giá
                </label>
                <input
                  name="priceRange"
                  value={form.priceRange || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="4.5 - 12 tỷ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả dự án
                </label>
                <textarea
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Mô tả chi tiết về dự án..."
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin chủ đầu tư</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chủ đầu tư *
                </label>
                <input
                  name="developer.name"
                  value={form.developer?.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Upload logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo chủ đầu tư
                </label>

                {/* Current logo preview */}
                {form.developer?.logo && (
                  <div className="mb-3">
                    <div className="relative w-32 h-20 border border-gray-300 rounded-lg overflow-hidden">
                      <Image
                        src={form.developer.logo}
                        alt="Logo preview"
                        width={128}
                        height={80}
                        className="w-full h-full object-contain bg-gray-50"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                {/* Upload button */}
                <div className="mb-3">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;

                        setUploading(true);
                        try {
                          const uploadResults =
                            await UploadService.uploadImages(files);
                          const successfulUpload = uploadResults.find(
                            (result) => result.success
                          );

                          if (successfulUpload?.data?.url) {
                            setForm((prev) => ({
                              ...prev,
                              developer: {
                                name: prev.developer?.name || "",
                                phone: prev.developer?.phone || "",
                                email: prev.developer?.email || "",
                                logo: successfulUpload.data!.url,
                              },
                            }));
                          }
                        } catch (error) {
                          console.error("Error uploading logo:", error);
                          alert("Có lỗi xảy ra khi upload logo");
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Manual URL input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hoặc nhập URL logo thủ công
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="developer.logo"
                      value={form.developer?.logo || ""}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="https://example.com/logo.png"
                    />
                    {form.developer?.logo && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            developer: {
                              name: prev.developer?.name || "",
                              phone: prev.developer?.phone || "",
                              email: prev.developer?.email || "",
                              logo: "",
                            },
                          }));
                        }}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  name="developer.phone"
                  value={form.developer?.phone || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="developer.email"
                  value={form.developer?.email || ""}
                  onChange={handleChange}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotline liên hệ
                </label>
                <input
                  name="contact.hotline"
                  value={form.contact?.hotline || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email liên hệ
                </label>
                <input
                  name="contact.email"
                  value={form.contact?.email || ""}
                  onChange={handleChange}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Hình ảnh, Video và Tiện ích</h3>
            <div className="space-y-6">
              {/* Upload ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh dự án
                </label>

                {/* File input để upload */}
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
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
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click để upload</span>{" "}
                        hoặc kéo thả ảnh vào đây
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (Max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                  </label>
                </div>

                {/* List ảnh hiện tại */}
                {uploading && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600">
                      Đang upload ảnh...
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {(form.images || []).map((image, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {image && (
                        <div className="relative w-16 h-16">
                          <Image
                            src={image}
                            alt={`Preview ${index}`}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded"
                            unoptimized
                          />
                        </div>
                      )}
                      <input
                        value={image}
                        onChange={(e) =>
                          handleArrayChange("images", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="URL ảnh hoặc sẽ được tự động thêm sau khi upload"
                        readOnly={image.startsWith("https://")}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, image)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addArrayItem("images")}
                  className="mt-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  + Thêm URL ảnh thủ công
                </button>
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video dự án (YouTube, Vimeo links)
                </label>
                <div className="space-y-2">
                  {(form.videos || []).map((video, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={video}
                        onChange={(e) =>
                          handleArrayChange("videos", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://youtube.com/watch?v=... hoặc https://vimeo.com/..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("videos", index)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("videos")}
                  className="mt-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  + Thêm video
                </button>
              </div>

              {/* Tiện ích */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiện ích dự án
                </label>
                <div className="space-y-2">
                  {(form.facilities || []).map((facility, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={facility}
                        onChange={(e) =>
                          handleArrayChange("facilities", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ví dụ: Hồ bơi Olympic, Gym hiện đại, Sân tennis..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("facilities", index)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("facilities")}
                  className="mt-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  + Thêm tiện ích
                </button>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Vị trí & Tiện ích xung quanh
            </h3>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Thông tin vị trí chi tiết
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700">
                    Các thông tin về tiện ích xung quanh (trường học, bệnh viện,
                    siêu thị, etc.) sẽ được chỉnh sửa chi tiết ở trang quản lý
                    dự án sau khi tạo/cập nhật.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông số kỹ thuật</h3>
            <div className="space-y-4">
              {/* Add new specification form */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Thêm thông số kỹ thuật mới
                  </h4>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => addSpecification()}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Thêm thông số
                  </button>
                </div>
              </div>

              {/* Existing specifications */}
              <div className="space-y-3">
                {Object.entries(form.specifications || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Tên thông số
                          </label>
                          <input
                            type="text"
                            value={key}
                            onChange={(e) =>
                              handleSpecificationKeyChange(key, e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Giá trị
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                handleSpecificationChange(key, e.target.value)
                              }
                              placeholder="Nhập giá trị..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeSpecification(key)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              title="Xóa thông số"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {Object.keys(form.specifications || {}).length === 0 && (
                  <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                    <i className="fas fa-cogs text-3xl mb-2"></i>
                    <p className="font-medium">Chưa có thông số kỹ thuật nào</p>
                    <p className="text-sm">
                      Sử dụng form bên trên để thêm thông số mới
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">FAQ</h3>
            <div className="space-y-4">
              {(form.faqs || []).map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Câu hỏi
                      </label>
                      <input
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...(form.faqs || [])];
                          newFaqs[index] = {
                            ...newFaqs[index],
                            question: e.target.value,
                          };
                          setForm((prev) => ({ ...prev, faqs: newFaqs }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Có gần metro không?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Câu trả lời
                      </label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...(form.faqs || [])];
                          newFaqs[index] = {
                            ...newFaqs[index],
                            answer: e.target.value,
                          };
                          setForm((prev) => ({ ...prev, faqs: newFaqs }));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Có, dự án cách ga metro..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeArrayItem("faqs", index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Xóa FAQ
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  addArrayItem("faqs", { question: "", answer: "" })
                }
                className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
              >
                + Thêm FAQ
              </button>
            </div>
          </div>
        );
      default:
        return null;
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
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              project.status === "Đã bàn giao"
                                ? "bg-green-100 text-green-800"
                                : project.status === "Đang bán"
                                ? "bg-blue-100 text-blue-800"
                                : project.status === "Sắp mở bán"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{project.totalUnits}</td>
                        <td className="px-6 py-4">{project.area}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(project)}
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title="Chỉnh sửa nhanh"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/quan-ly-du-an/${project.id}`
                                )
                              }
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              title="Chỉnh sửa chi tiết"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="p-1 text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <TrashIcon className="h-4 w-4" />
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

          {/* Enhanced Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      {editingProject ? "Chỉnh sửa dự án" : "Thêm dự án"}
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

                  {/* Step Indicator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      {[
                        { step: 1, label: "Thông tin cơ bản" },
                        { step: 2, label: "Chi tiết dự án" },
                        { step: 3, label: "Chủ đầu tư" },
                        { step: 4, label: "Hình ảnh & Tiện ích" },
                        { step: 5, label: "Vị trí" },
                        { step: 6, label: "FAQ" },
                      ].map(({ step }) => (
                        <div key={step} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              modalStep === step
                                ? "bg-blue-600 text-white"
                                : modalStep > step
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {modalStep > step ? "✓" : step}
                          </div>
                          {step < 6 && (
                            <div
                              className={`w-8 h-1 mx-2 ${
                                modalStep > step
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Current step label */}
                    <div className="text-center">
                      <span className="text-sm text-gray-500">
                        Bước {modalStep}/7:{" "}
                        {modalStep === 1 && "Thông tin cơ bản"}
                        {modalStep === 2 && "Chi tiết dự án"}
                        {modalStep === 3 && "Thông tin chủ đầu tư"}
                        {modalStep === 4 && "Hình ảnh & Tiện ích"}
                        {modalStep === 5 && "Vị trí & Bản đồ"}
                        {modalStep === 6 && "Thông số kỹ thuật"}
                        {modalStep === 7 && "FAQ & Hoàn tất"}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {modalLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">
                          Đang tải dữ liệu...
                        </span>
                      </div>
                    ) : (
                      renderModalStep()
                    )}

                    {/* Thông báo cho step cuối */}
                    {modalStep === 6 && !modalLoading && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-blue-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">
                              Thông tin bổ sung
                            </h4>
                            <p className="mt-1 text-sm text-blue-700">
                              Sau khi{" "}
                              {editingProject ? "lưu thay đổi" : "tạo dự án"},
                              bạn có thể chỉnh sửa chi tiết hơn (tiện ích xung
                              quanh, FAQ, hình ảnh, v.v.) tại trang chi tiết dự
                              án.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-8">
                      <div>
                        {modalStep > 1 && !modalLoading && (
                          <button
                            type="button"
                            onClick={() => setModalStep(modalStep - 1)}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Quay lại
                          </button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        {!modalLoading &&
                          (modalStep < 7 ? (
                            <button
                              type="button"
                              onClick={() => setModalStep(modalStep + 1)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Tiếp theo
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              {editingProject ? "Lưu thay đổi" : "Thêm mới"}
                            </button>
                          ))}
                      </div>
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
