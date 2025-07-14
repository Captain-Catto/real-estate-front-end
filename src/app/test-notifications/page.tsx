"use client";

import React, { useState } from "react";

export default function TestNotificationPage() {
  const [apiResponse, setApiResponse] = useState<string>("");

  const testNotificationAPI = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setApiResponse("❌ Chưa đăng nhập! Vui lòng đăng nhập trước.");
        return;
      }

      setApiResponse("🔄 Đang tạo demo notifications...");

      const response = await fetch(
        "http://localhost:8080/api/notifications/demo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setApiResponse(
          `✅ Thành công! Đã tạo ${data.data.created} notifications`
        );
      } else {
        setApiResponse(`❌ Lỗi: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      setApiResponse(`❌ Lỗi kết nối: ${error}`);
    }
  };

  const testGetNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setApiResponse("❌ Chưa đăng nhập! Vui lòng đăng nhập trước.");
        return;
      }

      setApiResponse("🔄 Đang lấy danh sách notifications...");

      const response = await fetch("http://localhost:8080/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApiResponse(
          `✅ Lấy thành công! Có ${data.data.notifications.length} notifications. Unread: ${data.data.unreadCount}`
        );
      } else {
        setApiResponse(`❌ Lỗi: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      setApiResponse(`❌ Lỗi kết nối: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔔 Test Notification System
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testNotificationAPI}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🎯 Tạo Demo Notifications
            </button>

            <button
              onClick={testGetNotifications}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📋 Lấy Danh Sách Notifications
            </button>
          </div>

          {apiResponse && (
            <div className="p-4 bg-gray-100 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">API Response:</h3>
              <p className="text-sm font-mono">{apiResponse}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              📝 Hướng dẫn test:
            </h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Đảm bảo bạn đã đăng nhập</li>
              <li>
                2. Click &quot;Tạo Demo Notifications&quot; để tạo 6
                notification mẫu
              </li>
              <li>3. Kiểm tra danh sách notification phía dưới</li>
              <li>4. Test các action button trong từng notification</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              🎉 Action Button Examples:
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>
                💰 <strong>Nạp tiền:</strong> &quot;Xem ví&quot; (primary)
              </li>
              <li>
                🎉 <strong>Mua gói:</strong> &quot;Đăng tin ngay&quot; (success)
              </li>
              <li>
                ✅ <strong>Được duyệt:</strong> &quot;Xem tin đăng&quot;
                (primary)
              </li>
              <li>
                ❌ <strong>Bị từ chối:</strong> &quot;Chỉnh sửa tin&quot;
                (warning)
              </li>
              <li>
                💖 <strong>Quan tâm:</strong> &quot;Xem tin đăng&quot; (info)
              </li>
              <li>
                🔔 <strong>Hệ thống:</strong> &quot;Khám phá ngay&quot;
                (primary)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
