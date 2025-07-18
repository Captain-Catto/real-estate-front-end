"use client";
import { useRef, useEffect } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange }) => {
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      quillRef.current &&
      !quillInstance.current
    ) {
      import("quill").then((Quill) => {
        const QuillClass = Quill.default;
        quillInstance.current = new QuillClass(quillRef.current!, {
          theme: "snow",
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "code-block"],
              ["link", "image"],
              ["clean"],
            ],
          },
        });

        quillInstance.current.on("text-change", () => {
          const content = quillInstance.current.root.innerHTML;
          onChange(content);
        });
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (
      quillInstance.current &&
      value !== quillInstance.current.root.innerHTML
    ) {
      quillInstance.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div>
      <div ref={quillRef} style={{ minHeight: "200px" }} />
    </div>
  );
};

export default QuillEditor;
