"use client"

import { useEffect, useRef, useState } from "react"
import { Button as UIButton } from "@ui-sdk/react/button"
import { useWebHaptics } from "web-haptics/react"
import { Icon } from "../icons"
import { playSound } from "../sound"

type CopyButtonProps = {
  /** What lands on the clipboard. */
  value: string
  /** The tooltip before copying, e.g. "Copy SVG". */
  label: string
  /** The tooltip after copying. */
  done?: string
}

/** A round icon button with a tooltip whose label rolls from `label` to `done` on copy,
 *  after aave.com/brand. Behaviour from ui-sdk's Button. */
function CopyButton({ value, label, done = "Copied" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [align, setAlign] = useState<"center" | "start" | "end">("center")
  const timer = useRef(0)
  const { trigger } = useWebHaptics()
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      trigger("success")
      playSound("copy")
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const fit = (el: HTMLElement) => {
    const tip = el.querySelector<HTMLElement>(".khe-copy-tip")
    if (!tip) return
    const r = el.getBoundingClientRect()
    const half = tip.offsetWidth / 2
    const mid = r.left + r.width / 2
    setAlign(mid + half > innerWidth - 12 ? "end" : mid - half < 12 ? "start" : "center")
  }

  return (
    <UIButton
      className="khe-copy"
      data-copied={copied || undefined}
      data-align={align}
      aria-label={copied ? done : label}
      onClick={copy}
      onPointerEnter={(e) => fit(e.currentTarget)}
      onFocus={(e) => fit(e.currentTarget)}
    >
      <span className="khe-copy-face">
        <Icon name="copy" className="khe-copy-icon khe-copy-icon-copy" />
        <Icon name="check" className="khe-copy-icon khe-copy-icon-check" />
      </span>
      <span className="khe-copy-tip" aria-hidden="true">
        <span className="khe-copy-roll">
          <span className="khe-copy-label">{label}</span>
          <span className="khe-copy-label khe-copy-done">{done}</span>
        </span>
        <svg className="khe-copy-tail" viewBox="0 0 12 6" aria-hidden="true">
          <path d="M0 0h12L7.4 4.6a2 2 0 0 1-2.8 0z" />
        </svg>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? done : ""}
      </span>
    </UIButton>
  )
}

export { CopyButton }
export type { CopyButtonProps }
