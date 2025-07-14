"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/store/hooks";
import { categoryService, Category } from "@/services/categoryService";
import { toast } from "sonner";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites: favoriteItems } = useFavorites();
  const [propertyCategories, setPropertyCategories] = useState<Category[]>([]);
  const [rentCategories, setRentCategories] = useState<Category[]>([]);
  const [projectCategories, setProjectCategories] = useState<Category[]>([]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Load property categories
        const propResult = await categoryService.getByProjectType(false);
        const activePropertyCategories = propResult
          .filter((cat) => cat.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setPropertyCategories(activePropertyCategories);
        setRentCategories(activePropertyCategories); // Same categories for rent

        // Load project categories
        const projectResult = await categoryService.getByProjectType(true);
        const activeProjectCategories = projectResult
          .filter((cat) => cat.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setProjectCategories(activeProjectCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      onClose();
      window.location.href = "/";
    }
  };

  return (
    <Transition show={isOpen}>
      <Dialog as="div" className="relative z-50 xl:hidden" onClose={onClose}>
        {/* Overlay */}
        <TransitionChild
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm" />
        </TransitionChild>

        {/* Sidebar */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        {/* Logo hoặc title có thể thêm ở đây */}
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* User Actions */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        {/* User info hiển thị khi đã đăng nhập */}
                        {isAuthenticated && user && (
                          <Link
                            href="/nguoi-dung/tong-quan"
                            onClick={onClose}
                            className="flex items-center gap-2 flex-1"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.username?.charAt(0).toUpperCase() ||
                                  user.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {user.username || user.email?.split("@")[0]}
                            </span>
                          </Link>
                        )}

                        <Link
                          href="/nguoi-dung/yeu-thich"
                          onClick={onClose}
                          className="p-2 border border-gray-300 rounded-lg relative flex items-center justify-center"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill={
                                favoriteItems.length > 0
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "none"
                              }
                            />
                          </svg>

                          {/* Badge số lượng yêu thích */}
                          {favoriteItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {favoriteItems.length > 9
                                  ? "9+"
                                  : favoriteItems.length}
                              </span>
                            </span>
                          )}
                        </Link>
                      </div>
                      {isAuthenticated && user ? (
                        /* Authenticated user actions */
                        <div className="space-y-2">
                          <Link
                            href="/dang-tin"
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors text-center block"
                            onClick={onClose}
                          >
                            Đăng tin
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      ) : (
                        /* Guest user actions */
                        <>
                          <div className="flex gap-2">
                            <Link
                              href="/dang-nhap"
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm text-center hover:bg-gray-50 transition-colors"
                              onClick={onClose}
                            >
                              Đăng nhập
                            </Link>
                            <Link
                              href="/register"
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm text-center hover:bg-red-700 transition-colors"
                              onClick={onClose}
                            >
                              Đăng ký
                            </Link>
                          </div>

                          <Link
                            href="/dang-tin"
                            className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm block text-center hover:bg-gray-50 transition-colors"
                            onClick={onClose}
                          >
                            Đăng tin
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto">
                      <nav className="p-4 space-y-2">
                        {/* Trang chủ */}
                        <Link
                          href="/"
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={onClose}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <span>Trang chủ</span>
                        </Link>

                        {/* Mua bán */}
                        <Disclosure>
                          {({ open }) => (
                            <div>
                              <div className="flex items-center">
                                <Link
                                  href="/mua-ban"
                                  className="flex-1 flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-l-lg"
                                  onClick={onClose}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                  <span>Mua bán</span>
                                </Link>
                                <DisclosureButton className="p-3 text-gray-700 hover:bg-gray-50 rounded-r-lg">
                                  <svg
                                    className={`w-4 h-4 transform transition-transform ${
                                      open ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </DisclosureButton>
                              </div>
                              <DisclosurePanel className="ml-8 mt-2 space-y-1">
                                {propertyCategories.map((category) => (
                                  <Link
                                    key={category._id}
                                    href={`/mua-ban/${category.slug}`}
                                    className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                    onClick={onClose}
                                  >
                                    {category.name}
                                  </Link>
                                ))}
                              </DisclosurePanel>
                            </div>
                          )}
                        </Disclosure>

                        {/* Cho thuê */}
                        <Disclosure>
                          {({ open }) => (
                            <div>
                              <div className="flex items-center">
                                <Link
                                  href="/cho-thue"
                                  className="flex-1 flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-l-lg"
                                  onClick={onClose}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                    />
                                  </svg>
                                  <span>Cho thuê</span>
                                </Link>
                                <DisclosureButton className="p-3 text-gray-700 hover:bg-gray-50 rounded-r-lg">
                                  <svg
                                    className={`w-4 h-4 transform transition-transform ${
                                      open ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </DisclosureButton>
                              </div>
                              <DisclosurePanel className="ml-8 mt-2 space-y-1">
                                <Link
                                  href="/cho-thue/can-ho"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Căn hộ chung cư
                                </Link>
                                <Link
                                  href="/cho-thue/nha-rieng"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Nhà riêng
                                </Link>
                                <Link
                                  href="/cho-thue/van-phong"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Văn phòng
                                </Link>
                                <Link
                                  href="/cho-thue/mat-bang"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Mặt bằng
                                </Link>
                              </DisclosurePanel>
                            </div>
                          )}
                        </Disclosure>

                        {/* Dự án */}
                        <Disclosure>
                          {({ open }) => (
                            <div>
                              <div className="flex items-center">
                                <Link
                                  href="/du-an"
                                  className="flex-1 flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-l-lg"
                                  onClick={onClose}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                  <span>Dự án</span>
                                </Link>
                                <DisclosureButton className="p-3 text-gray-700 hover:bg-gray-50 rounded-r-lg">
                                  <svg
                                    className={`w-4 h-4 transform transition-transform ${
                                      open ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </DisclosureButton>
                              </div>
                              <DisclosurePanel className="ml-8 mt-2 space-y-1">
                                <Link
                                  href="/du-an/can-ho-chung-cu"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Căn hộ chung cư
                                </Link>
                                <Link
                                  href="/du-an/cao-oc-van-phong"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Cao ốc văn phòng
                                </Link>
                                <Link
                                  href="/du-an/trung-tam-thuong-mai"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Trung tâm thương mại
                                </Link>
                                <Link
                                  href="/du-an/khu-do-thi-moi"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Khu đô thị mới
                                </Link>
                                <Link
                                  href="/du-an/khu-phuc-hop"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Khu phức hợp
                                </Link>
                                <Link
                                  href="/du-an/nha-o-xa-hoi"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Nhà ở xã hội
                                </Link>
                                <Link
                                  href="/du-an/khu-nghi-duong"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Khu nghỉ dưỡng
                                </Link>
                                <Link
                                  href="/du-an/khu-cong-nghiep"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Khu công nghiệp
                                </Link>
                              </DisclosurePanel>
                            </div>
                          )}
                        </Disclosure>

                        {/* Tin tức */}
                        <Link
                          href="/tin-tuc"
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={onClose}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                            />
                          </svg>
                          <span>Tin tức</span>
                        </Link>

                        {/* Liên hệ */}
                        <Link
                          href="/lien-he"
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={onClose}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>Liên hệ</span>
                        </Link>
                      </nav>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
