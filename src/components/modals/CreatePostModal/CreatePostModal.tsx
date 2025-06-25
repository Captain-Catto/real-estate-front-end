import React from "react";
import { Dialog } from "@headlessui/react";
import BasicInfoStep from "../EditPostModal/steps/BasicInfoStep";
import ImageUploadStep from "../EditPostModal/steps/ImageUploadStep";
import PackageSelectionStep from "../EditPostModal/steps/PackageSelectionStep";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  formData: any;
  selectedImages: File[];
  selectedPackage: any;
  isSubmitting?: boolean;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (updates: any) => void;
  setSelectedImages: (images: File[]) => void;
  setSelectedPackage: (pkg: any) => void;
  handleSubmit: () => void;
  provinces: any[]; // Thêm dòng này
  districts: any[]; // Thêm dòng này
  wards: any[]; // Thêm dòng này
  locationLoading: boolean; // Thêm dòng này
}

export default function CreatePostModal({
  isOpen,
  onClose,
  currentStep,
  formData,
  selectedImages,
  selectedPackage,
  isSubmitting = false,
  nextStep,
  prevStep,
  updateFormData,
  setSelectedImages,
  setSelectedPackage,
  handleSubmit,
  provinces,
  districts,
  wards,
  locationLoading,
}: CreatePostModalProps) {
  const steps = [
    { number: 1, title: "Thông tin cơ bản" },
    { number: 2, title: "Hình ảnh" },
    { number: 3, title: "Gói đăng tin" },
  ];

  const totalSteps = steps.length;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.location &&
          formData.location.province &&
          formData.location.district &&
          formData.location.ward &&
          formData.price &&
          formData.area
        );
      case 2:
        return selectedImages.length > 0;
      case 3:
        return selectedPackage;
      default:
        return false;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Đăng tin bất động sản
              </Dialog.Title>
              {!isSubmitting && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Steps */}
            <div className="mt-4">
              <div className="flex items-center justify-between max-w-lg">
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
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
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
                      className={`ml-2 text-sm ${
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
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentStep === 1 && (
              <BasicInfoStep
                formData={formData}
                updateFormData={updateFormData}
                provinces={provinces}
                districts={districts}
                wards={wards}
                locationLoading={locationLoading}
              />
            )}
            {currentStep === 2 && (
              <ImageUploadStep
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
              />
            )}
            {currentStep === 3 && (
              <PackageSelectionStep
                selectedPackage={selectedPackage}
                setSelectedPackage={setSelectedPackage}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Bước {currentStep} / {totalSteps}
              </div>

              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Quay lại
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed() || isSubmitting}
                    className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isSubmitting ? "Đang đăng tin..." : "Đăng tin"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
