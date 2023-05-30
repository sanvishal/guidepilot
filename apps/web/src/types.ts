import { JSONContent } from "@tiptap/react"

type DateTimeInfo = Partial<{
  updatedAt: string
  createdAt: string
}>

export type UnSerializedGuide = {
  id: string
  userId: string
  name: string
  blocks: string[]
} & DateTimeInfo

export type UnserializedGuideWithoutId = Omit<UnSerializedGuide, "id">

export type Guide = Omit<UnSerializedGuide, "blocks"> & {
  blocks: Block[]
}

export enum DYNAMIC_CONTENT_TYPE {
  IMAGE = "IMAGE",
  CODE = "CODE",
  PLACEHOLDER = "PLACEHOLDER",
}

export type ContentZoom = {
  x: number
  y: number
  amount: number
}

type _DynamicContent =
  | {
      type: DYNAMIC_CONTENT_TYPE.IMAGE
      url: string
      zoom: ContentZoom
    }
  | { type: DYNAMIC_CONTENT_TYPE.CODE; code: string }
  | {
      type: DYNAMIC_CONTENT_TYPE.PLACEHOLDER
    }

export type DynamicContent<T = DYNAMIC_CONTENT_TYPE> = Extract<
  _DynamicContent,
  { type: T }
>

export type Block<T = DYNAMIC_CONTENT_TYPE> = {
  id: string
  staticContent: JSONContent
  dynamicContent: DynamicContent<T>
}
