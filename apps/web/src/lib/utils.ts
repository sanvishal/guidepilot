import { Block, DYNAMIC_CONTENT_TYPE, DynamicContent, Guide } from "@/types"
import { Permission, Role } from "appwrite"
import { FileError } from "react-dropzone"

export const grantReadWritePermission = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.write(Role.user(userId)),
]

export const grantWritePermission = (userId: string) => [
  Permission.write(Role.user(userId)),
]

export const grantReadPermission = (userId: string) => [
  Permission.read(Role.user(userId)),
]

export const scrollToElement = (
  element: HTMLElement,
  scrollContainer: HTMLDivElement,
  offsetTop: number
) => {
  if (element && scrollContainer) {
    const scrollRect = scrollContainer?.getBoundingClientRect()
    const elementRect = element?.getBoundingClientRect()
    const scrollTop =
      elementRect.top - scrollRect.top + scrollContainer.scrollTop

    scrollContainer.scrollTo({
      behavior: "smooth",
      top: scrollTop - offsetTop,
    })
  }
}

export const debounce = <F extends (...args: any) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: number = 0

  const debounced = (...args: any) => {
    clearTimeout(timeout)
    setTimeout(() => func(...args), waitFor)
  }

  return debounced as (...args: Parameters<F>) => ReturnType<F>
}

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max)

export const isUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

export const fileUtils = {
  acceptFormats: {
    "image/png": [".png"],
    "image/jpeg": [".jpeg", ".jpg"],
    "image/webp": [".webp"],
    "image/avif": [".avif"],
    "image/gif": [".gif"],
  },
  maxSize: 8000000,
  getFileErrorMessage: (err: FileError) => {
    if (err.code === "file-too-large") {
      return {
        title: "File too large",
        description: "file should not be larger than 8MB",
      }
    }

    if (err.code === "file-invalid-type") {
      return {
        title: "File type invalid",
        description: "upload only png/jpeg/webp/avif/gif files",
      }
    }
  },
  getRenamedFile: (
    file: File,
    userId: string,
    guideId: string,
    blockId: string
  ) => {
    return new File([file], `${userId}/${guideId}/${blockId}`, {
      type: file.type,
    })
  },
}

export const isFileUsedInAnyOtherBlocks = (
  blockId: string,
  blocks: Block[]
) => {
  return Boolean(
    blocks.find((block) =>
      (
        block.id !== blockId &&
        (block.dynamicContent as DynamicContent<DYNAMIC_CONTENT_TYPE.IMAGE>)
      )?.url?.includes(blockId)
    )
  )
}
