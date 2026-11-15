"use client"

import { useRef } from "react"
import { flushSync } from "react-dom"
import { motion, useReducedMotion } from "motion/react"
import { Switch as UISwitch } from "@ui-sdk/react/switch"
import { useWebHaptics } from "web-haptics/react"
import { Icon } from "../icons"
import { playSound } from "../sound"

type Theme = "light" | "dark"

type ThemeToggleProps = {
  value: Theme
  onChange: (theme: Theme) => void
}

/** One switch: a click anywhere flips light and dark, and the new theme sweeps out from the click as
 *  a circle (a view transition). While a sweep runs the switch ignores clicks, so the page never has
 *  two themes in flight. Behaviour from ui-sdk's Switch. */
function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const origin = useRef<{ x: number; y: number } | null>(null)
  const busy = useRef(false)
  const reduce = useReducedMotion()
  const { trigger } = useWebHaptics()
  const dark = value === "dark"

  const flip = (next: boolean) => {
    if (busy.current) return
    const theme: Theme = next ? "dark" : "light"
    if (!document.startViewTransition || reduce) {
      playSound(theme)
      return onChange(theme)
    }
    busy.current = true
    trigger("nudge")
    const { x, y } = origin.current ?? { x: innerWidth - 40, y: 32 }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const t = document.startViewTransition(() => {
      flushSync(() => onChange(theme))
    })
    t.ready
      .then(() => {
        playSound(theme) // with the sweep's first frame, the moment the new theme shows
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 520, easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-in-out-cubic").trim() || "ease-in-out", pseudoElement: "::view-transition-new(root)" },
        )
      })
      .catch(() => {})
    t.finished.finally(() => {
      busy.current = false
    })
  }

  return (
    <UISwitch
      className="khe-theme"
      aria-label="Dark theme"
      checked={dark}
      onCheckedChange={flip}
      onPointerDown={(e) => (origin.current = { x: e.clientX, y: e.clientY })}
      onKeyDown={(e) => {
        const b = e.currentTarget.getBoundingClientRect()
        origin.current = { x: b.left + b.width / 2, y: b.top + b.height / 2 }
      }}
    >
      <motion.span
        className="khe-theme-thumb"
        aria-hidden="true"
        initial={false}
        animate={{ x: dark ? 26 : 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
      >
        <span className="khe-theme-icon khe-theme-sun">
          <Icon name="sun" />
        </span>
        <span className="khe-theme-icon khe-theme-moon">
          <Icon name="moon" />
        </span>
      </motion.span>
    </UISwitch>
  )
}

export { ThemeToggle }
export type { Theme, ThemeToggleProps }
