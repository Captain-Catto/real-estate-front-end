"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Developer {
  name: string;
  logo?: string;
  phone?: string;
  email?: string;
}

interface ContactBoxProps {
  developer: Developer;
  projectId: string;
  projectName: string;
}

export default function ContactBox({
  developer,
  projectId,
  projectName,
}: ContactBoxProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại!");
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

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-4">
          <i className="fas fa-check-circle text-green-500 text-4xl"></i>
        </div>
        <h3 className="text-lg font-semibold mb-2">Cảm ơn bạn!</h3>
        <p className="text-gray-600 mb-4">
          Chúng tôi đã nhận được thông tin và sẽ liên hệ với bạn sớm nhất về dự
          án này.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Liên hệ tư vấn miễn phí</h3>
        <p className="text-gray-600 text-sm">
          Để lại thông tin để nhận tư vấn và cập nhật mới nhất về dự án{" "}
          <b>{projectName}</b>
        </p>
      </div>

      {/* Developer Info */}
      {developer && (
        <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
          {developer.logo && (
            <Image
              src={developer.logo}
              alt={developer.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="font-medium text-sm">{developer.name}</div>
            <div className="text-xs text-gray-500">Chủ đầu tư</div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Họ tên *"
          value={formData.fullName}
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
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="message"
          placeholder="Lời nhắn"
          value={formData.message}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="text-xs text-gray-500">
          Khi gửi thông tin, bạn đồng ý với{" "}
          <a
            href="/chinh-sach-bao-mat"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            chính sách bảo mật
          </a>
          .
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Đang gửi...
            </>
          ) : (
            <>
              <i className="fas fa-envelope mr-2"></i>
              Liên hệ lại tôi
            </>
          )}
        </button>
      </form>

      {/* Quick Contact Options */}
      <div className="mt-6 pt-6 border-t space-y-3">
        {developer && developer.phone && (
          <a
            href={`tel:${developer.phone}`}
            className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-phone"></i>
            <span>Gọi ngay</span>
          </a>
        )}
        {developer && developer.email && (
          <a
            href={`mailto:${developer.email}`}
            className="flex items-center justify-center space-x-2 w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-envelope"></i>
            <span>Gửi email</span>
          </a>
        )}
      </div>
    </div>
  );
}
