"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

type CountProps = {
  /** The figure as it should finally read, e.g. "17,300+", "3rd", "2.5k+", "100K+". The number part
   *  counts up; whatever comes before or after it (a +, a k, a %) stays as written. */
  value: string
  /** Seconds. */
  duration?: number
}

const NUMBER = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/

/** A figure that counts up the first time it scrolls into view. The final value is in the server HTML
 *  and is what screen readers get; reduced motion shows it at once. */
function Count({ value, duration = 1.2 }: CountProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" })
  const reduce = useReducedMotion()
  const m = value.match(NUMBER)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    if (!m || reduce || !seen) return
    const [, pre, num, post] = m
    const target = parseFloat(num.replace(/,/g, ""))
    const decimals = num.includes(".") ? num.split(".")[1].length : 0
    const grouped = num.includes(",")
    const fmt = (n: number) => {
      const s = n.toFixed(decimals)
      return grouped ? Number(s).toLocaleString("en-US", { minimumFractionDigits: decimals }) : s
    }
    setShown(pre + fmt(0) + post)
    const c = animate(0, target, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (n) => setShown(pre + fmt(n) + post) })
    return () => c.stop()
    // the figure is fixed per instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, reduce])

  return (
    <span ref={ref} className="khe-count" aria-label={value}>
      <span aria-hidden="true">{shown}</span>
    </span>
  )
}

export { Count }
export type { CountProps }
