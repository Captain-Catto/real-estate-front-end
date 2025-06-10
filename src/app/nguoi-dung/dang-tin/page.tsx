"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import Footer from "@/components/footer/Footer";
import { useCreatePostModal } from "@/hooks/useCreatePostModal";
import CreatePostModal from "@/components/modals/CreatePostModal/CreatePostModal";
import BasicInfoStep from "@/components/modals/EditPostModal/steps/BasicInfoStep";
import ImageUploadStep from "@/components/modals/EditPostModal/steps/ImageUploadStep";
import PackageSelectionStep from "@/components/modals/EditPostModal/steps/PackageSelectionStep";

export default function DangTinPage() {
  const [isMobile, setIsMobile] = useState(false);
  const createModal = useCreatePostModal();

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Mock user data
  const userData = {
    name: "Lê Quang Trí Đạt",
    avatar: "Đ",
    balance: "0 đ",
    greeting: "Chào buổi sáng 🌤",
  };

  const steps = [
    { number: 1, title: "Thông tin cơ bản" },
    { number: 2, title: "Hình ảnh" },
    { number: 3, title: "Gói đăng tin" },
  ];

  const canProceed = () => {
    switch (createModal.currentStep) {
      case 1:
        return (
          createModal.formData.title &&
          createModal.formData.address &&
          createModal.formData.price &&
          createModal.formData.area
        );
      case 2:
        return createModal.selectedImages.length > 0;
      case 3:
        return createModal.selectedPackage;
      default:
        return false;
    }
  };

  // Auto open modal on mobile
  useEffect(() => {
    if (isMobile && !createModal.isOpen) {
      createModal.openModal();
    }
  }, [isMobile]);

  // Mobile: Always use modal
  if (isMobile) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-4">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto text-blue-600"
              >
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Đăng tin bất động sản
            </h1>
            <p className="text-gray-600 mb-6">
              Bắt đầu đăng tin để bán hoặc cho thuê bất động sản của bạn
            </p>
            <button
              onClick={createModal.openModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Bắt đầu đăng tin
            </button>
          </div>
        </div>

        <CreatePostModal
          isOpen={createModal.isOpen}
          onClose={createModal.closeModal}
          currentStep={createModal.currentStep}
          formData={createModal.formData}
          selectedImages={createModal.selectedImages}
          selectedPackage={createModal.selectedPackage}
          nextStep={createModal.nextStep}
          prevStep={createModal.prevStep}
          updateFormData={createModal.updateFormData}
          setSelectedImages={createModal.setSelectedImages}
          setSelectedPackage={createModal.setSelectedPackage}
          handleSubmit={createModal.handleSubmit}
        />
      </>
    );
  }

  // Desktop: Regular page layout
  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen w-full">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <div className="bg-white rounded-lg shadow">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  {/* Left Side - User Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {userData.avatar}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs text-gray-600 mb-1">
                          {userData.greeting}
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-gray-900">
                            {userData.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-4">
                    <Link href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue">
                      <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        Quản lý tin đăng
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          createModal.currentStep >= step.number
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {createModal.currentStep > step.number ? (
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
                          createModal.currentStep >= step.number
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-8 h-0.5 mx-4 ${
                            createModal.currentStep > step.number
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
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  {createModal.currentStep === 1 && (
                    <BasicInfoStep
                      formData={createModal.formData}
                      updateFormData={createModal.updateFormData}
                    />
                  )}
                  {createModal.currentStep === 2 && (
                    <ImageUploadStep
                      selectedImages={createModal.selectedImages}
                      setSelectedImages={createModal.setSelectedImages}
                    />
                  )}
                  {createModal.currentStep === 3 && (
                    <PackageSelectionStep
                      selectedPackage={createModal.selectedPackage}
                      setSelectedPackage={createModal.setSelectedPackage}
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Bước {createModal.currentStep} / {steps.length}
                </div>

                <div className="flex gap-3">
                  {createModal.currentStep > 1 && (
                    <button
                      onClick={createModal.prevStep}
                      className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Quay lại
                    </button>
                  )}

                  {createModal.currentStep < steps.length ? (
                    <button
                      onClick={createModal.nextStep}
                      disabled={!canProceed()}
                      className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tiếp tục
                    </button>
                  ) : (
                    <button
                      onClick={createModal.handleSubmit}
                      disabled={!canProceed()}
                      className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đăng tin
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
