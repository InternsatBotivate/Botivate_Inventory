import * as React from "react"
import { cn } from "../../lib/utils"

const ChartContainer = React.forwardRef(({ className, config, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("w-full h-full", className)}
      style={{
        "--color-current": "#3b82f6",
        "--color-max": "#e2e8f0",
        "--chart-1": "#3b82f6",
        "--chart-2": "#e2e8f0",
        ...Object.entries(config || {}).reduce((acc, [key, value]) => {
          acc[`--color-${key}`] = value.color
          return acc
        }, {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

export { ChartContainer }
