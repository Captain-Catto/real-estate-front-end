"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
}: ImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  // Sync activeIndex with currentIndex when props change
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex, isOpen]); // Add isOpen to dependencies

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setActiveIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : images.length - 1;
            return newIndex;
          });
          break;
        case "ArrowRight":
          e.preventDefault();
          setActiveIndex((prev) => {
            const newIndex = prev < images.length - 1 ? prev + 1 : 0;
            return newIndex;
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const nextImage = () => {
    const newIndex = activeIndex < images.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
  };

  const prevImage = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : images.length - 1;
    setActiveIndex(newIndex);
  };

  const modal = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        aria-label="Đóng"
      >
        <svg
          className="w-8 h-8"
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

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="relative max-w-7xl max-h-full">
          <Image
            src={images[activeIndex]}
            alt={`Hình ${activeIndex + 1}`}
            width={1200}
            height={800}
            className="object-contain max-w-full max-h-full"
            key={activeIndex} // Add key to force re-render when index changes
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-3"
              aria-label="Hình trước"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-3"
              aria-label="Hình tiếp theo"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Image info bar with thumbnail gallery */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 text-white">
        {/* Image counter */}
        <div className="px-4 py-2 border-b border-gray-600">
          <p className="text-sm text-gray-300 text-center">
            Hình {activeIndex + 1} / {images.length}
          </p>
        </div>

        {/* Thumbnail gallery */}
        {images.length > 1 && (
          <div className="p-3">
            <div className="flex gap-2 overflow-x-auto max-w-full scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-12 w-16 md:h-16 md:w-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                    index === activeIndex
                      ? "border-white scale-110"
                      : "border-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Đóng modal"
      />
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
