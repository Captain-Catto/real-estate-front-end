import React, { useState } from "react";
import { useEffect } from "react";
import { packageService, Package } from "@/services/packageService";

interface PackageSelectionStepProps {
  selectedPackage: Package | null;
  setSelectedPackage: (pkg: Package | null) => void;
}

export default function PackageSelectionStep({
  selectedPackage,
  setSelectedPackage,
}: PackageSelectionStepProps) {
  // EMERGENCY FIX: Disable useWallet in modal components to prevent multiple instances causing infinite loops
  // const { balance } = useWallet();
  // For now, we'll skip balance checking in modal or get it from parent component
  const balance = 0; // Placeholder - will get actual balance when needed

  // State for packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setPackagesLoading(true);
        setError(null);
        const result = await packageService.getActivePackages();

        if (result.success) {
          // Packages are already in the correct format from packageService
          setPackages(result.data.packages);
        } else {
          setError("Không thể tải danh sách gói. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Có lỗi xảy ra khi tải danh sách gói.");
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Auto-select affordable package if no package is selected
  useEffect(() => {
    if (!selectedPackage && packages.length > 0) {
      // Find affordable packages only
      const affordablePackages = packages.filter((pkg) => pkg.price <= balance);

      if (affordablePackages.length > 0) {
        // Try to find a free package first, then the cheapest affordable one
        const freePackage = affordablePackages.find((pkg) => pkg.price === 0);
        const defaultPackage = freePackage || affordablePackages[0];
        setSelectedPackage(defaultPackage);
      }
    }
  }, [selectedPackage, setSelectedPackage, packages, balance]);

  // Check if selected package is affordable
  const isAffordable = selectedPackage
    ? balance >= selectedPackage.price
    : true;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chọn gói đăng tin
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Chọn gói phù hợp để tin đăng của bạn tiếp cận được nhiều khách hàng
          hơn
        </p>
      </div>

      {/* Loading State */}
      {packagesLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải danh sách gói...</span>
        </div>
      )}

      {/* Error State */}
      {error && !packagesLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 mb-2">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Packages Grid */}
      {!packagesLoading && !error && packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {packages.map((pkg) => {
            const isUnaffordable = pkg.price > balance;

            return (
              <div
                key={pkg.id}
                onClick={() => {
                  if (!isUnaffordable) {
                    setSelectedPackage(pkg);
                  }
                }}
                className={`relative border-2 rounded-lg p-6 transition-all ${
                  selectedPackage?.id === pkg.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                } ${
                  isUnaffordable
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-gray-300 hover:shadow-md"
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
            );
          })}
        </div>
      )}

      {/* No Packages Available */}
      {!packagesLoading && !error && packages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"
              />
            </svg>
          </div>
          <p className="text-gray-600">Hiện tại chưa có gói nào khả dụng</p>
        </div>
      )}

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

            {/* Balance Warning */}
            {!isAffordable && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm flex items-start gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="flex-shrink-0 mt-0.5"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p className="font-medium mb-1">Số dư ví không đủ</p>
                  <p>
                    Vui lòng nạp thêm tiền vào ví hoặc chọn gói thấp hơn. Bạn
                    cần thêm{" "}
                    {(selectedPackage.price - balance).toLocaleString("vi-VN")}đ
                  </p>
                  <a
                    href="/nguoi-dung/vi-tien"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-medium text-blue-600 hover:underline"
                  >
                    Nạp tiền vào ví
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
