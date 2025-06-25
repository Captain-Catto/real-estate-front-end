import React, { useState, useEffect } from "react";
import { Location } from "@/types/location";
import { EditPostForm } from "@/types/editPost";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

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
  id: number;
  name: string;
  district: string;
  city: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: "Vinhomes Grand Park",
    district: "quan_9",
    city: "thanh_pho_ho_chi_minh",
  },
  {
    id: 2,
    name: "Vinhomes Central Park",
    district: "quan_binh_thanh",
    city: "thanh_pho_ho_chi_minh",
  },
  {
    id: 3,
    name: "Vinhomes Smart City",
    district: "quan_nam_tu_liem",
    city: "thanh_pho_ha_noi",
  },
  {
    id: 4,
    name: "Eco Green Saigon",
    district: "quan_7",
    city: "thanh_pho_ho_chi_minh",
  },
  {
    id: 5,
    name: "Masteri Thảo Điền",
    district: "quan_2",
    city: "thanh_pho_ho_chi_minh",
  },
  {
    id: 6,
    name: "Times City",
    district: "quan_hai_ba_trung",
    city: "thanh_pho_ha_noi",
  },
];

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
  const [showProjects, setShowProjects] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  // Sync state with formData/props
  useEffect(() => {
    setSelectedProvince(formData.location?.province || "");
    setSelectedDistrict(formData.location?.district || "");
    setSelectedWard(formData.location?.ward || "");
    setStreetAddress(formData.location?.street || "");
    setSelectedProject(formData.location?.project || "");
  }, [formData.location, provinces, districts, wards]);

  // Update available projects when province/district thay đổi
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      setAvailableProjects(
        mockProjects.filter(
          (p) =>
            p.district === selectedDistrict &&
            p.city ===
              provinces.find((prov) => prov.code === selectedProvince)?.codename
        )
      );
    } else {
      setAvailableProjects([]);
    }
  }, [selectedProvince, selectedDistrict, provinces]);

  // Handle change
  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setSelectedProject("");
    updateFormData({
      location: {
        ...formData.location,
        province: provinceCode,
        district: "",
        ward: "",
        project: "",
      },
    });
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setSelectedProject("");
    updateFormData({
      location: {
        ...formData.location,
        province: selectedProvince,
        district: districtCode,
        ward: "",
        project: "",
      },
    });
  };

  const handleWardChange = (wardCode: string) => {
    setSelectedWard(wardCode);
    updateFormData({
      location: {
        ...formData.location,
        province: selectedProvince,
        district: selectedDistrict,
        ward: wardCode,
      },
    });
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
      ? availableProjects.find((p) => p.id.toString() === projectId)
      : null;
    updateFormData({
      location: {
        ...formData.location,
        project: project?.name || "",
      },
    });
  };

  // AI Title/Description
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateTitleWithAI = async () => {
    if (!formData.type || !formData.category || !formData.location?.province) {
      alert("Vui lòng chọn loại hình giao dịch, loại BĐS và tỉnh/thành phố.");
      return;
    }
    try {
      setIsGeneratingTitle(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken)
        throw new Error("Bạn cần đăng nhập để sử dụng tính năng này.");
      const propertyData = {
        type: formData.type === "ban" ? "Bán" : "Cho thuê",
        category: formData.category,
        area: formData.area,
        location: {
          street: formData.location.street,
          ward: formData.location.ward,
          district: formData.location.district,
          province: formData.location.province,
        },
        price: formData.price,
        currency: formData.currency,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        houseDirection: formData.houseDirection,
      };
      const response = await fetch(`${API_BASE_URL}/ai/generate-title`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(propertyData),
      });
      if (!response.ok) throw new Error("Không thể tạo tiêu đề.");
      const data = await response.json();
      updateFormData({ title: data.title });
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo tiêu đề. Vui lòng thử lại.");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const generateDescriptionWithAI = async () => {
    if (!formData.type || !formData.category || !formData.location?.province) {
      alert("Vui lòng chọn loại hình giao dịch, loại BĐS và tỉnh/thành phố.");
      return;
    }
    try {
      setIsGeneratingDescription(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken)
        throw new Error("Bạn cần đăng nhập để sử dụng tính năng này.");
      const propertyData = {
        type: formData.type === "ban" ? "Bán" : "Cho thuê",
        category: formData.category,
        area: formData.area,
        location: {
          street: formData.location.street,
          ward: formData.location.ward,
          district: formData.location.district,
          province: formData.location.province,
        },
        price: formData.price,
        currency: formData.currency,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        furniture: formData.furniture,
        legalDocs: formData.legalDocs,
        houseDirection: formData.houseDirection,
        balconyDirection: formData.balconyDirection,
        roadWidth: formData.roadWidth,
        frontWidth: formData.frontWidth,
      };
      const response = await fetch(`${API_BASE_URL}/ai/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(propertyData),
      });
      if (!response.ok) throw new Error("Không thể tạo mô tả.");
      const data = await response.json();
      updateFormData({ description: data.description });
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo mô tả. Vui lòng thử lại.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Nhu cầu */}
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

      {/* Địa chỉ */}
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
              {provinces.map((province) => (
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
              {wards.map((ward) => (
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
          {availableProjects.length > 0 && (
            <div>
              <label
                htmlFor="project"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dự án
              </label>
              <div className="relative">
                <button
                  id="project"
                  type="button"
                  onClick={() => setShowProjects(!showProjects)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      selectedProject ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {selectedProject
                      ? availableProjects.find(
                          (p) => p.id.toString() === selectedProject
                        )?.name
                      : "Chọn dự án (không bắt buộc)"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      showProjects ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showProjects && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      onClick={() => {
                        handleProjectChange("");
                        setShowProjects(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                    >
                      Không chọn dự án
                    </div>
                    {availableProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => {
                          handleProjectChange(project.id.toString());
                          setShowProjects(false);
                        }}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {project.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {
                              districts.find(
                                (d) => d.codename === project.district
                              )?.name
                            }
                          </div>
                        </div>
                        {selectedProject === project.id.toString() && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gợi ý {availableProjects.length} dự án trong khu vực này
              </p>
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
                formData.location?.street,
                formData.location?.project,
                formData.location?.ward,
                formData.location?.district,
                formData.location?.province,
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
            >
              <option value="Nhà riêng">Nhà riêng</option>
              <option value="Căn hộ chung cư">Căn hộ chung cư</option>
              <option value="Biệt thự">Biệt thự</option>
              <option value="Đất nền">Đất nền</option>
              <option value="Văn phòng">Văn phòng</option>
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
            <div className="flex flex-col space-y-2">
              <textarea
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ"
              />
              <button
                type="button"
                onClick={generateTitleWithAI}
                className="self-end px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                disabled={isGeneratingTitle}
              >
                {isGeneratingTitle ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Tạo tiêu đề bằng AI</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                Tối thiểu 30 ký tự, tối đa 99 ký tự
              </p>
            </div>
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mô tả
            </label>
            <div className="flex flex-col space-y-2">
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                rows={6}
                maxLength={1500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Mô tả chi tiết về loại hình bất động sản, vị trí, diện tích, tiện ích..."
              />
              <button
                type="button"
                onClick={generateDescriptionWithAI}
                className="self-end px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                disabled={isGeneratingDescription}
              >
                {isGeneratingDescription ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Tạo mô tả bằng AI</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                Tối thiểu 30 ký tự, tối đa 500 ký tự
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
