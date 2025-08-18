"use client";
import { useState, useEffect, useCallback } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import {
  notificationService,
  type User,
  type ActionButton,
  type SystemNotificationPayload,
} from "@/services/notificationService";

interface NotificationFormData {
  title: string;
  message: string;
  targetType: "all" | "specific" | "role";
  targetUsers: string[];
  userRole: string;
  actionButton?: ActionButton;
}

export default function SystemNotificationManager() {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    message: "",
    targetType: "all",
    targetUsers: [],
    userRole: "user",
    actionButton: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [previewData, setPreviewData] = useState<{
    targetCount: number;
    previewUsers: User[];
    hasMore: boolean;
  } | null>(null);

  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActionButton, setShowActionButton] = useState(false);

  // Preview notification targets
  const previewTargets = useCallback(async () => {
    if (
      formData.targetType === "specific" &&
      formData.targetUsers.length === 0
    ) {
      setPreviewData(null);
      return;
    }

    setPreviewLoading(true);
    try {
      const result = await notificationService.admin.previewNotificationTargets(
        formData.targetType,
        formData.targetUsers,
        formData.userRole
      );

      if (result.success) {
        setPreviewData(result.data);
      } else {
        showErrorToast(result.message || "Lỗi khi xem trước");
      }
    } catch (error) {
      // Silent error - đã có showErrorToast("Lỗi kết nối")
      showErrorToast("Lỗi kết nối");
    } finally {
      setPreviewLoading(false);
    }
  }, [formData.targetType, formData.targetUsers, formData.userRole]);

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const result = await notificationService.admin.searchUsers(query);

      if (result.success) {
        setSearchResults(result.data);
      } else {
        showErrorToast(result.message || "Lỗi tìm kiếm");
      }
    } catch (error) {
      // Silent error - đã có showErrorToast("Lỗi kết nối")
      showErrorToast("Lỗi kết nối");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (formData.targetType === "specific") {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, formData.targetType]);

  // Auto preview when form changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      previewTargets();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [previewTargets]);

  // Send notification
  const sendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showErrorToast("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    if (
      formData.targetType === "specific" &&
      formData.targetUsers.length === 0
    ) {
      showErrorToast("Vui lòng chọn ít nhất một người dùng");
      return;
    }

    setLoading(true);
    try {
      const payload: SystemNotificationPayload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        targetType: formData.targetType,
        targetUsers: formData.targetUsers,
        userRole: formData.userRole,
        actionButton: showActionButton ? formData.actionButton : undefined,
      };

      const result = await notificationService.admin.sendSystemNotification(
        payload
      );

      if (result.success) {
        showSuccessToast(result.message || "Gửi thông báo thành công");
        // Reset form
        setFormData({
          title: "",
          message: "",
          targetType: "all",
          targetUsers: [],
          userRole: "user",
          actionButton: undefined,
        });
        setShowActionButton(false);
        setPreviewData(null);
      } else {
        showErrorToast(result.message || "Lỗi khi gửi thông báo");
      }
    } catch (error) {
      showErrorToast(error, "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter((id) => id !== userId)
        : [...prev.targetUsers, userId],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🔔 Gửi Thông Báo Hệ Thống
      </h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề thông báo *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tiêu đề thông báo..."
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 ký tự
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung thông báo *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập nội dung thông báo..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.message.length}/500 ký tự
          </p>
        </div>

        {/* Target Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đối tượng nhận thông báo
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="all"
                checked={formData.targetType === "all"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetType: e.target.value as "all" | "specific" | "role",
                  }))
                }
                className="mr-2"
              />
              <span>Tất cả người dùng</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="role"
                checked={formData.targetType === "role"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetType: e.target.value as "all" | "specific" | "role",
                  }))
                }
                className="mr-2"
              />
              <span>Theo vai trò</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="specific"
                checked={formData.targetType === "specific"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetType: e.target.value as "all" | "specific" | "role",
                  }))
                }
                className="mr-2"
              />
              <span>Chọn người dùng cụ thể</span>
            </label>
          </div>
        </div>

        {/* Role Selection */}
        {formData.targetType === "role" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn vai trò
            </label>
            <select
              value={formData.userRole}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, userRole: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">Người dùng thường</option>
              <option value="vip">Người dùng VIP</option>
            </select>
          </div>
        )}

        {/* User Search and Selection */}
        {formData.targetType === "specific" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm và chọn người dùng
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              placeholder="Tìm theo tên, email..."
            />

            {searchLoading && (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto mb-3">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      formData.targetUsers.includes(user._id)
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => toggleUserSelection(user._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.targetUsers.includes(user._id)}
                        readOnly
                        className="mr-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.targetUsers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Đã chọn {formData.targetUsers.length} người dùng
                </p>
                <div className="flex flex-wrap gap-1">
                  {formData.targetUsers.map((userId) => {
                    const user = searchResults.find((u) => u._id === userId);
                    return user ? (
                      <span
                        key={userId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {user.username}
                        <button
                          onClick={() => toggleUserSelection(userId)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={showActionButton}
              onChange={(e) => setShowActionButton(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Thêm nút hành động
            </span>
          </label>

          {showActionButton && (
            <div className="border border-gray-300 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nút
                </label>
                <input
                  type="text"
                  value={formData.actionButton?.text || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      actionButton: {
                        ...prev.actionButton,
                        text: e.target.value,
                        link: prev.actionButton?.link || "",
                        style: prev.actionButton?.style || "primary",
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ví dụ: Khám phá ngay"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn
                </label>
                <input
                  type="text"
                  value={formData.actionButton?.link || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      actionButton: {
                        ...prev.actionButton,
                        text: prev.actionButton?.text || "",
                        link: e.target.value,
                        style: prev.actionButton?.style || "primary",
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ví dụ: /nguoi-dung/dashboard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu nút
                </label>
                <select
                  value={formData.actionButton?.style || "primary"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      actionButton: {
                        ...prev.actionButton,
                        text: prev.actionButton?.text || "",
                        link: prev.actionButton?.link || "",
                        style: e.target.value as
                          | "primary"
                          | "secondary"
                          | "success"
                          | "warning"
                          | "info"
                          | "danger",
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="primary">Xanh dương</option>
                  <option value="success">Xanh lá</option>
                  <option value="warning">Vàng</option>
                  <option value="info">Xanh cyan</option>
                  <option value="danger">Đỏ</option>
                  <option value="secondary">Xám</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">
              📊 Xem trước đối tượng nhận
            </h3>

            {previewLoading ? (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-green-700 mb-3">
                  Sẽ gửi tới <strong>{previewData.targetCount}</strong> người
                  dùng
                  {previewData.hasMore && " (hiển thị 10 người đầu tiên)"}
                </p>

                {previewData.previewUsers.length > 0 && (
                  <div className="space-y-1">
                    {previewData.previewUsers.map((user) => (
                      <div key={user._id} className="text-xs text-green-600">
                        • {user.username} ({user.email}) - {user.role}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={sendNotification}
            disabled={
              loading || !formData.title.trim() || !formData.message.trim()
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </div>
            ) : (
              "📤 Gửi Thông Báo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
