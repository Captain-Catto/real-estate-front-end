"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NewsEditor from "@/components/admin/NewsEditor";
import { UploadService } from "@/services/uploadService";
import { toast } from "sonner";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";

interface NewsFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
}

function CreateNewsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    image: "",
  });

  // State để lưu trữ hình ảnh chờ upload
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  // State để lưu trữ các hình ảnh từ editor
  const [contentImages, setContentImages] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý khi người dùng chọn ảnh đại diện
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);

      // Tạo URL để preview
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cập nhật state cho các trường văn bản
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cập nhật nội dung từ editor
  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  // Cập nhật danh sách hình ảnh từ editor
  const handleEditorImagesChange = (files: File[]) => {
    setContentImages(files);
  };

  // Xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // 1. Upload ảnh đại diện
      let coverImageUrl = "";
      if (coverImage) {
        const coverResult = await UploadService.uploadImage(coverImage);
        if (coverResult.success && coverResult.data?.url) {
          coverImageUrl = coverResult.data.url;
        } else {
          throw new Error("Không thể tải lên ảnh đại diện");
        }
      }

      // 2. Upload các hình ảnh trong nội dung
      const contentImagePromises = contentImages.map((file) =>
        UploadService.uploadImage(file)
      );

      await Promise.all(contentImagePromises);

      // 3. Tạo bài viết
      // Lưu ý: HTML content đã có URL hình ảnh do chúng được hiển thị trước
      // khi đăng, không cần thay thế URL trong nội dung
      const createNewsData = {
        ...formData,
        image: coverImageUrl, // URL ảnh đại diện đã upload
      };

      // Gọi API để tạo bài viết
      // const result = await newsService.createNews(createNewsData);
      console.log("Creating news with data:", createNewsData);

      // Giả lập thành công
      toast.success("Tạo bài viết thành công!");
      router.push("/admin/news");
    } catch {
      toast.error("Lỗi khi tạo bài viết mới");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tạo bài viết mới</h1>

      <form onSubmit={handleSubmit}>
        {/* Tiêu đề */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Mô tả ngắn */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Mô tả ngắn <span className="text-red-500">*</span>
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Chọn ảnh đại diện */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Ảnh đại diện <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="mb-2"
          />

          {coverImagePreview && (
            <div className="mt-2 relative">
              <Image
                src={coverImagePreview}
                alt="Preview"
                width={320}
                height={160}
                className="h-40 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => {
                  setCoverImage(null);
                  setCoverImagePreview("");
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                X
              </button>
            </div>
          )}
        </div>

        {/* Danh mục */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">-- Chọn danh mục --</option>
            <option value="mua-ban">Mua bán</option>
            <option value="cho-thue">Cho thuê</option>
            <option value="tai-chinh">Tài chính</option>
            <option value="phong-thuy">Phong thủy</option>
            <option value="tong-hop">Tổng hợp</option>
            <option value="tai-chinh">Tin tức tài chính</option>
            <option value="phong-thuy">Phong thủy nhà đất</option>
            <option value="mua-ban">Tin tức mua bán</option>
            <option value="cho-thue">Tin tức cho thuê</option>
          </select>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Tags (ngăn cách bởi dấu phẩy)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags.join(",")}
            onChange={(e) => {
              const tagsInput = e.target.value;
              const tagsArray = tagsInput
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "");
              setFormData((prev) => ({ ...prev, tags: tagsArray }));
            }}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Editor nội dung */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <NewsEditor
            initialContent={formData.content}
            onChange={handleEditorChange}
            onImageFilesChange={handleEditorImagesChange}
          />

          {contentImages.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {contentImages.length} hình ảnh sẽ được tải lên khi đăng bài
            </p>
          )}
        </div>

        {/* Nút submit */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng bài"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Wrap component with AdminGuard
export default function ProtectedCreateNewsPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.DASHBOARD.VIEW]}>
      <CreateNewsPage />
    </AdminGuard>
  );
}
