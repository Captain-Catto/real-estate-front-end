"use client";
import { useRef, useEffect, useState } from "react";
import "quill/dist/quill.snow.css";
// Thêm CSS tùy chỉnh cho QuillEditor
import styles from "./QuillEditor.module.css";
import { showErrorToast } from "@/utils/errorHandler";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange }) => {
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const [editorReady, setEditorReady] = useState(false);
  const toolbarId = useRef(
    `toolbar-${Math.random().toString(36).substring(2, 11)}`
  );

  // Only initialize the editor once
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      quillRef.current &&
      !quillInstance.current
    ) {
      console.log("Initializing Quill editor");
      import("quill").then((Quill) => {
        const QuillClass = Quill.default;

        // Define image handler function
        const handleImageInsert = () => {
          console.log("Image button clicked - opening file dialog");
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              try {
                // Hiển thị loading placeholder
                const range = quillInstance.current.getSelection(true);
                quillInstance.current.insertText(
                  range.index,
                  "Đang tải hình ảnh...",
                  { italic: true }
                );
                quillInstance.current.setSelection(range.index + 20);

                // Tạo FormData để upload file
                const formData = new FormData();
                formData.append("image", file);

                // Upload file lên server - sử dụng UploadService
                try {
                  // Import UploadService dynamically
                  const { UploadService } = await import(
                    "@/services/uploadService"
                  );
                  const response = await UploadService.uploadImage(file);

                  if (response.success && response.data?.url) {
                    // Xóa placeholder loading text
                    quillInstance.current.deleteText(range.index, 20);

                    // Chèn hình ảnh với URL từ server
                    quillInstance.current.insertEmbed(
                      range.index,
                      "image",
                      response.data.url
                    );
                    quillInstance.current.setSelection(range.index + 1);
                  } else {
                    showErrorToast("Có lỗi xảy ra khi tải hình ảnh");
                    // Xóa placeholder loading text
                    quillInstance.current.deleteText(range.index, 20);
                    quillInstance.current.insertText(
                      range.index,
                      "Lỗi tải hình ảnh!",
                      { color: "#f44336", italic: true }
                    );
                  }
                } catch {
                  showErrorToast("Có lỗi xảy ra khi tải hình ảnh");
                  // Xóa placeholder loading text
                  quillInstance.current.deleteText(range.index, 20);
                  quillInstance.current.insertText(
                    range.index,
                    "Lỗi tải hình ảnh!",
                    { color: "#f44336", italic: true }
                  );
                }
              } catch {
                showErrorToast("Có lỗi xảy ra khi xử lý hình ảnh");
              }
            }
          };
        };

        // Create the editor with toolbar options
        quillInstance.current = new QuillClass(quillRef.current!, {
          theme: "snow",
          modules: {
            toolbar: {
              container: `#${toolbarId.current}`,
              handlers: {
                image: handleImageInsert,
              },
            },
          },
          placeholder: "Nhập nội dung...",
        });

        // Set up the text change handler
        quillInstance.current.on("text-change", () => {
          const content = quillInstance.current.root.innerHTML;
          onChange(content);
        });

        // Set initial content if available
        if (value) {
          console.log("Setting initial content:", value);

          // Use the dangerouslySetInnerHTML approach for maximum compatibility
          try {
            // First try the direct innerHTML approach
            quillInstance.current.root.innerHTML = value;
            quillInstance.current.update();

            // Log the content to verify it was set
            console.log(
              "Content after initial setting:",
              quillInstance.current.root.innerHTML
            );
          } catch {
            showErrorToast("Có lỗi xảy ra khi thiết lập nội dung");
          }
        }

        // Mark editor as ready
        setEditorReady(true);
      });
    }

    // Cleanup on unmount
    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change");
      }
    };
  }, []); // Only run once on mount, intentionally not including onChange and value

  // Handle content updates
  useEffect(() => {
    if (quillInstance.current && editorReady) {
      const currentContent = quillInstance.current.root.innerHTML;

      // Chỉ cập nhật nếu có giá trị value và nội dung khác với hiện tại
      if (value && value !== currentContent) {
        console.log("Updating content to:", value);

        // Tạm thời tắt handler text-change để tránh vòng lặp vô hạn
        quillInstance.current.off("text-change");

        try {
          // Cập nhật nội dung theo cách an toàn nhất
          quillInstance.current.root.innerHTML = value;
          quillInstance.current.update();
          console.log(
            "Content after update:",
            quillInstance.current.root.innerHTML
          );
        } catch {
          showErrorToast("Có lỗi xảy ra khi cập nhật nội dung");
        }

        // Khôi phục handler text-change sau khi cập nhật
        setTimeout(() => {
          quillInstance.current?.on("text-change", () => {
            const content = quillInstance.current.root.innerHTML;
            console.log("Text changed, new content:", content);
            onChange(content);
          });
        }, 50);
      }
    }
  }, [value, editorReady, onChange]);

  return (
    <div className={styles.quillContainer}>
      {/* Custom toolbar with unique ID */}
      <div id={toolbarId.current}>
        <span className="ql-formats">
          <select className="ql-header">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="">Normal</option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
        </span>
        <span className="ql-formats">
          <button className="ql-blockquote" />
          <button className="ql-code-block" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
        </span>
        <span className="ql-formats">
          <button className="ql-clean" />
        </span>
      </div>
      <div ref={quillRef} style={{ minHeight: "200px" }} />
    </div>
  );
};

export default QuillEditor;
