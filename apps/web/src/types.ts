export type Guide = {
  id: string
  userId: string
  name: string
}

export type GuideWithoutId = Omit<Guide, "id">

export enum DYNAMIC_CONTENT_TYPE {
  IMAGE = "IMAGE",
  CODE = "CODE",
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

export type DynamicContent<T = DYNAMIC_CONTENT_TYPE> = Extract<
  _DynamicContent,
  { type: T }
>

export type Block<T = DYNAMIC_CONTENT_TYPE> = {
  id: string
  staticContent: string
  dynamicContent: DynamicContent<T>
}

export type GuideEdit = {
  blocks: Block[]
}
