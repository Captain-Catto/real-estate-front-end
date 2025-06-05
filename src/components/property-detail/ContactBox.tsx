"use client";
import React, { useState } from "react";
import Image from "next/image";

interface ContactBoxProps {
  agent: {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
    email?: string;
    totalListings: number;
  };
  propertyId: string;
}

export function ContactBox({ agent, propertyId }: ContactBoxProps) {
  const [showPhone, setShowPhone] = useState(false);

  const handleShowPhone = () => {
    setShowPhone(true);
  };

  const maskedPhone = agent.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 ***");

  return (
    <>
      {/* Desktop Version - Sidebar */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md p-4 sticky top-6">
        <h3 className="text-lg font-semibold mb-3">Liên hệ</h3>

        {/* Agent Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={agent.avatar || "/images/default-avatar.png"}
              alt={agent.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-base truncate">{agent.name}</h4>
            <p className="text-gray-500 text-xs">
              {agent.totalListings} tin đăng
            </p>
          </div>
        </div>

        {/* Contact Actions - Desktop */}
        <div className="space-y-2">
          <button
            onClick={handleShowPhone}
            className="w-full bg-blue-600 text-white py-2.5 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <i className="fas fa-phone text-xs"></i>
            <span>{showPhone ? agent.phone : `Hiện số`}</span>
          </button>

          <button
            onClick={() =>
              window.open(`https://zalo.me/${agent.phone.replace(/\D/g, "")}`)
            }
            className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
          >
            <i className="fab fa-facebook-messenger text-xs"></i>
            <span>Chat Zalo</span>
          </button>

          {agent.email && (
            <button
              onClick={() => window.open(`mailto:${agent.email}`)}
              className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 text-sm"
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
            {/* Agent Avatar & Info */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={agent.avatar || "/images/default-avatar.png"}
                  alt={agent.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                <p className="text-gray-500 text-xs">
                  {agent.totalListings} tin đăng
                </p>
              </div>
            </div>

            {/* Contact Buttons - Horizontal */}
            <div className="flex flex-3 space-x-2 flex-shrink-0">
              <button
                onClick={handleShowPhone}
                className="flex-2 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
              >
                <i className="fas fa-phone text-xs"></i>
                <span className="hidden sm:inline">
                  {showPhone ? agent.phone : `Hiện số`}
                </span>
                <span className="sm:hidden">Gọi</span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://zalo.me/${agent.phone.replace(/\D/g, "")}`
                  )
                }
                className="flex-1 flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 text-sm"
              >
                <i className="fab fa-facebook-messenger text-xs"></i>
                <span className="hidden sm:inline">Zalo</span>
              </button>

              {agent.email && (
                <button
                  onClick={() => window.open(`mailto:${agent.email}`)}
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
