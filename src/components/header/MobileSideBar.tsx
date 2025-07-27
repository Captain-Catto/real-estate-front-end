"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Disclosure, Transition } from "@headlessui/react";
import {
  headerSettingsService,
  HeaderMenu,
} from "@/services/headerSettingsService";
import ActionButton from "./ActionButton";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [headerMenus, setHeaderMenus] = useState<HeaderMenu[]>([]);
  const [loading, setLoading] = useState(true);

  // Load header menus on component mount
  useEffect(() => {
    loadHeaderMenus();
  }, []);

  const loadHeaderMenus = async () => {
    try {
      setLoading(true);
      const response = await headerSettingsService.getHeaderMenus();
      if (response.success) {
        // Only show active menus, sorted by order
        const activeMenus = response.data
          .filter((menu) => menu.isActive)
          .sort((a, b) => a.order - b.order);
        setHeaderMenus(activeMenus);
      }
    } catch (error) {
      console.error("Failed to load header menus:", error);
      // Fallback to default menus
      setHeaderMenus([
        {
          id: "1",
          label: "Trang chủ",
          href: "/",
          order: 1,
          isActive: true,
          hasDropdown: false,
          dropdownItems: [],
        },
        {
          id: "2",
          label: "Mua bán",
          href: "/mua-ban",
          order: 2,
          isActive: true,
          hasDropdown: true,
          dropdownItems: [
            {
              id: "2-1",
              label: "Nhà riêng",
              href: "/mua-ban/nha-rieng",
              order: 1,
              isActive: true,
            },
            {
              id: "2-2",
              label: "Chung cư",
              href: "/mua-ban/chung-cu",
              order: 2,
              isActive: true,
            },
          ],
        },
        {
          id: "3",
          label: "Cho thuê",
          href: "/cho-thue",
          order: 3,
          isActive: true,
          hasDropdown: false,
          dropdownItems: [],
        },
        {
          id: "4",
          label: "Dự án",
          href: "/du-an",
          order: 4,
          isActive: true,
          hasDropdown: false,
          dropdownItems: [],
        },
        {
          id: "5",
          label: "Tin tức",
          href: "/tin-tuc",
          order: 5,
          isActive: true,
          hasDropdown: false,
          dropdownItems: [],
        },
        {
          id: "6",
          label: "Liên hệ",
          href: "/lien-he",
          order: 6,
          isActive: true,
          hasDropdown: false,
          dropdownItems: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // If not open, don't render
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-4">
          {/* Close button */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-medium">Menu</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg
                className="w-6 h-6"
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
          <div className="mt-6 border-t border-gray-200 pt-4">
            <ActionButton />
          </div>

          {/* Navigation */}
          <div className="mt-2">
            {loading ? (
              <div className="py-3">
                <div className="space-y-6">
                  <div className="animate-pulse bg-gray-200 h-8 w-40 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-36 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-28 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="py-3">
                <div className="space-y-1">
                  {headerMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="border-b border-gray-200 pb-2 mb-2 last:border-0"
                    >
                      {menu.hasDropdown && menu.dropdownItems.length > 0 ? (
                        <Disclosure>
                          {({ open }) => (
                            <div>
                              <Disclosure.Button className="flex justify-between items-center w-full py-2 text-left text-base font-medium text-black hover:text-[#e03c31] transition-colors">
                                <Link
                                  href={menu.href}
                                  className="no-underline text-inherit"
                                >
                                  {menu.label}
                                </Link>
                                <svg
                                  className={`${
                                    open ? "rotate-180" : "rotate-0"
                                  } h-5 w-5 transform transition-transform`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </Disclosure.Button>
                              <Transition
                                enter="transition duration-100 ease-out"
                                enterFrom="transform scale-95 opacity-0"
                                enterTo="transform scale-100 opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform scale-100 opacity-100"
                                leaveTo="transform scale-95 opacity-0"
                              >
                                <Disclosure.Panel className="ml-4 mt-2 space-y-2">
                                  {menu.dropdownItems
                                    .filter((item) => item.isActive)
                                    .sort((a, b) => a.order - b.order)
                                    .map((item) => (
                                      <div key={item.id} className="py-1">
                                        <Link
                                          href={item.href}
                                          className="block pl-3 pr-4 py-2 border-l-2 border-gray-300 text-base text-gray-700 hover:text-[#e03c31] hover:border-[#e03c31] transition-colors duration-150 no-underline"
                                        >
                                          {item.label}
                                        </Link>
                                      </div>
                                    ))}
                                </Disclosure.Panel>
                              </Transition>
                            </div>
                          )}
                        </Disclosure>
                      ) : (
                        <Link
                          href={menu.href}
                          className="block py-2 text-base font-medium text-black hover:text-[#e03c31] transition-colors no-underline"
                        >
                          {menu.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
