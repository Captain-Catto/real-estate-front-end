"use client";
import React, { useState } from "react";

interface PropertyDescriptionProps {
  description: string;
}

export function PropertyDescription({ description }: PropertyDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = description.length > 500;

  const displayDescription = isExpanded
    ? description
    : description.slice(0, 500);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Mô tả chi tiết</h3>
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayDescription}
          {!isExpanded && isLongDescription && "..."}
        </p>
        {isLongDescription && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>
    </div>
  );
}
