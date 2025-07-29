"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
}

export function ContactBox({ author }: { author: ContactBoxProps['author'] }) {
  console.log("ContactBox rendered with author:", author);
  const [showPhone, setShowPhone] = useState(false);

  const handleShowPhone = () => {
    setShowPhone(true);
  };

  return (
    <>
      {/* Mobile/Tablet Version - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Author Avatar & Info */}
            <Link 
              href={`/nguoi-dung/${author.id}`}
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
                className="flex-2 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
              >
                <i className="fas fa-phone text-xs"></i>
                <span className="hidden sm:inline">
                  {showPhone ? author.phone : `Hiện số`}
                </span>
                <span className="sm:hidden">Gọi</span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://zalo.me/${author.phone.replace(/\D/g, "")}`
                  )
                }
                className="flex-1 flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 text-sm"
              >
                <i className="fab fa-facebook-messenger text-xs"></i>
                <span className="hidden sm:inline">Zalo</span>
              </button>

              {author.email && (
                <button
                  onClick={() => window.open(`mailto:${author.email}`)}
                  className="flex-1 flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
                >
                  <i className="fas fa-envelope text-xs"></i>
                  <span className="hidden sm:inline">Email</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
