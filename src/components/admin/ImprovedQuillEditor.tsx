"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { nanoid } from "nanoid"; // Nếu không có, cần cài đặt: npm install nanoid
import { showErrorToast } from "@/utils/errorHandler";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  maxImageWidth?: number;
  imageQuality?: number;
  onImageAdd?: (imageFile: File, previewUrl: string, imageId: string) => void;
  onImageRemove?: (imageId: string) => void;
  isSubmitting?: boolean;
  deferImageUpload?: boolean;
}

// Lưu trữ các hình ảnh đã được thêm nhưng chưa upload
interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImprovedQuillEditor({
  value = "",
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
  height = "300px",
  maxImageWidth = 800,
  imageQuality = 0.7,
  onImageAdd,
  onImageRemove: _onImageRemove, // eslint-disable-line @typescript-eslint/no-unused-vars
  isSubmitting = false,
  deferImageUpload = true,
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // State để theo dõi các hình ảnh chưa upload
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // Ref để tham chiếu đến dropdown menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  // State để theo dõi trạng thái đóng/mở của dropdown
  const [imageDropdownActive, setImageDropdownActive] = useState(true);

  // Khởi tạo editor
  useEffect(() => {
    if (!isInitialized && editorRef.current) {
      setIsInitialized(true);

      // Store ref value for cleanup
      const currentEditor = editorRef.current;

      // Đặt nội dung ban đầu nếu có
      if (value) {
        currentEditor.innerHTML = value;
      }

      // Thêm sự kiện input để cập nhật khi người dùng chỉnh sửa
      currentEditor.addEventListener("input", handleInput);

      // Thêm sự kiện paste để xử lý hình ảnh được paste
      currentEditor.addEventListener("paste", handlePaste);

      // Thêm sự kiện keydown để xử lý tab và shift+tab
      currentEditor.addEventListener("keydown", handleKeyDown);

      // Thiết lập placeholder nếu rỗng
      if (!value) {
        currentEditor.setAttribute("data-placeholder", placeholder);
      }

      // Cleanup khi component unmount
      return () => {
        currentEditor.removeEventListener("input", handleInput);
        currentEditor.removeEventListener("paste", handlePaste);
        currentEditor.removeEventListener("keydown", handleKeyDown);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, value, placeholder]);

  // Xử lý khi nội dung thay đổi
  const handleInput = useCallback(() => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Xử lý khi nhấn phím tab
  const handleKeyDown = (e: KeyboardEvent) => {
    // Tab key
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  };

  // Hiển thị loading element
  const showLoadingElement = () => {
    const loadingElement = `<div class="image-loading" style="padding: 1rem; text-align: center; background: #f3f4f6; border-radius: 0.5rem; margin: 0.5rem 0; border: 2px dashed #d1d5db;">
      <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #3b82f6; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
      <span style="margin-left: 0.5rem; color: #6b7280; font-size: 14px;">Đang xử lý hình ảnh...</span>
    </div>`;

    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = loadingElement;
        range.insertNode(tempDiv.firstChild!);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.innerHTML += loadingElement;
      }
      handleInput();
    }
  };

  // Xóa loading element
  const removeLoadingElement = () => {
    if (editorRef.current) {
      const loadingDiv = editorRef.current.querySelector(".image-loading");
      if (loadingDiv) {
        loadingDiv.remove();
        handleInput();
      }
    }
  };

  // Resize và compress hình ảnh
  const resizeAndCompressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        try {
          // Tính toán kích thước mới
          let { width, height } = img;

          // Nếu width lớn hơn maxImageWidth, resize theo tỷ lệ
          if (width > maxImageWidth) {
            const ratio = maxImageWidth / width;
            width = maxImageWidth;
            height = height * ratio;
          }

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Draw và resize image
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 với chất lượng được compress
          const compressedDataUrl = canvas.toDataURL(
            "image/jpeg",
            imageQuality
          );
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Load file vào image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  };

  // Insert image vào editor với ID duy nhất
  const insertImageIntoEditor = (
    imageUrl: string,
    altText: string = "Image",
    imageId: string
  ) => {
    const imgElement = `<img 
      src="${imageUrl}" 
      alt="${altText}" 
      data-image-id="${imageId}"
      style="max-width: 100%; height: auto; margin: 0.5rem 0; border-radius: 0.375rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" 
    />`;

    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = imgElement;
        const imgNode = tempDiv.firstChild;

        if (imgNode) {
          range.insertNode(imgNode);
          range.setStartAfter(imgNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        // Nếu không có selection, thêm vào cuối
        editorRef.current.innerHTML += imgElement;
      }

      handleInput();
      editorRef.current.focus();
    }
  };

  // Chức năng upload hình ảnh từ máy tính với xử lý chờ
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        // Hiển thị loading
        showLoadingElement();

        // Vô hiệu hóa dropdown sau khi chọn ảnh
        setImageDropdownActive(false);

        // Đảm bảo dropdown bị ẩn ngay lập tức sau khi chọn ảnh
        const imageDropdownContainer = document.getElementById(
          "image-dropdown-container"
        );
        if (imageDropdownContainer) {
          imageDropdownContainer.classList.add("pointer-events-none");
        }

        if (dropdownRef.current) {
          dropdownRef.current.classList.add("hidden");
          dropdownRef.current.classList.remove("opacity-100");
          dropdownRef.current.classList.remove("visible");
          dropdownRef.current.classList.remove("group-hover:opacity-100");
          dropdownRef.current.classList.remove("group-hover:visible");
        }

        // Resize và compress image để hiển thị preview
        const compressedImageUrl = await resizeAndCompressImage(file);

        // Tạo ID duy nhất cho hình ảnh này
        const imageId = nanoid();

        // Xóa loading
        removeLoadingElement();

        if (deferImageUpload && onImageAdd) {
          // Nếu dùng chế độ defer upload, thì thêm vào danh sách chờ
          setPendingImages((prev) => [
            ...prev,
            {
              id: imageId,
              file,
              previewUrl: compressedImageUrl,
            },
          ]);

          // Thông báo cho component cha về hình ảnh mới
          onImageAdd(file, compressedImageUrl, imageId);
        }

        // Insert image vào editor
        insertImageIntoEditor(compressedImageUrl, "Uploaded image", imageId);

        // Sau một khoảng thời gian mới cho phép hiển thị lại dropdown
        setTimeout(() => {
          setImageDropdownActive(true);
          if (imageDropdownContainer) {
            imageDropdownContainer.classList.remove("pointer-events-none");
          }
        }, 2000);
      } catch {
        showErrorToast("Có lỗi xảy ra khi xử lý hình ảnh. Vui lòng thử lại!");
        removeLoadingElement();
        setImageDropdownActive(true);
      }
    }

    // Reset input để có thể chọn cùng file lần nữa
    event.target.value = "";
  };

  // Mở image picker
  const openImagePicker = () => {
    // Vô hiệu hóa dropdown sau khi chọn tệp
    setImageDropdownActive(false);
    fileInputRef.current?.click();

    // Đóng dropdown sau khi người dùng đã click chọn ảnh
    if (dropdownRef.current) {
      dropdownRef.current.classList.add("hidden");
      dropdownRef.current.classList.remove("group-hover:opacity-100");
      dropdownRef.current.classList.remove("group-hover:visible");
    }

    // Tạm thời vô hiệu hóa tất cả hover behavior
    const container = document.getElementById("image-dropdown-container");
    if (container) {
      container.classList.add("pointer-events-none");

      // Cho phép hover trở lại sau một khoảng thời gian
      setTimeout(() => {
        setImageDropdownActive(true);
        container.classList.remove("pointer-events-none");
      }, 2000);
    }
  };

  // Xử lý paste hình ảnh với resize
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          event.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            try {
              showLoadingElement();

              // Tạo ID duy nhất cho hình ảnh
              const imageId = nanoid();

              const compressedImageUrl = await resizeAndCompressImage(blob);

              if (deferImageUpload && onImageAdd) {
                // Thêm vào danh sách chờ nếu sử dụng chế độ defer upload
                setPendingImages((prev) => [
                  ...prev,
                  {
                    id: imageId,
                    file: blob,
                    previewUrl: compressedImageUrl,
                  },
                ]);

                // Thông báo cho component cha về hình ảnh mới
                onImageAdd(blob, compressedImageUrl, imageId);
              }

              removeLoadingElement();
              insertImageIntoEditor(
                compressedImageUrl,
                "Pasted image",
                imageId
              );
            } catch {
              removeLoadingElement();
              showErrorToast(
                "Có lỗi xảy ra khi xử lý hình ảnh paste. Vui lòng thử lại!"
              );
            }
          }
          break;
        }
      }
    },
    [maxImageWidth, imageQuality, onImageAdd, deferImageUpload]
  );

  // Xử lý khi component đang submit form
  useEffect(() => {
    if (isSubmitting && pendingImages.length > 0) {
      console.log(
        "Đang submit form, sẽ xử lý upload các hình ảnh còn lại",
        pendingImages
      );
      // Các hàm xử lý upload sẽ được xử lý ở component cha thông qua onImageAdd callback
    }
  }, [isSubmitting, pendingImages]);

  return (
    <div className={`quill-editor-container ${className}`}>
      <div className="editor-toolbar flex flex-wrap items-center p-1 gap-1 bg-gray-50 border border-gray-300 rounded-t">
        {/* Định dạng văn bản */}
        <div className="format-group flex items-center border-r border-gray-300 pr-1 mr-1">
          <button
            type="button"
            onClick={() => document.execCommand("bold")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="In đậm"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => document.execCommand("italic")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="In nghiêng"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => document.execCommand("underline")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Gạch chân"
          >
            <span className="underline">U</span>
          </button>
        </div>

        {/* Heading */}
        <div className="heading-group border-r border-gray-300 pr-1 mr-1">
          <select
            onChange={(e) => {
              if (e.target.value) {
                document.execCommand("formatBlock", false, e.target.value);
                e.target.value = ""; // Reset giá trị select
              }
            }}
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            <option value="">Heading</option>
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
            <option value="h5">H5</option>
            <option value="h6">H6</option>
            <option value="p">Paragraph</option>
          </select>
        </div>

        {/* Căn chỉnh */}
        <div className="align-group flex items-center border-r border-gray-300 pr-1 mr-1">
          <button
            type="button"
            onClick={() => document.execCommand("justifyLeft")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Căn trái"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => document.execCommand("justifyCenter")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Căn giữa"
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => document.execCommand("justifyRight")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Căn phải"
          >
            →
          </button>
        </div>

        {/* Danh sách */}
        <div className="list-group flex items-center border-r border-gray-300 pr-1 mr-1">
          <button
            type="button"
            onClick={() => document.execCommand("insertUnorderedList")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Danh sách không thứ tự"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => document.execCommand("insertOrderedList")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Danh sách có thứ tự"
          >
            1. List
          </button>
        </div>

        {/* Thêm hình ảnh */}
        <div className="image-group flex items-center">
          {/* Dropdown cho hình ảnh */}
          <div
            className={`relative group ${
              imageDropdownActive ? "" : "no-hover"
            }`}
            id="image-dropdown-container"
          >
            <button
              type="button"
              className="px-2 py-1 hover:bg-gray-200 rounded flex items-center gap-1"
              title={`Insert Image (Max: ${maxImageWidth}px, Quality: ${Math.round(
                imageQuality * 100
              )}%)`}
              onClick={() => {
                if (!imageDropdownActive) return;

                // Toggle dropdown visibility
                if (dropdownRef.current) {
                  if (dropdownRef.current.classList.contains("hidden")) {
                    // Show dropdown
                    dropdownRef.current.classList.remove("hidden");
                    dropdownRef.current.classList.add("opacity-100");
                    dropdownRef.current.classList.add("visible");
                    dropdownRef.current.classList.add(
                      "group-hover:opacity-100"
                    );
                    dropdownRef.current.classList.add("group-hover:visible");
                  } else {
                    // Hide dropdown
                    dropdownRef.current.classList.add("hidden");
                    dropdownRef.current.classList.remove("opacity-100");
                    dropdownRef.current.classList.remove("visible");
                  }
                }
              }}
            >
              📷
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              ref={dropdownRef}
              className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
            >
              <button
                type="button"
                onClick={openImagePicker}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b"
              >
                📁 Upload từ máy tính
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Nhập URL hình ảnh:");
                  if (url) {
                    const imageId = nanoid();
                    insertImageIntoEditor(url, "Image from URL", imageId);
                  }
                  // Đóng dropdown
                  if (dropdownRef.current) {
                    dropdownRef.current.classList.add("hidden");
                  }
                }}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                🌐 Chèn từ URL
              </button>
            </div>
          </div>
        </div>

        {/* Nút xóa định dạng */}
        <div className="clear-format-group ml-auto">
          <button
            type="button"
            onClick={() => document.execCommand("removeFormat")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Xóa định dạng"
          >
            Aa
          </button>
        </div>

        {/* Input ẩn để upload file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable
        style={{ height, minHeight: "150px" }}
        className="p-3 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-300 rounded-b overflow-y-auto"
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      ></div>

      {/* Hiển thị số lượng hình ảnh đang chờ upload */}
      {pendingImages.length > 0 && (
        <div className="mt-2 text-sm text-blue-600">
          Đã thêm {pendingImages.length} hình ảnh sẽ được tải lên khi đăng tin
        </div>
      )}

      <style jsx global>{`
        /* Animation cho loading */
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* CSS cho editor */
        [contenteditable] {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
        }

        [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          direction: ltr !important;
          display: block;
        }

        [contenteditable] * {
          direction: ltr !important;
          unicode-bidi: normal !important;
        }

        [contenteditable] h1,
        [contenteditable] h2,
        [contenteditable] h3,
        [contenteditable] h4,
        [contenteditable] h5,
        [contenteditable] h6 {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
        }

        [contenteditable] h1 {
          font-size: 2rem !important;
          font-weight: bold !important;
          margin-bottom: 1rem !important;
        }

        [contenteditable] h2 {
          font-size: 1.5rem !important;
          font-weight: bold !important;
          margin-bottom: 0.75rem !important;
        }

        [contenteditable] h3 {
          font-size: 1.25rem !important;
          font-weight: bold !important;
          margin-bottom: 0.5rem !important;
        }

        [contenteditable] h4 {
          font-size: 1.125rem !important;
          font-weight: bold !important;
          margin-bottom: 0.5rem !important;
        }

        [contenteditable] h5 {
          font-size: 1rem !important;
          font-weight: bold !important;
          margin-bottom: 0.25rem !important;
        }

        [contenteditable] h6 {
          font-size: 0.875rem !important;
          font-weight: bold !important;
          margin-bottom: 0.25rem !important;
        }

        [contenteditable] p {
          direction: ltr !important;
          text-align: left !important;
          margin-bottom: 1rem !important;
          unicode-bidi: normal !important;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          padding-left: 1.5rem !important;
          margin-bottom: 1rem !important;
          direction: ltr !important;
          text-align: left !important;
        }

        [contenteditable] li {
          margin-bottom: 0.25rem !important;
          direction: ltr !important;
          text-align: left !important;
        }

        [contenteditable] a {
          color: #2563eb !important;
          text-decoration: underline !important;
          direction: ltr !important;
        }

        [contenteditable] a:hover {
          color: #1d4ed8 !important;
        }

        /* Image styling với responsive */
        [contenteditable] img {
          max-width: 100% !important;
          height: auto !important;
          margin: 0.5rem 0 !important;
          border-radius: 0.375rem !important;
          cursor: pointer !important;
          display: block !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.2s ease !important;
        }

        [contenteditable] img:hover {
          opacity: 0.9 !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
          transform: scale(1.02) !important;
        }

        [contenteditable] hr {
          border: none !important;
          border-top: 1px solid #e5e7eb !important;
          margin: 1rem 0 !important;
        }

        /* Style cho loading element */
        .image-loading {
          user-select: none !important;
          pointer-events: none !important;
        }

        /* Fix cho browser webkit */
        [contenteditable] {
          -webkit-writing-mode: horizontal-tb !important;
          writing-mode: horizontal-tb !important;
        }

        /* Hover effect cho image dropdown */
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1 !important;
        }

        .group:hover .group-hover\\:visible {
          visibility: visible !important;
        }

        /* Ẩn dropdown khi có class hidden */
        .hidden {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Tắt hover cho dropdown sau khi chọn ảnh */
        .no-hover:hover .group-hover\\:opacity-100,
        .no-hover:hover .group-hover\\:visible {
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* CSS cho vô hiệu hóa sự kiện hover/click */
        .pointer-events-none {
          pointer-events: none !important;
        }

        /* Responsive cho mobile */
        @media (max-width: 768px) {
          [contenteditable] img {
            margin: 0.25rem 0 !important;
          }

          .group .absolute {
            right: 0 !important;
            left: auto !important;
          }
        }

        /* Strong và em styling */
        [contenteditable] strong,
        [contenteditable] b {
          font-weight: 700 !important;
        }

        [contenteditable] em,
        [contenteditable] i {
          font-style: italic !important;
        }

        [contenteditable] u {
          text-decoration: underline !important;
        }

        [contenteditable] [style*="line-through"] {
          text-decoration: line-through !important;
        }
      `}</style>
    </div>
  );
}
