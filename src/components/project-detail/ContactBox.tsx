"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  contactService,
  CreateContactMessage,
} from "@/services/contactService";
import { toast } from "sonner";

interface Developer {
  name: string;
  logo?: string;
  phone?: string;
  email?: string;
}

interface ContactBoxProps {
  developer: Developer;
  projectName: string;
}

export default function ContactBox({
  developer,
  projectName,
}: ContactBoxProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const contactData: CreateContactMessage = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Tư vấn dự án ${projectName}`,
        message:
          formData.message ||
          `Tôi quan tâm đến dự án ${projectName}. Vui lòng liên hệ tư vấn cho tôi.`,
      };

      const result = await contactService.sendContactMessage(contactData);

      if (result.success) {
        setIsSubmitted(true);
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: "",
        });
      } else {
        setErrorMessage("Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi gửi thông tin liên hệ");
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
          placeholder="Nội dung (tùy chọn)"
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
              <i className="fas fa-headset mr-2"></i>
              Liên hệ lại với tôi
            </>
          )}
        </button>
      </form>
    </div>
  );
}
