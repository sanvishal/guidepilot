import { MouseEvent, useCallback, useState } from "react"
import { useRouter } from "next/router"
import { Guide } from "@/types"
import dayjs from "dayjs"
import { MoreHorizontal, Trash } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@guidepilot/ui"
import { cn } from "@guidepilot/ui/lib/utils"
import { LogoInverted } from "./LogoInverted"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip"

interface IGuideCard {
  guide: Guide
}

export const GuideCard = (props: IGuideCard) => {
  const router = useRouter()

  const handleGuideClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      router.push(`/edit/${props.guide.id}`)
    },
    [props.guide]
  )

  return (
    <div
      className="bg-muted group relative flex h-48 w-72 cursor-pointer flex-col justify-between overflow-hidden rounded-md border p-3 transition-all hover:scale-[1.01] hover:shadow-sm"
      tabIndex={1}
    >
      <div className="h-36 w-full" onClick={handleGuideClick}>
        <h1 className="font-display text-xl font-medium">{props.guide.name}</h1>
      </div>
      <div
        className={cn(
          "ml-auto flex items-center transition-opacity group-hover:opacity-100"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="z-20 cursor-context-menu">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="hover:bg-border flex items-center justify-center rounded-sm bg-transparent p-1 px-1.5">
                    <MoreHorizontal className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>options</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="focus:bg-destructive-background">
              <Trash className="mr-2 h-4 w-4" />
              Delete Guide
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground">
              Last updated
              <p>{dayjs(props.guide.updatedAt).format("DD MMM YYYY")}</p>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="pointer-events-none absolute bottom-7 left-7 -rotate-6 scale-[2.2] opacity-[0.04]">
        <LogoInverted />
      </div>
    </div>
  )
}
