"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import UserSidebar from "@/components/user/UserSidebar";
import UserHeader from "@/components/user/UserHeader";
import { useAuth } from "@/store/hooks";
import { Suspense } from "react";

// Loading component
function UserLayoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main user layout component
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect the route - redirect if not authenticated
  const { isLoading } = useProtectedRoute();
  const { user, isAuthenticated } = useAuth();

  // Show loading while checking authentication
  if (isLoading || !isAuthenticated) {
    return <UserLayoutLoading />;
  }

  // Default avatar URL
  const DEFAULT_AVATAR_URL = "https://datlqt-real-estate.s3.ap-southeast-2.amazonaws.com/uploads/4b3fd577-logo_placeholder.jpg";

  // User data for UserHeader component
  const userData = {
    name: user?.username || user?.email?.split("@")[0] || "Người dùng",
    avatar: user?.avatar || DEFAULT_AVATAR_URL,
    greeting: getGreeting(),
    verified: false, // You can add email verification status
  };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng 🌅";
    if (hour < 18) return "Chào buổi chiều ☀️";
    return "Chào buổi tối 🌙";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <UserHeader 
        userData={userData}
        showNotificationButton={true}
        showWalletButton={true}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="md:w-24 bg-white border-b border-gray-2004 bg-white shadow-sm">
          <UserSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <Suspense fallback={<UserLayoutLoading />}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}