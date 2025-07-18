"use client";
import dynamic from "next/dynamic";

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
  return <QuillEditor value={value} onChange={onChange} />;
};

export default EditorWrapper;
