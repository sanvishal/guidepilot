import { RefObject, forwardRef, useEffect, useRef, useState } from "react"
import { Block, DYNAMIC_CONTENT_TYPE, DynamicContent } from "@/types"
import { PanInfo, motion, useMotionValue } from "framer-motion"
import { Move, ZoomIn } from "lucide-react"

import { Label, Slider } from "@guidepilot/ui"
import { cn } from "@guidepilot/ui/lib/utils"
import { clamp } from "@/lib/utils"

interface IDynamicImageContent {
  block: Block<DYNAMIC_CONTENT_TYPE.IMAGE>
  onZoomParamsChange: (
    blockId: string,
    zoom: DynamicContent<DYNAMIC_CONTENT_TYPE.IMAGE>["zoom"]
  ) => void
}

const DRAG_HANDLE_SIZE = 140
const getImageDimensions = (
  image: HTMLImageElement,
  container: HTMLDivElement,
  zoomAmount: number
) => {
  const widthRatio = container.offsetWidth / image.naturalWidth
  const heightRatio = container.offsetHeight / image.naturalHeight

  const scale = Math.min(widthRatio, heightRatio)

  const canvasBBox = (container as HTMLDivElement).getBoundingClientRect()

  const noZoomWidth =
    widthRatio > heightRatio ? canvasBBox.width : image.naturalWidth * scale
  const noZoomHeight =
    widthRatio > heightRatio ? canvasBBox.height : image.naturalHeight * scale

  return {
    noZoomWidth,
    noZoomHeight,
    transformedWidth: image.naturalWidth * scale * zoomAmount,
    transformedHeight: image.naturalHeight * scale * zoomAmount,
    imageTop: (canvasBBox.height - noZoomHeight) / 2,
    imageBottom: (canvasBBox.height + noZoomHeight) / 2,
    imageLeft: canvasBBox.left,
    canvasBBox,
  }
}

export const EditableDynamicImageContent = forwardRef<
  HTMLDivElement,
  IDynamicImageContent
