"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Import dynamic để tránh lỗi SSR
const ImprovedQuillEditor = dynamic(
  () => import("@/components/admin/ImprovedQuillEditor"),
  { ssr: false }
);

interface NewsEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  onImageFilesChange?: (files: File[]) => void;
}

// Interface để lưu trữ thông tin hình ảnh
interface PendingImageInfo {
  id: string;
  file: File;
  previewUrl: string;
}

export default React.forwardRef<any, NewsEditorProps>(function NewsEditor(
  { initialContent = "", onChange, onImageFilesChange },
  ref
) {
  const [editorContent, setEditorContent] = useState(initialContent);
  const [pendingImages, setPendingImages] = useState<PendingImageInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cập nhật nội dung khi người dùng thay đổi
  const handleContentChange = (content: string) => {
    setEditorContent(content);
    onChange(content);

    // Kiểm tra nội dung để xóa những hình ảnh đã bị xóa khỏi editor
    checkAndRemoveDeletedImages(content);
  };

  // Xử lý khi thêm hình ảnh mới
  const handleImageAdd = (file: File, previewUrl: string, imageId: string) => {
    console.log(`Đã thêm hình ảnh (${imageId}) - sẽ upload khi submit form`);

    // Thêm hình ảnh vào danh sách chờ
    setPendingImages((prev) => [...prev, { id: imageId, file, previewUrl }]);
  };

  // Xử lý khi xóa hình ảnh
  const handleImageRemove = (imageId: string) => {
    console.log(`Đã xóa hình ảnh (${imageId})`);

    // Xóa hình ảnh khỏi danh sách chờ
    setPendingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Kiểm tra và xóa hình ảnh đã bị xóa khỏi nội dung
  const checkAndRemoveDeletedImages = (content: string) => {
    // Kiểm tra tất cả ID hình ảnh trong danh sách chờ
    pendingImages.forEach((img) => {
      // Nếu ID không còn trong nội dung, xóa khỏi danh sách chờ
      if (!content.includes(`data-image-id="${img.id}"`)) {
        handleImageRemove(img.id);
      }
    });
  };

  // Khi pendingImages thay đổi, gọi callback để cập nhật files
  useEffect(() => {
    if (onImageFilesChange) {
      const files = pendingImages.map((img) => img.file);
      onImageFilesChange(files);
    }
  }, [pendingImages, onImageFilesChange]);

  // Phương thức để upload hình ảnh khi submit form
  const submitWithImages = async (
    uploadHandler: (file: File) => Promise<string>
  ) => {
    try {
      setIsSubmitting(true);

      if (pendingImages.length === 0) {
        // Không có hình ảnh nào cần upload
        return {
          success: true,
          content: editorContent,
          imageUrls: [],
        };
      }

      // Upload tất cả hình ảnh lên server sử dụng handler được truyền vào
      const imagePromises = pendingImages.map(async (img) => {
        try {
          // Upload hình ảnh sử dụng hàm handler từ component cha
          const uploadedUrl = await uploadHandler(img.file);

          // Thay thế URL tạm thời bằng URL thật trong nội dung
          const updatedContent = editorContent.replace(
            new RegExp(
              `src="${img.previewUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
              "g"
            ),
            `src="${uploadedUrl}"`
          );

          // Cập nhật nội dung editor
          setEditorContent(updatedContent);
          onChange(updatedContent);

          return {
            id: img.id,
            originalUrl: img.previewUrl,
            uploadedUrl,
          };
        } catch (error) {
          console.error(`Lỗi khi upload hình ảnh ${img.id}:`, error);
          throw error;
        }
      });

      // Đợi tất cả hình ảnh upload xong
      const results = await Promise.all(imagePromises);

      // Xóa danh sách hình ảnh chờ vì đã upload xong
      setPendingImages([]);

      // Trả về kết quả
      return {
        success: true,
        content: editorContent,
        uploadResults: results,
      };
    } catch (error) {
      console.error("Lỗi khi upload hình ảnh:", error);
      return {
        success: false,
        error: "Không thể upload hình ảnh",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cung cấp phương thức cho component cha để sử dụng
  React.useImperativeHandle(
    ref,
    () => ({
      submitWithImages,
      getPendingImages: () => pendingImages,
      getContent: () => editorContent,
    }),
    [submitWithImages, pendingImages, editorContent]
  );

  return (
    <div className="news-editor-container">
      <ImprovedQuillEditor
        value={editorContent}
        onChange={handleContentChange}
        onImageAdd={handleImageAdd}
        onImageRemove={handleImageRemove}
        deferImageUpload={true}
        isSubmitting={isSubmitting}
        placeholder="Nhập nội dung tin tức..."
      />

      {pendingImages.length > 0 && (
        <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded">
          <p className="font-medium">
            Đã thêm {pendingImages.length} hình ảnh chưa được lưu
          </p>
          <p className="text-sm">
            Hình ảnh sẽ được tự động tải lên khi bạn đăng hoặc cập nhật tin
          </p>
        </div>
      )}
    </div>
  );
});
