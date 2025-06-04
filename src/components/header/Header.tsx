"use client";
import React, { useState } from "react";
import { Logo } from "./Logo";
import { Navbar } from "./Navbar";
import { MobileSidebar } from "./MobileSideBar";
import ActionButton from "./ActionButton";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop Navigation - hiển thị từ xl (1280px) trở lên */}
            <div className="hidden xl:block">
              <Navbar />
            </div>

            {/* Mobile Menu Button - ẩn từ xl trở lên */}
            <div className="xl:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop User Actions - hiển thị từ xl trở lên */}
            <div className="hidden xl:flex items-center">
              <ActionButton />
            </div>
          </div>
        </div>
      </header>

      {/* Spacer để tránh content bị che bởi fixed header */}
      <div className="h-16"></div>

      {/* Mobile Sidebar - ẩn từ xl trở lên */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
