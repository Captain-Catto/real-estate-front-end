"use client";

import React, { useState } from "react";
import { customerContactService } from "@/services/customerContactService";

interface CallBackButtonProps {
  postId: string;
  postTitle?: string;
  className?: string;
  children?: React.ReactNode;
}

const CallBackButton: React.FC<CallBackButtonProps> = ({
  postId,
  postTitle,
  className = "",
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCallBackRequest = async () => {
    setIsLoading(true);
    try {
      const response = await customerContactService.createCallBackRequest(
        postId,
        notes
      );

      console.log("Response from createCallBackRequest:", response);

      if (response.success) {
        showMessage(
          "success",
          "Yêu cầu liên hệ đã được gửi thành công! Chủ bài viết sẽ liên hệ với bạn sớm nhất."
        );
        setShowNoteModal(false);
        setNotes("");
      } else {
        showMessage(
          "error",
          response.message || "Có lỗi xảy ra, vui lòng thử lại"
        );
      }
    } catch (error: unknown) {
      console.error("Error creating call back request:", error);

      if (error instanceof Error && error.message.includes("401")) {
        showMessage("error", "Vui lòng đăng nhập để sử dụng tính năng này");
      } else if (
        error instanceof Error &&
        error.message.includes("already exists")
      ) {
        showMessage(
          "info",
          "Bạn đã gửi yêu cầu liên hệ cho bài viết này rồi. Chủ bài viết sẽ liên hệ với bạn sớm nhất!"
        );
      } else {
        showMessage("error", "Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openNoteModal = () => {
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setNotes("");
  };

  return (
    <>
      {/* Message Display */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
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
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <svg
                className="h-4 w-4"
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
        </div>
      )}

      {/* Call Back Button */}
      <button
        onClick={openNoteModal}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
        } ${className}`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Đang gửi...</span>
          </>
        ) : (
          <>
            {children || (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Yêu cầu liên hệ lại</span>
              </>
            )}
          </>
        )}
      </button>

      {/* Modal for notes */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Yêu cầu liên hệ lại
              </h3>
              <button
                onClick={closeNoteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
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

            {postTitle && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bài viết:</p>
                <p className="font-medium text-gray-900 line-clamp-2">
                  {postTitle}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ghi chú (tùy chọn)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về thời gian liên hệ hoặc thông tin cần tư vấn..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {notes.length}/500 ký tự
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeNoteModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCallBackRequest}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallBackButton;
