"use client";
import React, { useState } from "react";
import Image from "next/image";

interface ProjectGalleryProps {
  images: string[];
  videos?: string[];
  title: string;
}

export function ProjectGallery({
  images,
  videos = [],
  title,
}: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allMedia = [
    ...images.map((img) => ({ type: "image", src: img })),
    ...videos.map((vid) => ({ type: "video", src: vid })),
  ];

  const visibleMedia = allMedia.slice(0, 5);
  const remainingCount = Math.max(0, allMedia.length - 5);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 h-80">
          {/* Main image */}
          <div className="col-span-2 row-span-2 relative group cursor-pointer">
            <Image
              src={visibleMedia[0]?.src || "/images/default-project.jpg"}
              alt={title}
              fill
              className="object-cover rounded-l-lg"
              onClick={() => openModal(0)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-l-lg" />
          </div>

          {/* Side images */}
          {visibleMedia.slice(1, 5).map((media, index) => (
            <div
              key={index + 1}
              className="relative group cursor-pointer"
              onClick={() => openModal(index + 1)}
            >
              <Image
                src={media.src}
                alt={`${title} ${index + 2}`}
                fill
                className={`object-cover ${
                  index === 1
                    ? "rounded-tr-lg"
                    : index === 3
                    ? "rounded-br-lg"
                    : ""
                }`}
              />
              {media.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-play-circle text-white text-2xl"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />

              {/* Show remaining count on last image */}
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center rounded-br-lg">
                  <span className="text-white font-semibold">
                    +{remainingCount} ảnh
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Media count badge */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
          <i className="fas fa-camera mr-1"></i>
          {images.length} ảnh
          {videos.length > 0 && (
            <>
              <i className="fas fa-video ml-2 mr-1"></i>
              {videos.length} video
            </>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl z-10 hover:text-gray-300"
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Navigation buttons */}
            <button
              onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
              disabled={selectedIndex === 0}
              className="absolute left-4 text-white text-2xl z-10 hover:text-gray-300 disabled:opacity-50"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  Math.min(allMedia.length - 1, prev + 1)
                )
              }
              disabled={selectedIndex === allMedia.length - 1}
              className="absolute right-4 text-white text-2xl z-10 hover:text-gray-300 disabled:opacity-50"
            >
              <i className="fas fa-chevron-right"></i>
            </button>

            {/* Main media display */}
            <div className="relative w-4/5 h-4/5">
              {allMedia[selectedIndex]?.type === "video" ? (
                <video
                  src={allMedia[selectedIndex].src}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={
                    allMedia[selectedIndex]?.src ||
                    "/images/default-project.jpg"
                  }
                  alt={`${title} ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 backdrop-blur-sm p-2 rounded-lg">
              {allMedia.slice(0, 10).map((media, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative w-16 h-16 rounded overflow-hidden ${
                    selectedIndex === index ? "ring-2 ring-white" : ""
                  }`}
                >
                  <Image
                    src={media.src}
                    alt={`Thumb ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {media.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fas fa-play text-white text-xs"></i>
                    </div>
                  )}
                </button>
              ))}
              {allMedia.length > 10 && (
                <div className="w-16 h-16 backdrop-blur-sm flex items-center justify-center text-white text-xs rounded">
                  +{allMedia.length - 10}
                </div>
              )}
            </div>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white">
              {selectedIndex + 1} / {allMedia.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
