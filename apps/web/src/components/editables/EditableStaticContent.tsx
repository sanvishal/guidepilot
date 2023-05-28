import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { Block } from "@/types"
import { TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Node } from "@tiptap/pm/model"
import {
  BubbleMenu,
  Editor,
  EditorContent,
  Extension,
  JSONContent,
  ReactNodeViewRenderer,
  isTextSelection,
  mergeAttributes,
  useEditor,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Suggestion from "@tiptap/suggestion"
import css from "highlight.js/lib/languages/css"
import js from "highlight.js/lib/languages/javascript"
import ts from "highlight.js/lib/languages/typescript"
import html from "highlight.js/lib/languages/xml"
import { lowlight } from "lowlight"
import {
  Bold,
  Check,
  Code,
  Code2,
  Heading1,
  Heading2,
  Italic,
  Link2,
  Strikethrough,
  X,
} from "lucide-react"

import { Button, Input, Separator, Toggle } from "@guidepilot/ui"
import { cn } from "@guidepilot/ui/lib/utils"
import { isUrl } from "@/lib/utils"
import { Tooltip, TooltipContent } from "../Tooltip"
import { renderCommandsList } from "./CommandList"
import { EditableCodeBlock } from "./EditableCodeBlock"

lowlight.registerLanguage("html", html)
lowlight.registerLanguage("css", css)
lowlight.registerLanguage("js", js)
lowlight.registerLanguage("ts", ts)

interface IEditableStaticContent {
  block: Block
  onFocus: (focused: boolean) => void
  isEditable: boolean
  onContentUpdate: (updatedContent: JSONContent) => void
}

const Commands = Extension.create({
  name: "slash commands",
  defaultOptions: {
    suggestion: {
      char: "/",
      startOfLine: false,
      allowedPrefixes: null,
      command: ({ editor, range, props }) => {
        props.command({ editor, range, props })
      },
    },
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

const getSuggestions = ({ query }) => {
  return [
    {
      title: "title",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run()
      },
    },
    {
      title: "subtitle",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run()
      },
    },
    {
      title: "text",
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run()
      },
    },
    {
      title: "bullet list",
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: "quote",
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run()
      },
    },
    {
      title: "code block",
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run()
      },
    },
  ]
    .filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 10)
}

