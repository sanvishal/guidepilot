import { MouseEventHandler, forwardRef, useEffect, useRef } from "react"
import { Block } from "@/types"
import { BubbleMenu } from "@tiptap/react"
import { useInView } from "framer-motion"

import { cn } from "@guidepilot/ui/lib/utils"
import { EditableStaticContent } from "./editables/EditableStaticContent"

export interface IStaticContentBlockContainer {
  block: Block
  isSelected: boolean
  onClick: (element: HTMLDivElement, id: string) => void
  onViewAppear: (element: HTMLDivElement, id: string) => void
}

export const StaticContentBlockContainer = forwardRef<
  HTMLDivElement,
  IStaticContentBlockContainer
>(function StaticContentBlockContainer(props, scrollContainerRef) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleBlockClick = () => {
    if (contentRef.current) {
      props.onClick(contentRef.current, props.block.id)
    }
  }

  const isInView = useInView(contentRef, {
    once: false,
    margin: "-40% 0% -50% 0%",
  })

  useEffect(() => {
    if (isInView && contentRef.current) {
      props.onViewAppear(contentRef.current, props.block.id)
    }
  }, [isInView])

  return (
    <div
      ref={contentRef}
      className={cn(
        "bg-muted mb-20 min-h-[150px] rounded-md p-3",
        props.isSelected ? "border border-red-500 opacity-100" : "opacity-30"
      )}
      onClick={handleBlockClick}
    >
      <EditableStaticContent block={props.block} />
    </div>
  )
})
