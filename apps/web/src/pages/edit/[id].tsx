import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { Block, DYNAMIC_CONTENT_TYPE, DynamicContent, Guide } from "@/types"
import { JSONContent } from "@tiptap/react"
import { Loader, MousePointerClick, Move, PlusCircle } from "lucide-react"
import { nanoid } from "nanoid"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { useDropzone } from "react-dropzone"

import { useToast } from "@guidepilot/ui/lib/useToast"
import { cn } from "@guidepilot/ui/lib/utils"
import { useDebounce, useOnClickOutside } from "@/lib/hooks/common.hooks"
import {
  useDeleteFileMutation,
  useGetGuideByIdQuery,
  useSaveGuideMutation,
  useUpdateGuideName,
} from "@/lib/hooks/guides.hooks"
import { isFileUsedInAnyOtherBlocks, scrollToElement } from "@/lib/utils"
import { LogoInverted } from "@/components/LogoInverted"
import { Navbar } from "@/components/Navbar"
import {
  IStaticContentBlockContainer,
  StaticContentBlockContainer,
} from "@/components/StaticContentBlockContainer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/Tooltip"
import { EditableDynamicImageContent } from "@/components/editables/EditableDynamicImageContent"
import { EditablePlaceholder } from "@/components/editables/EditablePlaceholder"

// const dummyGuide: Guide = {
//   blocks: [
//     {
//       id: "1",
//       staticContent: {},
//       dynamicContent: {
//         type: DYNAMIC_CONTENT_TYPE.IMAGE,
//         url: "https://comicbookmovie.com/images/articles/banners/198854.jpeg",
//         zoom: {
//           x: 0,
//           y: 0,
//           amount: 1,
//         },
//       },
//     },
//     {
//       id: "4",
//       staticContent: {},
//       dynamicContent: {
//         type: DYNAMIC_CONTENT_TYPE.IMAGE,
//         url: "https://comicbookmovie.com/images/articles/banners/198854.jpeg",
//         zoom: {
//           x: 1,
//           y: 1,
//           amount: 2,
//         },
//       },
//     },
//     {
//       id: "2",
//       staticContent: {},
//       dynamicContent: {
//         type: DYNAMIC_CONTENT_TYPE.IMAGE,
//         url: "https://static.wikia.nocookie.net/sonypicturesanimation/images/f/f8/Spider-Man_Across_the_Spider-Verse_poster_4.png",
//         zoom: {
//           x: 0,
//           y: 0,
//           amount: 1,
//         },
//       },
//     },
//     {
//       id: "1.2",
//       staticContent: {},
//       dynamicContent: {
//         type: DYNAMIC_CONTENT_TYPE.IMAGE,
//         url: "https://static.wikia.nocookie.net/sonypicturesanimation/images/f/f8/Spider-Man_Across_the_Spider-Verse_poster_4.png",
//         zoom: {
//           x: 0.5,
//           y: 0.5,
//           amount: 2,
//         },
//       },
//     },
//   ],
// }

