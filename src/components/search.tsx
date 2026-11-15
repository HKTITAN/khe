"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { playSound, typingSound } from "../sound"

type SearchProps = {
  /** The field's accessible name and placeholder. */
  label?: string
  value: string
  onValueChange: (value: string) => void
  /** Open width in px. */
  width?: number
}

const SIZE = 40

/** A search that starts as a round lens button and opens into the field as one object: the circle
 *  stretches into a pill, the lens slides to the field's left edge, the field takes focus. Empty and
 *  blurred, or on Escape, it folds back into the button. Our own build of the behaviour of Bencho's
 *  Seek block. */
function Search({ label = "Search", value, onValueChange, width = 260 }: SearchProps) {
  const [open, setOpen] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const reduce = useReducedMotion()
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 520, damping: 40, mass: 0.9 }

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  const close = () => {
    onValueChange("")
    setOpen(false)
    playSound("close")
  }

  return (
    <motion.div
      className="khe-seek"
      data-open={open || undefined}
      initial={false}
      animate={{ width: open ? width : SIZE }}
      transition={spring}
      onClick={() => {
        if (!open) {
          setOpen(true)
          playSound("open")
        }
      }}
    >
      <motion.button
        type="button"
        className="khe-seek-lens"
        aria-label={open ? label : `Open ${label.toLowerCase()}`}
        aria-expanded={open}
        tabIndex={open ? -1 : 0}
        initial={false}
        animate={{ x: open ? -((SIZE - 34) / 2) + 2 : 0 }}
        transition={spring}
      >
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="7.6" cy="7.6" r="5.4" />
          <path d="M11.6 11.6 15.4 15.4" />
        </svg>
      </motion.button>
      <input
        ref={input}
        className="khe-seek-field"
        type="search"
        placeholder={label}
        aria-label={label}
        tabIndex={open ? 0 : -1}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          typingSound(e)
          if (e.key === "Escape") close()
        }}
        onBlur={() => {
          if (!value) setOpen(false)
        }}
      />
    </motion.div>
  )
}

export { Search }
export type { SearchProps }
