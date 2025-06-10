import React from "react";
import { Package } from "@/types/Post";

interface PackageSelectionStepProps {
  selectedPackage: Package | null;
  setSelectedPackage: (pkg: Package | null) => void;
}

// Mock packages data
const packages: Package[] = [
  {
    id: "basic",
    name: "Gói Cơ Bản",
    price: 50000,
    duration: 30,
    features: [
      "Hiển thị tin đăng 30 ngày",
      "Xuất hiện trong kết quả tìm kiếm",
      "Hỗ trợ khách hàng cơ bản",
    ],
  },
  {
    id: "premium",
    name: "Gói Cao Cấp",
    price: 150000,
    duration: 30,
    features: [
      "Hiển thị tin đăng 30 ngày",
      "Ưu tiên trong kết quả tìm kiếm",
      "Xuất hiện trang chủ",
      "Hỗ trợ khách hàng ưu tiên",
      "Thống kê chi tiết",
    ],
    isPopular: true,
  },
  {
    id: "vip",
    name: "Gói VIP",
    price: 300000,
    duration: 30,
    features: [
      "Hiển thị tin đăng 30 ngày",
      "Luôn xuất hiện đầu trang",
      "Nổi bật với nhãn VIP",
      "Xuất hiện nhiều vị trí",
      "Hỗ trợ 24/7",
      "Báo cáo chi tiết",
      "Tư vấn marketing",
    ],
  },
];

export default function PackageSelectionStep({
  selectedPackage,
  setSelectedPackage,
}: PackageSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chọn gói đăng tin
        </h3>
        <p className="text-sm text-gray-600">
          Chọn gói phù hợp để tin đăng của bạn tiếp cận được nhiều khách hàng
          hơn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg)}
            className={`relative cursor-pointer border-2 rounded-lg p-6 transition-all ${
              selectedPackage?.id === pkg.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            {/* Popular Badge */}
            {pkg.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Phổ biến
                </span>
              </div>
            )}

            {/* Selected Badge */}
            {selectedPackage?.id === pkg.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {pkg.name}
              </h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {pkg.price.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-sm text-gray-600">{pkg.duration} ngày</p>
            </div>

            <ul className="space-y-3">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-green-500 mt-0.5 flex-shrink-0"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {selectedPackage?.id === pkg.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded-lg text-center font-medium">
                  Đã chọn gói này
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Info */}
      {selectedPackage && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">
            Thông tin thanh toán
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Gói đã chọn:</span>
              <span className="font-medium">{selectedPackage.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Thời gian:</span>
              <span>{selectedPackage.duration} ngày</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">
                {selectedPackage.price.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Free Option */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-gray-900">Đăng tin miễn phí</h5>
            <p className="text-sm text-gray-600">
              Hiển thị cơ bản trong 7 ngày
            </p>
          </div>
          <button
            onClick={() => setSelectedPackage(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPackage === null
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {selectedPackage === null ? "Đã chọn" : "Chọn"}
          </button>
        </div>
      </div>
    </div>
  );
}