const DEFAULT_DYNAMIC_REGION_PADDING = 60
const DEFAULT_DYNAMIC_CONTENT_PADDING = 40
export default function EditGuide() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dynamicContentCanvasRef = useRef<HTMLDivElement>(null)
  const guideNameRef = useRef<HTMLDivElement>(null)
  const [guideName, setGuideName] = useState({
    value: "",
    isFocused: false,
  })
  const [selectedBlock, setSelectedBlock] = useState("1")
  const [guide, setGuide] = useState<Guide>(null)
  const router = useRouter()
  const { toast } = useToast()

  const { isFetching: isGuideFetching, status: guideFetchStatus } =
    useGetGuideByIdQuery({
      id: router.query?.id as string,
      onSuccess: (data) => {
        setGuide(data)
        setGuideName({ value: data.name, isFocused: false })
      },
    })

  const { mutate: updateGuideNameMutation } = useUpdateGuideName({
    onSuccess: () => {
      setGuide({ ...guide, name: guideName.value })
    },
  })

  const { mutate: saveGuideMutation } = useSaveGuideMutation({
    onMutate: () => {},
  })

  const { mutateAsync: deleteFileMutation } = useDeleteFileMutation({
    onSuccess: () => {},
  })

  const handleBlockDeleteConfirm = async (blockId: string) => {
    const idxToDelete = guide.blocks.findIndex((block) => block.id === blockId)
    if (idxToDelete !== -1) {
      const isFileInUse = isFileUsedInAnyOtherBlocks(blockId, guide.blocks)
      if (!isFileInUse) {
        switch (guide.blocks[idxToDelete].dynamicContent.type) {
          case DYNAMIC_CONTENT_TYPE.IMAGE:
            await deleteFileMutation({ blockId })
        }
      }
      guide.blocks.splice(idxToDelete, 1)
    }
    const updatedGuide = { ...guide }
    setGuide(updatedGuide)
    saveGuideMutation({ guide: updatedGuide })
  }

  const handleBlockClick: IStaticContentBlockContainer["onClick"] = (
    blockElement
  ) => {
    if (scrollContainerRef.current) {
      scrollToElement(blockElement, scrollContainerRef.current, 300)
    }
  }

  const handleBlockAppearInView: IStaticContentBlockContainer["onViewAppear"] =
    (blockElement, blockId) => {
      setSelectedBlock(blockId)
      // handleBlockClick(blockElement, blockId)
    }

  const handleGuideNameOnChange = (e: FormEvent<HTMLTextAreaElement>) => {
    const value = (e.target as HTMLTextAreaElement).value.replace(
      /[\r\n\v]+/g,
      ""
    )

    if (value.length < 110) {
      setGuideName({
        ...guideName,
        value: value.replace(/[\r\n\v]+/g, ""),
      })
    }
  }

  const handleGuideNameFocus = (e: MouseEvent<HTMLDivElement>) => {
    setGuideName((g) => {
      return { ...g, isFocused: true }
    })
  }

  const handleGuideNameUnFocus = () => {
    setGuideName((g) => {
      return { value: g.value.trim(), isFocused: false }
    })
    if (guide.name.trim() !== guideName.value.trim()) {
      updateGuideNameMutation({ name: guideName.value, id: guide.id })
    }
  }

  useOnClickOutside(guideNameRef, handleGuideNameUnFocus)

  const handleOnImageZoomParamsChange = (
    blockId: string,
    zoom: DynamicContent<DYNAMIC_CONTENT_TYPE.IMAGE>["zoom"]
  ) => {
    console.log(blockId, zoom)
    const idx = guide.blocks.findIndex((b) => b.id === blockId)
    if (idx !== -1) {
      // @ts-ignore
      guide.blocks[idx].dynamicContent.zoom = zoom
      const updatedGuide = { ...guide }
      setGuide(updatedGuide)
      saveGuideMutation({ guide: updatedGuide })
    }
  }

  const debouncedImageZoomHandler = useDebounce(
    handleOnImageZoomParamsChange,
    500
  )

  const debouncedStaticContentUpdateHandler = useDebounce(
    (updatedContent: JSONContent, blockId: string) => {
      const blockToUpdate = guide.blocks.find((b) => b.id === blockId)
      if (
        JSON.stringify(blockToUpdate.staticContent) !==
        JSON.stringify(updatedContent)
      ) {
        setGuide((currGuides) => {
          const updatedGuide = {
            ...currGuides,
            blocks: currGuides.blocks.map((block) => {
              if (block.id === blockId) {
                block.staticContent = updatedContent
              }
              return block
            }),
          }
          saveGuideMutation({ guide: updatedGuide })
          return updatedGuide
        })
      }
    },
    200
  )

  const handleAddBlock = ({
    addAfterIdx,
    addBeforeIdx,
  }: {
    addAfterIdx?: number
    addBeforeIdx?: number
  }) => {
    const newBlock: Block = {
      id: nanoid(32),
      staticContent: {},
      dynamicContent: {
        type: DYNAMIC_CONTENT_TYPE.PLACEHOLDER,
      },
    }

    if (addAfterIdx !== undefined) {
      guide.blocks.splice(addAfterIdx + 1, 0, newBlock)
    } else if (addBeforeIdx !== undefined) {
      guide.blocks.splice(addBeforeIdx, 0, newBlock)
    } else {
      guide.blocks.push(newBlock)
    }

    const updatedGuide = { ...guide }
    setGuide(updatedGuide)
    saveGuideMutation({ guide: updatedGuide })
  }

  const handleFileUpload = (url: string, blockId: string) => {
    const idx = guide.blocks.findIndex((b) => b.id === blockId)
    if (idx !== -1 && guide.blocks[idx]) {
      guide.blocks[idx].dynamicContent = {
        type: DYNAMIC_CONTENT_TYPE.IMAGE,
        url,
        zoom: {
          x: 0,
          y: 0,
          amount: 1,
        },
      }
      const updatedGuide = { ...guide }
      setGuide(updatedGuide)
      saveGuideMutation({ guide: updatedGuide })
    }
  }

  const handleFileDelete = async (blockId: string) => {
    const idx = guide.blocks.findIndex((b) => b.id === blockId)
    if (idx !== -1 && guide.blocks[idx]) {
      const isFileInUse = isFileUsedInAnyOtherBlocks(blockId, guide.blocks)
      if (!isFileInUse) {
        switch (guide.blocks[idx].dynamicContent.type) {
          case DYNAMIC_CONTENT_TYPE.IMAGE:
            await deleteFileMutation({ blockId })
        }
      }
      guide.blocks[idx].dynamicContent = {
        type: DYNAMIC_CONTENT_TYPE.PLACEHOLDER,
      }
      const updatedGuide = { ...guide }
      setGuide(updatedGuide)
      saveGuideMutation({ guide: updatedGuide })
    }
  }

  const handleCopyPreviousBlock = (blockId: string) => {
    const idx = guide.blocks.findIndex((b) => b.id === blockId)
    if (idx !== -1 && guide.blocks[idx] && guide.blocks[idx - 1]) {
      if (
        guide.blocks[idx - 1].dynamicContent.type ===
        DYNAMIC_CONTENT_TYPE.PLACEHOLDER
      ) {
        toast({
          title: "Previous block does not have content",
        })
        return
      }
      guide.blocks[idx].dynamicContent = guide.blocks[idx - 1].dynamicContent
    } else {
      toast({
        variant: "destructive",
        title: "Error occured trying to copy block",
      })
      return
    }

    const updatedGuide = { ...guide }
    setGuide(updatedGuide)
    saveGuideMutation({ guide: updatedGuide })
  }

  const currentBlock = guide?.blocks?.find(
    (block) => block.id === selectedBlock
  )

  const renderDynamicContent = () => {
    switch (currentBlock?.dynamicContent.type) {
      case DYNAMIC_CONTENT_TYPE.PLACEHOLDER:
        const isFirst =
          guide.blocks.findIndex((b) => b.id === currentBlock.id) === 0
        return (
          <EditablePlaceholder
            key={currentBlock?.id}
            block={currentBlock}
            guideId={guide?.id}
            onUploadFile={handleFileUpload}
            shouldShowCopyPreviousBlock={!isFirst}
            onCopyPreviousBlockClick={handleCopyPreviousBlock}
          />
        )
      case DYNAMIC_CONTENT_TYPE.IMAGE:
        return (
          <EditableDynamicImageContent
            guideId={guide?.id}
            block={currentBlock as Block<DYNAMIC_CONTENT_TYPE.IMAGE>}
            ref={dynamicContentCanvasRef}
            onZoomParamsChange={debouncedImageZoomHandler}
            onReplaceImage={handleFileUpload}
            onDeleteImage={handleFileDelete}
          />
        )
    }
  }

  const handleBlockReorder = (updatedOrder) => {
    if (!updatedOrder.destination) {
      return
    }

    const result = Array.from(guide.blocks)
    const [removed] = result.splice(updatedOrder.source.index, 1)
    result.splice(updatedOrder.destination.index, 0, removed)

    const updatedGuide: Guide = { ...guide, blocks: result }
    setGuide(updatedGuide)
    saveGuideMutation({ guide: updatedGuide })
  }

  return (
    <>
      <Head>
        <title>GuidePilot • Edit</title>
      </Head>
      <main className="app-container fixed inset-0 z-0 h-full w-full origin-top-left overflow-hidden">
        <div
          className="absolute z-10 w-full bg-transparent px-10"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <Navbar />
        </div>
        {isGuideFetching ? (
          <div className="mt-28 flex w-full flex-col items-center justify-center">
            <Loader className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : guideFetchStatus === "error" ? (
          <div className="text-muted-foreground mt-28 flex w-full flex-col items-center justify-center">
            <p className="text-md">error occured!</p>
          </div>
        ) : (
          guide && (
            <div
              ref={scrollContainerRef}
              className="scroll-area h-full w-full overflow-x-hidden overflow-y-scroll"
            >
              <DragDropContext onDragEnd={handleBlockReorder}>
                <Droppable droppableId="static-content-list">
                  {(provided, snapshot) => (
                    <div
                      className="static-content relative w-[45%] p-8 py-[350px]"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <div
                        role="textbox"
                        ref={guideNameRef}
                        className="font-display hover:bg-muted group absolute top-24 flex w-full rounded-md p-2 text-3xl font-medium"
                        onClick={handleGuideNameFocus}
                        style={{
                          wordBreak: "break-word",
                        }}
                      >
                        <div
                          className={cn(
                            "text-muted-foreground pointer-events-none absolute -bottom-6 right-0 flex items-center font-sans text-sm font-normal transition-opacity",
                            guideName.isFocused
                              ? "opacity-0"
                              : "opacity-0 group-hover:opacity-70"
                          )}
                        >
                          <MousePointerClick className="mr-1 h-4 w-4 stroke-[1.5]" />
                          click to edit
                        </div>
                        {!guideName.isFocused && guideName.value}
                        {guideName.isFocused && (
                          <textarea
                            onChange={handleGuideNameOnChange}
                            className="*:unset outline-border h-36 w-full resize-none p-0.5"
                            value={guideName.value}
                            onBlur={handleGuideNameUnFocus}
                          />
                        )}
                      </div>
                      {guide.blocks.length === 0 ? (
                        <button
                          className="*:unset hover:border-foreground flex w-full rounded-md border p-1 shadow-sm"
                          onClick={() => handleAddBlock({})}
                        >
                          <div className="bg-muted text-muted-foreground relative h-full w-full flex-col items-center justify-center overflow-hidden rounded-sm p-3 py-4">
                            Get Started!
                            <div className="text-foreground mt-1 flex items-center justify-center">
                              <PlusCircle className="mr-1 h-5 w-5" /> Add Block
                            </div>
                            <div className="pointer-events-none absolute bottom-2 right-10 -rotate-6 scale-[1.6] opacity-[0.04]">
                              <LogoInverted />
                            </div>
                          </div>
                        </button>
                      ) : (
                        guide.blocks.map((block, idx) => {
                          return (
                            <Draggable
                              key={block.id}
                              draggableId={block.id}
                              index={idx}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={{
                                    position: "relative",
                                    ...provided.draggableProps.style,
                                  }}
                                  className="group"
                                >
                                  <div
                                    className="text-background absolute -top-9 left-0 flex h-4 w-full items-center justify-center opacity-80"
                                    style={{
                                      backgroundImage:
                                        "radial-gradient(hsla(215,16.3%,46.9%,0.5) 13%, transparent 13%), radial-gradient(hsla(215.4,16.3%,46.9%,0.5) 13%, transparent 13%)",
                                      backgroundRepeat: "repeat",
                                      backgroundSize: "10px 10px",
                                    }}
                                    {...provided.dragHandleProps}
                                  >
                                    <div className="bg-background mt-1 flex h-full items-center justify-center px-2">
                                      <Move className="text-muted-foreground h-4 w-4" />
                                    </div>
                                  </div>
                                  <TooltipProvider delayDuration={500}>
                                    {idx === 0 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            className="bg-muted absolute -top-20 flex w-full flex-row items-center justify-center rounded-md px-2 py-1 opacity-5 transition-opacity hover:!opacity-100 group-hover:opacity-20"
                                            onClick={() =>
                                              handleAddBlock({
                                                addBeforeIdx: idx,
                                              })
                                            }
                                          >
                                            <div className="border-foreground h-[1px] flex-grow border border-dashed bg-transparent" />
                                            <PlusCircle className="text-foreground mx-1 h-4 w-4" />
                                            <div className="border-foreground h-[1px] flex-grow border border-dashed bg-transparent" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Insert block
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    <StaticContentBlockContainer
                                      key={idx}
                                      block={block}
                                      isSelected={selectedBlock === block.id}
                                      ref={scrollContainerRef}
                                      onClick={handleBlockClick}
                                      onViewAppear={handleBlockAppearInView}
                                      onUpdateContent={
                                        debouncedStaticContentUpdateHandler
                                      }
                                      onDeleteConfirm={handleBlockDeleteConfirm}
                                    />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="bg-muted absolute -bottom-14 flex w-full flex-row items-center justify-center rounded-md px-2 py-1 opacity-5 transition-opacity hover:!opacity-100 group-hover:opacity-20"
                                          onClick={() => {
                                            handleAddBlock({ addAfterIdx: idx })
                                          }}
                                        >
                                          <div className="border-foreground h-[1px] flex-grow border border-dashed bg-transparent" />
                                          <PlusCircle className="text-foreground mx-1 h-4 w-4" />
                                          <div className="border-foreground h-[1px] flex-grow border border-dashed bg-transparent" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        Insert block
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </Draggable>
                          )
                        })
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div
                className={cn(
                  "dynamic-content absolute top-0 h-full origin-top-left overflow-hidden"
                )}
                style={{
                  width: `calc(55% - ${DEFAULT_DYNAMIC_REGION_PADDING}px)`,
                  left: `calc(45% + ${DEFAULT_DYNAMIC_REGION_PADDING / 2}px)`,
                }}
              >
                <div
                  className="dynamic-content-container relative h-full overflow-hidden"
                  style={{
                    width: `calc(100% - ${DEFAULT_DYNAMIC_CONTENT_PADDING}px)`,
                    marginLeft: DEFAULT_DYNAMIC_CONTENT_PADDING / 2,
                    backgroundImage:
                      "radial-gradient(hsla(215,16.3%,46.9%,0.5) 0.01%, transparent 6%), radial-gradient(hsla(215.4,16.3%,46.9%,0.5) 0.01%, transparent 6%)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "40px 40px",
                  }}
                  ref={dynamicContentCanvasRef}
                >
                  <div className="dynamic-content-item-canvas flex h-full w-full items-center">
                    {/* <div className="relative h-1/2 w-full overflow-hidden"> */}
                    {renderDynamicContent()}
                    {/* </div> */}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </>
  )
}
