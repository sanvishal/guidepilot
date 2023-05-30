import {
  MouseEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { Block } from "@/types"
import { BubbleMenu, JSONContent } from "@tiptap/react"
import { useInView } from "framer-motion"
import { MousePointerClick, Trash } from "lucide-react"

import { cn } from "@guidepilot/ui/lib/utils"
import { EditableStaticContent } from "./editables/EditableStaticContent"

export interface IStaticContentBlockContainer {
  block: Block
  isSelected: boolean
  onClick: (element: HTMLDivElement, id: string) => void
  onViewAppear: (element: HTMLDivElement, id: string) => void
  onUpdateContent: (content: JSONContent, id: string) => void
  onDeleteConfirm: (id: string) => void
}

export const StaticContentBlockContainer = forwardRef<
  HTMLDivElement,
  IStaticContentBlockContainer
>(function StaticContentBlockContainer(props, scrollContainerRef) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [deleteClickCount, setDeleteClickCount] = useState(0)

  const handleBlockClick = () => {
    if (contentRef.current) {
      props.onClick(contentRef.current, props.block.id)
    }
  }

  const handleOnContentUpdate = useCallback(
    (updatedContent: JSONContent) => {
      props.onUpdateContent(updatedContent, props.block.id)
    },
    [props.block]
  )

  const isInView = useInView(contentRef, {
    once: false,
    margin: "-40% 0% -50% 0%",
  })

  useEffect(() => {
    if (isInView && contentRef.current) {
      props.onViewAppear(contentRef.current, props.block.id)
    }
    setDeleteClickCount(0)
  }, [isInView])

  const handleOnFocus = useCallback((state: boolean) => {
    setIsEditorFocused(state)
    // props.onClick(contentRef.current, props.block.id)
    setDeleteClickCount(0)
  }, [])

  const handleDeleteClicked = () => {
    setDeleteClickCount((count) => {
      if (count === 1) {
        props.onDeleteConfirm(props.block.id)
        return 0
      }
      count += 1
      return count
    })
  }

  return (
    <div
      className={cn(
        "group relative mb-28 min-h-[150px] w-full rounded-md border p-4",
        props.isSelected ? "opacity-100" : "opacity-30",
        isEditorFocused ? "shadow-sm" : "",
        deleteClickCount === 1 ? "border-destructive" : "border-foreground"
      )}
      onClick={handleBlockClick}
      ref={contentRef}
    >
      <EditableStaticContent
        block={props.block}
        onFocus={handleOnFocus}
        isEditable={props.isSelected}
        onContentUpdate={handleOnContentUpdate}
      />
      {props.isSelected && (
        <div className="text-muted-foreground  absolute -bottom-6 right-0 flex w-full items-center justify-between text-sm opacity-0 transition-opacity group-hover:opacity-50">
          <button
            className={cn(
              "text-destructive flex items-center text-sm",
              deleteClickCount === 1 ? "font-bold" : "font-normal"
            )}
            onClick={handleDeleteClicked}
          >
            <Trash className="mr-1 h-4 w-4" />
            {deleteClickCount === 1 ? "Confirm?" : "Delete"}
          </button>
          <div className="pointer-events-none flex items-center">
            <MousePointerClick className="mr-1 h-4 w-4 stroke-[1.5]" />
            click to edit
            {/* {props.block.id} */}
          </div>
        </div>
      )}
    </div>
  )
})
