"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserSidebar() {
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Desktop menu (6 items)
  const desktopMenu = [
    {
      id: "overview",
      href: "/nguoi-dung/tong-quan",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "Tổng quan",
    },
    {
      id: "posts",
      href: "/nguoi-dung/quan-ly-tin-rao-ban-cho-thue",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
            fill="currentColor"
          />
          <polyline
            points="14,2 14,8 20,8"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      ),
      title: "Tin đăng",
    },
    {
      id: "create-post",
      href: "/nguoi-dung/dang-tin",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 3a.75.75 0 0 1 .75.75v7.5h7.5a.75.75 0 0 1 0 1.5h-7.5v7.5a.75.75 0 0 1-1.5 0v-7.5h-7.5a.75.75 0 0 1 0-1.5h7.5v-7.5A.75.75 0 0 1 12 3"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Đăng tin",
      special: true,
    },
    {
      id: "customers",
      href: "/sellernet/quan-ly-khach-hang",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="9"
            cy="7"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M23 21v-2a4 4 0 0 0-3-3.87"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      title: "Khách hàng",
    },
    {
      id: "wallet",
      href: "/nguoi-dung/vi-tien",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill="currentColor"
          />
        </svg>
      ),
      title: "Ví tiền",
      badge: "-39%",
      desktopOnly: true,
    },
    {
      id: "account",
      href: "/tai-khoan",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      title: "Tài khoản",
      hasSubmenu: true,
    },
  ];

  // Tablet/Mobile menu (5 items - exclude wallet)
  const tabletMenu = desktopMenu.filter((item) => !item.desktopOnly);

  const accountMenuItems = [
    { href: "/nguoi-dung/tai-khoan", title: "Thông tin cá nhân" },
    { href: "/nguoi-dung/yeu-thich", title: "Danh sách yêu thích" },
    { href: "/dang-xuat", title: "Đăng xuất" },
  ];

  const checkActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  return (
    <>
      {/* Add global styles for body padding */}
      <div className="hidden lg:block fixed top-0 left-0 w-24 h-full pointer-events-none z-0"></div>

      {/* Desktop Sidebar - Large screens only */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-24 lg:bg-white lg:border-r lg:border-gray-200 lg:z-50">
        {/* Logo Section */}
        <div className="p-3 border-b border-gray-100">
          <Link href="/" className="flex items-center justify-center">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 py-2 px-2 flex flex-col">
          {desktopMenu.map((item) => {
            const isActive = checkActiveRoute(item.href);

            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="relative mb-1">
                  <button
                    onClick={toggleAccountMenu}
                    className={`w-full flex flex-col items-center p-2 rounded-lg text-xs font-medium transition-all duration-300 hover:bg-gray-50 hover:-translate-y-0.5 ${
                      isActive || isAccountMenuOpen
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-center w-6 h-6">
                      {item.icon}
                    </div>
                    <span className="text-center leading-tight">
                      {item.title}
                    </span>
                  </button>

                  {/* Desktop Account Submenu */}
                  {isAccountMenuOpen && (
                    <div className="absolute left-full top-0 ml-2 w-56 bg-white rounded-lg shadow-xl border py-2 z-[70]">
                      {accountMenuItems.map((subItem, idx) => (
                        <Link
                          key={idx}
                          href={subItem.href}
                          className={`block px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                            checkActiveRoute(subItem.href)
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center p-2 mb-1 rounded-lg text-xs font-medium transition-all duration-300 hover:bg-gray-50 hover:-translate-y-0.5 ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="relative mb-1 flex items-center justify-center w-6 h-6">
                  {item.special ? (
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full p-1 shadow-lg shadow-red-500/30 w-6 h-6 flex items-center justify-center text-white">
                      {item.icon}
                    </div>
                  ) : (
                    item.icon
                  )}
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded text-[8px] leading-none shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-center leading-tight">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Tablet/Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {tabletMenu.map((item) => {
            const isActive = checkActiveRoute(item.href);

            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="relative flex-1">
                  <button
                    onClick={toggleAccountMenu}
                    className={`w-full flex flex-col items-center py-2 px-1 transition-colors ${
                      isActive || isAccountMenuOpen
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-center w-6 h-6">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {item.title}
                    </span>
                  </button>

                  {/* Mobile Account Submenu */}
                  {isAccountMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border py-2 z-[70]">
                      {accountMenuItems.map((subItem, idx) => (
                        <Link
                          key={idx}
                          href={subItem.href}
                          className={`block px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                            checkActiveRoute(subItem.href)
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
                data-tour={item.special ? "sidebar-create-post" : undefined}
              >
                <div className="flex flex-col items-center">
                  {item.special ? (
                    <div className="bg-red-600 rounded-full w-11 h-11 flex items-center justify-center mb-1 shadow-lg shadow-red-600/30">
                      <div className="flex items-center justify-center w-6 h-6 text-white">
                        {item.icon}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-1 flex items-center justify-center w-6 h-6">
                      {item.icon}
                    </div>
                  )}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {item.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Overlay for Account Menu */}
      {isAccountMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm"
          onClick={() => setIsAccountMenuOpen(false)}
        />
      )}
    </>
  );
}