>(function EditableDynamicImageContent(
  props,
  dynamicCanvasRef: RefObject<HTMLDivElement>
) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentZoom, setCurrentZoom] = useState<
    DynamicContent<DYNAMIC_CONTENT_TYPE.IMAGE>["zoom"]
  >({
    x: 0,
    y: 0,
    amount: 1,
  })
  const [currentImageDimensions, setCurrentImageDimensions] = useState(null)
  const dragHandleX = useMotionValue(0)
  const dragHandleY = useMotionValue(0)

  const setDragHandlerPosition = (imageDimensions) => {
    const absX =
      props.block.dynamicContent.zoom.x * imageDimensions.noZoomWidth -
      DRAG_HANDLE_SIZE / 2
    const absY =
      props.block.dynamicContent.zoom.y * imageDimensions.noZoomHeight -
      imageDimensions.noZoomHeight / 2
    dragHandleX.set(absX)
    dragHandleY.set(absY)
  }

  const handleImageLoad = () => {
    const newImageDimensions = getImageDimensions(
      imageRef.current,
      dynamicCanvasRef.current,
      props.block.dynamicContent.zoom.amount
    )

    if (imageRef.current?.naturalWidth) {
      setDragHandlerPosition(newImageDimensions)
    }

    setCurrentImageDimensions(newImageDimensions)
  }

  useEffect(() => {
    const newImageDimensions = getImageDimensions(
      imageRef.current,
      dynamicCanvasRef.current,
      props.block.dynamicContent.zoom.amount
    )

    if (imageRef.current?.naturalWidth) {
      setDragHandlerPosition(newImageDimensions)
    }

    setCurrentImageDimensions(newImageDimensions)

    setCurrentZoom({
      x: props.block.dynamicContent.zoom.x,
      y: props.block.dynamicContent.zoom.y,
      amount: props.block.dynamicContent.zoom.amount,
    })
  }, [props.block.id])

  const handleZoomSliderChange = (values: number[]) => {
    const updatedZoom = {
      ...currentZoom,
      amount: values[0],
    }
    setCurrentZoom(updatedZoom)
    props.onZoomParamsChange(props.block.id, updatedZoom)
  }

  const handleOnDragHandlerEnd = (_, coords: PanInfo) => {
    setIsDragging(false)

    const leftBound = coords.point.x - currentImageDimensions.canvasBBox.left
    const clampedX = clamp(leftBound, 0, currentImageDimensions.noZoomWidth)

    const topBound =
      coords.point.y -
      currentImageDimensions.canvasBBox.top -
      currentImageDimensions.imageTop
    const clampedY = clamp(topBound, 0, currentImageDimensions.noZoomHeight)
    const relX = clampedX / currentImageDimensions.noZoomWidth
    const relY = clampedY / currentImageDimensions.noZoomHeight
    const updatedZoom = {
      ...currentZoom,
      x: relX,
      y: relY,
    }
    setCurrentZoom(updatedZoom)
    props.onZoomParamsChange(props.block.id, updatedZoom)
  }

  if (props.block.dynamicContent.type === DYNAMIC_CONTENT_TYPE.IMAGE) {
    const content = props.block.dynamicContent
    return (
      <>
        <img
          className="rounded-md"
          src={content.url}
          key={content.url}
          ref={imageRef}
          onLoad={handleImageLoad}
          // onLoad={handleImageLoad}
          // className="object-cover"
          style={{
            maxHeight: "100%",
            width: "100%",
            objectFit: "contain",
            transformOrigin: `${isDragging ? 0 : currentZoom.x * 100}% ${
              isDragging ? 0 : currentZoom.y * 100
            }%`,
            transform: `scale(${isDragging ? 1 : currentZoom.amount})`,
            transition: "all 0.45s cubic-bezier(0.6, 0.02, 0.05, 0.9)",
          }}
          alt=""
        />
        <motion.div
          onDragStart={() => {
            setIsDragging(true)
          }}
          onDragEnd={handleOnDragHandlerEnd}
          drag
          dragConstraints={{
            top: -currentImageDimensions?.noZoomHeight / 2,
            bottom: currentImageDimensions?.noZoomHeight / 2,
            left: -DRAG_HANDLE_SIZE / 2,
            right: currentImageDimensions?.noZoomWidth - DRAG_HANDLE_SIZE / 2,
          }}
          dragElastic={0.1}
          dragMomentum={false}
          className={cn(
            "border-foreground absolute z-50 flex border-spacing-2 items-center justify-center rounded-full border-2 border-dashed bg-slate-300 shadow-md",
            isDragging
              ? "cursor-grabbing bg-opacity-40"
              : "cursor-grab bg-opacity-50"
          )}
          style={{
            width: DRAG_HANDLE_SIZE,
            height: DRAG_HANDLE_SIZE,
            x: dragHandleX,
            y: dragHandleY,
            transition: "background 0.15s ease-in-out",
          }}
        >
          <div
            className={cn(
              "rounded-full p-2",
              !isDragging ? "bg-background" : "bg-transparent"
            )}
            style={{ transition: "background 0.15s ease-in-out" }}
          >
            <Move className="text-foreground" />
          </div>
        </motion.div>
        <div
          className={cn(
            "absolute bottom-5 flex w-full items-center justify-center p-6 transition-transform duration-200 ease-in-out",
            isDragging ? "translate-y-40" : "translate-y-0"
          )}
        >
          <div className="bg-background h-full rounded-lg border p-6 shadow-md">
            <div className="w-52 space-y-3">
              <>
                <Label htmlFor="zoom-amount" className="flex items-center">
                  <ZoomIn className="mr-1 h-4 w-4" />
                  Zoom Amount
                </Label>
                <Slider
                  id="zoom-amount"
                  onValueChange={handleZoomSliderChange}
                  value={[currentZoom.amount]}
                  max={4}
                  step={0.02}
                  min={1}
                />
              </>
            </div>
          </div>
        </div>
      </>
    )
  }

  return <></>
})
