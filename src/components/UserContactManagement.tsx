"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  customerContactService,
  CustomerContact,
} from "@/services/customerContactService";
import LocationDisplay from "@/components/LocationDisplay";
import { createPostSlug } from "../utils/postSlug";
import { useAuth } from "@/store/hooks";
import { showErrorToast } from "@/utils/errorHandler";

interface ContactFilters {
  page: number;
  limit: number;
  status: string;
  contactType: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  includeDeleted?: boolean;
}

interface UserContactManagementProps {
  userId?: string; // Optional - nếu có thì hiển thị liên hệ của user đó (dành cho admin)
}

export function UserContactManagement({ userId }: UserContactManagementProps) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";
  const canViewDeleted = isAdmin || isEmployee;

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 10,
    status: "all",
    contactType: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    includeDeleted: canViewDeleted, // Chỉ admin/employee mới thấy deleted
  });

  const [selectedContact, setSelectedContact] =
    useState<CustomerContact | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Debounce ref for API calls
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load contacts with debouncing
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: filters.page,
        limit: filters.limit,
        status: filters.status !== "all" ? filters.status : undefined,
        contactType:
          filters.contactType !== "all" ? filters.contactType : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        includeDeleted: filters.includeDeleted,
        userId: userId, // Nếu có userId thì lấy liên hệ của user đó
      };

      console.log("customerContactService:", customerContactService);
      console.log(
        "getUserContacts method:",
        customerContactService.getUserContacts
      );

      let response;
      if (userId) {
        response = await customerContactService.getContactsByUserId(
          userId,
          params
        );
      } else {
        // Fallback để tránh lỗi undefined
        if (customerContactService.getUserContacts) {
          response = await customerContactService.getUserContacts(params);
        } else {
          showErrorToast("Có lỗi xảy ra khi lấy danh sách liên hệ");
          response = { success: false, data: { contacts: [], pagination: {} } };
        }
      }

      if (response.success && response.data) {
        setContacts(response.data.contacts || []);
        if (process.env.NODE_ENV === "development") {
          console.log("response", response.data.contacts);
        }
        setPagination({
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
          limit: response.data.pagination?.limit || 10,
        });
      }
    } catch (err) {
      showErrorToast("Có lỗi xảy ra khi tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  }, [filters, userId]);

  // Debounced effect for loading contacts
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadContacts();
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [loadContacts]);

  // Handle filter changes
  const handleFilterChange = (
    key: keyof ContactFilters,
    value: string | number | boolean
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle contact actions
  const handleUpdateStatus = async (contactId: string, status: string) => {
    try {
      const response = await customerContactService.updateStatus(
        contactId,
        status
      );
      if (response.success) {
        await loadContacts();
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi cập nhật trạng thái liên hệ");
    }
  };

  const handleSoftDelete = async (contactId: string) => {
    try {
      const response = await customerContactService.softDelete(contactId);
      if (response.success) {
        await loadContacts();
        setShowDeleteModal(false);
        setSelectedContact(null);
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi xóa liên hệ");
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", class: "bg-yellow-100 text-yellow-800" },
      contacted: { label: "Đã liên hệ", class: "bg-blue-100 text-blue-800" },
      completed: { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      deleted: { label: "Đã xóa", class: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      class: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  // Render contact type badge
  const renderContactTypeBadge = (contactType: string) => {
    const typeConfig = {
      call_back: { label: "Gọi lại", class: "bg-purple-100 text-purple-800" },
      message: { label: "Tin nhắn", class: "bg-indigo-100 text-indigo-800" },
      view_contact: {
        label: "Xem liên hệ",
        class: "bg-cyan-100 text-cyan-800",
      },
    };

    const config = typeConfig[contactType as keyof typeof typeConfig] || {
      label: contactType,
      class: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => loadContacts()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {userId ? "Lịch sử liên hệ" : "Quản lý liên hệ khách hàng"}
        </h2>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="contacted">Đã liên hệ</option>
              <option value="deleted">Đã xóa</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp theo
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="updatedAt">Ngày cập nhật</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                handleFilterChange(
                  "sortOrder",
                  e.target.value as "asc" | "desc"
                )
              }
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hiển thị
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                handleFilterChange("limit", parseInt(e.target.value))
              }
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
        </div>

        {/* Include Deleted - Chỉ hiện cho admin/employee */}
        {canViewDeleted && (
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeDeleted}
                onChange={(e) =>
                  handleFilterChange("includeDeleted", e.target.checked)
                }
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Hiển thị liên hệ đã xóa
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Contact List */}
      {contacts.filter((contact) => canViewDeleted || !contact.isDeleted)
        .length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có liên hệ nào
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bài viết
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Lịch sử cập nhật
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts
                  .filter((contact) => canViewDeleted || !contact.isDeleted)
                  .map((contact) => (
                    <tr
                      key={contact._id}
                      className={contact.isDeleted ? "opacity-50" : ""}
                    >
                      {/* Customer Info */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {contact.user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.user.phoneNumber}
                          </div>
                          {contact.user.email && (
                            <div className="text-sm text-gray-500">
                              {contact.user.email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Post Info */}
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
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
                                  typeof contact.post.location?.ward ===
                                  "string"
                                    ? contact.post.location.ward
                                    : contact.post.location?.ward?.name,
                              },
                            })}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium line-clamp-2"
                            title={contact.post.title}
                          >
                            {contact.post.title}
                          </Link>
                          <div className="text-sm text-gray-500 mt-1">
                            <LocationDisplay
                              provinceCode={
                                typeof contact.post.location?.province ===
                                "string"
                                  ? contact.post.location.province
                                  : contact.post.location?.province?.name
                              }
                              wardCode={
                                typeof contact.post.location?.ward === "string"
                                  ? contact.post.location.ward
                                  : contact.post.location?.ward?.name
                              }
                            />
                          </div>
                          <div className="mt-1">
                            {renderContactTypeBadge(contact.contactType)}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {renderStatusBadge(contact.status)}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>

                      {/* Status History */}
                      <td className="px-4 py-4">
                        <div className="text-xs space-y-1">
                          {contact.contactedAt && contact.contactedBy && (
                            <div className="text-blue-600">
                              <div>
                                Đã liên hệ:{" "}
                                {new Date(
                                  contact.contactedAt
                                ).toLocaleDateString("vi-VN")}{" "}
                                {new Date(
                                  contact.contactedAt
                                ).toLocaleTimeString("vi-VN")}
                              </div>
                              <div>Bởi: {contact.contactedBy.username}</div>
                            </div>
                          )}
                          {contact.deletedAt && contact.deletedBy && (
                            <div className="text-red-600">
                              <div>
                                Đã xóa:{" "}
                                {new Date(contact.deletedAt).toLocaleDateString(
                                  "vi-VN"
                                )}{" "}
                                {new Date(contact.deletedAt).toLocaleTimeString(
                                  "vi-VN"
                                )}
                              </div>
                              <div>Bởi: {contact.deletedBy.username}</div>
                            </div>
                          )}
                          {!contact.contactedAt && !contact.deletedAt && (
                            <div className="text-gray-400">
                              Chưa có cập nhật
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          {contact.status !== "cancelled" &&
                            !contact.isDeleted && (
                              <>
                                {contact.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        contact._id,
                                        "contacted"
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Đã gọi
                                  </button>
                                )}
                                {contact.status === "contacted" && (
                                  <span className="text-green-600 text-sm">
                                    Đã liên hệ
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          {(contact.status === "cancelled" ||
                            contact.isDeleted) && (
                            <span className="text-gray-400 text-sm">
                              {contact.isDeleted ? "Đã xóa" : "Đã hủy"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {contacts
              .filter((contact) => canViewDeleted || !contact.isDeleted)
              .map((contact) => (
                <div
                  key={contact._id}
                  className={`bg-white p-4 rounded-lg shadow-sm border ${
                    contact.isDeleted ? "opacity-50" : ""
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {contact.user.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {contact.user.phoneNumber}
                      </p>
                      {contact.user.email && (
                        <p className="text-sm text-gray-600">
                          {contact.user.email}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      {renderContactTypeBadge(contact.contactType)}
                      {renderStatusBadge(contact.status)}
                    </div>
                  </div>

                  {/* Post Info */}
                  <div className="mb-3">
                    <Link
                      href={createPostSlug({
                        _id: contact.post._id,
                        title: contact.post.title,
                        type: contact.post.type || "ban", // Use actual post type
                        location: {
                          province:
                            typeof contact.post.location?.province === "string"
                              ? contact.post.location.province
                              : contact.post.location?.province?.name,
                          ward:
                            typeof contact.post.location?.ward === "string"
                              ? contact.post.location.ward
                              : contact.post.location?.ward?.name,
                        },
                      })}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {contact.post.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      <LocationDisplay
                        provinceCode={
                          typeof contact.post.location?.province === "string"
                            ? contact.post.location.province
                            : contact.post.location?.province?.name
                        }
                        wardCode={
                          typeof contact.post.location?.ward === "string"
                            ? contact.post.location.ward
                            : contact.post.location?.ward?.name
                        }
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  {contact.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{contact.notes}</p>
                    </div>
                  )}

                  {/* Status History */}
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      Lịch sử cập nhật:
                    </div>
                    <div className="text-xs space-y-1">
                      {contact.contactedAt && contact.contactedBy && (
                        <div className="text-blue-600">
                          <div>
                            ✓ Đã liên hệ:{" "}
                            {new Date(contact.contactedAt).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            {new Date(contact.contactedAt).toLocaleTimeString(
                              "vi-VN"
                            )}
                          </div>
                          <div>Bởi: {contact.contactedBy.username}</div>
                        </div>
                      )}

                      {!contact.contactedAt && !contact.deletedAt && (
                        <div className="text-gray-400">Chưa có cập nhật</div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    {!contact.isDeleted && contact.status !== "cancelled" && (
                      <div className="flex space-x-3">
                        {contact.status === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(contact._id, "contacted")
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Đã gọi
                          </button>
                        )}
                        {contact.status === "contacted" && (
                          <span className="text-green-600 text-sm">
                            Đã liên hệ
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Pagination Info */}
          <div className="text-sm text-gray-700">
            Hiển thị{" "}
            {Math.min(
              (pagination.currentPage - 1) * filters.limit + 1,
              pagination.total
            )}
            -{" "}
            {Math.min(pagination.currentPage * filters.limit, pagination.total)}
            trong tổng số {pagination.total} liên hệ
          </div>

          {/* Pagination Controls */}
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 1 &&
                  page <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      page === pagination.currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.currentPage - 2 ||
                page === pagination.currentPage + 2
              ) {
                return (
                  <span key={page} className="px-2 py-2 text-sm text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa liên hệ
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa liên hệ từ{" "}
              <strong>{selectedContact.user.username}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedContact(null);
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSoftDelete(selectedContact._id)}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserContactManagement;
