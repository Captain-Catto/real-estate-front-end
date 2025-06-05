"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserSidebar() {
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Desktop menu (6 items)
  const desktopMenu = [
    {
      id: "overview",
      href: "/nguoi-ban/trang-chu",
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
      href: "/nguoi-ban/quan-ly-tin-rao-ban-cho-thue",
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
      href: "/nguoi-ban/dang-tin",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      id: "membership",
      href: "/goi-hoi-vien",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill="currentColor"
          />
        </svg>
      ),
      title: "Gói Hội viên",
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

  // Tablet/Mobile menu (5 items - exclude membership)
  const tabletMenu = desktopMenu.filter((item) => !item.desktopOnly);

  const accountMenuItems = [
    { href: "/tai-khoan/thong-tin-ca-nhan", title: "Thông tin cá nhân" },
    { href: "/tai-khoan/doi-mat-khau", title: "Đổi mật khẩu" },
    { href: "/tai-khoan/cai-dat", title: "Cài đặt" },
    { href: "/yeu-thich", title: "Danh sách yêu thích" },
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
      <style jsx>{`
        .sidebar-item-hover:hover {
          background: #f3f4f6 !important;
          transform: translateY(-1px);
        }

        .sidebar-transition {
          transition: all 0.3s ease;
        }

        .create-post-special {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          color: white;
          padding: 6px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .discount-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .mobile-nav-bottom {
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }

        .mobile-icon-plus {
          background: #dc3545;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
        }

        .mobile-icon-plus svg {
          color: white;
        }

        @media (max-width: 1279px) {
          body {
            padding-bottom: 70px;
          }
        }
      `}</style>

      {/* Desktop Sidebar - Large screens only */}
      <aside className="hidden xl:flex xl:flex-col xl:fixed xl:left-0 xl:top-0 xl:h-screen xl:w-64 xl:bg-white xl:border-r xl:border-gray-200 xl:z-50">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <Link
            href="/"
            className="flex items-center space-x-3 text-decoration-none"
          >
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">BDS Portal</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {desktopMenu.map((item) => {
            const isActive = checkActiveRoute(item.href);

            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={toggleAccountMenu}
                    className={`w-full flex flex-col items-center p-4 rounded-xl text-sm font-medium sidebar-transition sidebar-item-hover ${
                      isActive || isAccountMenuOpen
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    <div className="mb-2">{item.icon}</div>
                    <span>{item.title}</span>
                  </button>

                  {/* Desktop Account Submenu */}
                  {isAccountMenuOpen && (
                    <div className="absolute left-full top-0 ml-2 w-56 bg-white rounded-lg shadow-xl border py-2 z-60">
                      {accountMenuItems.map((subItem, idx) => (
                        <Link
                          key={idx}
                          href={subItem.href}
                          className={`block px-4 py-3 text-sm hover:bg-gray-50 sidebar-transition ${
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
                className={`flex flex-col items-center p-4 rounded-xl text-sm font-medium sidebar-transition sidebar-item-hover ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-gray-600"
                }`}
              >
                <div className="relative mb-2">
                  <div className={item.special ? "create-post-special" : ""}>
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="discount-badge">{item.badge}</span>
                  )}
                </div>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Tablet/Mobile Bottom Navigation */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 mobile-nav-bottom z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {tabletMenu.map((item) => {
            const isActive = checkActiveRoute(item.href);

            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="relative flex-1">
                  <button
                    onClick={toggleAccountMenu}
                    className={`w-full flex flex-col items-center py-2 px-1 sidebar-transition ${
                      isActive || isAccountMenuOpen
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className="mb-1 flex justify-content-center align-items-center"
                      style={{ width: "24px", height: "24px" }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-nowrap">
                      {item.title}
                    </span>
                  </button>

                  {/* Mobile Account Submenu */}
                  {isAccountMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border py-2 z-60">
                      {accountMenuItems.map((subItem, idx) => (
                        <Link
                          key={idx}
                          href={subItem.href}
                          className={`block px-4 py-3 text-sm hover:bg-gray-50 sidebar-transition ${
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
                className={`flex-1 flex flex-col items-center py-2 px-1 sidebar-transition ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
                data-tour={item.special ? "sidebar-create-post" : undefined}
              >
                <div className="flex flex-col items-center">
                  {item.special ? (
                    <div className="mobile-icon-plus">
                      <div
                        className="flex justify-content-center align-items-center"
                        style={{ width: "24px", height: "24px" }}
                      >
                        {item.icon}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="mb-1 flex justify-content-center align-items-center"
                      style={{ width: "24px", height: "24px" }}
                    >
                      {item.icon}
                    </div>
                  )}
                  <p className="text-xs font-medium text-nowrap mb-0">
                    {item.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Overlay for Account Menu */}
      {isAccountMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsAccountMenuOpen(false)}
        />
      )}
    </>
  );
}
