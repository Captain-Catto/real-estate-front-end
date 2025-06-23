"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import QuillEditor from "@/components/admin/QuillEditor";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import imgTest from "@/assets/images/card-img.jpg";

interface Developer {
  name: string;
  logo: string;
  phone: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  address: string;
  fullLocation: string;
  latitude: number;
  longitude: number;
  developer: Developer;
  images: (string | StaticImageData)[];
  videos?: string[];
  totalUnits: number;
  area: string;
  numberOfTowers: number;
  density: string;
  status: "Đang cập nhật" | "Sắp mở bán" | "Đã bàn giao" | "Đang bán";
  priceRange: string;
  description: string;
  facilities: string[];
  specifications: {
    [key: string]: string;
  };
  locationInsights: {
    schools: Array<{ name: string; distance: string }>;
    hospitals: Array<{ name: string; distance: string }>;
    supermarkets: Array<{ name: string; distance: string }>;
    parks: Array<{ name: string; distance: string }>;
    restaurants: Array<{ name: string; distance: string }>;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

// Mock service
const ProjectService = {
  getProjectById: async (id: string): Promise<Project> => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      id,
      name: "Vinhomes Central Park",
      slug: "vinhomes-central-park",
      address: "208 Nguyễn Hữu Cảnh",
      fullLocation: "Bình Thạnh, TP.HCM",
      latitude: 10.7879,
      longitude: 106.7197,
      developer: {
        name: "Tập đoàn Vingroup",
        logo: "/images/vingroup-logo.jpg",
        phone: "0283.567.8900",
        email: "info@vingroup.net",
      },
      images: [imgTest, imgTest, imgTest, imgTest, imgTest],
      videos: ["/videos/vinhomes-cp-tour.mp4"],
      totalUnits: 2800,
      area: "25.5 ha",
      numberOfTowers: 12,
      density: "30%",
      status: "Đã bàn giao",
      priceRange: "4.5 - 12 tỷ",
      description: `
        <h3>Vinhomes Central Park - Khu đô thị phức hợp cao cấp</h3>
        <p>Vinhomes Central Park là khu đô thị phức hợp cao cấp tại trung tâm TP.HCM.</p>
        <p>Dự án có công viên trung tâm 14ha và đầy đủ tiện ích như Vincom, trường học, bệnh viện...</p>
        <p>Với vị trí đắc địa và hệ thống tiện ích hoàn hảo, đây là nơi lý tưởng để an cư lập nghiệp.</p>
      `,
      facilities: [
        "Công viên trung tâm 14ha",
        "Vincom Center",
        "Trường quốc tế",
        "Bệnh viện Vinmec",
        "Hồ bơi Olympic",
        "Gym & Spa",
        "Sân tennis",
        "Khu thể thao",
        "Khu vui chơi trẻ em",
        "Phòng họp cao cấp",
        "An ninh 24/7",
        "Dịch vụ concierge",
      ],
      specifications: {
        "Tổng diện tích": "25.5 ha",
        "Số tòa nhà": "12 tòa",
        "Tổng số căn": "2800 căn",
        "Mật độ xây dựng": "30%",
        "Chiều cao": "45 tầng",
        "Năm khởi công": "2015",
        "Năm hoàn thiện": "2018",
        "Chủ đầu tư": "Vingroup",
        "Đơn vị thi công": "Coteccons",
        "Đơn vị thiết kế": "ARUP",
        "Hướng chính": "Nam",
        "Loại hình": "Căn hộ chung cư cao cấp",
      },
      locationInsights: {
        schools: [
          { name: "Vinschool Central Park", distance: "100m" },
          { name: "Trường ĐH Kinh tế", distance: "2km" },
          { name: "Trường THPT Lê Quý Đôn", distance: "1.5km" },
        ],
        hospitals: [
          { name: "Vinmec Central Park", distance: "200m" },
          { name: "Bệnh viện Chợ Rẫy", distance: "3km" },
        ],
        supermarkets: [
          { name: "Vincom Center", distance: "100m" },
          { name: "Saigon Centre", distance: "2km" },
          { name: "BigC An Lạc", distance: "4km" },
        ],
        parks: [
          { name: "Công viên trung tâm", distance: "0m" },
          { name: "Công viên 23/9", distance: "3km" },
        ],
        restaurants: [
          { name: "The Observatory", distance: "500m" },
          { name: "Bitexco Sky Bar", distance: "3km" },
          { name: "McDonald's", distance: "1km" },
        ],
      },
      faqs: [
        {
          question: "Có gần metro không?",
          answer: "Có, dự án cách ga metro Bến Thành chỉ 10 phút đi xe.",
        },
        {
          question: "Tiện ích nội khu như thế nào?",
          answer:
            "Đầy đủ tiện ích với công viên 14ha, Vincom, trường học, bệnh viện ngay trong khu.",
        },
        {
          question: "Có chỗ đậu xe không?",
          answer:
            "Có hầm đỗ xe rộng rãi với đủ chỗ cho tất cả cư dân và khách thăm.",
        },
      ],
    };
  },
  updateProject: async (id: string, data: any) => {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },
};

