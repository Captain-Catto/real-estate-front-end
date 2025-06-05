"use client";
import React, { useState } from "react";
import Image from "next/image";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        {/* Main Image */}
        <div className="relative h-120 w-full mb-2 rounded-xl overflow-hidden">
          <Image
            src={images[currentImage]}
            alt={`${title} - Image ${currentImage + 1}`}
            fill
          />

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev > 0 ? prev - 1 : images.length - 1
                  )
                }
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev < images.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentImage + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto">
              {images.slice(0, 6).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    currentImage === index
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
              {images.length > 6 && (
                <button className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-300">
                  +{images.length - 6}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
