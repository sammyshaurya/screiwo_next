"use client";
import "./styles.css";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Link from "@tiptap/extension-link";
import Bold from "@tiptap/extension-bold";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import History from "@tiptap/extension-history";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Image from "@tiptap/extension-image";

// Custom
import * as Icons from "./Icons";
import { Icon } from "lucide-react";

export function SimpleEditor({ onChange }) {
  const editor = useEditor({
    extensions: [
      Document,
      History,
      Paragraph,
      Text,
      Link.configure({
        openOnClick: false,
      }),
      Bold,
      Underline,
      Italic,
      Strike,
      Code,
      BulletList.configure({
        itemTypeName: 'listItem',
        keepAttributes: true,
        HTMLAttributes: {
          class: 'list-disc'
        }
      }),
      OrderedList.configure({
        itemTypeName: 'listItem',
        keepAttributes: true,
        HTMLAttributes: {
          class: 'list-decimal'
        }
      }),
      ListItem,
      Image,
    ],
    editorProps: {
      attributes: {
        class:
          "w-full opensans font-light text-lg px-4 py-3 border-l-4 border-transparent focus:border-blue-500 outline-none transition-colors duration-300 placeholder-gray-400",
      },
    },
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="editor">
      <div className="menu">
        <button
          className="menu-button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          type="button"
        >
          <Icons.RotateLeft />
        </button>
        <button
          className="menu-button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          type="button"
        >
          <Icons.RotateRight />
        </button>
        <button
          className={`menu-button ${
            editor.isActive("link") ? "is-active" : ""
          }`}
        >
          <Icons.Link />
        </button>
        <button
          className={`menu-button ${
            editor.isActive("bold") ? "is-active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          type="button"
        >
          <Icons.Bold />
        </button>
        <button
          className={`menu-button ${
            editor.isActive("underline") ? "is-active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          type="button"
        >
          <Icons.Underline />
        </button>
        <button
          className={`menu-button ${
            editor.isActive("italic") ? "is-active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          type="button"
        >
          <Icons.Italic />
        </button>
        <button
          className={`menu-button ${
            editor.isActive("strike") ? "is-active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          type="button"
        >
          <Icons.Strikethrough />
        </button>
        <button
          className={`menu-button ${
            editor.isActive("code") ? "is-active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          type="button"
        >
          <Icons.Code />
        </button>
        <button
          className={`menu-button ${
            editor.isActive("BulletList") ? "is-active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          type="button"
        >
          <Icons.BulletItem size={20}/>
        </button>
        <button
          className={`menu-button ${
            editor.isActive("OrderedList") ? "is-active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          type="button"
        >
          oL
        </button>
        <button
          className="menu-button"
          onClick={() => {
            const url = prompt("Enter image URL");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          type="button"
        >
          <Icons.ImageItem size={18} />
        </button>
      </div>
      <div className="w-full opensans font-light text-lg px-4 py-3 border-l-4 border-slate-200 max-h-dvh overflow-scroll">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