export const EditableStaticContent = (props: IEditableStaticContent) => {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Link.configure({
        protocols: ["http", "https"],
        openOnClick: false,
        validate: (href) => isUrl(href),
      }),
      Placeholder.configure({
        placeholder: "Type '/' to get suggestions...",
      }),
      Commands.configure({
        suggestion: {
          // @ts-ignore
          items: getSuggestions,
          render: renderCommandsList,
        },
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(EditableCodeBlock)
        },
      }).configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
    ],
    content: `<pre><code class="language-javascript">const a = 2;</code></pre>`,

    onBlur: () => props.onFocus(false),
    onFocus: () => props.onFocus(true),
    onUpdate: ({ editor }) => {
      props.onContentUpdate(editor.getJSON())
    },
  })

  useEffect(() => {
    if (props.isEditable) {
      editor?.setEditable(true)
    }
  }, [props.isEditable, editor])

  const linkInputRef = useRef<HTMLInputElement>(null)
  const [linkEditor, setLinkEditor] = useState({ isOpen: false, url: "" })

  const handleLinkInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setLinkEditor((l) => {
        return { ...l, url: e.target.value }
      })
    },
    [editor]
  )

  const openLinkEditor = () => {
    const previousUrl = editor.getAttributes("link").href
    setLinkEditor({ isOpen: true, url: previousUrl })
    if (linkInputRef.current) {
      linkInputRef.current.focus()
    }
  }

  const unsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
  }, [editor])

  const setLink = useCallback(
    (inputValue: string) => {
      if (!inputValue || !inputValue?.trim()) {
        unsetLink()
        return
      }

      try {
        const urlObj = new URL(inputValue.trim())
        if (["http:", "https:"].includes(urlObj.protocol)) {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: inputValue.trim() })
            .run()
        }
      } catch (e) {
        console.error(e, inputValue)
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: `http://${inputValue.trim()}` })
          .run()
      }

      setLinkEditor((l) => {
        return { isOpen: false, url: l.url }
      })
    },
    [editor]
  )

  return (
    <>
      <EditorContent
        editor={editor}
        className="prose prose-p:mt-0 prose-p:mb-0 prose-ul:marker:text-red prose-code:before:hidden prose-code:after:hidden prose-p:before:hidden prose-p:after:hidden prose-h1:font-display prose-hr:my-3.5 prose-h1:mt-2.5 prose-h2:mt-2 prose-h1:mb-2 prose-h2:mb-1.5 prose-h2:font-display"
      />
      {editor && (
        <TooltipProvider>
          <BubbleMenu
            shouldShow={({ editor, view, state, from, to }) => {
              if (!view.hasFocus()) return false
              const { doc, selection } = state
              const isText = isTextSelection(selection)
              if (!isText) return false
              const isEmpty =
                selection.empty ||
                (isText && doc.textBetween(from, to).length === 0)
              if (isEmpty) return false
              if (editor.isActive("codeBlock")) return false
              return true
            }}
            editor={editor}
            tippyOptions={{
              duration: 100,
              onHide: () => {
                setLinkEditor({ isOpen: false, url: "" })
              },
            }}
          >
            <div
              className={cn(
                "bg-foreground flex items-center rounded-lg shadow-md",
                linkEditor.isOpen ? "p-2" : "space-x-1 p-1.5"
              )}
            >
              {linkEditor.isOpen ? (
                <>
                  <div className="bg-background w-52 rounded-md">
                    <Input
                      icon={<Link2 />}
                      autoFocus
                      ref={linkInputRef}
                      value={linkEditor.url}
                      onChange={handleLinkInputChange}
                      placeholder="Enter http/https link"
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          setLink(linkEditor.url)
                        }
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="ml-2 w-7 p-1.5"
                    onClick={() => setLink(linkEditor.url)}
                  >
                    <Check />
                  </Button>
                  <Button
                    size="sm"
                    className="w-7 p-1.5"
                    onClick={() => setLinkEditor({ isOpen: false, url: "" })}
                  >
                    <X />
                  </Button>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("heading", { level: 1 })}
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                      >
                        <Heading1 className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>title</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("heading", { level: 2 })}
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                      >
                        <Heading2 className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>subtitle</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("bold")}
                        onClick={() =>
                          editor.chain().focus().toggleBold().run()
                        }
                      >
                        <Bold className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>bold</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("italic")}
                        onClick={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                      >
                        <Italic className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>italic</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("link")}
                        onClick={openLinkEditor}
                      >
                        <Link2 className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      {editor.isActive("link") ? "edit " : "add "} link
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("code")}
                        onClick={() =>
                          editor.chain().focus().toggleCode().run()
                        }
                      >
                        <Code className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>toggle inline code</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("codeBlock")}
                        onClick={() => {
                          const { from, to } = editor.state.selection
                          const { doc } = editor.state

                          const textBetween = doc.textBetween(from, to, "\n")
                          editor.commands.deleteSelection()
                          editor
                            .chain()
                            .focus()
                            .insertContent({
                              type: "codeBlock",
                              attrs: {
                                language: "auto",
                              },
                              content: [
                                {
                                  type: "text",
                                  text: textBetween,
                                },
                              ],
                            })
                            .run()
                        }}
                      >
                        <Code2 className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>toggle code block</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Toggle
                        size="xs"
                        variant="ghost"
                        pressed={editor.isActive("strike")}
                        onClick={() =>
                          editor.chain().focus().toggleStrike().run()
                        }
                      >
                        <Strikethrough className="h-5 w-5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>toggle strikethrough</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </BubbleMenu>
        </TooltipProvider>
      )}
    </>
  )
}
