import React, { useState, useEffect } from "react";
import { EditPostForm } from "@/types/Post";
import locationData from "../../../../../locationVN.json";

interface BasicInfoStepProps {
  formData: EditPostForm;
  updateFormData: (updates: Partial<EditPostForm>) => void;
}

// Mock data cho dự án
const mockProjects = [
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
}: BasicInfoStepProps) {
  // Location states
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  // Dropdown data
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);

  // Dropdown visibility
  const [showProjects, setShowProjects] = useState(false);

  // Handle province change
  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setSelectedProject("");
    setWards([]);
    setAvailableProjects([]);

    const province = locationData.find((p) => p.codename === provinceCode);
    const newDistricts = province ? province.districts || [] : [];
    setDistricts(newDistricts);

    // Cập nhật địa chỉ với province mới - truyền data trực tiếp
    updateAddress({
      street: streetAddress,
      project: "",
      ward: "",
      district: "",
      province: provinceCode,
      provinceData: province,
      districtData: null,
      wardData: null,
      projectData: null,
    });
  };

  // Handle district change
  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setSelectedProject("");

    const district = districts.find((d) => d.short_codename === districtCode);
    const newWards = district ? district.wards || [] : [];
    const newProjects = mockProjects.filter(
      (p) => p.district === districtCode && p.city === selectedProvince
    );

    setWards(newWards);
    setAvailableProjects(newProjects);

    // Cập nhật địa chỉ với district mới - truyền data trực tiếp
    const province = locationData.find((p) => p.codename === selectedProvince);
    updateAddress({
      street: streetAddress,
      project: "",
      ward: "",
      district: districtCode,
      province: selectedProvince,
      provinceData: province,
      districtData: district,
      wardData: null,
      projectData: null,
    });
  };

  // Handle ward change
  const handleWardChange = (wardCode: string) => {
    setSelectedWard(wardCode);

    const province = locationData.find((p) => p.codename === selectedProvince);
    const district = districts.find(
      (d) => d.short_codename === selectedDistrict
    );
    const ward = wards.find((w) => w.short_codename === wardCode);

    updateAddress({
      street: streetAddress,
      project: selectedProject,
      ward: wardCode,
      district: selectedDistrict,
      province: selectedProvince,
      provinceData: province,
      districtData: district,
      wardData: ward,
      projectData: selectedProject
        ? availableProjects.find((p) => p.id.toString() === selectedProject)
        : null,
    });
  };

  // Handle street address change
  const handleStreetChange = (street: string) => {
    setStreetAddress(street);

    const province = locationData.find((p) => p.codename === selectedProvince);
    const district = districts.find(
      (d) => d.short_codename === selectedDistrict
    );
    const ward = wards.find((w) => w.short_codename === selectedWard);

    updateAddress({
      street,
      project: selectedProject,
      ward: selectedWard,
      district: selectedDistrict,
      province: selectedProvince,
      provinceData: province,
      districtData: district,
      wardData: ward,
      projectData: selectedProject
        ? availableProjects.find((p) => p.id.toString() === selectedProject)
        : null,
    });
  };

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);

    const province = locationData.find((p) => p.codename === selectedProvince);
    const district = districts.find(
      (d) => d.short_codename === selectedDistrict
    );
    const ward = wards.find((w) => w.short_codename === selectedWard);
    const project = projectId
      ? availableProjects.find((p) => p.id.toString() === projectId)
      : null;

    updateAddress({
      street: streetAddress,
      project: projectId,
      ward: selectedWard,
      district: selectedDistrict,
      province: selectedProvince,
      provinceData: province,
      districtData: district,
      wardData: ward,
      projectData: project,
    });
  };

  // Update full address với data được truyền trực tiếp
  const updateAddress = ({
    street,
    project,
    ward,
    district,
    province,
    provinceData,
    districtData,
    wardData,
    projectData,
  }: {
    street: string;
    project: string;
    ward: string;
    district: string;
    province: string;
    provinceData: any;
    districtData: any;
    wardData: any;
    projectData: any;
  }) => {
    const addressParts = [];

    // Thêm street address nếu có
    if (street && street.trim()) {
      addressParts.push(street.trim());
    }

    // Thêm project nếu có
    if (project && projectData) {
      addressParts.push(`Dự án ${projectData.name}`);
    }

    // Thêm ward nếu có
    if (ward && wardData) {
      addressParts.push(`Phường ${wardData.short_codename.replace(/_/g, " ")}`);
    }

    // Thêm district nếu có
    if (district && districtData) {
      addressParts.push(districtData.name);
    }

    // Thêm province nếu có
    if (province && provinceData) {
      addressParts.push(provinceData.name);
    }

    const fullAddress = addressParts.join(", ");
    updateFormData({ address: fullAddress });
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
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="text-gray-800"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M2 4.75A2.75 2.75 0 0 1 4.75 2h6.412c.729 0 1.428.29 1.944.805l8.01 8.01a2.75 2.75 0 0 1 0 3.89l-6.411 6.411a2.75 2.75 0 0 1-3.89 0l-8.01-8.01A2.75 2.75 0 0 1 2 11.162zM7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
                clipRule="evenodd"
              />
            </svg>
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
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="text-gray-800"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M14.998 3.85a5.15 5.15 0 0 0-4.929 6.646c.09.3.01.626-.212.848l-5.965 5.964a.15.15 0 0 0-.044.106V20c0 .083.068.15.15.15h2.15V19c0-.47.381-.85.85-.85h1.15V17c0-.47.381-.85.85-.85h1.648l2.008-2.008a.85.85 0 0 1 .848-.212 5.15 5.15 0 1 0 1.496-10.08M8.148 9a6.85 6.85 0 1 1 5.364 6.688L11.6 17.601a.85.85 0 0 1-.602.249h-1.15V19c0 .47-.38.85-.85.85h-1.15V21c0 .47-.38.85-.85.85h-3A1.85 1.85 0 0 1 2.148 20v-2.586c0-.49.195-.961.542-1.308l5.62-5.62A7 7 0 0 1 8.148 9m6-2c0-.47.381-.85.85-.85A2.85 2.85 0 0 1 17.848 9a.85.85 0 1 1-1.7 0 1.15 1.15 0 0 0-1.15-1.15.85.85 0 0 1-.85-.85"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Cho thuê</span>
          </button>
        </div>
      </div>

      {/* Địa chỉ BĐS */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Địa chỉ BĐS</h3>
        <div className="space-y-4">
          {/* Tỉnh/Thành phố */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {locationData.map((province) => (
                <option key={province.code} value={province.codename}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quận/Huyện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!selectedProvince}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Chọn Quận/Huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.short_codename}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phường/Xã */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWard}
              onChange={(e) => handleWardChange(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Chọn Phường/Xã</option>
              {wards.map((ward, index) => (
                <option key={index} value={ward.short_codename}>
                  {ward.short_codename.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Đường/Phố */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đường/Phố
            </label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => handleStreetChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập tên đường, số nhà (không bắt buộc)"
            />
          </div>

          {/* Dự án */}
          {availableProjects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dự án
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProjects(!showProjects)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left bg-white flex items-center justify-between"
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
                                (d) => d.short_codename === project.district
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

          {/* Địa chỉ đầy đủ (hiển thị) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ đầy đủ
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[40px]">
              {formData.address ||
                "Địa chỉ sẽ được tạo tự động khi bạn chọn các thông tin trên"}
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin chính */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin chính
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loại BĐS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại BĐS
            </label>
            <select
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

          {/* Diện tích */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diện tích
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.area}
                onChange={(e) => updateFormData({ area: e.target.value })}
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Nhập diện tích"
              />
              <span className="absolute right-3 top-2 text-gray-500">m²</span>
            </div>
          </div>

          {/* Mức giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức giá
            </label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập giá"
            />
          </div>

          {/* Đơn vị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn vị
            </label>
            <select
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

      {/* Thông tin khác */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin khác
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Giấy tờ pháp lý */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giấy tờ pháp lý
            </label>
            <select
              value={formData.legalDocs}
              onChange={(e) => updateFormData({ legalDocs: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Sổ đỏ/ Sổ hồng">Sổ đỏ/ Sổ hồng</option>
              <option value="Giấy tờ khác">Giấy tờ khác</option>
            </select>
          </div>

          {/* Nội thất */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội thất
            </label>
            <select
              value={formData.furniture}
              onChange={(e) => updateFormData({ furniture: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Đầy đủ">Đầy đủ</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Không nội thất">Không nội thất</option>
            </select>
          </div>

          {/* Số phòng ngủ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số phòng ngủ
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateFormData({
                    bedrooms: Math.max(0, formData.bedrooms - 1),
                  })
                }
                disabled={formData.bedrooms === 0}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-center w-8">{formData.bedrooms}</span>
              <button
                type="button"
                onClick={() =>
                  updateFormData({ bedrooms: formData.bedrooms + 1 })
                }
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M12 3a.75.75 0 0 1 .75.75v7.5h7.5a.75.75 0 0 1 0 1.5h-7.5v7.5a.75.75 0 0 1-1.5 0v-7.5h-7.5a.75.75 0 0 1 0-1.5h7.5v-7.5A.75.75 0 0 1 12 3"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Số phòng tắm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số phòng tắm
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateFormData({
                    bathrooms: Math.max(0, formData.bathrooms - 1),
                  })
                }
                disabled={formData.bathrooms === 0}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-center w-8">{formData.bathrooms}</span>
              <button
                type="button"
                onClick={() =>
                  updateFormData({ bathrooms: formData.bathrooms + 1 })
                }
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M12 3a.75.75 0 0 1 .75.75v7.5h7.5a.75.75 0 0 1 0 1.5h-7.5v7.5a.75.75 0 0 1-1.5 0v-7.5h-7.5a.75.75 0 0 1 0-1.5h7.5v-7.5A.75.75 0 0 1 12 3"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin liên hệ */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên liên hệ
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => updateFormData({ contactName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập tên liên hệ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập email"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>
      </div>

      {/* Tiêu đề & Mô tả */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tiêu đề & Mô tả
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <textarea
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối thiểu 30 ký tự, tối đa 99 ký tự
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Mô tả chi tiết về loại hình bất động sản, vị trí, diện tích, tiện ích..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối thiểu 30 ký tự, tối đa 3000 ký tự
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
