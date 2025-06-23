"use client";
import React, { useState } from "react";
import QuillEditor from "./QuillEditor";

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
}

interface ContactBoxEditorProps {
  value?: ContactInfo;
  onChange?: (value: ContactInfo) => void;
}

export default function ContactBoxEditor({
  value,
  onChange,
}: ContactBoxEditorProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(
    value || {
      name: "",
      phone: "",
      email: "",
      address: "",
      description: "",
    }
  );

  const handleFieldChange = (field: keyof ContactInfo, fieldValue: string) => {
    const updated = { ...contactInfo, [field]: fieldValue };
    setContactInfo(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên liên hệ *
          </label>
          <input
            type="text"
            value={contactInfo.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên người liên hệ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại *
          </label>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => handleFieldChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <input
            type="text"
            value={contactInfo.address}
            onChange={(e) => handleFieldChange("address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa chỉ"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả thêm
        </label>
        <QuillEditor
          value={contactInfo.description}
          onChange={(value) => handleFieldChange("description", value)}
          placeholder="Nhập mô tả thêm về thông tin liên hệ..."
          height="200px"
          maxImageWidth={600}
          imageQuality={0.7}
        />
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Xem trước:</h4>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {contactInfo.name.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {contactInfo.name || "Tên liên hệ"}
              </h3>
              <p className="text-sm text-gray-500">
                {contactInfo.phone || "Số điện thoại"}
              </p>
            </div>
          </div>

          {contactInfo.email && (
            <p className="text-sm text-gray-600 mb-2">📧 {contactInfo.email}</p>
          )}

          {contactInfo.address && (
            <p className="text-sm text-gray-600 mb-2">
              📍 {contactInfo.address}
            </p>
          )}

          {contactInfo.description && (
            <div
              className="text-sm text-gray-600 mt-3 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contactInfo.description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
