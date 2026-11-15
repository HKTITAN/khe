import tokens from "../tokens/tokens.json"
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react"
import { SegmentedControl } from "../src"

/* Inline tweaks. Each one lives in a TweakScope around the demo it changes, and writes its CSS
   variables on that scope only, so trying a value changes that example and nothing else on the page. */

type Highlight = "yellow" | "pink" | "green" | "blue"
type Grey = "sand" | "gray" | "slate"
type State = { headingWeight: number; upper: boolean; highlight: Highlight; grey: Grey; radius: number }

const DEFAULTS: State = { headingWeight: 900, upper: true, highlight: "yellow", grey: "sand", radius: 1 }

const HIGHLIGHT: Record<Highlight, string> = {
  yellow: "oklch(0.92 0.16 98)",
  pink: "oklch(0.87 0.11 350)",
  green: "oklch(0.89 0.14 150)",
  blue: "oklch(0.87 0.08 240)",
}

const color = tokens.primitive.color as unknown as Record<string, Record<string, { $value: string }>>
const ramp = (name: string) => Object.entries(color[name]).map(([step, v]) => ({ step, value: v.$value }))

function toVars(s: State): CSSProperties {
  const vars: Record<string, string> = {}
  if (s.headingWeight !== DEFAULTS.headingWeight) vars["--heading-weight"] = String(s.headingWeight)
  if (s.upper !== DEFAULTS.upper) vars["--heading-case"] = s.upper ? "uppercase" : "none"
  if (s.highlight !== DEFAULTS.highlight) vars["--highlight"] = HIGHLIGHT[s.highlight]
  if (s.radius !== DEFAULTS.radius) {
    vars["--radius-badge"] = `${Math.round(6 * s.radius)}px`
    vars["--radius-control"] = `${Math.round(8 * s.radius)}px`
    vars["--radius-card"] = `${Math.round(12 * s.radius)}px`
  }
  return vars as CSSProperties
}

type Ctx = { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void }
const TweakContext = createContext<Ctx | null>(null)

function TweakScope({ children, className }: { children: ReactNode; className?: string }) {
  const [s, setS] = useState<State>(DEFAULTS)
  const ctx: Ctx = { s, set: (k, v) => setS((p) => ({ ...p, [k]: v })) }
  return (
    <TweakContext.Provider value={ctx}>
      <div className={`tweak-scope ${className ?? ""}`} style={toVars(s)}>
        {children}
      </div>
    </TweakContext.Provider>
  )
}

function useTweaks() {
  const ctx = useContext(TweakContext)
  if (!ctx) throw new Error("useTweaks needs a <TweakScope> around it")
  return ctx
}

/** The grey ramp the nearest scope has picked, in the current theme. */
function useGreyRamp(dark: boolean) {
  const { s } = useTweaks()
  const name = s.grey[0].toUpperCase() + s.grey.slice(1)
  return { name, steps: ramp(dark ? `${s.grey}-dark` : s.grey) }
}

/** A label and a segmented choice on one quiet line, no box around it. */
function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="choice">
      <span className="choice-label">{label}</span>
      <SegmentedControl aria-label={label} value={value} onValueChange={onChange} options={options} />
    </div>
  )
}

function HeadingChoices() {
  const { s, set } = useTweaks()
  return (
    <div className="choices">
      <Choice
        label="Weight"
        value={String(s.headingWeight) as "500" | "700" | "900"}
        onChange={(v) => set("headingWeight", Number(v))}
        options={[
          { value: "500", label: "Medium" },
          { value: "700", label: "Bold" },
          { value: "900", label: "Black" },
        ]}
      />
      <Choice
        label="Case"
        value={s.upper ? "caps" : "sentence"}
        onChange={(v) => set("upper", v === "caps")}
        options={[
          { value: "caps", label: "CAPS" },
          { value: "sentence", label: "Sentence" },
        ]}
      />
    </div>
  )
}

function GreyChoice() {
  const { s, set } = useTweaks()
  return (
    <Choice
      label="Grey"
      value={s.grey}
      onChange={(v) => set("grey", v)}
      options={[
        { value: "sand", label: "Sand" },
        { value: "gray", label: "Gray" },
        { value: "slate", label: "Slate" },
      ]}
    />
  )
}

function HighlightDots() {
  const { s, set } = useTweaks()
  return (
    <div className="choice">
      <span className="choice-label">Highlight</span>
      <div className="dots" role="group" aria-label="Highlight colour">
        {(Object.keys(HIGHLIGHT) as Highlight[]).map((h) => (
          <button
            key={h}
            type="button"
            className="dot"
            style={{ background: HIGHLIGHT[h] }}
            aria-label={h}
            aria-pressed={s.highlight === h}
            onClick={() => set("highlight", h)}
          />
        ))}
      </div>
    </div>
  )
}

function RadiusChoice() {
  const { s, set } = useTweaks()
  const value = s.radius < 0.75 ? "sharp" : s.radius > 1.25 ? "round" : "soft"
  return (
    <Choice
      label="Corners"
      value={value}
      onChange={(v) => set("radius", v === "sharp" ? 0.4 : v === "round" ? 1.75 : 1)}
      options={[
        { value: "sharp", label: "Sharp" },
        { value: "soft", label: "Soft" },
        { value: "round", label: "Round" },
      ]}
    />
  )
}

export { GreyChoice, HeadingChoices, HighlightDots, RadiusChoice, TweakScope, useGreyRamp, useTweaks }
