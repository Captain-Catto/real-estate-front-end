"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ImageModal } from "./ImageModal";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return; // Let modal handle keyboard events when open

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, isModalOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-96 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Không có hình ảnh</span>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          {/* Main Image */}
          <div
            className="relative h-96 w-full group cursor-pointer"
            onClick={openModal}
          >
            <Image
              src={images[currentImage]}
              alt={`${title} - Hình ${currentImage + 1}`}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />

            {/* Navigation buttons - Only show if more than 1 image */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Hình trước"
                >
                  <svg
                    className="w-6 h-6"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Hình tiếp theo"
                >
                  <svg
                    className="w-6 h-6"
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

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {currentImage + 1} / {images.length}
            </div>

            {/* Click to expand hint */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Click hình để phóng to
            </div>
          </div>

          {/* Thumbnail Gallery - Only show if more than 1 image */}
          {images.length > 1 && (
            <div className="p-4 bg-gray-50">
              {/* Thumbnail grid for all screen sizes */}
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative h-16 w-20 md:h-20 md:w-28 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all transform ${
                      index === currentImage
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${title} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />
                    {/* Active indicator - Border instead of background */}
                    {index === currentImage && (
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Show all thumbnails button if more than 8 images */}
              {images.length > 8 && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={openModal}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Xem tất cả {images.length} hình ảnh
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Controls Help Text */}
          {images.length > 1 && (
            <div className="px-4 pb-3 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                <span className="hidden md:inline">Sử dụng phím ← → hoặc </span>
                Kéo ngang hoặc click vào hình nhỏ để chuyển ảnh • Click vào hình
                chính để phóng to
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <ImageModal
        images={images}
        currentIndex={currentImage}
        isOpen={isModalOpen}
        onClose={closeModal}
        title={title}
      />
    </>
  );
}
