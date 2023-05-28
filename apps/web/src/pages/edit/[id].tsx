import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import { Block, DYNAMIC_CONTENT_TYPE, DynamicContent, GuideEdit } from "@/types"
import { JSONContent } from "@tiptap/react"
import { Move } from "lucide-react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"

import { cn } from "@guidepilot/ui/lib/utils"
import { useDebounce } from "@/lib/hooks/common.hooks"
import { scrollToElement } from "@/lib/utils"
import { Navbar } from "@/components/Navbar"
import {
  IStaticContentBlockContainer,
  StaticContentBlockContainer,
} from "@/components/StaticContentBlockContainer"
import { EditableDynamicImageContent } from "@/components/editables/EditableDynamicImageContent"

const dummyGuide: GuideEdit = {
  blocks: [
    {
      id: "1",
      staticContent: {},
      dynamicContent: {
        type: DYNAMIC_CONTENT_TYPE.IMAGE,
        url: "https://comicbookmovie.com/images/articles/banners/198854.jpeg",
        zoom: {
          x: 0,
          y: 0,
          amount: 1,
        },
      },
    },
    {
      id: "4",
      staticContent: {},
      dynamicContent: {
        type: DYNAMIC_CONTENT_TYPE.IMAGE,
        url: "https://comicbookmovie.com/images/articles/banners/198854.jpeg",
        zoom: {
          x: 1,
          y: 1,
          amount: 2,
        },
      },
    },
    {
      id: "2",
      staticContent: {},
      dynamicContent: {
        type: DYNAMIC_CONTENT_TYPE.IMAGE,
        url: "https://static.wikia.nocookie.net/sonypicturesanimation/images/f/f8/Spider-Man_Across_the_Spider-Verse_poster_4.png",
        zoom: {
          x: 0,
          y: 0,
          amount: 1,
        },
      },
    },
    {
      id: "1.2",
      staticContent: {},
      dynamicContent: {
        type: DYNAMIC_CONTENT_TYPE.IMAGE,
        url: "https://static.wikia.nocookie.net/sonypicturesanimation/images/f/f8/Spider-Man_Across_the_Spider-Verse_poster_4.png",
        zoom: {
          x: 0.5,
          y: 0.5,
          amount: 2,
        },
      },
    },
  ],
}

const DEFAULT_DYNAMIC_REGION_PADDING = 60
const DEFAULT_DYNAMIC_CONTENT_PADDING = 40
export default function EditGuide() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dynamicContentCanvasRef = useRef<HTMLDivElement>(null)
  const [selectedBlock, setSelectedBlock] = useState("1")
  const [guide, setGuide] = useState<GuideEdit>(dummyGuide)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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

  useEffect(() => {
    console.log(guide)
  }, [guide])

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
    },
    1200
  )

  const currentBlock = guide.blocks.find((block) => block.id === selectedBlock)

  const renderDynamicContent = () => {
    switch (currentBlock.dynamicContent.type) {
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

  useEffect(() => {
    console.log(guide)
  }, [guide])

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
        <div
          ref={scrollContainerRef}
          className="scroll-area h-full w-full overflow-x-hidden overflow-y-scroll"
        >
          {isLoaded && (
            <DragDropContext onDragEnd={handleBlockReorder}>
              <Droppable droppableId="static-content-list">
                {(provided, snapshot) => (
                  <div
                    className="static-content relative my-[350px] w-[40%] p-5"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
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
          )}
          <div
            className={cn(
              "dynamic-content absolute top-0 h-full origin-top-left overflow-hidden"
            )}
            style={{
              width: `calc(60% - ${DEFAULT_DYNAMIC_REGION_PADDING}px)`,
              left: `calc(40% + ${DEFAULT_DYNAMIC_REGION_PADDING / 2}px)`,
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
      </main>
    </>
  )
}
