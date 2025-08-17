"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { packageService, Package } from "@/services/packageService";

interface PackageSelectionProps {
  selectedPackageId?: string;
  onPackageSelect: (packageId: string) => void;
}

const PackageSelection = ({
  selectedPackageId,
  onPackageSelect,
}: PackageSelectionProps) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active packages
  const fetchPackages = async () => {
    try {
      const result = await packageService.getActivePackages();

      if (result.success) {
        // Packages đã được filter active từ backend và sort theo priority
        setPackages(result.data.packages);
      }
    } catch (error) {
      toast.error("Lấy danh sách gói dịch vụ thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Chọn Gói Đăng Tin</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
              selectedPackageId === pkg.id
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
            onClick={() => onPackageSelect(pkg.id)}
          >
            {/* Selected indicator */}
            {selectedPackageId === pkg.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Package header */}
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {pkg.name}
              </h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {formatPrice(pkg.price)}
              </div>
              <div className="text-sm text-gray-500">{pkg.duration} ngày</div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              {pkg.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-700"
                >
                  <svg
                    className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            {/* Priority badge for premium packages */}
            {pkg.priority === "premium" && (
              <div className="absolute top-2 left-2">
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  KHUYẾN NGHỊ
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Hiện tại chưa có gói đăng tin nào khả dụng
        </div>
      )}

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg
            className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tin đăng sẽ tự động hết hạn sau thời gian quy định</li>
              <li>Bạn có thể gia hạn tin đăng trước khi hết hạn</li>
              <li>Gói cao cấp hơn sẽ có độ ưu tiên hiển thị cao hơn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSelection;
