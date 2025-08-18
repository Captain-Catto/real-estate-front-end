"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postService } from "@/services/postsService";
import { paymentService } from "@/services/paymentService";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

interface Package {
  _id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
}

interface ExtendPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  postId: string;
  postTitle: string;
}

export default function ExtendPostModal({
  isOpen,
  onClose,
  onSuccess,
  postId,
  postTitle,
}: ExtendPostModalProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setFetchingData(true);
      // Load packages and wallet balance in parallel
      const [packagesResponse, walletResponse] = await Promise.all([
        postService.getPackages(),
        paymentService.getUserWalletInfo(),
      ]);

      // Debug log to see response structure
      console.log("Packages response:", packagesResponse);
      console.log("Packages response type:", typeof packagesResponse);
      console.log(
        "Packages response keys:",
        Object.keys(packagesResponse || {})
      );
      console.log("Wallet response:", walletResponse);

      // Handle packages response - check if it's direct array or wrapped
      if (packagesResponse) {
        let packagesData: Array<{
          _id: string;
          name: string;
          price: number;
          duration: number;
          features: string[];
          type: string;
          status?: string;
        }> = [];
        if (Array.isArray(packagesResponse)) {
          packagesData = packagesResponse;
        } else if (
          packagesResponse.success &&
          packagesResponse.data &&
          Array.isArray(packagesResponse.data)
        ) {
          packagesData = packagesResponse.data;
        } else {
          packagesData = [];
        }

        // All packages from API should already be active, but filter just in case
        const activePackages = packagesData
          .filter((pkg) => pkg.status !== "inactive")
          .map((pkg) => ({
            _id: pkg._id,
            name: pkg.name,
            price: pkg.price,
            duration: pkg.duration,
            features: pkg.features,
            isActive: pkg.status !== "inactive",
          }));

        setPackages(activePackages);
        // Auto-select first package
        if (activePackages.length > 0) {
          setSelectedPackage(activePackages[0]);
        }
      }

      if (walletResponse && walletResponse.success) {
        setWalletBalance(walletResponse.data.balance || 0);
      }
    } catch {
      // Silent error for extend post data loading
      showErrorToast("Không thể tải thông tin gói dịch vụ");
    } finally {
      setFetchingData(false);
    }
  };

  const handleExtend = async () => {
    if (!selectedPackage) {
      showErrorToast("Vui lòng chọn gói dịch vụ");
      return;
    }

    if (walletBalance < selectedPackage.price) {
      showErrorToast("Số dư ví không đủ để gia hạn tin đăng");
      return;
    }

    try {
      setLoading(true);
      const response = await postService.extendPost(
        postId,
        selectedPackage._id
      );

      if (response.success) {
        showSuccessToast(
          "Đã gia hạn tin đăng thành công. Tin đăng đang chờ duyệt."
        );
        // Refresh wallet balance after successful extend
        try {
          const walletResponse = await paymentService.getUserWalletInfo();
          if (walletResponse && walletResponse.success) {
            setWalletBalance(walletResponse.data.balance || 0);
          }
        } catch (error) {
          console.log("Error refreshing wallet balance:", error);
        }
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Không thể gia hạn tin đăng");
      }
    } catch (error) {
      // Error already handled by toast below
      showErrorToast(
        error instanceof Error ? error.message : "Không thể gia hạn tin đăng"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Gia hạn tin đăng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {fetchingData ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        ) : (
          <>
            {/* Post Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Tin đăng cần gia hạn:
              </h4>
              <p className="text-gray-700">{postTitle}</p>
            </div>

            {/* Wallet Balance */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Số dư ví:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatPrice(walletBalance)}
                </span>
              </div>
            </div>

            {/* Package Selection */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Chọn gói gia hạn:
              </h4>
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPackage?._id === pkg._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {pkg.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Thời hạn: {pkg.duration} ngày
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(pkg.price)}
                        </p>
                        {walletBalance < pkg.price && (
                          <p className="text-sm text-red-600">Không đủ số dư</p>
                        )}
                      </div>
                    </div>
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="mt-3 text-sm text-gray-600">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Summary */}
            {selectedPackage && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Chi phí gia hạn:
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(selectedPackage.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600">Số dư sau khi gia hạn:</span>
                  <span
                    className={`font-medium ${
                      walletBalance - selectedPackage.price >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPrice(walletBalance - selectedPackage.price)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleExtend}
                disabled={
                  loading ||
                  !selectedPackage ||
                  walletBalance < (selectedPackage?.price || 0)
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  loading ||
                  !selectedPackage ||
                  walletBalance < (selectedPackage?.price || 0)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Đang xử lý..." : "Gia hạn tin đăng"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
