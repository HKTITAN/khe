import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import data from "./construction.json"

const top = Math.min(...data.points.map((p) => p[1]))
const PAD_X = 300
const PAD_Y = 70
const minX = -PAD_X
const minY = top - PAD_Y
const w = data.width + PAD_X * 2
const h = data.metrics.descender + 40 - minY

const guides = [
  { y: top, label: "ascender" },
  { y: data.metrics.x, label: "x-height" },
  { y: 0, label: "baseline" },
]
const verticals = [...new Set(data.glyphs.flat())]
const ends = [verticals[0], verticals[verticals.length - 1]]

function Construction() {
  const reduce = useReducedMotion()
  return (
    <svg className="construct" viewBox={`${minX} ${minY} ${w} ${h}`} role="img" aria-label="The khe wordmark drawn in Inter Black, with its anchor points and guides">
      {verticals.map((x) => (
        <line key={`v${x}`} x1={x} x2={x} y1={minY} y2={minY + h} className="g g-v" />
      ))}
      {guides.map((g) => (
        <g key={g.label}>
          <line x1={minX} x2={minX + w} y1={g.y} y2={g.y} className="g" />
          <text x={minX + 16} y={g.y - 8} className="g-label">
            {g.label}
          </text>
          {ends.map((x) => (
            <rect key={x} x={x - 4} y={g.y - 4} width={8} height={8} className="handle" />
          ))}
        </g>
      ))}
      <motion.path
        d={data.d}
        className="outline"
        initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
        whileInView={{ pathLength: 1, fillOpacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ pathLength: { duration: 1.6, ease: "easeInOut" }, fillOpacity: { delay: 1.4, duration: 0.6 } }}
      />
      {data.points.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={3.6}
          className="anchor"
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 500, damping: 26, delay: 0.3 + i * 0.012 }}
        />
      ))}
    </svg>
  )
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`frame ${className ?? ""}`}>
      <span className="f-line f-top" />
      <span className="f-line f-bottom" />
      <span className="f-line f-left" />
      <span className="f-line f-right" />
      <span className="f-handle f-tl" />
      <span className="f-handle f-tr" />
      <span className="f-handle f-bl" />
      <span className="f-handle f-br" />
      {children}
    </div>
  )
}

export { Construction, Frame }
