import { Block, DYNAMIC_CONTENT_TYPE } from "@/types"

interface IDynamicImageContent {
  block: Block
}

export const DynamicImageContent = (props: IDynamicImageContent) => {
  if (props.block.dynamicContent.type === DYNAMIC_CONTENT_TYPE.IMAGE) {
    const content = props.block.dynamicContent

    return (
      <img
        src={content.url}
        key={content.url}
        // onLoad={handleImageLoad}
        // className="object-cover"
        style={{
          maxHeight: "100%",
          width: "100%",
          objectFit: "contain",
          transformOrigin: "top left",
          transform: `translate(${-content.zoom.x * 100}%, ${
            -content.zoom.y * 100
          }%) scale(${content.zoom.amount})`,
          transition: "all 0.45s cubic-bezier(0.6, 0.02, 0.05, 0.9)",
        }}
        alt=""
      />
    )
  }

  return <></>
}
