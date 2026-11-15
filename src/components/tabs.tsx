"use client"

import type { ComponentProps, ReactNode } from "react"
import {
  Tabs as UITabs,
  TabsIndicator,
  TabsList as UITabsList,
  TabsPanel as UITabsPanel,
  TabsTab as UITabsTab,
} from "@ui-sdk/react/tabs"
import { playSound } from "../sound"

type NoEscape = "className" | "style" | "render"

function Tabs({ onValueChange, ...props }: Omit<ComponentProps<typeof UITabs>, NoEscape>) {
  return (
    <UITabs
      {...props}
      onValueChange={(value, details) => {
        playSound("tick")
        onValueChange?.(value, details)
      }}
    />
  )
}
function TabsList({
  children,
  ...props
}: Omit<ComponentProps<typeof UITabsList>, NoEscape | "children"> & { "aria-label": string; children: ReactNode }) {
  return (
    <UITabsList {...props}>
      {children}
      <TabsIndicator />
    </UITabsList>
  )
}
function TabsTab(props: Omit<ComponentProps<typeof UITabsTab>, NoEscape>) {
  return <UITabsTab {...props} />
}
function TabsPanel(props: Omit<ComponentProps<typeof UITabsPanel>, NoEscape>) {
  return <UITabsPanel {...props} />
}

export { Tabs, TabsList, TabsPanel, TabsTab }
