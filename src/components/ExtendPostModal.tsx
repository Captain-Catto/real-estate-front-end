"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postService } from "../services/postsService";
import { paymentService } from "../services/paymentService";
import { toast } from "sonner";

interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface ExtendPostModalProps {
  post: {
    id: string;
    title: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExtendPostModal({
  post,
  onClose,
  onSuccess,
}: ExtendPostModalProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesData, walletData] = await Promise.all([
        postService.getPackages(),
        paymentService.getUserWalletInfo(),
      ]);

      setPackages(
        packagesData?.data?.map((pkg) => ({
          id: pkg._id,
          name: pkg.name,
          price: pkg.price,
          duration: pkg.duration,
          description: pkg.features?.join(", ") || "",
        })) || []
      );
      setWalletBalance(walletData?.data?.balance || 0);
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!selectedPackage) {
      toast.error("Vui lòng chọn gói gia hạn");
      return;
    }

    if (walletBalance < selectedPackage.price) {
      toast.error("Số dư ví không đủ để thực hiện giao dịch");
      return;
    }

    try {
      setExtending(true);

      await postService.extendPost(post.id, selectedPackage.id);

      toast.success("Gia hạn tin đăng thành công!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra khi gia hạn tin đăng");
    } finally {
      setExtending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gia hạn tin đăng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Tin đăng: {post.title}</h3>
          <div className="text-sm text-gray-600">
            Số dư ví:{" "}
            <span className="font-medium text-green-600">
              {formatCurrency(walletBalance)}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-3">Chọn gói gia hạn:</h4>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedPackage?.id === pkg.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{pkg.name}</div>
                    <div className="text-sm text-gray-600">
                      Thời hạn: {pkg.duration} ngày
                    </div>
                    {pkg.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {pkg.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">
                      {formatCurrency(pkg.price)}
                    </div>
                    {walletBalance < pkg.price && (
                      <div className="text-xs text-red-500">Không đủ số dư</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleExtend}
            disabled={
              !selectedPackage ||
              extending ||
              (selectedPackage && walletBalance < selectedPackage.price)
            }
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {extending ? "Đang xử lý..." : "Gia hạn"}
          </button>
        </div>
      </div>
    </div>
  );
}
