"use client";

import { Favorites } from "@/components/favorites/Favorites";
import { useAuth, useFavorites } from "@/store/hooks";
import UserSidebar from "@/components/user/UserSidebar";
import UserHeader from "@/components/user/UserHeader";
import Footer from "@/components/footer/Footer";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function FavoritesPage() {
  const searchParams = useSearchParams();
  const initialSort = searchParams.get("sort") || "newest";
  const { isAuthenticated, user } = useAuth();
  const { fetchUserFavorites } = useFavorites();
  const hasLoggedRef = useRef(false);

  // Mock user data for UserHeader component
  const userData = {
    name: user?.username || "Người dùng",
    avatar: (user?.username?.[0] || "U").toUpperCase(),
    balance: "0₫",
    greeting: "Xin chào",
    verified: false,
  };

  useEffect(() => {
    // Log only once
    if (!hasLoggedRef.current) {
      console.log("Component mounted - User Auth Status:", {
        user,
        isAuthenticated,
      });
      hasLoggedRef.current = true;
    }
  }, [user, isAuthenticated]);

  // Only fetch favorites once on page load
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Loading favorites - first time only");
      fetchUserFavorites();
    }
  }, [isAuthenticated, user, fetchUserFavorites]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex flex-col">
        {/* Main Content Area */}
        <div className="flex-grow bg-gray-50">
          {/* User Sidebar */}
          <UserSidebar />

          {/* Content with sidebar spacing */}
          <div className="lg:pl-24">
            {/* UserHeader - Add at the top */}
            <UserHeader
              userData={userData}
              showNotificationButton={true}
              showWalletButton={true}
            />

            {/* Page Header */}
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Danh sách yêu thích
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Xem và quản lý các bất động sản và dự án bạn đã lưu
                </p>
              </div>
            </header>

            {/* Main content with padding for bottom mobile navigation */}
            <main className="pb-20 lg:pb-8">
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Favorites initialSort={initialSort as string} />
              </div>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
