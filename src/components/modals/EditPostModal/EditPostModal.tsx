import React from "react";
import { Dialog } from "@headlessui/react";
import { EditPostForm } from "@/types/editPost";
import BasicInfoStep from "./steps/BasicInfoStep";
import ImageUploadStep from "./steps/ImageUploadStep";
import PackageSelectionStep from "./steps/PackageSelectionStep";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  editingPost: any;
  formData: any;
  selectedImages: File[];
  selectedPackage: any;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (
    field: string | number | symbol,
    value: string | number | undefined
  ) => void;
  setSelectedImages: (images: File[]) => void;
  setSelectedPackage: (pkg: any) => void;
  handleBasicSubmit: () => void;
  handleImageSubmit: () => void;
  handlePackageSubmit: () => void;
  existingImages: string[];
  updateExistingImages: (images: string[]) => void;
  provinces: any[];
  wards: any[];
  locationLoading: boolean;
}
export default function EditPostModal({
  isOpen,
  onClose,
  currentStep,
  editingPost,
  formData,
  selectedImages,
  selectedPackage,
  nextStep,
  prevStep,
  updateFormData,
  setSelectedImages,
  setSelectedPackage,
  handleBasicSubmit,
  handleImageSubmit,
  handlePackageSubmit,
  existingImages,
  updateExistingImages,
  provinces,
  wards,
  locationLoading,
}: EditPostModalProps) {
  // Xác định trạng thái tin đăng - CHUẨN HÓA STATUS CODES
  const isExpired = editingPost?.status === "expired"; // Hết hạn - cần chọn gói mới
  const isRejected = editingPost?.status === "rejected"; // Không duyệt - đã charge, ko cần chọn gói
  const isActive = editingPost?.status === "active"; // Đang hiển thị - chỉ edit
  const isPending = editingPost?.status === "pending"; // Chờ duyệt - chỉ edit
  const isWaitingDisplay = editingPost?.status === "waiting_display"; // Chờ hiển thị - chỉ edit
  const isWaitingPublish = editingPost?.status === "waiting_publish"; // Chờ xuất bản - chỉ edit
  const isNearExpiry = editingPost?.status === "near_expiry"; // Sắp hết hạn - chỉ edit
  const isHidden = editingPost?.status === "hidden"; // Đã hạ - chỉ edit
  const isWaitingPayment = editingPost?.status === "waiting_payment"; // Chờ thanh toán - cần chọn gói

  // Chỉ cần chọn gói khi tin hết hạn (status = "8") hoặc chờ thanh toán (status = "12")
  const needsPackageSelection = isExpired || isWaitingPayment;

  const steps = needsPackageSelection
    ? [
        { number: 1, title: "Thông tin cơ bản" },
        { number: 2, title: "Hình ảnh" },
        { number: 3, title: "Gói đăng tin" },
      ]
    : [
        { number: 1, title: "Thông tin cơ bản" },
        { number: 2, title: "Hình ảnh" },
      ];

  const totalSteps = steps.length;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.location &&
          formData.location.province &&
          formData.location.ward &&
          formData.price &&
          formData.area
        );
      case 2:
        const hasImages =
          selectedImages.length > 0 || existingImages.length > 0;
        console.log("🔍 Step 2 canProceed check:", {
          selectedImages: selectedImages.length,
          existingImages: existingImages.length,
          hasImages,
        });
        return hasImages;
      case 3:
        return needsPackageSelection ? selectedPackage : true;
      default:
        return false;
    }
  };

  // Xác định title và button text dựa trên status - CẬP NHẬT
  const getModalTitle = () => {
    if (isExpired) return "Gia hạn tin đăng";
    if (isWaitingPayment) return "Hoàn tất thanh toán";
    if (isRejected) return "Chỉnh sửa tin bị từ chối";
    if (isPending) return "Chỉnh sửa tin chờ duyệt";
    if (isWaitingDisplay) return "Chỉnh sửa tin chờ hiển thị";
    if (isWaitingPublish) return "Chỉnh sửa tin chờ xuất bản";
    if (isNearExpiry) return "Chỉnh sửa tin sắp hết hạn";
    if (isHidden) return "Chỉnh sửa tin đã hạ";
    return "Chỉnh sửa tin đăng";
  };

  const getSubmitButtonText = () => {
    if (isExpired) return "Gia hạn & Đăng tin";
    if (isWaitingPayment) return "Thanh toán & Đăng tin";
    if (isRejected) return "Gửi lại tin đăng";
    if (isPending) return "Cập nhật tin đăng";
    if (isWaitingDisplay) return "Cập nhật tin đăng";
    if (isWaitingPublish) return "Cập nhật tin đăng";
    if (isNearExpiry) return "Cập nhật tin đăng";
    if (isHidden) return "Cập nhật tin đăng";
    if (isActive) return "Cập nhật tin đăng";
    return "Lưu thay đổi";
  };

  const handleSubmit = () => {
    if (currentStep === 1) {
      handleBasicSubmit();
    } else if (currentStep === 2) {
      // Always handle images first, then proceed
      handleImageSubmit();
    } else if (currentStep === 3 && needsPackageSelection) {
      handlePackageSubmit();
    }
  };

  const getSubmitButtonColor = () => {
    if (isExpired) return "bg-blue-600 hover:bg-blue-700";
    if (isWaitingPayment) return "bg-green-600 hover:bg-green-700";
    if (isRejected) return "bg-orange-600 hover:bg-orange-700";
    if (isNearExpiry) return "bg-yellow-600 hover:bg-yellow-700";
    return "bg-green-600 hover:bg-green-700";
  };

  // Create a wrapper to convert the hook's updates to what BasicInfoStep expects
  const handleUpdateFormData = (updates: Partial<EditPostForm>) => {
    console.log("🔄 handleUpdateFormData called with:", updates);

    // Handle existing images update
    if (updates.images) {
      updateExistingImages(updates.images);
      return;
    }

    // Handle other form field updates by calling the hook's updateFormData
    Object.keys(updates).forEach((key) => {
      const value = updates[key as keyof EditPostForm];
      if (key !== "images" && value !== undefined && value !== null) {
        console.log(`🔧 Updating field: ${key} = ${value}`);
        updateFormData(key, value as string | number | undefined);
      }
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  {getModalTitle()}
                </Dialog.Title>
                {/* Status indicator - CẬP NHẬT */}
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive
                        ? "bg-green-500"
                        : isPending || isWaitingDisplay || isWaitingPublish
                        ? "bg-yellow-500"
                        : isRejected
                        ? "bg-red-500"
                        : isExpired || isHidden
                        ? "bg-gray-400"
                        : isNearExpiry
                        ? "bg-orange-500"
                        : isWaitingPayment
                        ? "bg-indigo-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {isActive && "Tin đang hiển thị"}
                    {isWaitingDisplay && "Tin chờ hiển thị"}
                    {isPending && "Tin chờ duyệt"}
                    {isWaitingPublish && "Tin chờ xuất bản"}
                    {isRejected && "Tin bị từ chối - Đã thanh toán"}
                    {isExpired && "Tin đã hết hạn"}
                    {isNearExpiry && "Tin sắp hết hạn"}
                    {isHidden && "Tin đã hạ"}
                    {isWaitingPayment && "Tin chờ thanh toán"}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-500"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.number
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        currentStep >= step.number
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 h-0.5 mx-4 ${
                          currentStep > step.number
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {currentStep === 1 && (
                <BasicInfoStep
                  formData={formData}
                  updateFormData={handleUpdateFormData}
                  provinces={provinces}
                  wards={wards}
                  locationLoading={locationLoading}
                />
              )}
              {currentStep === 2 && (
                <ImageUploadStep
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  existingImages={existingImages}
                  updateFormData={handleUpdateFormData}
                  updateExistingImages={updateExistingImages}
                />
              )}
              {/* Chỉ hiển thị PackageSelectionStep khi cần */}
              {currentStep === 3 && needsPackageSelection && (
                <PackageSelectionStep
                  selectedPackage={selectedPackage}
                  setSelectedPackage={setSelectedPackage}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Bước {currentStep} / {totalSteps}
                </div>
                {isRejected && (
                  <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    💡 Tin đã được thanh toán, chỉ cần sửa nội dung
                  </div>
                )}
                {isWaitingPayment && (
                  <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    💳 Cần hoàn tất thanh toán để đăng tin
                  </div>
                )}
                {(isActive ||
                  isPending ||
                  isWaitingDisplay ||
                  isWaitingPublish ||
                  isNearExpiry ||
                  isHidden) && (
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    ⚠️ Sau khi cập nhật, tin sẽ được duyệt lại
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Quay lại
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getSubmitButtonColor()}`}
                  >
                    {getSubmitButtonText()}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
