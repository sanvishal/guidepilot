import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"

export const EditableCodeBlock = ({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
}) => {
  return (
    <NodeViewWrapper className="code-block relative">
      <select
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
        className="absolute right-2 top-2 rounded-sm px-1 py-0.5"
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang, index) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}
