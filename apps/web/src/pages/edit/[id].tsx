import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { Block, DYNAMIC_CONTENT_TYPE, DynamicContent, Guide } from "@/types"
import { JSONContent } from "@tiptap/react"
import { Loader, MousePointerClick, Move } from "lucide-react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"

import { cn } from "@guidepilot/ui/lib/utils"
import { useDebounce, useOnClickOutside } from "@/lib/hooks/common.hooks"
import {
  useGetGuideByIdQuery,
  useUpdateGuideName,
} from "@/lib/hooks/guides.hooks"
import { scrollToElement } from "@/lib/utils"
import { Navbar } from "@/components/Navbar"
import {
  IStaticContentBlockContainer,
  StaticContentBlockContainer,
} from "@/components/StaticContentBlockContainer"
import { EditableDynamicImageContent } from "@/components/editables/EditableDynamicImageContent"

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
    setGuide((currGuides) => {
      return {
        ...currGuides,
        blocks: currGuides.blocks.map((block) => {
          if (
            block.id === blockId &&
            block.dynamicContent.type === DYNAMIC_CONTENT_TYPE.IMAGE
          ) {
            block.dynamicContent.zoom = zoom
          }
          return block
        }),
      }
    })
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
          return {
            ...currGuides,
            blocks: currGuides.blocks.map((block) => {
              if (block.id === blockId) {
                block.staticContent = updatedContent
              }
              return block
            }),
          }
        })
      }
    },
    200
  )

  const currentBlock = guide?.blocks?.find(
    (block) => block.id === selectedBlock
  )

  const renderDynamicContent = () => {
    switch (currentBlock?.dynamicContent.type) {
      case DYNAMIC_CONTENT_TYPE.IMAGE:
        return (
          <EditableDynamicImageContent
            block={currentBlock as Block<DYNAMIC_CONTENT_TYPE.IMAGE>}
            ref={dynamicContentCanvasRef}
            onZoomParamsChange={debouncedImageZoomHandler}
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

    setGuide((g) => {
      return { ...g, blocks: result }
    })
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
                            "text-muted-foreground absolute -bottom-6 right-0 flex items-center text-sm transition-opacity",
                            guideName.isFocused
                              ? "opacity-0"
                              : "opacity-0 group-hover:opacity-100"
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
                      {guide.blocks.map((block, idx) => {
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
                                  // marginTop:
                                  //   idx === 0 && !snapshot.isDragging
                                  //     ? "350px"
                                  //     : 0,
                                  // marginBottom:
                                  //   idx === guide.blocks.length - 1 &&
                                  //   !snapshot.isDragging
                                  //     ? "350px"
                                  //     : "0px",
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div
                                  className="text-background absolute -top-9 left-0 flex h-6 w-full items-center opacity-80"
                                  style={{
                                    backgroundImage:
                                      "radial-gradient(hsla(215,16.3%,46.9%,0.5) 13%, transparent 13%), radial-gradient(hsla(215.4,16.3%,46.9%,0.5) 13%, transparent 13%)",
                                    backgroundRepeat: "repeat",
                                    backgroundSize: "15px 15px",
                                  }}
                                  {...provided.dragHandleProps}
                                >
                                  <div className="bg-background flex h-full w-6 items-center">
                                    <Move className="text-muted-foreground ml-2 h-4 w-4" />
                                  </div>
                                </div>
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
                                />
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
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
