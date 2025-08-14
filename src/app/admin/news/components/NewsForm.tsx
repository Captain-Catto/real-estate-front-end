import React, { useState } from "react";
import ImprovedQuillEditor from "@/components/admin/ImprovedQuillEditor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Service để gọi API
import { newsService } from "@/services/newsService";

interface NewsFormProps {
  initialValues?: {
    title?: string;
    content?: string;
    category?: string;
  };
}

export default function NewsForm({ initialValues = {} }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialValues.title || "",
    content: initialValues.content || "",
    category: initialValues.category || "",
  });

  // State để lưu trữ thông tin về các hình ảnh cần upload
  const [pendingImages, setPendingImages] = useState<{
    [key: string]: {
      file: File;
      previewUrl: string;
    };
  }>({});

  // Xử lý khi thêm hình ảnh mới vào editor
  const handleImageAdd = (file: File, previewUrl: string, imageId: string) => {
    setPendingImages((prev) => ({
      ...prev,
      [imageId]: { file, previewUrl },
    }));
  };

  // Xử lý khi xóa hình ảnh khỏi editor
  const handleImageRemove = (imageId: string) => {
    setPendingImages((prev) => {
      const newPendingImages = { ...prev };
      delete newPendingImages[imageId];
      return newPendingImages;
    });
  };

  // Xử lý thay đổi các trường input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý thay đổi nội dung editor
  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề tin tức");
      return;
    }

    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      toast.error("Vui lòng nhập nội dung tin tức");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Upload tất cả các hình ảnh và lấy về URL từ server
      const imageUploadPromises = Object.entries(pendingImages).map(
        async ([imageId, { file }]) => {
          const formData = new FormData();
          formData.append("image", file);

          // Gọi API upload ảnh
          const response = await newsService.uploadNewsImage(formData);

          // Trả về object chứa imageId và URL thật từ server
          return {
            imageId,
            serverUrl: response.data?.url || "",
          };
        }
      );

      // Đợi tất cả các hình ảnh upload xong
      const uploadedImages = await Promise.all(imageUploadPromises);

      // 2. Thay thế các URL tạm thời trong nội dung bằng URL thật từ server
      let finalContent = formData.content;
      uploadedImages.forEach(({ imageId, serverUrl }) => {
        // Thay thế data-image-id trong HTML
        const regex = new RegExp(
          `data-image-id="${imageId}"[^>]*src="[^"]*"`,
          "g"
        );
        finalContent = finalContent.replace(
          regex,
          `data-image-id="${imageId}" src="${serverUrl}"`
        );
      });

      // 3. Tạo tin tức mới với nội dung đã cập nhật URL hình ảnh
      const newsData = {
        title: formData.title,
        content: finalContent,
        category: formData.category,
        // Thêm các trường khác nếu cần
      };

      // Gọi API tạo tin tức
      await newsService.createNews(newsData);

      toast.success("Đăng tin thành công!");
      router.push("/admin/news");
    } catch (error) {
      console.error("Lỗi khi đăng tin:", error);
      toast.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tiêu đề
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tiêu đề tin tức"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Danh mục
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn danh mục --</option>
          <option value="mua-ban">Mua bán</option>
          <option value="cho-thue">Cho thuê</option>
          <option value="tai-chinh">Tài chính</option>
          <option value="phong-thuy">Phong thủy</option>
          <option value="tong-hop">Tổng hợp</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nội dung
        </label>
        <ImprovedQuillEditor
          value={formData.content}
          onChange={handleEditorChange}
          placeholder="Nhập nội dung tin tức..."
          height="400px"
          maxImageWidth={800}
          imageQuality={0.8}
          onImageAdd={handleImageAdd}
          onImageRemove={handleImageRemove}
          isSubmitting={isSubmitting}
          deferImageUpload={true}
        />

        {/* Hiển thị số lượng hình ảnh đang chờ upload */}
        {Object.keys(pendingImages).length > 0 && (
          <div className="mt-2 text-sm text-blue-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {Object.keys(pendingImages).length} hình ảnh sẽ được tải lên khi
              đăng tin
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-3">
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            "Đăng tin"
          )}
        </button>
      </div>
    </form>
  );
}
