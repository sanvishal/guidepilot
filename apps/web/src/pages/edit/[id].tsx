import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import { Block, DYNAMIC_CONTENT_TYPE, DynamicContent, GuideEdit } from "@/types"

import { cn } from "@guidepilot/ui/lib/utils"
import { useDebounce } from "@/lib/hooks/common.hooks"
import { scrollToElement } from "@/lib/utils"
import { DynamicImageContent } from "@/components/DynamicImageContent"
import { Navbar } from "@/components/Navbar"
import {
  IStaticContentBlockContainer,
  StaticContentBlockContainer,
} from "@/components/StaticContentBlockContainer"
import { EditableDynamicImageContent } from "@/components/editables/EditableDynamicImageContent"
import { EditableStaticContent } from "@/components/editables/EditableStaticContent"

const dummyGuide: GuideEdit = {
  blocks: [
    {
      id: "1",
      staticContent: "block1",
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
      staticContent: "block2",
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
      staticContent: "block3",
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
      staticContent: "block4",
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

    const blockToUpdate = guide.blocks.find(
      (b) => b.id === blockId
    ) as Block<DYNAMIC_CONTENT_TYPE.IMAGE>
    blockToUpdate.dynamicContent.zoom = zoom
    setGuide({ ...guide })
  }

  const debouncedImageZoomHandler = useDebounce(
    handleOnImageZoomParamsChange,
    500
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
          <div className="static-content relative w-[40%] p-5">
            {guide.blocks.map((block, idx) => {
              return (
                <div
                  key={idx}
                  style={{
                    marginTop: idx === 0 ? "350px" : 0,
                    marginBottom:
                      idx === guide.blocks.length - 1 ? "350px" : "0px",
                  }}
                >
                  <StaticContentBlockContainer
                    key={idx}
                    block={block}
                    isSelected={selectedBlock === block.id}
                    ref={scrollContainerRef}
                    onClick={handleBlockClick}
                    onViewAppear={handleBlockAppearInView}
                  />
                </div>
              )
            })}
          </div>
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
