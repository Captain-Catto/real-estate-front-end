"use client";
import React, { useRef, useState, useEffect } from "react";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  maxImageWidth?: number;
  imageQuality?: number;
}

export default function QuillEditor({
  value = "",
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
  height = "300px",
  maxImageWidth = 800,
  imageQuality = 0.8,
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Chỉ khởi tạo nội dung ban đầu 1 lần
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange?.(newContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt("Nhập URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertImageFromUrl = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  // Hàm resize và compress hình ảnh
  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

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

  // Insert image vào editor
  const insertImageIntoEditor = (
    imageUrl: string,
    altText: string = "Image"
  ) => {
    const imgElement = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; margin: 0.5rem 0; border-radius: 0.375rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />`;

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
        const loadingNode = tempDiv.firstChild;

        if (loadingNode) {
          range.insertNode(loadingNode);
          range.setStartAfter(loadingNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
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

  // Chức năng upload hình ảnh từ máy tính với resize
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        // Hiển thị loading
        showLoadingElement();

        // Resize và compress image
        const compressedImageUrl = await resizeAndCompressImage(file);

        // Xóa loading
        removeLoadingElement();

        // Insert image
        insertImageIntoEditor(compressedImageUrl, "Uploaded image");
      } catch (error) {
        console.error("Error processing image:", error);
        removeLoadingElement();
        alert("Có lỗi xảy ra khi xử lý hình ảnh. Vui lòng thử lại!");
      }
    }

    // Reset input để có thể chọn cùng file lần nữa
    event.target.value = "";
  };

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  // Xử lý paste hình ảnh với resize
  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        event.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          try {
            showLoadingElement();
            const compressedImageUrl = await resizeAndCompressImage(blob);
            removeLoadingElement();
            insertImageIntoEditor(compressedImageUrl, "Pasted image");
          } catch (error) {
            console.error("Error processing pasted image:", error);
            removeLoadingElement();
            alert("Có lỗi xảy ra khi xử lý hình ảnh paste. Vui lòng thử lại!");
          }
        }
        break;
      }
    }
  };

  // Xử lý drag & drop hình ảnh với resize
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    for (const file of imageFiles) {
      try {
        showLoadingElement();
        const compressedImageUrl = await resizeAndCompressImage(file);
        removeLoadingElement();
        insertImageIntoEditor(compressedImageUrl, "Dropped image");
      } catch (error) {
        console.error("Error processing dropped image:", error);
        removeLoadingElement();
        alert(
          "Có lỗi xảy ra khi xử lý hình ảnh drag & drop. Vui lòng thử lại!"
        );
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div
      className={`border border-gray-300 rounded-lg bg-white shadow-sm ${className}`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 rounded-t-lg text-sm">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => execCommand("undo")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Undo (Ctrl+Z)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => execCommand("redo")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Redo (Ctrl+Y)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
              />
            </svg>
          </button>
        </div>

        {/* Format */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <select
            onChange={(e) => execCommand("formatBlock", e.target.value)}
            className="text-xs border rounded px-2 py-1"
            defaultValue=""
          >
            <option value="">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <select
            onChange={(e) => execCommand("fontName", e.target.value)}
            className="text-xs border rounded px-2 py-1"
            defaultValue="Arial"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>

          <select
            onChange={(e) => execCommand("fontSize", e.target.value)}
            className="text-xs border rounded px-2 py-1"
            defaultValue="3"
          >
            <option value="1">8pt</option>
            <option value="2">10pt</option>
            <option value="3">12pt</option>
            <option value="4">14pt</option>
            <option value="5">18pt</option>
            <option value="6">24pt</option>
            <option value="7">36pt</option>
          </select>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            className="px-2 py-1 hover:bg-gray-200 rounded font-bold"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            className="px-2 py-1 hover:bg-gray-200 rounded italic"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand("underline")}
            className="px-2 py-1 hover:bg-gray-200 rounded underline"
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => execCommand("strikeThrough")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </button>
        </div>

        {/* Color */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <input
            type="color"
            onChange={(e) => execCommand("foreColor", e.target.value)}
            className="w-8 h-8 border rounded cursor-pointer"
            title="Text Color"
          />
          <input
            type="color"
            onChange={(e) => execCommand("backColor", e.target.value)}
            className="w-8 h-8 border rounded cursor-pointer"
            title="Background Color"
          />
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => execCommand("insertUnorderedList")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCommand("insertOrderedList")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => execCommand("justifyLeft")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Align Left"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyCenter")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Align Center"
          >
            ↔️
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyRight")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Align Right"
          >
            ➡️
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyFull")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Justify"
          >
            ↕️
          </button>
        </div>

        {/* Insert */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={insertLink}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Insert Link"
          >
            🔗
          </button>

          {/* Dropdown cho hình ảnh */}
          <div className="relative group">
            <button
              type="button"
              className="px-2 py-1 hover:bg-gray-200 rounded flex items-center gap-1"
              title={`Insert Image (Max: ${maxImageWidth}px, Quality: ${Math.round(
                imageQuality * 100
              )}%)`}
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

            <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                type="button"
                onClick={openImagePicker}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b"
              >
                📁 Upload từ máy tính
                <div className="text-xs text-gray-500 mt-1">
                  Tự động resize xuống {maxImageWidth}px
                </div>
              </button>
              <button
                type="button"
                onClick={insertImageFromUrl}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                🌐 Từ URL
                <div className="text-xs text-gray-500 mt-1">
                  Giữ nguyên kích thước gốc
                </div>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => execCommand("insertHorizontalRule")}
            className="px-2 py-1 hover:bg-gray-200 rounded"
            title="Insert HR"
          >
            ➖
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="p-4 outline-none"
        style={{
          minHeight: height,
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "normal",
        }}
        dir="ltr"
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

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
