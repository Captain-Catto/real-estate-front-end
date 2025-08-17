import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface ImageUploadStepProps {
  selectedImages: File[];
  setSelectedImages: (images: File[]) => void;
  existingImages?: string[]; // URLs of existing images from the post
  updateFormData?: (updates: { images?: string[] }) => void; // Function to update parent's formData
  updateExistingImages?: (images: string[]) => void; // Function to update existingImages in parent
}

export default function ImageUploadStep({
  selectedImages,
  setSelectedImages,
  existingImages = [],
  updateFormData,
  updateExistingImages,
}: ImageUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingImageUrls, setExistingImageUrls] =
    useState<string[]>(existingImages);

  const [failedImages, setFailedImages] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Handle image load error
  const handleImageError = (imageUrl: string) => {
    // Silent error for image loading failures
    setFailedImages((prev) => ({ ...prev, [imageUrl]: true }));
  };

  // Remove an existing image
  const removeExistingImage = (index: number) => {
    const newUrls = existingImageUrls.filter((_, i) => i !== index);
    setExistingImageUrls(newUrls);

    // Update parent's formData if the function is provided
    if (updateFormData) {
      updateFormData({ images: newUrls });
    }

    // Update parent's existingImages state if the function is provided
    if (updateExistingImages) {
      updateExistingImages(newUrls);
    }
  };

  // Move an existing image in the order
  const moveExistingImage = (fromIndex: number, toIndex: number) => {
    const newUrls = [...existingImageUrls];
    const [movedUrl] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, movedUrl);
    setExistingImageUrls(newUrls);

    // Update parent's formData if the function is provided
    if (updateFormData) {
      updateFormData({ images: newUrls });
    }

    // Update parent's existingImages state if the function is provided
    if (updateExistingImages) {
      updateExistingImages(newUrls);
    }
  };

  // Update existingImageUrls when props change
  useEffect(() => {
    console.log("Existing images from props:", existingImages);
    if (Array.isArray(existingImages) && existingImages.length > 0) {
      setExistingImageUrls(existingImages);
      console.log("Set existing image URLs:", existingImages);
    } else {
      console.log("No existing images found or not an array");
    }
  }, [existingImages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Tính tổng số ảnh hiện có (existing + selected)
      const totalCurrentImages =
        existingImageUrls.length + selectedImages.length;
      const remainingSlots = Math.max(0, 20 - totalCurrentImages);

      if (remainingSlots === 0) {
        alert(
          "Bạn đã đạt giới hạn 20 ảnh. Vui lòng xóa một số ảnh cũ trước khi thêm ảnh mới."
        );
        return;
      }

      const filesToAdd = files.slice(0, remainingSlots);
      setSelectedImages([...selectedImages, ...filesToAdd]);

      if (files.length > remainingSlots) {
        alert(
          `Chỉ có thể thêm ${remainingSlots} ảnh nữa. Đã thêm ${filesToAdd.length} ảnh.`
        );
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...selectedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setSelectedImages(newImages);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Hình ảnh tin đăng
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Tải lên tối đa 20 hình ảnh. Hình đầu tiên sẽ là hình đại diện.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-400 mb-4"
          >
            <path
              fill="currentColor"
              d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
            />
          </svg>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Chọn hình ảnh
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Kéo thả hoặc click để chọn file
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG tối đa 5MB mỗi file
          </p>
        </div>
      </div>

      {/* Selected Images */}
      {(selectedImages.length > 0 || existingImageUrls.length > 0) && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Hình ảnh đã chọn ({selectedImages.length + existingImageUrls.length}
            /20)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Display existing images first */}
            {existingImageUrls.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Existing Image ${index + 1}`}
                    className="object-cover w-full h-full"
                    width={200}
                    height={200}
                    onError={() => handleImageError(imageUrl)}
                  />
                  {failedImages[imageUrl] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <span className="text-sm text-gray-500">
                        Không thể tải hình ảnh
                      </span>
                    </div>
                  )}
                </div>

                {/* Image Controls */}
                <div className="absolute inset-0 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveExistingImage(index, index - 1)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Di chuyển lên"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19V5m-7 7l7-7 7 7"
                          />
                        </svg>
                      </button>
                    )}

                    {index < existingImageUrls.length - 1 && (
                      <button
                        onClick={() => moveExistingImage(index, index + 1)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Di chuyển xuống"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v14m-7-7l7 7 7-7"
                          />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => removeExistingImage(index)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Xóa hình"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Main Image Badge */}
                {index === 0 &&
                  existingImageUrls.length > 0 &&
                  selectedImages.length === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                      Hình đại diện
                    </div>
                  )}
              </div>
            ))}

            {/* Display newly selected images */}
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`Image ${index + 1}`}
                    className="object-cover w-full h-full"
                    width={200}
                    height={200}
                  />
                </div>

                {/* Image Controls */}
                <div className="absolute inset-0 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Di chuyển lên"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19V5m-7 7l7-7 7 7"
                          />
                        </svg>
                      </button>
                    )}

                    {index < selectedImages.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Di chuyển xuống"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v14m7-7l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Xóa"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M18 6L6 18M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Ảnh chính
                  </div>
                )}

                {/* Image Number */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Lưu ý khi tải ảnh:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ảnh đầu tiên sẽ là ảnh đại diện của tin đăng</li>
          <li>• Nên chụp ảnh rõ nét, đủ ánh sáng</li>
          <li>• Tránh chụp ảnh mờ, nghiêng hoặc quá tối</li>
          <li>• Ảnh nên thể hiện đầy đủ các khu vực của bất động sản</li>
        </ul>
      </div>
    </div>
  );
}
