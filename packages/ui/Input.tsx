import * as React from "react"

import { cn } from "./lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconPadding?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPadding, ...props }, ref) => {
    if (icon) {
      return (
        <label className="relative block text-gray-400 focus-within:text-gray-600">
          <div
            className={cn(
              "pointer-events-none absolute flex h-full w-9 items-center justify-center",
              iconPadding || "p-2.5"
            )}
          >
            {icon}
          </div>
          <input
            ref={ref}
            type={type}
            className={cn(
              "border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent py-3 pl-9 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          />
        </label>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
