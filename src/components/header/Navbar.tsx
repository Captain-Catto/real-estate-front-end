"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";

export function Navbar() {
  const [isHoveringBuy, setIsHoveringBuy] = useState(false);
  const [isHoveringRent, setIsHoveringRent] = useState(false);
  const [isHoveringProject, setIsHoveringProject] = useState(false);

  return (
    <ul className="flex list-none gap-4 md:gap-6 lg:gap-8 xl:gap-10 items-center">
      {/* Trang chủ */}
      <li>
        <Link
          href="/"
          className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium"
        >
          Trang chủ
        </Link>
      </li>

      {/* Mua bán with hover */}
      <li
        className="relative"
        onMouseEnter={() => setIsHoveringBuy(true)}
        onMouseLeave={() => setIsHoveringBuy(false)}
      >
        <Menu as="div" className="relative inline-block text-left">
          {({ open }) => (
            <>
              <MenuButton className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium flex items-center gap-1">
                <Link href="/mua-ban" className="no-underline text-inherit">
                  Mua bán
                </Link>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    open || isHoveringBuy ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </MenuButton>

              <Transition
                show={open || isHoveringBuy}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems
                  static
                  className="absolute left-0 mt-2 w-48 origin-top-left divide-y divide-gray-100 rounded-lg bg-white shadow-lg focus:outline-none z-50"
                >
                  <div className="px-1 py-1">
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/mua-ban/can-ho"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Căn hộ chung cư
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/mua-ban/nha-rieng"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Nhà riêng
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/mua-ban/biet-thu"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Biệt thự
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/mua-ban/dat-nen"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Đất nền
                        </Link>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </>
          )}
        </Menu>
      </li>

      {/* Cho thuê with hover */}
      <li
        className="relative"
        onMouseEnter={() => setIsHoveringRent(true)}
        onMouseLeave={() => setIsHoveringRent(false)}
      >
        <Menu as="div" className="relative inline-block text-left">
          {({ open }) => (
            <>
              <MenuButton className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium flex items-center gap-1">
                <Link href="/cho-thue" className="no-underline text-inherit">
                  Cho thuê
                </Link>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    open || isHoveringRent ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </MenuButton>

              <Transition
                show={open || isHoveringRent}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems
                  static
                  className="absolute left-0 mt-2 w-48 origin-top-left divide-y divide-gray-100 rounded-lg bg-white shadow-lg focus:outline-none z-50"
                >
                  <div className="px-1 py-1">
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/cho-thue/can-ho"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Căn hộ chung cư
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/cho-thue/nha-rieng"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Nhà riêng
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/cho-thue/van-phong"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Văn phòng
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/cho-thue/mat-bang"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Mặt bằng
                        </Link>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </>
          )}
        </Menu>
      </li>

      {/* Dự án with hover */}
      <li
        className="relative"
        onMouseEnter={() => setIsHoveringProject(true)}
        onMouseLeave={() => setIsHoveringProject(false)}
      >
        <Menu as="div" className="relative inline-block text-left">
          {({ open }) => (
            <>
              <MenuButton className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium flex items-center gap-1">
                <Link href="/du-an" className="no-underline text-inherit">
                  Dự án
                </Link>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    open || isHoveringProject ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </MenuButton>

              <Transition
                show={open || isHoveringProject}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems
                  static
                  className="absolute left-0 mt-2 w-52 origin-top-left divide-y divide-gray-100 rounded-lg bg-white shadow-lg focus:outline-none z-50"
                >
                  <div className="px-1 py-1">
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/can-ho-chung-cu"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Căn hộ chung cư
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/cao-oc-van-phong"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Cao ốc văn phòng
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/trung-tam-thuong-mai"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Trung tâm thương mại
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/khu-do-thi-moi"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Khu đô thị mới
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/khu-phuc-hop"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Khu phức hợp
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/nha-o-xa-hoi"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Nhà ở xã hội
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/khu-nghi-duong"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Khu nghỉ dưỡng
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/du-an/khu-cong-nghiep"
                          className={`${
                            focus
                              ? "bg-gray-50 text-[#e03c31]"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                        >
                          Khu công nghiệp
                        </Link>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </>
          )}
        </Menu>
      </li>

      {/* Tin tức */}
      <li className="hidden lg:block">
        <Link
          href="/tin-tuc"
          className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium"
        >
          Tin tức
        </Link>
      </li>

      {/* Liên hệ */}
      <li>
        <Link
          href="/lien-he"
          className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium"
        >
          Liên hệ
        </Link>
      </li>
    </ul>
  );
}
