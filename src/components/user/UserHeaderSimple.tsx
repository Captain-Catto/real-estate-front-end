"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

interface UserData {
  name: string;
  avatar: string;
  greeting?: string;
  balance?: string;
  verified?: boolean;
}

interface UserHeaderProps {
  userData: UserData;
  showNotificationButton?: boolean;
  showWalletButton?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  userData,
  showNotificationButton = false,
  showWalletButton = false,
}) => {
  const router = useRouter();

  // Wallet hook with real-time balance updates
  const { formattedBalance, loading: walletLoading } = useWallet();

  // Wallet popup state
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside of wallet popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showWalletPopup &&
        walletRef.current &&
        !walletRef.current.contains(event.target as Node)
      ) {
        setShowWalletPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWalletPopup]);

  const handleWalletClick = () => {
    setShowWalletPopup(!showWalletPopup);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              <img
                src={userData.avatar || "/images/default-avatar.png"}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {userData.greeting || `Chào ${userData.name}`}
              </h2>
              {userData.verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Đã xác thực
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            {/* Wallet Button - Conditional rendering */}
            {showWalletButton && (
              <div className="relative" ref={walletRef}>
                <button
                  onClick={handleWalletClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-blue-600"
                  >
                    <path
                      fill="currentColor"
                      d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">
                    {walletLoading ? (
                      <div className="w-16 h-4 bg-blue-200 rounded animate-pulse"></div>
                    ) : (
                      formattedBalance || "0đ"
                    )}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-blue-600"
                  >
                    <path fill="currentColor" d="M7 10l5 5 5-5z" />
                  </svg>
                </button>

                {/* Wallet Popup */}
                {showWalletPopup && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Số dư hiện tại
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {walletLoading ? (
                            <div className="w-24 h-8 bg-gray-200 rounded mx-auto animate-pulse"></div>
                          ) : (
                            formattedBalance || "0đ"
                          )}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Link
                          href="/nguoi-dung/vi-tien"
                          className="w-full py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-center hover:bg-gray-200 transition-colors block"
                        >
                          Quản lý ví
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Button - Conditional rendering */}
            {showNotificationButton && <NotificationDropdown />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
