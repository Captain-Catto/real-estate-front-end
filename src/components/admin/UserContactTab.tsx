"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  customerContactService,
  CustomerContact,
} from "@/services/customerContactService";
import LocationDisplay from "@/components/LocationDisplay";
import { createPostSlug } from "@/utils/postSlug";

interface UserContactTabProps {
  userId: string;
  username?: string;
}

const UserContactTab: React.FC<UserContactTabProps> = ({
  userId,
  username,
}) => {
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Load user's contact requests (both sent and received)
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);

      // Sử dụng API mới để lấy tất cả contact của user này
      const response = await customerContactService.getContactsByUserId(
        userId,
        {
          limit: 50,
        }
      );

      if (response.success) {
        setContacts(response.data.contacts);
      } else {
        showMessage("error", response.message || "Không thể tải dữ liệu");
      }
    } catch (error: unknown) {
      console.error("Error loading contacts:", error);
      showMessage("error", "Không thể tải dữ liệu liên hệ");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadContacts();
  }, [userId, loadContacts]);

  // Update contact status
  const updateContactStatus = async (contactId: string, status: string) => {
    try {
      setUpdating(contactId);
      const response = await customerContactService.updateContactStatus(
        contactId,
        status
      );

      if (response.success) {
        showMessage("success", "Cập nhật trạng thái thành công");
        loadContacts(); // Reload data
      } else {
        showMessage("error", response.message || "Có lỗi xảy ra");
      }
    } catch (error: unknown) {
      console.error("Error updating status:", error);
      showMessage("error", "Không thể cập nhật trạng thái");
    } finally {
      setUpdating(null);
    }
  };

  // Hard delete contact (Admin only)
  const hardDeleteContact = async (contactId: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn XÓA VĨNH VIỄN yêu cầu liên hệ này? Hành động này không thể hoàn tác!"
      )
    ) {
      return;
    }

    try {
      const response = await customerContactService.hardDeleteContact(
        contactId
      );

      if (response.success) {
        showMessage("success", "Đã xóa vĩnh viễn yêu cầu liên hệ");
        loadContacts(); // Reload data
      } else {
        showMessage("error", "Có lỗi xảy ra khi xóa");
      }
    } catch (error: unknown) {
      console.error("Error hard deleting contact:", error);
      showMessage("error", "Không thể xóa yêu cầu liên hệ");
    }
  };

  // Restore soft deleted contact (Admin only)
  const restoreContact = async (contactId: string) => {
    if (!confirm("Bạn có chắc chắn muốn khôi phục yêu cầu liên hệ này?")) {
      return;
    }

    try {
      const response = await customerContactService.restoreContact(contactId);

      if (response.success) {
        showMessage("success", "Đã khôi phục yêu cầu liên hệ");
        loadContacts(); // Reload data
      } else {
        showMessage("error", response.message || "Có lỗi xảy ra khi khôi phục");
      }
    } catch (error: unknown) {
      console.error("Error restoring contact:", error);
      showMessage("error", "Không thể khôi phục yêu cầu liên hệ");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get contact type label
  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case "call_back":
        return "Yêu cầu gọi lại";
      case "message":
        return "Nhắn tin";
      case "view_contact":
        return "Xem liên hệ";
      default:
        return type;
    }
  };

  // Get contact direction
  const getContactDirection = (contact: CustomerContact) => {
    if (contact.user._id === userId) {
      return { direction: "sent", label: "Đã gửi", color: "text-blue-600" };
    } else {
      return {
        direction: "received",
        label: "Nhận được",
        color: "text-green-600",
      };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Message Display */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 border border-green-400 text-green-800"
              : message.type === "error"
              ? "bg-red-100 border border-red-400 text-red-800"
              : "bg-blue-100 border border-blue-400 text-blue-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Lịch sử liên hệ - {username || "User"}
        </h3>
        <p className="text-gray-600 text-sm">
          Tổng cộng: {contacts.length} yêu cầu liên hệ
        </p>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có yêu cầu liên hệ nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => {
            const direction = getContactDirection(contact);

            return (
              <div
                key={contact._id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Contact Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-xs font-medium ${direction.color}`}
                      >
                        {direction.label}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          contact.status
                        )}`}
                      >
                        {contact.status === "pending" && "Chờ xử lý"}
                        {contact.status === "contacted" && "Đã liên hệ"}
                        {contact.status === "deleted" && "Đã ẩn"}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {getContactTypeLabel(contact.contactType)}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {direction.direction === "sent" ? "Gửi đến" : "Từ"}:{" "}
                        {contact.user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.user.email}
                      </div>
                      {contact.user.phoneNumber && (
                        <div className="text-sm text-blue-600">
                          {contact.user.phoneNumber}
                        </div>
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        <Link
                          href={createPostSlug({
                            _id: contact.post._id,
                            title: contact.post.title,
                            type: contact.post.type || "ban", // Use actual post type
                            location: {
                              province:
                                typeof contact.post.location?.province ===
                                "string"
                                  ? contact.post.location.province
                                  : contact.post.location?.province?.name,
                              ward:
                                typeof contact.post.location?.ward === "string"
                                  ? contact.post.location.ward
                                  : contact.post.location?.ward?.name,
                            },
                          })}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {contact.post.title}
                        </Link>
                      </div>
                      {contact.post.location && (
                        <div className="text-xs text-gray-500">
                          <LocationDisplay
                            provinceCode={
                              typeof contact.post.location.province === "string"
                                ? contact.post.location.province
                                : undefined
                            }
                            wardCode={
                              typeof contact.post.location.ward === "string"
                                ? contact.post.location.ward
                                : undefined
                            }
                          />
                        </div>
                      )}
                      {contact.post.price && (
                        <div className="text-xs text-green-600 font-medium">
                          {contact.post.price.toLocaleString("vi-VN")} VND
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {contact.notes && (
                      <div className="mb-3 p-2 bg-yellow-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">
                          Ghi chú:
                        </div>
                        <div className="text-sm text-gray-800">
                          {contact.notes}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Tạo: {formatDate(contact.createdAt)}</div>
                      {contact.contactedAt && (
                        <div>Liên hệ: {formatDate(contact.contactedAt)}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {contact.status === "pending" && (
                      <button
                        onClick={() =>
                          updateContactStatus(contact._id, "contacted")
                        }
                        disabled={updating === contact._id}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Đã liên hệ
                      </button>
                    )}
                    {contact.status === "contacted" && (
                      <button
                        onClick={() =>
                          updateContactStatus(contact._id, "pending")
                        }
                        disabled={updating === contact._id}
                        className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        Chờ xử lý
                      </button>
                    )}

                    {contact.status === "deleted" ? (
                      <>
                        <button
                          onClick={() => restoreContact(contact._id)}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          title="Khôi phục contact"
                        >
                          ♻️ Khôi phục
                        </button>
                        <button
                          onClick={() => hardDeleteContact(contact._id)}
                          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Xóa vĩnh viễn khỏi database"
                        >
                          🗑️ Xóa vĩnh viễn
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => hardDeleteContact(contact._id)}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Xóa vĩnh viễn"
                      >
                        🗑️ Xóa vĩnh viễn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserContactTab;
