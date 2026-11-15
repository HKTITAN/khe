"use client"

import type { ComponentProps } from "react"
import { Icon, type IconName } from "../icons"
import { playSound } from "../sound"
import {
  SegmentedControl as UISegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

type SegmentedOption<T extends string> = { value: T; label: string; icon?: IconName }

type SegmentedControlProps<T extends string> = Omit<
  ComponentProps<typeof UISegmentedControl>,
  "className" | "style" | "render" | "children" | "value" | "defaultValue" | "onValueChange"
> & {
  "aria-label": string
  options: readonly SegmentedOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

function SegmentedControl<T extends string>({ options, onValueChange, ...props }: SegmentedControlProps<T>) {
  return (
    <UISegmentedControl
      {...props}
      onValueChange={(v) => {
        playSound("tick")
        onValueChange?.(v as T)
      }}
    >
      <SegmentedControlIndicator />
      {options.map((o) => (
        <SegmentedControlItem key={o.value} value={o.value}>
          {o.icon && <Icon name={o.icon} />}
          <span className="khe-seg-label">{o.label}</span>
        </SegmentedControlItem>
      ))}
    </UISegmentedControl>
  )
}

export { SegmentedControl }
export type { SegmentedControlProps, SegmentedOption }
