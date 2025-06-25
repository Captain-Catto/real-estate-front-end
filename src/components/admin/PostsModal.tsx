import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  CheckIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface PostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (postId: string) => void;
  onReject: (postId: string, reason: string) => void;
}

export default function PostModal({
  post,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: PostModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const formatPrice = (price: string) => {
    const num = parseInt(price);
    return num.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-800 bg-green-100";
      case "pending":
        return "text-yellow-800 bg-yellow-100";
      case "rejected":
        return "text-red-800 bg-red-100";
      case "expired":
        return "text-gray-800 bg-gray-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const handleApprove = () => {
    onApprove(post.id);
    onClose();
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(post.id, rejectReason);
      onClose();
    } else {
      alert("Vui lòng nhập lý do từ chối!");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Chi tiết tin đăng #{post.id}
                    </Dialog.Title>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {post.status === "active"
                          ? "Đang hiển thị"
                          : post.status === "pending"
                          ? "Chờ duyệt"
                          : post.status === "rejected"
                          ? "Bị từ chối"
                          : "Hết hạn"}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {post.priority === "vip"
                          ? "VIP"
                          : post.priority === "premium"
                          ? "Premium"
                          : "Thường"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Post Info */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {post.title}
                      </h2>

                      {/* Basic Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Thông tin cơ bản
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Giá</p>
                              <p className="text-sm font-medium">
                                {formatPrice(post.price)} VNĐ
                                {post.type === "cho-thue" && "/tháng"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <HomeIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Diện tích</p>
                              <p className="text-sm font-medium">
                                {post.area} m²
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Vị trí</p>
                              <p className="text-sm font-medium">
                                {post.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Lượt xem</p>
                              <p className="text-sm font-medium">
                                {post.views.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Mô tả
                        </h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {post.description}
                        </p>
                      </div>

                      {/* Images */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Hình ảnh ({post.images?.length || 0})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {post.images?.map((image: string, index: number) => (
                            <div
                              key={index}
                              className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center"
                            >
                              <span className="text-gray-500 text-xs">
                                IMG {index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Author & System Info */}
                    <div>
                      {/* Author Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Thông tin tác giả
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Tên</p>
                              <p className="text-sm font-medium">
                                {post.author}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Số điện thoại
                              </p>
                              <p className="text-sm font-medium">
                                {post.authorPhone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* System Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Thông tin hệ thống
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Ngày tạo</p>
                              <p className="text-sm font-medium">
                                {formatDate(post.createdAt)}
                              </p>
                            </div>
                          </div>
                          {post.approvedAt && (
                            <div className="flex items-center gap-2">
                              <CheckIcon className="w-4 h-4 text-green-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Đã duyệt
                                </p>
                                <p className="text-sm font-medium">
                                  {formatDate(post.approvedAt)} bởi{" "}
                                  {post.approvedBy}
                                </p>
                              </div>
                            </div>
                          )}
                          {post.rejectedAt && (
                            <div className="flex items-start gap-2">
                              <XCircleIcon className="w-4 h-4 text-red-500 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Bị từ chối
                                </p>
                                <p className="text-sm font-medium">
                                  {formatDate(post.rejectedAt)} bởi{" "}
                                  {post.rejectedBy}
                                </p>
                                {post.rejectedReason && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Lý do: {post.rejectedReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions for pending posts */}
                      {post.status === "pending" && (
                        <div className="space-y-4">
                          {!showRejectForm ? (
                            <div className="flex flex-col gap-3">
                              <button
                                onClick={handleApprove}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckIcon className="w-4 h-4" />
                                Duyệt tin đăng
                              </button>
                              <button
                                onClick={() => setShowRejectForm(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <XCircleIcon className="w-4 h-4" />
                                Từ chối tin đăng
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <textarea
                                value={rejectReason}
                                onChange={(e) =>
                                  setRejectReason(e.target.value)
                                }
                                placeholder="Nhập lý do từ chối..."
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleReject}
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                  Xác nhận từ chối
                                </button>
                                <button
                                  onClick={() => setShowRejectForm(false)}
                                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
