"use client"

import { useState, type ReactNode } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
} from "@ui-sdk/react/command"
import { Dialog, DialogBackdrop, DialogContent, DialogShortcut, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog"
import { Icon, type IconName } from "../icons"
import { playSound, typingSound } from "../sound"

type PaletteItem = { value: string; label: string; icon?: IconName; hint?: ReactNode; keywords?: string[] }
type PaletteGroup = { label: string; items: PaletteItem[] }

type CommandPaletteProps = {
  groups: PaletteGroup[]
  onAction: (value: string) => void
  /** Text on the trigger, like "Search". */
  label?: string
  placeholder?: string
}

/** A search pill that opens a command palette, also on Cmd/Ctrl+K. Behaviour from ui-sdk's
 *  Command inside its Dialog: filtering, arrow keys, Enter, Escape and focus return. */
function CommandPalette({ groups, onAction, label = "Search", placeholder = "Search sections, tokens, actions" }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        playSound(next ? "open" : "close")
        setOpen(next)
      }}
    >
      <DialogTrigger className="khe-search" shortcut="mod+k">
        <Icon name="search" />
        <span className="khe-search-label">{label}</span>
        <DialogShortcut className="khe-search-keys" />
      </DialogTrigger>
      <DialogBackdrop />
      <DialogContent className="khe-palette">
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <Command
          loop
          autoHighlight
          onAction={(value) => {
            playSound("select")
            setOpen(false)
            onAction(value)
          }}
        >
          <div className="khe-palette-field">
            <Icon name="search" />
            <CommandInput aria-label={label} placeholder={placeholder} onKeyDown={typingSound} />
          </div>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandList>
            {groups.map((g) => (
              <CommandGroup key={g.label}>
                <CommandGroupLabel>{g.label}</CommandGroupLabel>
                {g.items.map((it) => (
                  <CommandItem key={it.value} value={it.value} label={it.label} keywords={it.keywords}>
                    {it.icon && (
                      <CommandItemIcon>
                        <Icon name={it.icon} />
                      </CommandItemIcon>
                    )}
                    <CommandItemText />
                    {it.hint && <span className="khe-palette-hint">{it.hint}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export { CommandPalette }
export type { CommandPaletteProps, PaletteGroup, PaletteItem }