export default function AdminProjectEditPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    ProjectService.getProjectById(id).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setProject((prev) => ({
      ...prev!,
      [name]: type === "number" ? (value ? parseFloat(value) : 0) : value,
    }));
  };

  const handleDeveloperChange = (field: keyof Developer, value: string) => {
    setProject((prev) => ({
      ...prev!,
      developer: {
        ...prev!.developer,
        [field]: value,
      },
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setProject((prev) => ({ ...prev!, description: value }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setProject((prev) => ({
      ...prev!,
      specifications: {
        ...prev!.specifications,
        [key]: value,
      },
    }));
  };

  const handleFacilityChange = (index: number, value: string) => {
    setProject((prev) => ({
      ...prev!,
      facilities: prev!.facilities.map((facility, i) =>
        i === index ? value : facility
      ),
    }));
  };

  const addFacility = () => {
    setProject((prev) => ({
      ...prev!,
      facilities: [...prev!.facilities, ""],
    }));
  };

  const removeFacility = (index: number) => {
    setProject((prev) => ({
      ...prev!,
      facilities: prev!.facilities.filter((_, i) => i !== index),
    }));
  };

  const handleLocationInsightChange = (
    category: keyof Project["locationInsights"],
    index: number,
    field: "name" | "distance",
    value: string
  ) => {
    setProject((prev) => ({
      ...prev!,
      locationInsights: {
        ...prev!.locationInsights,
        [category]: prev!.locationInsights[category].map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const addLocationInsight = (category: keyof Project["locationInsights"]) => {
    setProject((prev) => ({
      ...prev!,
      locationInsights: {
        ...prev!.locationInsights,
        [category]: [
          ...prev!.locationInsights[category],
          { name: "", distance: "" },
        ],
      },
    }));
  };

  const removeLocationInsight = (
    category: keyof Project["locationInsights"],
    index: number
  ) => {
    setProject((prev) => ({
      ...prev!,
      locationInsights: {
        ...prev!.locationInsights,
        [category]: prev!.locationInsights[category].filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const handleFaqChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    setProject((prev) => ({
      ...prev!,
      faqs: prev!.faqs.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addFaq = () => {
    setProject((prev) => ({
      ...prev!,
      faqs: [...prev!.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFaq = (index: number) => {
    setProject((prev) => ({
      ...prev!,
      faqs: prev!.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ProjectService.updateProject(id, project);
      alert("Đã lưu thay đổi!");
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu dự án...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="text-center py-12">
              <p className="text-red-600">Không tìm thấy dự án</p>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PencilIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">
                Quản lý dự án: {project.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <EyeIcon className="w-4 h-4" />
                {previewMode ? "Chỉnh sửa" : "Xem trước"}
              </button>
              <button
                type="submit"
                form="project-form"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          {previewMode ? (
            /* Chế độ xem trước */
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
                <p className="text-gray-600 mb-4">
                  {project.address}, {project.fullLocation}
                </p>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.totalUnits}
                    </div>
                    <div className="text-sm text-gray-500">căn hộ</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.area}
                    </div>
                    <div className="text-sm text-gray-500">diện tích</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.numberOfTowers}
                    </div>
                    <div className="text-sm text-gray-500">tòa</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.density}
                    </div>
                    <div className="text-sm text-gray-500">mật độ xây dựng</div>
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Mô tả dự án</h3>
                <div
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Tiện ích */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Tiện ích</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {project.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <i className="fas fa-check-circle text-green-500 text-sm"></i>
                      <span className="text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thông số kỹ thuật */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Thông số kỹ thuật
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(project.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b"
                      >
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Chế độ chỉnh sửa */
            <form id="project-form" onSubmit={handleSave} className="space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b">
                  <nav className="flex space-x-8 px-6">
                    {[
                      {
                        key: "basic",
                        label: "Thông tin cơ bản",
                        icon: "fas fa-info-circle",
                      },
                      {
                        key: "description",
                        label: "Mô tả chi tiết",
                        icon: "fas fa-file-text",
                      },
                      {
                        key: "specifications",
                        label: "Thông số kỹ thuật",
                        icon: "fas fa-cogs",
                      },
                      {
                        key: "facilities",
                        label: "Tiện ích",
                        icon: "fas fa-star",
                      },
                      {
                        key: "location",
                        label: "Vị trí & Tiện ích xung quanh",
                        icon: "fas fa-map-marker-alt",
                      },
                      {
                        key: "faq",
                        label: "FAQ",
                        icon: "fas fa-question-circle",
                      },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === tab.key
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        <i className={tab.icon}></i>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Tab: Thông tin cơ bản */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên dự án *
                          </label>
                          <input
                            name="name"
                            value={project.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug *
                          </label>
                          <input
                            name="slug"
                            value={project.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ
                          </label>
                          <input
                            name="address"
                            value={project.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vị trí đầy đủ
                          </label>
                          <input
                            name="fullLocation"
                            value={project.fullLocation}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                          </label>
                          <select
                            name="status"
                            value={project.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Đang cập nhật">Đang cập nhật</option>
                            <option value="Sắp mở bán">Sắp mở bán</option>
                            <option value="Đang bán">Đang bán</option>
                            <option value="Đã bàn giao">Đã bàn giao</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Khoảng giá
                          </label>
                          <input
                            name="priceRange"
                            value={project.priceRange}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tổng số căn
                          </label>
                          <input
                            name="totalUnits"
                            value={project.totalUnits}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Diện tích
                          </label>
                          <input
                            name="area"
                            value={project.area}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số tòa nhà
                          </label>
                          <input
                            name="numberOfTowers"
                            value={project.numberOfTowers}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật độ xây dựng
                          </label>
                          <input
                            name="density"
                            value={project.density}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Latitude
                          </label>
                          <input
                            name="latitude"
                            value={project.latitude}
                            onChange={handleChange}
                            type="number"
                            step="any"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Longitude
                          </label>
                          <input
                            name="longitude"
                            value={project.longitude}
                            onChange={handleChange}
                            type="number"
                            step="any"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Thông tin chủ đầu tư */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Thông tin chủ đầu tư
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tên chủ đầu tư
                            </label>
                            <input
                              value={project.developer.name}
                              onChange={(e) =>
                                handleDeveloperChange("name", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo (URL)
                            </label>
                            <input
                              value={project.developer.logo}
                              onChange={(e) =>
                                handleDeveloperChange("logo", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số điện thoại
                            </label>
                            <input
                              value={project.developer.phone}
                              onChange={(e) =>
                                handleDeveloperChange("phone", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={project.developer.email}
                              onChange={(e) =>
                                handleDeveloperChange("email", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Mô tả chi tiết */}
                  {activeTab === "description" && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả dự án
                        </label>
                        <QuillEditor
                          value={project.description}
                          onChange={handleDescriptionChange}
                          placeholder="Nhập mô tả chi tiết về dự án..."
                          height="400px"
                          className="w-full"
                          imageQuality={0.7}
                          maxImageWidth={600}
                        />
                      </div>

                      {/* Preview Section - Sửa class name */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Xem trước mô tả:
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          {project.description ? (
                            <div
                              className="description-preview"
                              dangerouslySetInnerHTML={{
                                __html: project.description,
                              }}
                            />
                          ) : (
                            <p className="text-gray-400 italic">
                              Chưa có mô tả. Hãy nhập nội dung ở trên để xem
                              trước.
                            </p>
                          )}
                        </div>
                      </div>
                      {/* CSS cho preview */}
                      <style jsx global>{`
                        .description-preview {
                          line-height: 1.7;
                          color: #374151;
                        }

                        .description-preview h1 {
                          font-size: 2rem !important;
                          font-weight: 700 !important;
                          margin-bottom: 1.5rem !important;
                          color: #1f2937 !important;
                          line-height: 1.2 !important;
                        }

                        .description-preview h2 {
                          font-size: 1.5rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 1.25rem !important;
                          margin-top: 2rem !important;
                          color: #1f2937 !important;
                          line-height: 1.3 !important;
                        }

                        .description-preview h3 {
                          font-size: 1.25rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 1rem !important;
                          margin-top: 1.5rem !important;
                          color: #1f2937 !important;
                          line-height: 1.4 !important;
                        }

                        .description-preview h4 {
                          font-size: 1.125rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 0.75rem !important;
                          margin-top: 1.25rem !important;
                          color: #1f2937 !important;
                          line-height: 1.4 !important;
                        }

                        .description-preview h5 {
                          font-size: 1rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 0.5rem !important;
                          margin-top: 1rem !important;
                          color: #1f2937 !important;
                          line-height: 1.5 !important;
                        }

                        .description-preview h6 {
                          font-size: 0.875rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 0.5rem !important;
                          margin-top: 1rem !important;
                          color: #1f2937 !important;
                          line-height: 1.5 !important;
                        }

                        .description-preview p {
                          margin-bottom: 1rem !important;
                          line-height: 1.7 !important;
                          color: #374151 !important;
                        }

                        .description-preview strong,
                        .description-preview b {
                          font-weight: 700 !important;
                          color: #1f2937 !important;
                        }

                        .description-preview em,
                        .description-preview i {
                          font-style: italic !important;
                          color: #4b5563 !important;
                        }

                        .description-preview u {
                          text-decoration: underline !important;
                        }

                        .description-preview ul {
                          margin-bottom: 1rem !important;
                          padding-left: 1.5rem !important;
                          list-style-type: disc !important;
                        }

                        .description-preview ol {
                          margin-bottom: 1rem !important;
                          padding-left: 1.5rem !important;
                          list-style-type: decimal !important;
                        }

                        .description-preview li {
                          margin-bottom: 0.5rem !important;
                          line-height: 1.6 !important;
                          color: #374151 !important;
                        }

                        .description-preview blockquote {
                          border-left: 4px solid #3b82f6 !important;
                          padding-left: 1rem !important;
                          margin: 1.5rem 0 !important;
                          color: #6b7280 !important;
                          font-style: italic !important;
                          background-color: #f8fafc !important;
                          padding: 1rem !important;
                          border-radius: 0.375rem !important;
                        }

                        .description-preview a {
                          color: #2563eb !important;
                          text-decoration: underline !important;
                          font-weight: 500 !important;
                        }

                        .description-preview a:hover {
                          color: #1d4ed8 !important;
                          text-decoration: none !important;
                        }

                        .description-preview img {
                          max-width: 100% !important;
                          height: auto !important;
                          margin: 1.5rem 0 !important;
                          border-radius: 0.5rem !important;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                        }

                        .description-preview pre {
                          background-color: #1f2937 !important;
                          color: #f9fafb !important;
                          padding: 1rem !important;
                          border-radius: 0.5rem !important;
                          font-family: "Courier New", monospace !important;
                          font-size: 0.875rem !important;
                          margin: 1.5rem 0 !important;
                          overflow-x: auto !important;
                          line-height: 1.5 !important;
                        }

                        .description-preview hr {
                          border: none !important;
                          border-top: 2px solid #e5e7eb !important;
                          margin: 2rem 0 !important;
                        }

                        .description-preview table {
                          width: 100% !important;
                          border-collapse: collapse !important;
                          margin: 1.5rem 0 !important;
                        }

                        .description-preview th,
                        .description-preview td {
                          border: 1px solid #e5e7eb !important;
                          padding: 0.75rem !important;
                          text-align: left !important;
                        }

                        .description-preview th {
                          background-color: #f9fafb !important;
                          font-weight: 600 !important;
                          color: #1f2937 !important;
                        }

                        .description-preview code {
                          background-color: #f3f4f6 !important;
                          color: #dc2626 !important;
                          padding: 0.125rem 0.25rem !important;
                          border-radius: 0.25rem !important;
                          font-family: "Courier New", monospace !important;
                          font-size: 0.875rem !important;
                        }

                        /* Đảm bảo text alignment */
                        .description-preview * {
                          direction: ltr !important;
                          text-align: left !important;
                        }

                        .description-preview [style*="text-align: center"] {
                          text-align: center !important;
                        }

                        .description-preview [style*="text-align: right"] {
                          text-align: right !important;
                        }

                        .description-preview [style*="text-align: justify"] {
                          text-align: justify !important;
                        }
                      `}</style>
                    </div>
                  )}

                  {/* Tab: Thông số kỹ thuật */}
                  {activeTab === "specifications" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Thông số kỹ thuật
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {Object.entries(project.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <input
                                placeholder="Tên thông số"
                                value={key}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                readOnly
                              />
                              <input
                                placeholder="Giá trị"
                                value={value}
                                onChange={(e) =>
                                  handleSpecificationChange(key, e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab: Tiện ích */}
                  {activeTab === "facilities" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Tiện ích dự án
                        </h3>
                        <button
                          type="button"
                          onClick={addFacility}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Thêm tiện ích
                        </button>
                      </div>
                      <div className="space-y-3">
                        {project.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              placeholder="Tên tiện ích"
                              value={facility}
                              onChange={(e) =>
                                handleFacilityChange(index, e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeFacility(index)}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab: Vị trí & Tiện ích xung quanh */}
                  {activeTab === "location" && (
                    <div className="space-y-6">
                      {Object.entries(project.locationInsights).map(
                        ([category, items]) => (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold capitalize">
                                {category === "schools"
                                  ? "Trường học"
                                  : category === "hospitals"
                                  ? "Bệnh viện"
                                  : category === "supermarkets"
                                  ? "Siêu thị"
                                  : category === "parks"
                                  ? "Công viên"
                                  : "Nhà hàng"}
                              </h3>
                              <button
                                type="button"
                                onClick={() =>
                                  addLocationInsight(
                                    category as keyof Project["locationInsights"]
                                  )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Thêm
                              </button>
                            </div>
                            <div className="space-y-3">
                              {items.map((item, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-2 gap-2"
                                >
                                  <input
                                    placeholder="Tên địa điểm"
                                    value={item.name}
                                    onChange={(e) =>
                                      handleLocationInsightChange(
                                        category as keyof Project["locationInsights"],
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      placeholder="Khoảng cách"
                                      value={item.distance}
                                      onChange={(e) =>
                                        handleLocationInsightChange(
                                          category as keyof Project["locationInsights"],
                                          index,
                                          "distance",
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeLocationInsight(
                                          category as keyof Project["locationInsights"],
                                          index
                                        )
                                      }
                                      className="p-2 text-red-600 hover:text-red-800"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Tab: FAQ */}
                  {activeTab === "faq" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Câu hỏi thường gặp
                        </h3>
                        <button
                          type="button"
                          onClick={addFaq}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Thêm câu hỏi
                        </button>
                      </div>
                      <div className="space-y-4">
                        {project.faqs.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">
                                Câu hỏi {index + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeFaq(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                placeholder="Nhập câu hỏi..."
                                value={item.question}
                                onChange={(e) =>
                                  handleFaqChange(
                                    index,
                                    "question",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <textarea
                                placeholder="Nhập câu trả lời..."
                                value={item.answer}
                                onChange={(e) =>
                                  handleFaqChange(
                                    index,
                                    "answer",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
