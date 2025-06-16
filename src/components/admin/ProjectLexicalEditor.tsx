"use client";
import React, { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import {
  $isHeadingNode,
  $createHeadingNode,
  HeadingNode,
} from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  ListNode,
  ListItemNode,
} from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { $generateHtmlFromNodes } from "@lexical/html";

interface ProjectLexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  }, [editor]);

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  }, [editor]);

  const formatHeading = useCallback(
    (headingSize: "h1" | "h2" | "h3") => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach((node) => {
            if ($isHeadingNode(node)) {
              node.replace($createHeadingNode(headingSize));
            }
          });
        }
      });
    },
    [editor]
  );

  const formatBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const formatNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const formatAlignLeft = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  }, [editor]);

  const formatAlignCenter = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  }, [editor]);

  const formatAlignRight = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  }, [editor]);

  const formatIndent = useCallback(() => {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  const formatOutdent = useCallback(() => {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <button
          onClick={formatBold}
          className={`p-2 rounded hover:bg-gray-200 ${
            isBold ? "bg-gray-300" : ""
          }`}
          type="button"
          title="Bold"
        >
          <i className="fas fa-bold text-sm"></i>
        </button>
        <button
          onClick={formatItalic}
          className={`p-2 rounded hover:bg-gray-200 ${
            isItalic ? "bg-gray-300" : ""
          }`}
          type="button"
          title="Italic"
        >
          <i className="fas fa-italic text-sm"></i>
        </button>
        <button
          onClick={formatUnderline}
          className={`p-2 rounded hover:bg-gray-200 ${
            isUnderline ? "bg-gray-300" : ""
          }`}
          type="button"
          title="Underline"
        >
          <i className="fas fa-underline text-sm"></i>
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => formatHeading("h1")}
          className="px-2 py-1 text-sm rounded hover:bg-gray-200"
          type="button"
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => formatHeading("h2")}
          className="px-2 py-1 text-sm rounded hover:bg-gray-200"
          type="button"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => formatHeading("h3")}
          className="px-2 py-1 text-sm rounded hover:bg-gray-200"
          type="button"
          title="Heading 3"
        >
          H3
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <button
          onClick={formatBulletList}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Bullet List"
        >
          <i className="fas fa-list-ul text-sm"></i>
        </button>
        <button
          onClick={formatNumberedList}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Numbered List"
        >
          <i className="fas fa-list-ol text-sm"></i>
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <button
          onClick={formatAlignLeft}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Align Left"
        >
          <i className="fas fa-align-left text-sm"></i>
        </button>
        <button
          onClick={formatAlignCenter}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Align Center"
        >
          <i className="fas fa-align-center text-sm"></i>
        </button>
        <button
          onClick={formatAlignRight}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Align Right"
        >
          <i className="fas fa-align-right text-sm"></i>
        </button>
      </div>

      {/* Indent */}
      <div className="flex items-center gap-1">
        <button
          onClick={formatOutdent}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Outdent"
        >
          <i className="fas fa-outdent text-sm"></i>
        </button>
        <button
          onClick={formatIndent}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Indent"
        >
          <i className="fas fa-indent text-sm"></i>
        </button>
      </div>
    </div>
  );
}

// Plugin để set nội dung HTML ban đầu - SỬA LẠI HOÀN TOÀN
function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (html && html.trim()) {
      editor.update(() => {
        try {
          const root = $getRoot();
          root.clear();

          // Parse HTML đơn giản thành text và tạo paragraph nodes
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          const textContent = tempDiv.textContent || tempDiv.innerText || "";

          // Tách thành các đoạn văn
          const paragraphs = textContent.split("\n").filter((p) => p.trim());

          if (paragraphs.length === 0) {
            // Nếu không có nội dung, tạo một paragraph trống
            const paragraph = $createParagraphNode();
            root.append(paragraph);
          } else {
            // Tạo paragraph node cho mỗi đoạn
            paragraphs.forEach((text) => {
              const paragraph = $createParagraphNode();
              const textNode = $createTextNode(text.trim());
              paragraph.append(textNode);
              root.append(paragraph);
            });
          }
        } catch (error) {
          console.error("Error setting initial content:", error);
          // Fallback: tạo một paragraph trống
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          root.append(paragraph);
        }
      });
    }
  }, [editor, html]);

  return null;
}

export default function ProjectLexicalEditor({
  value,
  onChange,
}: ProjectLexicalEditorProps) {
  const initialConfig = {
    namespace: "ProjectEditor",
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
    theme: {
      heading: {
        h1: "text-2xl font-bold mb-4",
        h2: "text-xl font-semibold mb-3",
        h3: "text-lg font-medium mb-2",
      },
      list: {
        ul: "list-disc ml-6 mb-4",
        ol: "list-decimal ml-6 mb-4",
        listitem: "mb-1",
      },
      paragraph: "mb-2",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
      },
    },
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  return (
    <div className="border rounded-lg bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none min-h-[200px] p-4 text-base" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                Nhập mô tả dự án...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <InitialContentPlugin html={value} />
        <OnChangePlugin
          onChange={async (editorState, editor) => {
            try {
              const htmlString = await $generateHtmlFromNodes(editor, null);
              onChange(htmlString);
            } catch (error) {
              console.error("Error generating HTML:", error);
              // Fallback to plain text
              editorState.read(() => {
                const root = $getRoot();
                const textContent = root.getTextContent();
                onChange(textContent);
              });
            }
          }}
        />
      </LexicalComposer>
    </div>
  );
}
