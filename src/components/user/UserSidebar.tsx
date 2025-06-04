"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserSidebar() {
  const pathname = usePathname();
  const [showAccountSubmenu, setShowAccountSubmenu] = useState(false);

  // Define menu items for desktop (including tablets)
  const desktopMenuItems = [
    {
      id: "overview",
      href: "/nguoi-ban/trang-chu",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M11.25 3.533a8.5 8.5 0 1 0 8.485 11.996l-7.985-2.822a.75.75 0 0 1-.5-.707zm1.5 0v7.937l7.485 2.645A8.5 8.5 0 0 0 12.75 3.533M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10a10 10 0 0 1-10 10C6.477 22 2 17.523 2 12"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      label: "Tổng quan",
      labelShort: "Tổng quan",
    },
    {
      id: "posts",
      href: "/nguoi-ban/quan-ly-tin-rao-ban-cho-thue",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      label: "Tin đăng",
      labelShort: "Tin đăng",
    },
    {
      id: "create-post",
      href: "/nguoi-ban/dang-tin",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 3a.75.75 0 0 1 .75.75v7.5h7.5a.75.75 0 0 1 0 1.5h-7.5v7.5a.75.75 0 0 1-1.5 0v-7.5h-7.5a.75.75 0 0 1 0-1.5h7.5v-7.5A.75.75 0 0 1 12 3"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      label: "Đăng tin",
      labelShort: "Đăng tin",
      isPlusIcon: true,
    },
    {
      id: "customers",
      href: "/sellernet/quan-ly-khach-hang",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.25006 2C7.73128 2 6.50006 3.23122 6.50006 4.75C6.50006 6.26878 7.73128 7.5 9.25006 7.5C10.7688 7.5 12.0001 6.26878 12.0001 4.75C12.0001 3.23122 10.7688 2 9.25006 2ZM5.00006 4.75C5.00006 2.40279 6.90285 0.5 9.25006 0.5C11.5973 0.5 13.5001 2.40279 13.5001 4.75C13.5001 7.09721 11.5973 9 9.25006 9C6.90285 9 5.00006 7.09721 5.00006 4.75ZM14.2501 1.25C14.2501 0.835787 14.5858 0.5 15.0001 0.5C17.3473 0.5 19.2501 2.40279 19.2501 4.75C19.2501 7.09721 17.3473 9 15.0001 9C14.5858 9 14.2501 8.66421 14.2501 8.25C14.2501 7.83579 14.5858 7.5 15.0001 7.5C16.5188 7.5 17.7501 6.26878 17.7501 4.75C17.7501 3.23122 16.5188 2 15.0001 2C14.5858 2 14.2501 1.66421 14.2501 1.25ZM9.25006 12C5.77335 12 2.8884 14.2079 2.02017 16.9742C1.94236 17.2221 2.00299 17.4419 2.16951 17.6254C2.348 17.8221 2.64948 17.9688 3.00006 17.9688H15.5001C15.8506 17.9688 16.1521 17.8221 16.3306 17.6254C16.4971 17.4419 16.5578 17.2221 16.48 16.9742C15.6117 14.2079 12.7268 12 9.25006 12ZM0.589004 16.525C1.66539 13.0955 5.15855 10.5 9.25006 10.5C13.3416 10.5 16.8347 13.0955 17.9111 16.525C18.1641 17.331 17.9293 18.0958 17.4415 18.6334C16.9657 19.1577 16.2541 19.4688 15.5001 19.4688H3.00006C2.24607 19.4688 1.53443 19.1577 1.05864 18.6334C0.570867 18.0958 0.336046 17.331 0.589004 16.525ZM17.5431 11.7584C17.6814 11.3679 18.11 11.1635 18.5005 11.3018C20.9797 12.18 22.9023 14.1839 23.6553 16.5549C23.9112 17.3604 23.6782 18.1259 23.1909 18.6641C22.7156 19.1889 22.004 19.5 21.2501 19.5H20.7501C20.3358 19.5 20.0001 19.1642 20.0001 18.75C20.0001 18.3357 20.3358 18 20.7501 18H21.2501C21.6007 18 21.9015 17.8533 22.0789 17.6573C22.2443 17.4747 22.3042 17.2562 22.2257 17.0089C21.6175 15.0939 20.0443 13.44 17.9997 12.7158C17.6092 12.5775 17.4048 12.1488 17.5431 11.7584Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
      label: "Khách hàng",
      labelShort: "Khách hàng",
    },
    {
      id: "membership",
      href: "/goi-hoi-vien",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C13.1046 2 14 2.89543 14 4V6H16C17.1046 6 18 6.89543 18 8V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V8C6 6.89543 6.89543 6 8 6H10V4C10 2.89543 10.8954 2 12 2ZM12 4V6H12V4ZM8 8V18H16V8H8ZM9 10H15V12H9V10ZM9 14H13V16H9V14Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Gói Hội viên",
      labelShort: "Gói HV",
      badge: "-39%",
      badgeColor: "#dc3545",
      desktopOnly: true, // Only for desktop, not tablets
    },
  ];

  // Filter menu items for tablets and mobile (exclude "Gói Hội viên")
  const tabletAndMobileMenuItems = desktopMenuItems.filter(
    (item) => !item.desktopOnly
  );

  const accountSubmenuItems = [
    { href: "/tai-khoan/thong-tin-ca-nhan", label: "Thông tin cá nhân" },
    { href: "/tai-khoan/doi-mat-khau", label: "Đổi mật khẩu" },
    { href: "/tai-khoan/cai-dat", label: "Cài đặt" },
    { href: "/yeu-thich", label: "Danh sách yêu thích" },
    { href: "/dang-xuat", label: "Đăng xuất" },
  ];

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <>
      <style jsx global>{`
        .sidebar-hover:hover {
          background-color: #f8f9fa !important;
        }

        .sidebar-transition {
          transition: all 0.2s ease-in-out;
        }

        .plus-icon-bg {
          background-color: #f8f9fa;
          border-radius: 50%;
          padding: 8px;
        }

        .membership-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #dc3545;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 8px;
          min-width: 20px;
          text-align: center;
        }

        @media (max-width: 767.98px) {
          body {
            padding-bottom: 80px;
          }
        }
      `}</style>

      {/* Desktop Sidebar (Visible on Tablet and Above) */}
      <nav
        className="d-none d-md-flex flex-column bg-white border-end position-fixed h-100"
        style={{ width: "240px", top: 0, left: 0, zIndex: 1020 }}
      >
        {/* Logo */}
        <Link href="/" className="p-4 text-decoration-none">
          <div className="d-flex" style={{ width: "40px", height: "40px" }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 41 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33.9729 19.8484L32.4857 18.3445L33.9729 16.8421C35.1503 15.6527 35.1503 13.7193 33.9729 12.5299L28.7465 7.2517V4.76109C28.7465 3.90534 28.127 3.17732 27.3052 3.06875C26.8295 3.00489 26.3506 3.15177 25.9903 3.47108C25.8085 3.63233 25.6663 3.82871 25.5699 4.04424L22.4059 0.862333C21.2617 -0.288774 19.4111 -0.287177 18.2669 0.865526L6.69674 12.5331C5.51934 13.7225 5.51934 15.6559 6.69674 16.8453L8.18547 18.3493L7.70345 18.8362L7.26884 19.2753L7.26094 19.2832L6.69674 19.8532C5.51775 21.0442 5.51775 22.9744 6.69674 24.1655L10.9069 28.4155C11.4427 28.9567 12.1475 29.3063 12.903 29.3526C13.7785 29.4053 14.6098 29.086 15.2246 28.465L19.4111 24.2469C19.9263 23.728 20.7607 23.728 21.276 24.2485L25.4419 28.4634C26.0567 29.0828 26.888 29.4037 27.7635 29.351C28.5189 29.3047 29.2254 28.9551 29.7596 28.4139L33.9713 24.1607C35.1503 22.9728 35.1503 21.0378 33.9729 19.8484ZM7.9816 15.5425C7.5138 15.07 7.5138 14.3036 7.9816 13.8294L19.4016 2.29603C19.9168 1.77556 20.7513 1.77556 21.2665 2.29603L32.6865 13.8294C33.1543 14.302 33.1543 15.0684 32.6865 15.5425L31.1993 17.0449L22.4249 8.1745C21.2823 7.0186 19.4285 7.017 18.2827 8.16971L9.4735 17.0481L7.9816 15.5425ZM29.4308 18.8314L28.4557 19.8165C28.2408 20.0336 27.9595 20.1805 27.656 20.1996C27.3068 20.222 26.9749 20.0943 26.7299 19.8468L22.4044 15.4851C21.2601 14.3308 19.4063 14.3308 18.2637 15.4851L13.9381 19.8468C13.7121 20.0751 13.4103 20.2012 13.091 20.2012C12.7702 20.2012 12.4699 20.0751 12.2424 19.8468L10.7584 18.3477L19.4174 9.60819C19.9326 9.08772 20.7686 9.08932 21.2823 9.60979L29.9129 18.3445L29.4308 18.8314ZM32.6865 22.8611L28.4557 27.1334C28.2408 27.3506 27.9595 27.4974 27.656 27.5166C27.3068 27.539 26.9749 27.4112 26.7299 27.1638L22.4044 22.8036C21.2601 21.6509 19.4079 21.6509 18.2653 22.8036L13.9397 27.1638C13.6948 27.4112 13.3629 27.5374 13.0136 27.5166C12.7102 27.4974 12.4289 27.3506 12.2139 27.1334L7.98318 22.8611C7.51538 22.3885 7.51538 21.6222 7.98318 21.148L8.54739 20.578L9.47192 19.6457L10.9085 21.0969C11.4443 21.6381 12.1491 21.9878 12.9046 22.0341C13.7801 22.0868 14.6114 21.7675 15.2262 21.1464L19.4127 16.9251C19.9279 16.4047 20.7639 16.4063 21.2775 16.9267L25.4435 21.1448C26.0583 21.7643 26.8895 22.0852 27.7651 22.0325C28.5205 21.9862 29.227 21.6365 29.7611 21.0953L30.0219 20.8319L31.2009 19.6425L32.688 21.1464C33.1543 21.6206 33.1543 22.3885 32.6865 22.8611Z"
                fill="#E03C31"
              ></path>
            </svg>
          </div>
        </Link>

        {/* Menu Items */}
        <div className="flex-fill px-3">
          {(window.innerWidth >= 768
            ? desktopMenuItems
            : tabletAndMobileMenuItems
          ).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`d-flex flex-column align-items-center text-decoration-none p-3 mb-2 rounded sidebar-transition ${
                isActiveRoute(item.href)
                  ? "text-primary"
                  : "text-dark sidebar-hover"
              }`}
              style={{
                backgroundColor: isActiveRoute(item.href)
                  ? "#e7f3ff"
                  : "transparent",
              }}
            >
              <div
                className={`position-relative mb-2 ${
                  item.isPlusIcon ? "plus-icon-bg" : ""
                }`}
              >
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ width: "24px", height: "24px" }}
                >
                  {item.icon}
                </div>
                {item.badge && (
                  <span className="membership-badge">{item.badge}</span>
                )}
              </div>
              <p className="small text-nowrap mb-0 text-center">{item.label}</p>
            </Link>
          ))}

          {/* Account Menu */}
          <div className="position-relative">
            <button
              onClick={() => setShowAccountSubmenu(!showAccountSubmenu)}
              className={`d-flex flex-column align-items-center p-3 mb-2 rounded border-0 w-100 sidebar-transition ${
                showAccountSubmenu || pathname.startsWith("/tai-khoan")
                  ? "text-primary"
                  : "text-dark sidebar-hover"
              }`}
              style={{
                backgroundColor:
                  showAccountSubmenu || pathname.startsWith("/tai-khoan")
                    ? "#e7f3ff"
                    : "transparent",
              }}
            >
              <div className="mb-2">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ width: "24px", height: "24px" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.9987 2.33337C4.86908 2.33337 2.33203 4.87043 2.33203 8.00004C2.33203 9.49133 2.9076 10.8477 3.84985 11.8599C4.8305 10.716 6.27696 10 7.9987 10C9.72044 10 11.1669 10.716 12.1475 11.8599C13.0898 10.8477 13.6654 9.49133 13.6654 8.00004C13.6654 4.87043 11.1283 2.33337 7.9987 2.33337ZM11.4044 12.5296C10.6101 11.5922 9.43252 11 7.9987 11C6.56488 11 5.38734 11.5922 4.59301 12.5296C5.54118 13.2437 6.72007 13.6667 7.9987 13.6667C9.27732 13.6667 10.4562 13.2437 11.4044 12.5296ZM1.33203 8.00004C1.33203 4.31814 4.3168 1.33337 7.9987 1.33337C11.6806 1.33337 14.6654 4.31814 14.6654 8.00004C14.6654 9.98275 13.7992 11.7638 12.4262 12.9842C11.2492 14.0306 9.69761 14.6667 7.9987 14.6667C6.29978 14.6667 4.74824 14.0306 3.57116 12.9842C2.1982 11.7638 1.33203 9.98275 1.33203 8.00004ZM7.9987 5.00004C7.07822 5.00004 6.33203 5.74623 6.33203 6.66671C6.33203 7.58718 7.07822 8.33337 7.9987 8.33337C8.91917 8.33337 9.66536 7.58718 9.66536 6.66671C9.66536 5.74623 8.91917 5.00004 7.9987 5.00004ZM5.33203 6.66671C5.33203 5.19395 6.52594 4.00004 7.9987 4.00004C9.47146 4.00004 10.6654 5.19395 10.6654 6.66671C10.6654 8.13947 9.47146 9.33337 7.9987 9.33337C6.52594 9.33337 5.33203 8.13947 5.33203 6.66671Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </div>
              <p className="small text-nowrap mb-0 text-center">Tài khoản</p>
            </button>

            {/* Desktop Submenu */}
            {showAccountSubmenu && (
              <div
                className="position-absolute top-0 start-100 ms-2 bg-white border rounded shadow-lg py-2"
                style={{ minWidth: "200px", zIndex: 1030 }}
              >
                {accountSubmenuItems.map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className={`d-block px-4 py-2 text-decoration-none sidebar-transition ${
                      isActiveRoute(subItem.href)
                        ? "text-primary"
                        : "text-dark sidebar-hover"
                    }`}
                    style={{
                      backgroundColor: isActiveRoute(subItem.href)
                        ? "#e7f3ff"
                        : "transparent",
                    }}
                    onClick={() => setShowAccountSubmenu(false)}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav
        className="d-md-none fixed-bottom bg-white border-top"
        style={{ zIndex: 1020 }}
      >
        <div className="d-flex align-items-center justify-content-between px-2 py-2">
          {tabletAndMobileMenuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`d-flex flex-column align-items-center text-decoration-none便捷 p-2 rounded sidebar-transition ${
                isActiveRoute(item.href) ? "text-primary" : "text-muted"
              }`}
              style={{ minWidth: "60px" }}
            >
              <div
                className={`position-relative mb-1 ${
                  item.isPlusIcon ? "bg-light rounded-circle p-1" : ""
                }`}
              >
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ width: "20px", height: "20px" }}
                >
                  {item.icon}
                </div>
              </div>
              <span className="text-nowrap" style={{ fontSize: "10px" }}>
                {item.labelShort}
              </span>
            </Link>
          ))}

          {/* Mobile Account Menu */}
          <div className="position-relative">
            <button
              onClick={() => setShowAccountSubmenu(!showAccountSubmenu)}
              className={`d-flex flex-column align-items-center p-2 rounded border-0 bg-transparent sidebar-transition ${
                showAccountSubmenu || pathname.startsWith("/tai-khoan")
                  ? "text-primary"
                  : "text-muted"
              }`}
              style={{ minWidth: "60px" }}
            >
              <div className="mb-1">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ width: "20px", height: "20px" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.9987 2.33337C4.86908 2.33337 2.33203 4.87043 2.33203 8.00004C2.33203 9.49133 2.9076 10.8477 3.84985 11.8599C4.8305 10.716 6.27696 10 7.9987 10C9.72044 10 11.1669 10.716 12.1475 11.8599C13.0898 10.8477 13.6654 9.49133 13.6654 8.00004C13.6654 4.87043 11.1283 2.33337 7.9987 2.33337ZM11.4044 12.5296C10.6101 11.5922 9.43252 11 7.9987 11C6.56488 11 5.38734 11.5922 4.59301 12.5296C5.54118 13.2437 6.72007 13.6667 7.9987 13.6667C9.27732 13.6667 10.4562 13.2437 11.4044 12.5296ZM1.33203 8.00004C1.33203 4.31814 4.3168 1.33337 7.9987 1.33337C11.6806 1.33337 14.6654 4.31814 14.6654 8.00004C14.6654 9.98275 13.7992 11.7638 12.4262 12.9842C11.2492 14.0306 9.69761 14.6667 7.9987 14.6667C6.29978 14.6667 4.74824 14.0306 3.57116 12.9842C2.1982 11.7638 1.33203 9.98275 1.33203 8.00004ZM7.9987 5.00004C7.07822 5.00004 6.33203 5.74623 6.33203 6.66671C6.33203 7.58718 7.07822 8.33337 7.9987 8.33337C8.91917 8.33337 9.66536 7.58718 9.66536 6.66671C9.66536 5.74623 8.91917 5.00004 7.9987 5.00004ZM5.33203 6.66671C5.33203 5.19395 6.52594 4.00004 7.9987 4.00004C9.47146 4.00004 10.6654 5.19395 10.6654 6.66671C10.6654 8.13947 9.47146 9.33337 7.9987 9.33337C6.52594 9.33337 5.33203 8.13947 5.33203 6.66671Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </div>
              <span className="text-nowrap" style={{ fontSize: "10px" }}>
                Tài khoản
              </span>
            </button>

            {/* Mobile Submenu */}
            {showAccountSubmenu && (
              <div
                className="position-absolute bottom-100 start-50 translate-middle-x mb-2 bg-white border rounded shadow-lg py-2"
                style={{ minWidth: "180px", zIndex: 1030 }}
              >
                {accountSubmenuItems.map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className={`d-block px-3 py-2 text-decoration-none sidebar-transition ${
                      isActiveRoute(subItem.href)
                        ? "text-primary"
                        : "text-dark sidebar-hover"
                    }`}
                    style={{
                      backgroundColor: isActiveRoute(subItem.href)
                        ? "#e7f3ff"
                        : "transparent",
                    }}
                    onClick={() => setShowAccountSubmenu(false)}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {showAccountSubmenu && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1025, backgroundColor: "rgba(0,0,0,0.1)" }}
          onClick={() => setShowAccountSubmenu(false)}
        />
      )}
    </>
  );
}
