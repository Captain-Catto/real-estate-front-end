"use client";
import { useState } from "react";
import ImprovedQuillEditor from "@/components/admin/ImprovedQuillEditor";
import { toast } from "sonner";

export default function DemoPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Lưu trữ thông tin về các hình ảnh chờ upload
  const [pendingImages, setPendingImages] = useState<{
    [key: string]: {
      file: File;
      previewUrl: string;
    };
  }>({});

  // Xử lý khi người dùng thêm ảnh vào editor
  const handleImageAdd = (file: File, previewUrl: string, imageId: string) => {
    console.log("Thêm ảnh mới:", { imageId, fileName: file.name });
    setPendingImages((prev) => ({
      ...prev,
      [imageId]: { file, previewUrl },
    }));
  };

  // Xử lý khi người dùng xóa ảnh khỏi editor
  const handleImageRemove = (imageId: string) => {
    console.log("Xóa ảnh:", imageId);
    setPendingImages((prev) => {
      const newPendingImages = { ...prev };
      delete newPendingImages[imageId];
      return newPendingImages;
    });
  };

  // Mô phỏng việc submit form và upload hình ảnh
  const handleSubmit = async () => {
    // Kiểm tra nội dung
    if (!content || content === "<p><br></p>") {
      toast.error("Vui lòng nhập nội dung!");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Mô phỏng upload các hình ảnh (trong thực tế sẽ gọi API)
      console.log(
        `Bắt đầu upload ${Object.keys(pendingImages).length} hình ảnh...`
      );

      // Tạo một delay giả lập để mô phỏng quá trình upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mô phỏng URL hình ảnh từ server
      const uploadedImages = Object.entries(pendingImages).map(
        ([imageId, { file }]) => ({
          imageId,
          serverUrl: `https://example.com/uploads/${file.name}`, // URL giả định từ server
        })
      );

      console.log("Kết quả upload:", uploadedImages);

      // 2. Thay thế URL tạm thời trong nội dung
      let finalContent = content;

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

      // 3. Submit form với nội dung đã cập nhật URL hình ảnh
      console.log("Nội dung cuối cùng để lưu vào database:", finalContent);

      // Reset sau khi submit thành công
      toast.success("Đăng bài thành công!");
      setPendingImages({});
    } catch (error) {
      console.error("Lỗi khi submit:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Demo Trì Hoãn Upload Hình Ảnh</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <ImprovedQuillEditor
            value={content}
            onChange={setContent}
            placeholder="Nhập nội dung với hình ảnh..."
            height="300px"
            maxImageWidth={800}
            imageQuality={0.8}
            onImageAdd={handleImageAdd}
            onImageRemove={handleImageRemove}
            isSubmitting={isSubmitting}
            deferImageUpload={true}
          />
        </div>

        {/* Thông tin về hình ảnh đang chờ upload */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">
            Hình ảnh đang chờ upload: {Object.keys(pendingImages).length}
          </h3>

          {Object.keys(pendingImages).length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(pendingImages).map(
                ([imageId, { previewUrl, file }]) => (
                  <div
                    key={imageId}
                    className="border rounded-md p-2 flex flex-col"
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="mt-2 text-xs text-gray-600 truncate">
                      ID: {imageId.substring(0, 8)}...
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Đang xử lý...
              </>
            ) : (
              "Đăng Bài"
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">Cách Thức Hoạt Động:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Khi thêm hình ảnh, chúng chỉ được hiển thị trước trong editor</li>
          <li>
            Tất cả hình ảnh được lưu vào state <code>pendingImages</code> với ID
            duy nhất
          </li>
          <li>
            Khi bấm "Đăng Bài", tất cả hình ảnh mới được upload lên server
          </li>
          <li>
            Sau khi upload xong, các URL tạm thời trong nội dung được thay thế
            bằng URL thật từ server
          </li>
          <li>
            Cuối cùng, nội dung cập nhật với URL thật được lưu vào database
          </li>
        </ol>
      </div>
    </div>
  );
}
