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
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (updates: any) => void;
  setSelectedImages: (images: File[]) => void;
  setSelectedPackage: (pkg: any) => void;
  handleSubmit: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  currentStep,
  formData,
  selectedImages,
  selectedPackage,
  nextStep,
  prevStep,
  updateFormData,
  setSelectedImages,
  setSelectedPackage,
  handleSubmit,
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
          formData.title && formData.address && formData.price && formData.area
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
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Đăng tin bất động sản
              </Dialog.Title>
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
                  updateFormData={updateFormData}
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
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Bước {currentStep} / {totalSteps}
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
                    className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Đăng tin
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
