import { TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Heading1, Heading2, Italic } from "lucide-react"

import { Button, Separator, Toggle } from "@guidepilot/ui"
import { Tooltip, TooltipContent } from "../Tooltip"

export const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `<ul>
          <li>A list item</li>
          <li>And another one</li>
        </ul>`,
  })

  return (
    <>
      <EditorContent
        editor={editor}
        className="prose prose-p:mt-0 prose-p:mb-0 prose-ul:marker:text-red"
      />
      {editor && (
        <TooltipProvider>
          <BubbleMenu editor={editor} tippyOptions={{ duration: 50 }}>
            <div className="flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("heading", { level: 1 })}
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                  >
                    <Heading1 className="h-5 w-5" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>title</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("heading", { level: 2 })}
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                  >
                    <Heading2 className="h-5 w-5" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>subtitle</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-5 w-5" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>bold</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-5 w-5" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>italic</TooltipContent>
              </Tooltip>
            </div>
          </BubbleMenu>
        </TooltipProvider>
      )}
    </>
  )
}
