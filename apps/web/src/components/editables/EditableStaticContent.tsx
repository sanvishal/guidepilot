import { Block } from "@/types"

import { TiptapEditor } from "./TiptapEditor"

interface IEditableStaticContent {
  block: Block
}

export const EditableStaticContent = (props) => {
  return <TiptapEditor />
}
