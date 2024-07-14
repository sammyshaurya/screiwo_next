"use client";
import "./styles.css";
import { Button } from "@nextui-org/button";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";
import * as Toolbar from "@radix-ui/react-toolbar";
import {
  StrikethroughIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  FontBoldIcon,
  FontItalicIcon,
} from "@radix-ui/react-icons";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "w-full opensans font-light text-lg px-4 py-3 border-l-4 border-transparent focus:border-blue-500 outline-none transition-colors duration-300 placeholder-gray-400",
      },
    },

    content: `
      <p>
        Try to select <em>this text</em> to see what we call the bubble menu.
      </p>
      <p>
        Neat, isn’t it? Add an empty paragraph to see the floating menu.
      </p>
    `,
  });

  return (
    <>
      {editor && (
        <BubbleMenu tippyOptions={{ duration: 100 }} editor={editor}>
          <Toolbar.Root className="ToolbarRoot" aria-label="Formatting options">
            <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
              <Toolbar.ToggleItem
                className={`ToolbarToggleItem ${
                  editor.isActive("bold") ? "is-active" : ""
                }`}
                value="bold"
                aria-label="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <FontBoldIcon />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem
                className={`ToolbarToggleItem ${
                  editor.isActive("italic") ? "is-active" : ""
                }`}
                value="italic"
                aria-label="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <FontItalicIcon />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem
                className={`ToolbarToggleItem ${
                  editor.isActive("strike") ? "is-active" : ""
                }`}
                value="strikethrough"
                aria-label="Strike through"
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <StrikethroughIcon />
              </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>
          </Toolbar.Root>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu tippyOptions={{ duration: 100 }} editor={editor}>
          <Toolbar.Root className="ToolbarRoot" aria-label="Formatting options">
            <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
              <Toolbar.ToggleItem
                className={
                  editor.isActive("heading", { level: 1 }) ? "is-active" : ""
                }
                value="bold"
                aria-label="Bold"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                H
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem
                className={
                  editor.isActive("heading", { level: 2 }) ? "is-active" : ""
                }
                value="italic"
                aria-label="Italic"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                I
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem
                className={editor.isActive("bulletList") ? "is-active" : ""}
                value="strikethrough"
                aria-label="Strike through"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                Strike
              </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>
          </Toolbar.Root>
        </FloatingMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
};

export default Editor;
