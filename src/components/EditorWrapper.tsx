"use client";
import dynamic from "next/dynamic";
import { useCallback } from "react";

interface EditorWrapperProps {
  value: string;
  onChange: (content: string) => void;
}

const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-100 rounded border flex items-center justify-center">
      Đang tải editor...
    </div>
  ),
});

const EditorWrapper: React.FC<EditorWrapperProps> = ({ value, onChange }) => {
  console.log("EditorWrapper received value:", value);

  // Sử dụng useCallback để tránh tạo lại hàm onChange mỗi khi render
  const handleChange = useCallback(
    (content: string) => {
      console.log("EditorWrapper onChange called with:", content);
      onChange(content);
    },
    [onChange]
  );

  return <QuillEditor value={value} onChange={handleChange} />;
};

export default EditorWrapper;
