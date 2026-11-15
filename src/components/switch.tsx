"use client"

import type { ComponentProps, ReactNode } from "react"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Switch as UISwitch, SwitchThumb } from "@ui-sdk/react/switch"
import { playSound } from "../sound"

type SwitchProps = Omit<ComponentProps<typeof UISwitch>, "className" | "style" | "render" | "children"> & {
  label: ReactNode
}

function Switch({ label, onCheckedChange, ...props }: SwitchProps) {
  return (
    <Field data-kind="switch">
      <UISwitch
        {...props}
        onCheckedChange={(checked, details) => {
          playSound("tick")
          onCheckedChange?.(checked, details)
        }}
      >
        <SwitchThumb />
      </UISwitch>
      <FieldLabel>{label}</FieldLabel>
    </Field>
  )
}

export { Switch }
export type { SwitchProps }
