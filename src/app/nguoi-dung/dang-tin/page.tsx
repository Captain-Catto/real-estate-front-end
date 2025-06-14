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
import UserHeader from "@/components/user/UserHeader";

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
              {/* Header Section - Using Component */}
              <UserHeader
                userData={userData}
                showNotificationButton={true}
                showWalletButton={true}
              />

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

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          {/* Tổng quan */}
          <Link
            href="/nguoi-dung/tong-quan"
            className="flex flex-col items-center py-2 px-1 text-blue-600 bg-blue-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
              />
            </svg>
            <span className="text-xs font-medium">Tổng quan</span>
          </Link>

          {/* Quản lý tin */}
          <Link
            href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Quản lý</span>
          </Link>

          {/* Đăng tin */}
          <Link
            href="/nguoi-dung/dang-tin"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-1"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.75 2C8.16421 2 8.5 2.33579 8.5 2.75V7H12.75C13.1642 7 13.5 7.33579 13.5 7.75C13.5 8.16421 13.1642 8.5 12.75 8.5H8.5V12.75C8.5 13.1642 8.16421 13.5 7.75 13.5C7.33579 13.5 7 13.1642 7 12.75V8.5H2.75C2.33579 8.5 2 8.16421 2 7.75C2 7.33579 2.33579 7 2.75 7H7V2.75C7 2.33579 7.33579 2 7.75 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs">Đăng tin</span>
          </Link>

          {/* Nạp tiền */}
          <Link
            href="/nguoi-dung/khach-hang"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
              />
            </svg>
            <span className="text-xs">Khách hàng</span>
          </Link>

          {/* Tài khoản */}
          <Link
            href="/nguoi-dung/tai-khoan"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <span className="text-xs">Tài khoản</span>
          </Link>
        </div>
      </div>

      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
