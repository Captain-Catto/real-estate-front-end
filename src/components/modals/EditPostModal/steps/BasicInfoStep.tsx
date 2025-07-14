import React, { useState, useEffect, useCallback } from "react";
import { Location } from "@/types/location";
import { EditPostForm } from "@/types/editPost";
import "leaflet/dist/leaflet.css";
import { ProjectService } from "@/services/projectService";
import { categoryService, Category } from "@/services/categoryService";

interface BasicInfoStepProps {
  formData: EditPostForm & {
    location: {
      province?: string;
      district?: string;
      ward?: string;
      street?: string;
      project?: string;
    };
  };
  updateFormData: (updates: Partial<EditPostForm>) => void;
  provinces: Location[];
  districts: Location[];
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
    districtCode: string;
    wardCode?: string;
  };
}

export default function BasicInfoStep({
  formData,
  updateFormData,
  provinces,
  districts,
  wards,
  locationLoading,
}: BasicInfoStepProps) {
  const [selectedProvince, setSelectedProvince] = useState(
    formData.location?.province || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    formData.location?.district || ""
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

  const [latLng, setLatLng] = useState<{
    osmData?: {
      lat?: string;
      lon?: string;
      boundingbox?: string[];
      display_name?: string;
    };
  } | null>(null);

  // const MapView = dynamic(() => import("@/components/common/MapView"), {
  //   ssr: false, // Quan trọng: không render ở server
  //   loading: () => (
  //     <div className="bg-gray-100 animate-pulse h-[300px] rounded-lg"></div>
  //   ),
  // });

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

    // Find district code by name if we have a name but not a code
    if (formData.location?.district && districts.length > 0) {
      // Try to find the district by code first
      const districtByCode = districts.find(
        (d) => d.code === formData.location.district
      );

      // If not found by code, try to find by name
      if (!districtByCode) {
        const districtByName = districts.find(
          (d) =>
            d.name === formData.location.district ||
            d.name.toLowerCase() === formData.location.district?.toLowerCase()
        );

        if (districtByName) {
          setSelectedDistrict(districtByName.code);
          console.log(
            "Found district by name:",
            districtByName.name,
            "with code:",
            districtByName.code
          );
        } else {
          console.log(
            "District not found by name or code:",
            formData.location.district
          );
        }
      } else {
        setSelectedDistrict(districtByCode.code);
        console.log("Found district by code:", districtByCode.name);
      }
    }

    // Find ward code by name if we have a name but not a code
    if (formData.location?.ward && wards.length > 0) {
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
            "Ward not found by name or code:",
            formData.location.ward
          );
        }
      } else {
        setSelectedWard(wardByCode.code);
        console.log("Found ward by code:", wardByCode.name);
      }
    }

    // Set street address
    setStreetAddress(formData.location?.street || "");

    // Set project (if applicable)
    setSelectedProject(formData.location?.project || "");
  }, [formData.location, provinces, districts, wards]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      // Load projects from backend với location codes
      const loadProjects = async () => {
        console.log("🔍 Loading projects for location codes:", {
          selectedProvince,
          selectedDistrict,
          selectedWard, // Now using ward for project filtering if available
        });

        setProjectsLoading(true);
        try {
          // Call API with location codes instead of names
          // Now include wardCode for filtering if available
          const projects = await ProjectService.getProjectsForSelection(
            selectedProvince,
            selectedDistrict,
            selectedWard || undefined // Only pass wardCode if one is selected
          );

          console.log(
            `✅ Loaded ${projects.length} projects:`,
            projects.map((p) => p.name)
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
      // Clear projects if no district selected
      setAvailableProjects([]);
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard, // Added selectedWard to dependencies to reload projects when ward changes
    provinces,
    districts,
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
    // Clear district and ward when province changes
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setSelectedProject("");

    // Update the form data with the new province code
    updateFormData({
      location: {
        ...formData.location,
        province: provinceCode,
        district: "",
        ward: "",
        project: "",
      },
    });

    // Additional logging for debugging
    console.log("Province changed to:", provinceCode);
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setSelectedProject("");
    updateFormData({
      location: {
        ...formData.location,
        district: districtCode,
        ward: "",
        project: "",
      },
    });

    // Additional logging for debugging
    console.log("District changed to:", districtCode);
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
          project: project._id,
          ward: project.location.wardCode, // Auto-select ward from project
        },
      });
      console.log(
        "Project selected:",
        project.name,
        "- Ward auto-selected:",
        project.location.wardCode
      );
    } else {
      updateFormData({
        location: {
          ...formData.location,
          project: project?._id || "",
        },
      });
      console.log("Project selected:", project?.name || "None");
    }
  };

  const fetchLatLng = useCallback(async () => {
    try {
      if (!selectedProvince || !selectedDistrict || !selectedWard) return;

      const province = provinces.find(
        (p) => String(p.code) === String(selectedProvince)
      );
      const district = districts.find(
        (d) => String(d.code) === String(selectedDistrict)
      );
      const ward = wards.find((w) => String(w.code) === String(selectedWard));

      if (!province || !district || !ward) return;

      const fullAddress = [
        streetAddress,
        ward.name,
        district.name,
        province.name,
        "Việt Nam",
      ]
        .filter(Boolean)
        .join(", ");

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        fullAddress
      )}&countrycodes=VN&limit=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "RealEstateApp/1.0 (contact@yourapp.com)",
        },
      });
      const data = await response.json();

      if (data.length > 0) {
        // Lưu trữ toàn bộ data từ OSM để sử dụng
        setLatLng({
          osmData: {
            lat: data[0].lat,
            lon: data[0].lon,
            boundingbox: data[0].boundingbox,
            display_name: data[0].display_name,
          },
        });
        console.log("osmdata", latLng?.osmData);
      } else {
        // Fallback nếu không tìm thấy
        setLatLng({
          osmData: {
            lat: "10.7769",
            lon: "106.7009",
            display_name: "Vị trí mặc định",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching lat/lng:", error);
      setLatLng(null);
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    streetAddress,
    provinces,
    districts,
    wards,
    latLng,
  ]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      fetchLatLng();
    } else {
      setLatLng(null);
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    streetAddress,
    fetchLatLng,
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nhu cầu</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateFormData({ type: "ban" })}
            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
              formData.type === "ban"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="font-medium">Bán</span>
          </button>
          <button
            onClick={() => updateFormData({ type: "cho-thue" })}
            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
              formData.type === "cho-thue"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="font-medium">Cho thuê</span>
          </button>
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
              htmlFor="district"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!selectedProvince || locationLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Chọn Quận/Huyện</option>
              {(Array.isArray(districts) ? districts : []).map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
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
              disabled={!selectedDistrict || locationLoading}
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
          {/* Project Selection - Hiển thị khi có district */}
          {selectedDistrict && (
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
                    selectedDistrict && (
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
                districts.find(
                  (d) => String(d.code) === String(selectedDistrict)
                )?.name,
                provinces.find(
                  (p) => String(p.code) === String(selectedProvince)
                )?.name,
              ]
                .filter(Boolean)
                .join(", ") ||
                "Địa chỉ sẽ được tạo tự động khi bạn chọn các thông tin trên"}
            </div>
          </div>
          {/* {latLng && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Vị trí trên bản đồ</h4>
              <div
                key={`map-${selectedProvince}-${selectedDistrict}-${selectedWard}-${Date.now()}`}
              >
                <MapView osmData={latLng.osmData} />
              </div>
              {latLng.osmData?.display_name && (
                <p className="mt-2 text-sm text-gray-500">
                  {latLng.osmData.display_name}
                </p>
              )}
            </div>
          )} */}
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
              htmlFor="legalDocs"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Giấy tờ pháp lý
            </label>
            <select
              id="legalDocs"
              value={formData.legalDocs}
              onChange={(e) => updateFormData({ legalDocs: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Sổ đỏ/ Sổ hồng">Sổ đỏ/ Sổ hồng</option>
              <option value="Giấy tờ khác">Giấy tờ khác</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="furniture"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nội thất
            </label>
            <select
              id="furniture"
              value={formData.furniture}
              onChange={(e) => updateFormData({ furniture: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Đầy đủ">Đầy đủ</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Không nội thất">Không nội thất</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="houseDirection"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hướng nhà
            </label>
            <select
              id="houseDirection"
              value={formData.houseDirection}
              onChange={(e) =>
                updateFormData({ houseDirection: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Chọn hướng</option>
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
              value={formData.balconyDirection}
              onChange={(e) =>
                updateFormData({ balconyDirection: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Chọn hướng</option>
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
              htmlFor="roadWidth"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Độ rộng đường (m)
            </label>
            <input
              id="roadWidth"
              type="number"
              value={formData.roadWidth}
              onChange={(e) => updateFormData({ roadWidth: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập độ rộng đường trước nhà"
              min={0}
            />
          </div>
          <div>
            <label
              htmlFor="frontWidth"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mặt tiền (m)
            </label>
            <input
              id="frontWidth"
              type="number"
              value={formData.frontWidth}
              onChange={(e) => updateFormData({ frontWidth: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập chiều rộng mặt tiền"
              min={0}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="contactName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tên liên hệ
            </label>
            <input
              id="contactName"
              type="text"
              value={formData.contactName}
              onChange={(e) => updateFormData({ contactName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập tên liên hệ"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập email"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập số điện thoại"
            />
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
