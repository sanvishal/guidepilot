import { Permission, Role } from "appwrite"

export const grantReadWritePermission = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.write(Role.user(userId)),
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
