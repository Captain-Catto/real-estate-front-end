import React, { useState, useEffect } from "react";
import { Location } from "@/types/location";
import { ProjectService } from "@/services/projectService";
import { categoryService, Category } from "@/services/categoryService";

interface CreatePostFormData {
  type: "ban" | "cho-thue";
  category: string;
  location: {
    province: string;
    district?: string;
    ward: string;
    street?: string;
    project?: string;
  };
  area: string;
  price: string;
  currency: string;
  legalDocs: string;
  furniture: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  houseDirection: string;
  balconyDirection: string;
  roadWidth: string;
  frontWidth: string;
  contactName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
}

interface BasicInfoStepProps {
  formData: CreatePostFormData;
  updateFormData: (updates: Partial<CreatePostFormData>) => void;
  provinces: Location[];
  wards: Location[];
  locationLoading: boolean;
}

interface Project {
  _id: string;
  name: string;
  address: string;
  fullLocation: string;
  location?: {
    provinceCode: string;
    wardCode?: string;
  };
}

export default function BasicInfoStep({
  formData,
  updateFormData,
  provinces,
  wards,
  locationLoading,
}: BasicInfoStepProps) {
  const [selectedProvince, setSelectedProvince] = useState(
    formData.location?.province || ""
  );
  const [selectedWard, setSelectedWard] = useState(
    formData.location?.ward || ""
  );
  const [streetAddress, setStreetAddress] = useState(
    formData.location?.street || ""
  );
  const [selectedProject, setSelectedProject] = useState(
    formData.location?.project || ""
  );
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Update the useEffect to match locations by name or code and handle selected values properly
  useEffect(() => {
    // Find province code by name if we have a name but not a code
    if (formData.location?.province && provinces.length > 0) {
      // Try to find the province by code first
      const provinceByCode = provinces.find(
        (p) => p.code === formData.location.province
      );

      // If not found by code, try to find by name
      if (!provinceByCode) {
        const provinceByName = provinces.find(
          (p) =>
            p.name === formData.location.province ||
            p.name.toLowerCase() === formData.location.province?.toLowerCase()
        );

        if (provinceByName) {
          setSelectedProvince(provinceByName.code);
          console.log(
            "Found province by name:",
            provinceByName.name,
            "with code:",
            provinceByName.code
          );
        } else {
          console.log(
            "Province not found by name or code:",
            formData.location.province
          );
        }
      } else {
        setSelectedProvince(provinceByCode.code);
        console.log("Found province by code:", provinceByCode.name);
      }
    }

    // Find ward code by name if we have a name but not a code
    if (formData.location?.ward && wards.length > 0) {
      console.log("🔍 Looking for ward:", formData.location.ward);
      console.log(
        "📋 Available wards:",
        wards.map((w) => `${w.name} (${w.code})`)
      );

      // Try to find the ward by code first
      const wardByCode = wards.find((w) => w.code === formData.location.ward);

      // If not found by code, try to find by name
      if (!wardByCode) {
        const wardByName = wards.find(
          (w) =>
            w.name === formData.location.ward ||
            w.name.toLowerCase() === formData.location.ward?.toLowerCase()
        );

        if (wardByName) {
          setSelectedWard(wardByName.code);
          console.log(
            "Found ward by name:",
            wardByName.name,
            "with code:",
            wardByName.code
          );
        } else {
          console.log(
            "❌ Ward not found by name or code:",
            formData.location.ward
          );
          console.log(
            "Available ward names:",
            wards.map((w) => w.name)
          );
        }
      } else {
        setSelectedWard(wardByCode.code);
        console.log("Found ward by code:", wardByCode.name);
      }
    } else if (formData.location?.ward) {
      console.log(
        "⚠️ Ward specified but wards list is empty. Ward:",
        formData.location.ward,
        "Wards length:",
        wards.length
      );
    }

    // Set street address
    setStreetAddress(formData.location?.street || "");

    // Set project (if applicable)
    setSelectedProject(formData.location?.project || "");
  }, [formData.location, provinces, wards]);

  useEffect(() => {
    if (selectedProvince) {
      // Load projects from backend với location codes
      const loadProjects = async () => {
        console.log("🔍 Loading projects for location codes:", {
          selectedProvince,
          selectedWard, // Now using ward for project filtering if available
        });

        setProjectsLoading(true);
        try {
          // Call API with location codes instead of names
          // Now only use province code since district is removed
          const projects = await ProjectService.getProjectsForSelection(
            selectedProvince,
            undefined, // No district
            selectedWard || undefined // Only pass wardCode if one is selected
          );

          console.log(
            `✅ Loaded ${projects.length} projects:`,
            projects.map((p: Project) => p.name)
          );

          setAvailableProjects(projects);
        } catch (error) {
          console.error("❌ Error loading projects:", error);
          setAvailableProjects([]);
        } finally {
          setProjectsLoading(false);
        }
      };

      loadProjects();
    } else {
      // Clear projects if no province selected
      setAvailableProjects([]);
    }
  }, [
    selectedProvince,
    selectedWard, // Added selectedWard to dependencies to reload projects when ward changes
    provinces,
  ]);

  // Fetch categories based on whether project is selected
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        // If project is selected, fetch project categories, otherwise fetch property categories
        const isProjectSelected = Boolean(selectedProject);
        const result = await categoryService.getByProjectType(
          isProjectSelected
        );

        // Filter only active categories and sort by order
        const activeCategories = result
          .filter((cat) => cat.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [selectedProject]); // Re-fetch when project selection changes

  const handleProvinceChange = (provinceCode: string) => {
    // Clear ward when province changes
    setSelectedProvince(provinceCode);
    setSelectedWard("");
    setSelectedProject("");

    // Update the form data with the new province code
    updateFormData({
      location: {
        ...formData.location,
        province: provinceCode,
        ward: "",
        project: "",
      },
    });

    // Additional logging for debugging
    console.log("Province changed to:", provinceCode);
  };

  const handleWardChange = (wardCode: string) => {
    setSelectedWard(wardCode);
    updateFormData({
      location: {
        ...formData.location,
        ward: wardCode,
      },
    });

    // Additional logging for debugging
    console.log("Ward changed to:", wardCode);
    // The project list will be automatically updated due to the useEffect dependency on selectedWard
  };

  const handleStreetChange = (street: string) => {
    setStreetAddress(street);
    updateFormData({
      location: {
        ...formData.location,
        street,
      },
    });
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    const project = projectId
      ? availableProjects.find((p) => p._id === projectId)
      : null;

    // If a project is selected and it has a wardCode, automatically set the ward
    if (project && project.location?.wardCode) {
      setSelectedWard(project.location.wardCode);
      updateFormData({
        location: {
          ...formData.location,
          project: projectId,
          ward: project.location.wardCode,
        },
      });
    } else {
      updateFormData({
        location: {
          ...formData.location,
          project: projectId,
        },
      });
    }

    console.log("Project changed to:", projectId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Loại tin đăng
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="relative">
            <input
              type="radio"
              name="type"
              value="ban"
              checked={formData.type === "ban"}
              onChange={(e) =>
                updateFormData({ type: e.target.value as "ban" | "cho-thue" })
              }
              className="sr-only"
            />
            <div
              className={`p-4 border rounded-lg cursor-pointer text-center ${
                formData.type === "ban"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <span className="font-medium">Bán</span>
            </div>
          </label>
          <label className="relative">
            <input
              type="radio"
              name="type"
              value="cho-thue"
              checked={formData.type === "cho-thue"}
              onChange={(e) =>
                updateFormData({ type: e.target.value as "ban" | "cho-thue" })
              }
              className="sr-only"
            />
            <div
              className={`p-4 border rounded-lg cursor-pointer text-center ${
                formData.type === "cho-thue"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <span className="font-medium">Cho thuê</span>
            </div>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Địa chỉ BĐS</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              id="province"
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={locationLoading}
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {(Array.isArray(provinces) ? provinces : []).map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="ward"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              id="ward"
              value={selectedWard}
              onChange={(e) => handleWardChange(e.target.value)}
              disabled={!selectedProvince || locationLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Chọn Phường/Xã</option>
              {(Array.isArray(wards) ? wards : []).map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="street"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Đường/Phố
            </label>
            <input
              id="street"
              type="text"
              value={streetAddress}
              onChange={(e) => handleStreetChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Nhập tên đường, số nhà (không bắt buộc)"
            />
          </div>
          {/* Project Selection - Hiển thị khi có province */}
          {selectedProvince && (
            <div>
              <label
                htmlFor="project"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dự án (Tùy chọn)
              </label>

              {projectsLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                  <div className="mt-2 text-sm text-gray-500">
                    Đang tìm dự án trong khu vực...
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedProject}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {availableProjects.length > 0
                        ? `Chọn dự án (${availableProjects.length} dự án có sẵn)`
                        : "Không thuộc dự án nào"}
                    </option>
                    {availableProjects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name} - {project.address}
                      </option>
                    ))}
                  </select>

                  {/* Thông báo nếu không có dự án */}
                  {!projectsLoading &&
                    availableProjects.length === 0 &&
                    selectedProvince && (
                      <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded border">
                        Không có dự án bất động sản nào trong khu vực này.
                        <br />
                        <span className="text-xs">
                          Tin đăng sẽ được đăng dưới dạng nhà/đất riêng lẻ.
                        </span>
                      </div>
                    )}

                  {/* Hướng dẫn */}
                  {!projectsLoading &&
                    availableProjects.length > 0 &&
                    !selectedProject && (
                      <div className="text-xs text-gray-400 mt-1">
                        Chọn dự án nếu bất động sản của bạn nằm trong một dự án
                        cụ thể
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
          <div>
            <label
              htmlFor="full-address"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Địa chỉ đầy đủ
            </label>
            <div
              id="full-address"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[40px]"
            >
              {[
                streetAddress,
                selectedProject
                  ? availableProjects.find((p) => p._id === selectedProject)
                      ?.name
                  : "",
                wards.find((w) => String(w.code) === String(selectedWard))
                  ?.name,
                provinces.find(
                  (p) => String(p.code) === String(selectedProvince)
                )?.name,
              ]
                .filter(Boolean)
                .join(", ") ||
                "Địa chỉ sẽ được tạo tự động khi bạn chọn các thông tin trên"}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin chính
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Loại BĐS
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => updateFormData({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? "Đang tải danh mục..." : "Chọn loại BĐS"}
              </option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="area"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Diện tích
            </label>
            <div className="relative">
              <input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => updateFormData({ area: e.target.value })}
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Nhập diện tích"
              />
              <span className="absolute right-3 top-2 text-gray-500">m²</span>
            </div>
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mức giá
            </label>
            <input
              id="price"
              type="text"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập giá"
            />
          </div>
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Đơn vị
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => updateFormData({ currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin khác
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="houseDirection"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hướng nhà
            </label>
            <select
              id="houseDirection"
              value={formData.houseDirection || ""}
              onChange={(e) =>
                updateFormData({ houseDirection: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Không xác định</option>
              <option value="Đông">Đông</option>
              <option value="Tây">Tây</option>
              <option value="Nam">Nam</option>
              <option value="Bắc">Bắc</option>
              <option value="Đông Bắc">Đông Bắc</option>
              <option value="Tây Bắc">Tây Bắc</option>
              <option value="Đông Nam">Đông Nam</option>
              <option value="Tây Nam">Tây Nam</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="balconyDirection"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hướng ban công
            </label>
            <select
              id="balconyDirection"
              value={formData.balconyDirection || ""}
              onChange={(e) =>
                updateFormData({
                  balconyDirection: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Không xác định</option>
              <option value="Đông">Đông</option>
              <option value="Tây">Tây</option>
              <option value="Nam">Nam</option>
              <option value="Bắc">Bắc</option>
              <option value="Đông Bắc">Đông Bắc</option>
              <option value="Tây Bắc">Tây Bắc</option>
              <option value="Đông Nam">Đông Nam</option>
              <option value="Tây Nam">Tây Nam</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tiêu đề & Mô tả
        </h3>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tiêu đề
            </label>
            <textarea
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ"
            />
            <p className="text-xs text-gray-500">
              Tối thiểu 30 ký tự, tối đa 99 ký tự
            </p>
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={6}
              maxLength={1500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Mô tả chi tiết về loại hình bất động sản, vị trí, diện tích, tiện ích..."
            />
            <p className="text-xs text-gray-500">
              Tối thiểu 30 ký tự, tối đa 500 ký tự
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
