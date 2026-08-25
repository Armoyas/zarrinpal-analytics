import * as React from "react"

export type SeparatorOrientation = "horizontal" | "vertical"

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = false, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={`
        shrink-0 bg-border
        ${
          orientation === "horizontal"
            ? "h-px w-full"
            : "h-full w-px"
        }
      `}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }
