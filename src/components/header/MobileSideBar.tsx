"use client";
import React from "react";
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: SidebarProps) {
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
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700">
                          Tải ứng dụng
                        </button>
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
                        <button className="p-2 border border-gray-300 rounded-lg">
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm">
                          Đăng nhập
                        </button>
                        <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm">
                          Đăng ký
                        </button>
                      </div>

                      <button className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm">
                        Đăng tin
                      </button>
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
                                <Link
                                  href="/mua-ban/can-ho"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Căn hộ chung cư
                                </Link>
                                <Link
                                  href="/mua-ban/nha-rieng"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Nhà riêng
                                </Link>
                                <Link
                                  href="/mua-ban/biet-thu"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Biệt thự
                                </Link>
                                <Link
                                  href="/mua-ban/dat-nen"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Đất nền
                                </Link>
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

                        {/* Wiki BĐS */}
                        <Disclosure>
                          {({ open }) => (
                            <div>
                              <div className="flex items-center">
                                <Link
                                  href="/wiki"
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
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                  </svg>
                                  <span>Wiki BĐS</span>
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
                                  href="/wiki/mua-bds"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Mua BĐS
                                </Link>
                                <Link
                                  href="/wiki/ban-bds"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Bán BĐS
                                </Link>
                                <Link
                                  href="/wiki/thue-bds"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Thuê BĐS
                                </Link>
                                <Link
                                  href="/wiki/tai-chinh"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Tài chính BĐS
                                </Link>
                                <Link
                                  href="/wiki/phong-thuy"
                                  className="block p-2 text-sm text-gray-600 hover:text-blue-600"
                                  onClick={onClose}
                                >
                                  Phong thủy
                                </Link>
                              </DisclosurePanel>
                            </div>
                          )}
                        </Disclosure>

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
