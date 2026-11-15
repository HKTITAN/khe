"use client"

import type { ComponentProps, ElementType, ReactNode } from "react"
import { Checkbox as UICheckbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import {
  Dialog as UIDialog,
  DialogBackdrop as UIDialogBackdrop,
  DialogClose as UIDialogClose,
  DialogContent as UIDialogContent,
  DialogDescription as UIDialogDescription,
  DialogTitle as UIDialogTitle,
  DialogTrigger as UIDialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Menu as UIMenu,
  MenuContent as UIMenuContent,
  MenuContextTrigger as UIMenuContextTrigger,
  MenuItem as UIMenuItem,
  MenuItemIcon as UIMenuItemIcon,
  MenuSeparator as UIMenuSeparator,
  MenuShortcut as UIMenuShortcut,
  MenuTrigger as UIMenuTrigger,
} from "@ui-sdk/react/menu"
import { Slider as UISlider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@ui-sdk/react/slider"
import { Tooltip as UITooltip, TooltipArrow, TooltipContent as UITooltipContent, TooltipTrigger as UITooltipTrigger } from "@ui-sdk/react/tooltip"
import { Icon } from "../icons"

type NoEscape = "className" | "style"

/** khe parts are ui-sdk parts with the styling escape hatches removed; the look comes from khe.css. */
function part<C extends ElementType>(C: C, defaults?: Partial<ComponentProps<C>>) {
  return function KhePart(props: Omit<ComponentProps<C>, NoEscape>) {
    const Comp = C as ElementType
    return <Comp {...defaults} {...props} />
  }
}

const Menu = part(UIMenu)
const MenuTrigger = part(UIMenuTrigger)
const MenuContextTrigger = part(UIMenuContextTrigger)
const MenuContent = part(UIMenuContent, { sideOffset: 6, collisionPadding: 12 } as Partial<ComponentProps<typeof UIMenuContent>>)
const MenuItem = part(UIMenuItem)
const MenuItemIcon = part(UIMenuItemIcon)
const MenuSeparator = part(UIMenuSeparator)
const MenuShortcut = part(UIMenuShortcut)

const Dialog = part(UIDialog)
const DialogTrigger = part(UIDialogTrigger)
const DialogBackdrop = part(UIDialogBackdrop)
const DialogContent = part(UIDialogContent)
const DialogTitle = part(UIDialogTitle)
const DialogDescription = part(UIDialogDescription)
const DialogClose = part(UIDialogClose)

/** A tooltip around one trigger. `content` is plain text only. */
function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <UITooltip>
      <UITooltipTrigger render={<span className="khe-tooltip-trigger" />}>{children}</UITooltipTrigger>
      <UITooltipContent sideOffset={8}>
        {content}
        <TooltipArrow />
      </UITooltipContent>
    </UITooltip>
  )
}

type CheckboxProps = Omit<ComponentProps<typeof UICheckbox>, NoEscape | "render" | "children"> & { label: ReactNode }

function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <Field data-kind="checkbox">
      <UICheckbox {...props}>
        <CheckboxIndicator aria-hidden="true">
          <Icon name="check" size={12} />
        </CheckboxIndicator>
      </UICheckbox>
      <FieldLabel>{label}</FieldLabel>
    </Field>
  )
}

type SliderProps = Omit<ComponentProps<typeof UISlider>, NoEscape | "render" | "children"> & { "aria-label": string; showValue?: boolean }

function Slider({ "aria-label": label, showValue = true, ...props }: SliderProps) {
  return (
    <UISlider {...props}>
      {showValue && <SliderValue />}
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label={label} />
        </SliderTrack>
      </SliderControl>
    </UISlider>
  )
}

export {
  Checkbox,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Menu,
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuItemIcon,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
  Slider,
  Tooltip,
}
export type { CheckboxProps, SliderProps }
