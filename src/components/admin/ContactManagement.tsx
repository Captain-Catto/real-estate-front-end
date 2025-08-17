"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { contactService, ContactMessage } from "../../services/contactService";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
}

interface ContactLog {
  _id: string;
  contactId: string;
  action: "status_change" | "reply" | "create" | "delete";
  oldValue?: string;
  newValue?: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  performedAt: string;
  description: string;
  note?: string;
  canEdit?: boolean;
}

const ContactManagement = () => {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [contactLogs, setContactLogs] = useState<ContactLog[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    contactId: string;
    newStatus: string;
  } | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [shouldReopenDetailModal, setShouldReopenDetailModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    search: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await contactService.getContactMessages({
        page: filters.page,
        limit: filters.limit,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });

      setContacts(response.messages);
      setTotal(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
    } catch {
      toast.error("Có lỗi xảy ra khi lấy danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const stats = await contactService.getContactStats();
      setStats(stats);
    } catch {
      toast.error("Có lỗi xảy ra khi lấy thống kê liên hệ");
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [fetchContacts, fetchStats]);

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    // Đóng modal detail nếu đang mở và đánh dấu cần mở lại
    if (showDetailModal) {
      setShowDetailModal(false);
      setShouldReopenDetailModal(true);
    }

    // Map trạng thái từ UI sang backend
    let backendStatus = newStatus;
    if (newStatus === "contacted") {
      backendStatus = "read"; // hoặc "replied" tùy thuộc vào logic
    }

    // Mở modal để nhập note thay vì thay đổi trạng thái trực tiếp
    setPendingStatusChange({ contactId, newStatus: backendStatus });
    setStatusNote("");
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      setActionLoading(true);

      await contactService.updateContactMessageStatus(
        pendingStatusChange.contactId,
        pendingStatusChange.newStatus as "new" | "read" | "replied" | "closed",
        statusNote
      );

      await fetchContacts();
      await fetchStats();

      if (selectedContact?._id === pendingStatusChange.contactId) {
        const updatedContact = {
          ...selectedContact,
          status: pendingStatusChange.newStatus as
            | "new"
            | "read"
            | "replied"
            | "closed",
        };
        setSelectedContact(updatedContact);
      }

      // Đóng modal status và reset state
      setShowStatusModal(false);
      setPendingStatusChange(null);
      setStatusNote("");

      // Mở lại modal detail nếu cần
      if (shouldReopenDetailModal) {
        setTimeout(() => {
          setShowDetailModal(true);
          setShouldReopenDetailModal(false);
        }, 100);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái liên hệ");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelStatusChange = () => {
    setShowStatusModal(false);
    setPendingStatusChange(null);
    setStatusNote("");

    // Mở lại modal detail nếu cần
    if (shouldReopenDetailModal) {
      setTimeout(() => {
        setShowDetailModal(true);
        setShouldReopenDetailModal(false);
      }, 100);
    }
  };

  const openDetailModal = (contact: ContactMessage) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedContact(null);
    setShowDetailModal(false);
  };

  const openLogsModal = async (contact: ContactMessage) => {
    setSelectedContact(contact);
    try {
      const logs = await contactService.getContactLogs(contact._id);
      console.log("Received logs:", logs);
      setContactLogs(logs);
      setShowLogsModal(true);
    } catch {
      toast.error("Có lỗi xảy ra khi lấy nhật ký liên hệ");
      setContactLogs([]);
      setShowLogsModal(true);
    }
  };

  const closeLogsModal = () => {
    setShowLogsModal(false);
    setContactLogs([]);
  };

  const startEditingNote = (logId: string, currentNote: string) => {
    setEditingLogId(logId);
    setEditingNote(currentNote || "");
  };

  const cancelEditingNote = () => {
    setEditingLogId(null);
    setEditingNote("");
  };

  const saveNoteEdit = async (logId: string) => {
    try {
      setActionLoading(true);
      await contactService.updateContactLogNote(logId, editingNote);

      // Refresh logs
      if (selectedContact) {
        const logs = await contactService.getContactLogs(selectedContact._id);
        setContactLogs(logs);
      }

      setEditingLogId(null);
      setEditingNote("");
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật ghi chú");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) return;

    try {
      setActionLoading(true);
      await contactService.deleteContactMessage(contactId);
      await fetchContacts();
      await fetchStats();

      if (selectedContact?._id === contactId) {
        setSelectedContact(null);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa tin nhắn");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Quản Lý Liên Hệ
        </h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Tổng số</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {stats.new}
              </div>
              <div className="text-sm text-gray-600">Tin mới</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {stats.read + stats.replied}
              </div>
              <div className="text-sm text-gray-600">Đã liên hệ</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-600">
                {stats.closed}
              </div>
              <div className="text-sm text-gray-600">Đã đóng</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Tất cả</option>
                <option value="new">Mới</option>
                <option value="contacted">Đã liên hệ</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                    page: 1,
                  }))
                }
                placeholder="Tìm theo tên, email, chủ đề..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chủ đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Đang tải...</p>
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Không có tin nhắn nào
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500">
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {contact.subject}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {contact.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={
                        contact.status === "read" ||
                        contact.status === "replied"
                          ? "contacted"
                          : contact.status
                      }
                      onChange={(e) =>
                        handleStatusChange(contact._id, e.target.value)
                      }
                      disabled={actionLoading}
                      className={`px-3 py-1 text-xs rounded-full border-0 ${
                        statusColors[
                          contact.status === "read" ||
                          contact.status === "replied"
                            ? "contacted"
                            : (contact.status as keyof typeof statusColors)
                        ]
                      }`}
                    >
                      <option value="new">Mới</option>
                      <option value="contacted">Đã liên hệ</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(contact.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openDetailModal(contact)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openLogsModal(contact)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded-md hover:bg-purple-50"
                        title="Xem lịch sử"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>

                      {hasRole("admin") && (
                        <button
                          onClick={() => handleDelete(contact._id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                          title="Xóa"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {(filters.page - 1) * filters.limit + 1} -{" "}
                {Math.min(filters.page * filters.limit, total)} trong {total}{" "}
                kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={filters.page <= 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (pageNum) =>
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - filters.page) <= 2
                  )
                  .map((pageNum, index, array) => (
                    <React.Fragment key={pageNum}>
                      {index > 0 && array[index - 1] !== pageNum - 1 && (
                        <span className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, page: pageNum }))
                        }
                        className={`px-3 py-2 text-sm border rounded-md ${
                          filters.page === pageNum
                            ? "bg-red-600 text-white border-red-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(totalPages, prev.page + 1),
                    }))
                  }
                  disabled={filters.page >= totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Modal */}
      {showStatusModal && pendingStatusChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Thay đổi trạng thái
              </h2>
              <button
                onClick={cancelStatusChange}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Bạn muốn thay đổi trạng thái thành:{" "}
                  <span className="font-semibold">
                    {pendingStatusChange.newStatus === "new" && "Mới"}
                    {pendingStatusChange.newStatus === "read" && "Đã liên hệ"}
                    {pendingStatusChange.newStatus === "replied" &&
                      "Đã liên hệ"}
                    {pendingStatusChange.newStatus === "closed" && "Đã đóng"}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Nhập ghi chú về việc thay đổi trạng thái..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelStatusChange}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Chi tiết tin nhắn
              </h2>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedContact.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedContact.email}
                  </p>
                </div>
              </div>

              {selectedContact.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điện thoại
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedContact.phone}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chủ đề
                </label>
                <p className="text-sm text-gray-900">
                  {selectedContact.subject}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian gửi
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedContact.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={
                    selectedContact.status === "read" ||
                    selectedContact.status === "replied"
                      ? "contacted"
                      : selectedContact.status
                  }
                  onChange={(e) =>
                    handleStatusChange(selectedContact._id, e.target.value)
                  }
                  disabled={actionLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="new">Mới</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </div>

              {selectedContact.replyMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phản hồi
                  </label>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedContact.replyMessage}
                    </p>
                    {selectedContact.repliedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Trả lời lúc: {formatDate(selectedContact.repliedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
              <button
                onClick={() => {
                  openLogsModal(selectedContact);
                  closeDetailModal();
                }}
                className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700"
              >
                Xem Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Lịch sử thay đổi - {selectedContact.name}
              </h2>
              <button
                onClick={closeLogsModal}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {contactLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Chưa có lịch sử thay đổi nào
                </div>
              ) : (
                <div className="space-y-4">
                  {contactLogs.map((log, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {log.action === "status_change"
                            ? "Thay đổi trạng thái"
                            : log.action}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(log.performedAt)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Thực hiện bởi:</span>{" "}
                          {log.performedBy?.name ? (
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/quan-ly-nguoi-dung/${log.performedBy._id}`
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                            >
                              {log.performedBy.name}
                            </button>
                          ) : (
                            "Hệ thống"
                          )}
                        </div>

                        {log.performedBy?.email && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span>{" "}
                            {log.performedBy.email}
                          </div>
                        )}

                        {log.oldValue && log.newValue && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Thay đổi:</span>{" "}
                            <span className="inline-flex items-center space-x-2">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                {log.oldValue}
                              </span>
                              <span>→</span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {log.newValue}
                              </span>
                            </span>
                          </div>
                        )}

                        {log.description && (
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            <span className="font-medium">Mô tả:</span>{" "}
                            {log.description}
                          </div>
                        )}

                        {/* Note section with editing capability */}
                        <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="font-medium">Ghi chú:</span>{" "}
                              {editingLogId === log._id ? (
                                <div className="mt-2">
                                  <textarea
                                    value={editingNote}
                                    onChange={(e) =>
                                      setEditingNote(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Nhập ghi chú..."
                                  />
                                  <div className="mt-2 flex space-x-2">
                                    <button
                                      onClick={() => saveNoteEdit(log._id)}
                                      disabled={actionLoading}
                                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs"
                                    >
                                      {actionLoading ? "Đang lưu..." : "Lưu"}
                                    </button>
                                    <button
                                      onClick={cancelEditingNote}
                                      className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="block mt-1">
                                  {log.note || "Chưa có ghi chú"}
                                </span>
                              )}
                            </div>
                            {editingLogId !== log._id && (
                              <button
                                onClick={() =>
                                  startEditingNote(log._id, log.note || "")
                                }
                                className="ml-2 text-blue-600 hover:text-blue-800"
                                title="Chỉnh sửa ghi chú"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
