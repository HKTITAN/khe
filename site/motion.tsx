import { useState } from "react"
import { motion } from "motion/react"
import tokens from "../tokens/tokens.json"
import { Button, Icon } from "../src"

/* Motion: each spring token shown three ways. Its curve, plotted from the real stiffness and
   damping; what it feels like, on a live block; and where khe uses it. */

type SpringName = "smooth" | "snappy" | "bouncy"
const springs = tokens.primitive.spring as Record<SpringName, { $value: { stiffness: number; damping: number } }>

const USES: Record<SpringName, { what: string; where: string }> = {
  smooth: { what: "Calm, no overshoot.", where: "Sections arriving, dialogs, the page itself." },
  snappy: { what: "Quick and settled.", where: "Toggles, tabs, the selection pill, menus." },
  bouncy: { what: "One small overshoot.", where: "Skill glyphs and spots, success moments." },
}

/** Simulates the spring the way Motion does and returns its path, settle time and peak. */
function simulate(stiffness: number, damping: number) {
  let x = 0
  let v = 0
  let t = 0
  const dt = 1 / 240
  const pts: [number, number][] = [[0, 0]]
  let peak = 0
  while (t < 1.6) {
    v += (-stiffness * (x - 1) - damping * v) * dt
    x += v * dt
    t += dt
    pts.push([t, x])
    peak = Math.max(peak, x)
    if (t > 0.2 && Math.abs(x - 1) < 0.0015 && Math.abs(v) < 0.02) break
  }
  return { pts, settle: t, peak }
}

function Curve({ stiffness, damping }: { stiffness: number; damping: number }) {
  const { pts } = simulate(stiffness, damping)
  const W = 200
  const H = 96
  const top = 1.35
  const sx = (t: number) => (t / 1.2) * W
  const sy = (x: number) => H - (x / top) * (H - 8) - 4
  const d = pts.filter(([t]) => t <= 1.2).map(([t, x], i) => `${i ? "L" : "M"}${sx(t).toFixed(1)} ${sy(x).toFixed(1)}`).join("")
  return (
    <svg className="mo-curve" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <line className="mo-curve-one" x1="0" x2={W} y1={sy(1)} y2={sy(1)} />
      <line className="mo-curve-base" x1="0" x2={W} y1={sy(0)} y2={sy(0)} />
      <path className="mo-curve-line" d={d} />
    </svg>
  )
}

function SpringCard({ name, end, onPlay }: { name: SpringName; end: boolean; onPlay: () => void }) {
  const { stiffness, damping } = springs[name].$value
  const { settle, peak } = simulate(stiffness, damping)
  const over = Math.max(0, Math.round((peak - 1) * 100))
  return (
    <button type="button" className="mo-card" onClick={onPlay} aria-label={`${name} spring, ${USES[name].what} Play it`}>
      <span className="mo-head">
        <span className="mo-name">{name}</span>
        <code className="mo-vals">
          {stiffness} / {damping}
        </code>
      </span>
      <Curve stiffness={stiffness} damping={damping} />
      <span className="mo-stage" aria-hidden="true">
        <motion.span className="mo-run" initial={false} animate={{ x: end ? "100%" : "0%" }} transition={{ type: "spring", stiffness, damping }}>
          <span className="mo-block" />
        </motion.span>
      </span>
      <span className="mo-facts">
        <span>
          settles in <b>{Math.round(settle * 1000)}ms</b>
        </span>
        <span>
          overshoot <b>{over}%</b>
        </span>
      </span>
      <span className="mo-use">
        <b>{USES[name].what}</b> {USES[name].where}
      </span>
    </button>
  )
}

const RULES = [
  "Everything moves on a spring token, never a duration you picked by eye.",
  "Things enter from where they were, and leave the way they came.",
  "Nothing moves on a keystroke; typing stays instant.",
  "A second press redirects the motion mid-flight; it never waits.",
  "Reduced motion turns movement off and keeps the change.",
]

const ease = (tokens.primitive as unknown as { ease: Record<string, { $value: string } | string> }).ease
const CURVES = Object.entries(ease).filter(([k]) => !k.startsWith("$")) as [string, { $value: string }][]

/** A cubic-bezier drawn as its curve. */
function Bezier({ value }: { value: string }) {
  const [x1, y1, x2, y2] = value.match(/-?[\d.]+/g)!.map(Number)
  const W = 64
  const H = 64
  const p = (x: number, y: number) => `${(x * W).toFixed(1)} ${(H - y * (H - 16) - 8).toFixed(1)}`
  return (
    <svg className="mo-bezier" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path className="mo-bezier-line" d={`M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`} />
    </svg>
  )
}

function MotionShowcase() {
  const [end, setEnd] = useState<Record<SpringName, boolean>>({ smooth: false, snappy: false, bouncy: false })
  const flip = (n: SpringName) => setEnd((e) => ({ ...e, [n]: !e[n] }))
  const all = () => setEnd((e) => ({ smooth: !e.smooth, snappy: !e.smooth, bouncy: !e.smooth }))
  return (
    <div className="mo">
      <div className="mo-cards">
        {(["smooth", "snappy", "bouncy"] as const).map((n) => (
          <SpringCard key={n} name={n} end={end[n]} onPlay={() => flip(n)} />
        ))}
      </div>
      <div className="mo-bar">
        <Button variant="primary" onClick={all}>
          <Icon name="play" /> Play all three
        </Button>
        <span className="caption">Or click a card. Press again mid-way and it turns from where it is.</span>
      </div>
      <div className="mo-curves">
        <span className="mo-curves-head">
          For the few things that ease instead of spring, curves from <a href="https://www.easing.dev">easing.dev</a>:
        </span>
        <div className="mo-curves-row">
          {CURVES.map(([name, v]) => (
            <div key={name} className="mo-curve-card">
              <Bezier value={v.$value} />
              <code>--ease-{name}</code>
            </div>
          ))}
        </div>
      </div>
      <ul className="mo-rules">
        {RULES.map((r) => (
          <li key={r}>
            <Icon name="check" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { MotionShowcase }
