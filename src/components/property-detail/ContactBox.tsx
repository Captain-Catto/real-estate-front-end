"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  contactService,
  CreateContactMessage,
} from "@/services/contactService";

interface ContactBoxProps {
  author: {
    id?: string;
    username: string;
    avatar?: string;
    phone: string;
    email?: string;
    totalListings?: number;
  };
  propertyId: string;
  propertyTitle?: string;
}

export function ContactBox({
  author,
  propertyId,
  propertyTitle,
}: {
  author: ContactBoxProps["author"];
  propertyId: string;
  propertyTitle?: string;
}) {
  console.log("ContactBox rendered with author:", author);
  const [showPhone, setShowPhone] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleShowPhone = () => {
    setShowPhone(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const contactData: CreateContactMessage = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Liên hệ về tin đăng${
          propertyTitle ? ` - ${propertyTitle}` : ""
        }`,
        message:
          formData.message ||
          `Tôi quan tâm đến tin đăng này. Vui lòng liên hệ với tôi.`,
      };

      const result = await contactService.sendContactMessage(contactData);

      if (result.success) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: "",
        });
      } else {
        setErrorMessage("Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error sending contact message:", error);
      setErrorMessage("Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {/* Desktop Version - Sidebar */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md p-4 sticky top-6">
        <h3 className="text-lg font-semibold mb-3">Liên hệ</h3>

        {/* author Info */}
        <Link
          href={`/thanh-vien/${author.id}`}
          className="flex items-center space-x-3 mb-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={author?.avatar || "/images/default-avatar.png"}
              alt={author?.username}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-base truncate">
              {author.username}
            </h4>
            <p className="text-gray-500 text-xs">
              {author.totalListings} tin đăng
            </p>
          </div>
        </Link>

        {/* Contact Actions - Desktop */}
        <div className="space-y-2">
          <button
            onClick={handleShowPhone}
            className="w-full bg-blue-600 text-white py-2.5 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <i className="fas fa-phone text-xs"></i>
            <span>{showPhone ? author?.phone : `Hiện số`}</span>
          </button>

          <button
            onClick={() => setShowContactForm(true)}
            className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 text-sm"
          >
            <i className="fas fa-envelope text-xs"></i>
            <span>Nhắn tin</span>
          </button>

          <button
            onClick={() =>
              window.open(`https://zalo.me/${author?.phone.replace(/\D/g, "")}`)
            }
            className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
          >
            <i className="fab fa-facebook-messenger text-xs"></i>
            <span>Chat Zalo</span>
          </button>

          {author.email && (
            <button
              onClick={() => window.open(`mailto:${author.email}`)}
              className="w-full bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <i className="fas fa-envelope text-xs"></i>
              <span>Email</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Version - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Author Avatar & Info */}
            <Link
              href={`/thanh-vien/${author.id}`}
              className="flex items-center space-x-2 flex-1 min-w-0 hover:bg-gray-50 p-1 rounded transition-colors"
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={author.avatar || "/images/default-avatar.png"}
                  alt={author.username}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {author.username}
                </h4>
                <p className="text-gray-500 text-xs">
                  {author.totalListings} tin đăng
                </p>
              </div>
            </Link>

            {/* Contact Buttons - Horizontal */}
            <div className="flex flex-3 space-x-2 flex-shrink-0">
              <button
                onClick={handleShowPhone}
                className="flex-2 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <i className="fas fa-phone text-xs"></i>
                <span className="hidden sm:inline ml-1">
                  {showPhone ? author.phone : `Hiện số`}
                </span>
                <span className="sm:hidden">Gọi</span>
              </button>

              <button
                onClick={() => setShowContactForm(true)}
                className="flex-1 flex items-center justify-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <i className="fas fa-envelope text-xs"></i>
                <span className="hidden sm:inline ml-1">Nhắn tin</span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://zalo.me/${author.phone.replace(/\D/g, "")}`
                  )
                }
                className="flex-1 flex items-center justify-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <i className="fab fa-facebook-messenger text-xs"></i>
                <span className="hidden sm:inline ml-1">Zalo</span>
              </button>

              {author.email && (
                <button
                  onClick={() => window.open(`mailto:${author.email}`)}
                  className="flex-1 flex items-center justify-center bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <i className="fas fa-envelope text-xs"></i>
                  <span className="hidden sm:inline ml-1">Email</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {!isSubmitted ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Nhắn tin cho người đăng
                    </h3>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {errorMessage}
                      </div>
                    )}

                    <input
                      type="text"
                      name="name"
                      placeholder="Họ tên *"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Số điện thoại *"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <textarea
                      name="message"
                      placeholder="Tin nhắn (tùy chọn)"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />

                    <div className="text-xs text-gray-500">
                      Thông tin sẽ được gửi đến hệ thống quản lý liên hệ để
                      admin xử lý.
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Đang gửi...
                          </>
                        ) : (
                          "Gửi tin nhắn"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-green-500 text-4xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Gửi thành công!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tin nhắn của bạn đã được gửi đến hệ thống. Admin sẽ xử lý và
                    liên hệ lại với bạn sớm.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setShowContactForm(false);
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
