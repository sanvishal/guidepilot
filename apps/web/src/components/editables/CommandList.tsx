import { Component, useEffect, useState } from "react"
import { ReactRenderer } from "@tiptap/react"
import { Command, Heading1, List, Quote, Slash, Type } from "lucide-react"
import tippy from "tippy.js"

import { Button } from "@guidepilot/ui"
import { cn } from "@guidepilot/ui/lib/utils"

const getCommandIcon = (name: string, className: string) => {
  switch (name) {
    case "title":
      return <Heading1 className={className} />
    case "subtitle":
      return <Heading1 className={className} />
    case "text":
      return <Type className={className} />
    case "bullet list":
      return <List className={className} />
    case "quote":
      return <Quote className={className} />
    default:
      return <Command className={className} />
  }
}

class CommandsList extends Component<{
  items: { title: string }[]
  command: (item: any) => void
}> {
  state = {
    selectedIndex: 0,
  }

  componentDidUpdate(oldProps) {
    if (this.props.items !== oldProps.items) {
      this.setState({
        selectedIndex: 0,
      })
    }
  }

  onKeyDown({ event }) {
    if (this.props.items.length === 0) {
      return false
    }

    if (event.key === "ArrowUp") {
      this.upHandler()
      return true
    }

    if (event.key === "ArrowDown") {
      this.downHandler()
      return true
    }

    if (event.key === "Enter") {
      this.enterHandler()
      return true
    }

    return false
  }

  upHandler() {
    this.setState({
      selectedIndex:
        (this.state.selectedIndex + this.props.items.length - 1) %
        this.props.items.length,
    })
  }

  downHandler() {
    this.setState({
      selectedIndex: (this.state.selectedIndex + 1) % this.props.items.length,
    })
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex)
  }

  selectItem(index) {
    const item = this.props.items[index]

    if (item) {
      this.props.command(item)
    }
  }

  render() {
    const { items } = this.props
    return items.length ? (
      <div className="bg-popover text-popover-foreground flex min-w-[150px] flex-col items-start justify-center rounded-md border p-1 shadow-md">
        {items?.map((item, idx) => {
          return (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start px-1 capitalize",
                this.state.selectedIndex === idx ? "bg-muted" : ""
              )}
            >
              <div className="bg-foreground mr-2 flex items-center justify-center rounded-sm p-1.5">
                {getCommandIcon(item.title, "h-4 w-4 text-background")}
              </div>
              {item.title}
            </Button>
          )
        })}
      </div>
    ) : (
      <></>
    )
  }
}

export const renderCommandsList = () => {
  let component
  let popup

  return {
    onStart: (props) => {
      component = new ReactRenderer(CommandsList, {
        props,
        editor: props.editor,
      })

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-end",
      })
    },
    onUpdate(props) {
      component.updateProps(props)

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect,
      })
    },
    onKeyDown(props) {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide()

        return true
      }

      return component.ref?.onKeyDown(props)
    },
    onExit() {
      popup[0].destroy()
      component.destroy()
    },
  }
}
