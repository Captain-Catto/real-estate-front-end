import React, { useState, useEffect } from "react";
import { Location } from "@/types/location";
import { EditPostForm } from "@/types/editPost";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

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

  const [latLng, setLatLng] = useState<{
    osmData?: {
      lat?: string;
      lon?: string;
      boundingbox?: string[];
      display_name?: string;
    };
  } | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  const MapView = dynamic(() => import("@/components/common/MapView"), {
    ssr: false, // Quan trọng: không render ở server
    loading: () => (
      <div className="bg-gray-100 animate-pulse h-[300px] rounded-lg"></div>
    ),
  });

  useEffect(() => {
    setSelectedProvince(formData.location?.province || "");
    setSelectedDistrict(formData.location?.district || "");
    setSelectedWard(formData.location?.ward || "");
    setStreetAddress(formData.location?.street || "");
    setSelectedProject(formData.location?.project || "");
  }, [formData.location]);

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

  const fetchLatLng = async () => {
    setIsLoadingMap(true);
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
    } finally {
      setIsLoadingMap(false);
    }
  };

  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      fetchLatLng();
    } else {
      setLatLng(null);
    }
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress]);

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
                streetAddress,
                selectedProject
                  ? availableProjects.find(
                      (p) => p.id.toString() === selectedProject
                    )?.name
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
