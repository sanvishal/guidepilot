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
import { MousePointerClick } from "lucide-react"

import { cn } from "@guidepilot/ui/lib/utils"
import { EditableStaticContent } from "./editables/EditableStaticContent"

export interface IStaticContentBlockContainer {
  block: Block
  isSelected: boolean
  onClick: (element: HTMLDivElement, id: string) => void
  onViewAppear: (element: HTMLDivElement, id: string) => void
  onUpdateContent: (content: JSONContent, id: string) => void
}

export const StaticContentBlockContainer = forwardRef<
  HTMLDivElement,
  IStaticContentBlockContainer
>(function StaticContentBlockContainer(props, scrollContainerRef) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isEditorFocused, setIsEditorFocused] = useState(false)

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
  }, [isInView])

  const handleOnFocus = useCallback((state: boolean) => {
    setIsEditorFocused(state)
  }, [])

  return (
    <div
      ref={contentRef}
      className={cn(
        "group relative mb-20 min-h-[150px] rounded-md border p-4",
        props.isSelected ? "opacity-100" : "opacity-30",
        isEditorFocused ? "border-foreground border-dashed" : "border-border"
      )}
      onClick={handleBlockClick}
    >
      <EditableStaticContent
        block={props.block}
        onFocus={handleOnFocus}
        isEditable={props.isSelected}
        onContentUpdate={handleOnContentUpdate}
      />
      {props.isSelected && (
        <div className="text-muted-foreground absolute -bottom-6 right-0 flex items-center text-sm opacity-0 transition-opacity group-hover:opacity-100">
          <MousePointerClick className="mr-1 h-4 w-4 stroke-[1.5]" />
          click to edit
        </div>
      )}
    </div>
  )
})
