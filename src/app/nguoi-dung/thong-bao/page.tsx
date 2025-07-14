"use client";

import React from "react";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-gray-600 mt-1">
              Quản lý và xem tất cả các thông báo của bạn
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4 text-4xl">🔔</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Trang thông báo
              </h3>
              <p>Chức năng thông báo sẽ được phát triển trong tương lai.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
