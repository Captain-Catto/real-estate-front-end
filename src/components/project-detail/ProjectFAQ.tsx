"use client";
import React, { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface ProjectFAQProps {
  faqs: FAQ[];
  projectName: string;
}

export function ProjectFAQ({ faqs, projectName }: ProjectFAQProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpanded = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generalFAQs = [
    {
      question: "Dự án có được cấp phép xây dựng chưa?",
      answer:
        "Dự án đã được cấp giấy phép xây dựng và các giấy tờ pháp lý đầy đủ theo quy định của pháp luật.",
    },
    {
      question: "Thời gian bàn giao dự kiến là khi nào?",
      answer:
        "Dự án dự kiến sẽ hoàn thiện và bàn giao trong quý IV/2025. Thời gian có thể thay đổi tùy theo tiến độ thi công thực tế.",
    },
    {
      question: "Có những hình thức thanh toán nào?",
      answer:
        "Chủ đầu tư hỗ trợ nhiều hình thức thanh toán linh hoạt: thanh toán đợt, trả góp theo tiến độ, và hỗ trợ vay ngân hàng với lãi suất ưu đãi.",
    },
    {
      question: "Dự án có bảo hành không?",
      answer:
        "Có, dự án được bảo hành kết cấu 10 năm và hoàn thiện 2 năm theo quy định của pháp luật xây dựng.",
    },
  ];

  const allFAQs = [...faqs, ...generalFAQs];
  const displayFAQs = searchTerm ? filteredFAQs : allFAQs;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Câu hỏi thường gặp về {projectName}
        </h2>
        <p className="text-gray-600 text-sm">
          Tìm hiểu thông tin chi tiết về dự án qua các câu hỏi phổ biến
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "Tất cả", count: allFAQs.length },
          { key: "legal", label: "Pháp lý", count: 3 },
          { key: "payment", label: "Thanh toán", count: 4 },
          { key: "facilities", label: "Tiện ích", count: 5 },
          { key: "handover", label: "Bàn giao", count: 2 },
        ].map((category) => (
          <button
            key={category.key}
            className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* FAQ List */}
      {displayFAQs.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-search text-gray-300 text-3xl mb-3"></i>
          <p className="text-gray-500">Không tìm thấy câu hỏi phù hợp</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayFAQs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <i
                  className={`fas fa-chevron-${
                    expandedItems.includes(index) ? "up" : "down"
                  } text-gray-400 flex-shrink-0`}
                ></i>
              </button>

              {expandedItems.includes(index) && (
                <div className="px-4 pb-4 text-gray-600 border-t border-gray-100">
                  <div
                    className="pt-3"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-8 pt-6 border-t">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="fas fa-question-circle text-blue-600 text-xl mt-1"></i>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">
                Không tìm thấy câu trả lời?
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Liên hệ với chúng tôi để được tư vấn chi tiết về dự án
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <i className="fas fa-phone mr-2"></i>
                  Gọi hotline
                </button>
                <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                  <i className="fas fa-comments mr-2"></i>
                  Chat trực tuyến
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
