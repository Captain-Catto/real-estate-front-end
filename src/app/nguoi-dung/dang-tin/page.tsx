"use client";

import React, { useState, useEffect, useRef } from "react";
import UserSidebar from "@/components/user/UserSidebar";
import Footer from "@/components/footer/Footer";
import { useCreatePostModal } from "@/hooks/useCreatePostModal";
import CreatePostModal from "@/components/modals/CreatePostModal/CreatePostModal";
import BasicInfoStep from "@/components/posting/BasicInfoStep";
import ImageUploadStep from "@/components/modals/EditPostModal/steps/ImageUploadStep";
import PackageSelectionStep from "@/components/modals/EditPostModal/steps/PackageSelectionStep";
import UserHeader from "@/components/user/UserHeader";
import { useAuth } from "@/hooks/useAuth"; // Update to use enhanced hook
import { useRouter } from "next/navigation";
import { locationService, Location } from "@/services/locationService";

export default function DangTinPage() {
  const router = useRouter();
  // Use the enhanced auth hook with isInitialized
  const {
    user,
    isAuthenticated,
    loading: userLoading,
    isInitialized,
  } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  // Sử dụng useRef để tránh vòng lặp vô hạn
  const hasRedirectedRef = useRef(false);
  const hasOpenedModalRef = useRef(false);
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    isOpen,
    openModal,
    closeModal,
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
  } = useCreatePostModal();

  // Redirect nếu chưa đăng nhập - Only after auth is initialized
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push("/dang-nhap");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Lấy danh sách tỉnh/thành khi mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLocationLoading(true);
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLocationLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Lấy phường/xã khi chọn tỉnh
  useEffect(() => {
    if (formData.location?.province) {
      setWards([]);
      const fetchWards = async () => {
        setLocationLoading(true);
        try {
          const data = await locationService.getWardsFromProvince(
            formData.location.province
          );
          setWards(data);
        } catch (error) {
          console.error("Error loading wards:", error);
        } finally {
          setLocationLoading(false);
        }
      };
      fetchWards();
    }
  }, [formData.location?.province]);

  // Auto open modal on mobile - Improved logic
  useEffect(() => {
    if (
      isMobile &&
      isInitialized &&
      isAuthenticated &&
      !isOpen &&
      !hasOpenedModalRef.current &&
      !userLoading
    ) {
      hasOpenedModalRef.current = true;
      openModal();
    }
  }, [
    isMobile,
    isAuthenticated,
    isInitialized,
    userLoading,
    isOpen,
    openModal,
  ]);

  // Default avatar URL
  const DEFAULT_AVATAR_URL =
    "https://datlqt-real-estate.s3.ap-southeast-2.amazonaws.com/uploads/4b3fd577-logo_placeholder.jpg";

  // Format user data từ Redux store
  const userData = user
    ? {
        name: user.username || user.email?.split("@")[0] || "User",
        avatar: user.avatar || DEFAULT_AVATAR_URL,
        balance: "0 đ", // Có thể lấy từ API wallet
        greeting: getGreeting(),
        email: user.email,
      }
    : {
        name: "Guest",
        avatar: DEFAULT_AVATAR_URL,
        greeting: getGreeting(),
        balance: "0 đ",
      };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng 🌅";
    if (hour < 18) return "Chào buổi chiều ☀️";
    return "Chào buổi tối 🌙";
  }

  const steps = [
    { number: 1, title: "Thông tin cơ bản" },
    { number: 2, title: "Hình ảnh" },
    { number: 3, title: "Gói đăng tin" },
  ];

  // Sửa lại canProceed để dùng biến đã destructured
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title && formData.location && formData.price && formData.area
        );
      case 2:
        return selectedImages.length > 0;
      case 3:
        return selectedPackage;
      default:
        return false;
    }
  };

  // Loading state - Wait for auth initialization
  if (!isInitialized || userLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Redirect handled by the useEffect - only show when initialized
  if (isInitialized && !isAuthenticated) {
    return null;
  }

  // Nếu không có user data
  if (!userData) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Không thể tải thông tin người dùng
          </p>
          <button
            onClick={() => router.push("/dang-nhap")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

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
              onClick={openModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Bắt đầu đăng tin
            </button>
          </div>
        </div>

        <CreatePostModal
          isOpen={isOpen}
          onClose={closeModal}
          currentStep={currentStep}
          formData={formData}
          selectedImages={selectedImages}
          selectedPackage={selectedPackage}
          nextStep={nextStep}
          prevStep={prevStep}
          updateFormData={updateFormData}
          setSelectedImages={setSelectedImages}
          setSelectedPackage={setSelectedPackage}
          handleSubmit={handleSubmit}
          provinces={provinces}
          wards={wards}
          locationLoading={locationLoading}
        />
      </>
    );
  }

  // Desktop: Regular page layout
  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        {/* <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div> */}

        {/* Main Content */}
        <main className="flex-1 min-h-screen w-full">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <div className="bg-white rounded-lg shadow">
              {/* Step Navigation */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
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
                        <span className="mx-4 h-1 w-8 bg-gray-300 rounded"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="max-w-4xl mx-auto py-6">
                {currentStep === 1 && (
                  <BasicInfoStep
                    formData={formData}
                    updateFormData={updateFormData}
                    provinces={provinces}
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
              <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Bước {currentStep} / {steps.length}
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

                  {currentStep < steps.length ? (
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
            </div>
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation - giữ nguyên */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          {/* Navigation items giữ nguyên */}
        </div>
      </div>

      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
