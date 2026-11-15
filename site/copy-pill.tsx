import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { motion, useSpring } from "motion/react"
import { playSound } from "../src"

/* After aave.com/brand: hovering a colour shows a soft "Copy #hex" pill that trails the pointer on a
   spring; clicking scrambles the hex into "Copied". Mouse only; a tap just copies and toasts.
   The pill is clamped inside the viewport. */

const GLYPHS = "#0123456789ABCDEF"

type Target = { hex: string; label: string } | null

function useCopyPill(onCopy: (label: string, value: string) => void) {
  const [target, setTarget] = useState<Target>(null)
  const [text, setText] = useState("")
  const [done, setDone] = useState(false)
  const pill = useRef<HTMLDivElement>(null)
  const timer = useRef<number>(undefined)
  const x = useSpring(0, { stiffness: 500, damping: 40 })
  const y = useSpring(0, { stiffness: 500, damping: 40 })

  const place = (e: React.PointerEvent, jump = false) => {
    const w = pill.current?.offsetWidth ?? 120
    const h = pill.current?.offsetHeight ?? 36
    let px = e.clientX + 18
    let py = e.clientY + 22
    if (px + w > innerWidth - 12) px = e.clientX - w - 12
    if (py + h > innerHeight - 12) py = e.clientY - h - 12
    px = Math.max(12, px)
    py = Math.max(12, py)
    if (jump) {
      x.jump(px)
      y.jump(py)
    } else {
      x.set(px)
      y.set(py)
    }
  }

  useEffect(() => () => window.clearInterval(timer.current), [])

  const bind = (hex: string, label: string) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return
      window.clearInterval(timer.current)
      setTarget({ hex, label })
      setText(`Copy ${hex}`)
      setDone(false)
      place(e, true)
    },
    onPointerMove: (e: React.PointerEvent) => e.pointerType === "mouse" && place(e),
    onPointerLeave: () => setTarget(null),
    onClick: async (e: React.MouseEvent) => {
      const mouse = (e.nativeEvent as PointerEvent).pointerType === "mouse"
      try {
        await navigator.clipboard.writeText(hex)
      } catch {
        return
      }
      if (!mouse || !target) return onCopy(hex, hex)
      playSound("copy") // the copy is done now; the scramble below is only the picture of it
      // scramble, then settle on "Copied"
      let n = 0
      window.clearInterval(timer.current)
      timer.current = window.setInterval(() => {
        n++
        if (n > 9) {
          window.clearInterval(timer.current)
          setText("Copied")
          setDone(true)
          return
        }
        setText("Copy " + Array.from(hex, (c, i) => (i < n - 2 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""))
      }, 32)
    },
  })

  const node: ReactNode = createPortal(
    <motion.div ref={pill} className="copy-pill" data-on={target ? "" : undefined} data-done={done || undefined} style={{ x, y }} aria-hidden="true">
      {text}
    </motion.div>,
    document.body,
  )

  return { bind, node }
}

export { useCopyPill }
