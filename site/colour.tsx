import tokens from "../tokens/tokens.json"
import { Icon } from "../src"
import { GreyChoice, TweakScope, useGreyRamp } from "./tweaks"
import { useCopyPill } from "./copy-pill"

/* Colour: how much of each colour gets used, what each role is in light and dark, whether the text
   is readable (computed, not claimed), and the grey ramp itself. Click anything to copy its hex. */

type Copy = (label: string, value: string) => void
const prim = tokens.primitive.color as unknown as Record<string, Record<string, { $value: string }> | { $value: string }>

/** {color.sand.12} to its value. */
function resolve(ref: string): string {
  const path = ref.replace(/[{}]/g, "").split(".").slice(1)
  let node: unknown = prim
  for (const k of path) node = (node as Record<string, unknown>)[k]
  return (node as { $value: string }).$value
}

/** Any CSS colour to #rrggbb by painting one pixel, so oklch values copy as plain hex. */
function toHex(color: string) {
  if (color.startsWith("#")) return color
  const c = document.createElement("canvas")
  c.width = c.height = 1
  const ctx = c.getContext("2d")
  if (!ctx) return color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  const [x, y] = [luminance(toHex(a)), luminance(toHex(b))].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

const light = tokens.semantic.light as Record<string, string>
const dark = tokens.semantic.dark as Record<string, string>

const ROLES = [
  ["bg-page", "The page"],
  ["bg-subtle", "Wells, quiet fills"],
  ["bg-surface", "Cards, dialogs"],
  ["border-subtle", "Hairlines"],
  ["border-strong", "Pressable edges"],
  ["text-primary", "Words, ink buttons"],
  ["text-secondary", "Body you skim"],
  ["text-tertiary", "Captions, meta"],
  ["highlight", "Marks words only"],
  ["guide", "Construction lines"],
] as const

const sand = (n: number, d = false) => resolve(`{color.${d ? "sand-dark" : "sand"}.${n}}`)

// Sized like aave.com/brand: the more a colour is used, the more room it gets.
const BENTO = [
  { name: "Paper", cls: "co-paper", light: sand(1), dark: sand(1, true) },
  { name: "Ink", cls: "co-ink", light: sand(12), dark: sand(12, true) },
  { name: "Grey", cls: "co-grey", light: sand(9), dark: sand(9, true) },
  { name: "Highlight", cls: "co-hl", light: resolve("{color.yellow}"), dark: resolve("{color.yellow-dark}") },
]

function ColourShowcase({ onCopy, isDark }: { onCopy: Copy; isDark: boolean }) {
  const pill = useCopyPill(onCopy)
  return (
    <div className="co">
      <div className="co-bento" role="group" aria-label="The palette, sized by how much each colour is used">
        {BENTO.map((t) => {
          const value = isDark && t.dark ? t.dark : t.light
          const hex = toHex(value)
          return (
            <button key={t.name} type="button" className={`co-tile ${t.cls}`} style={{ background: value }} aria-label={`${t.name}, ${hex}. Copy`} {...pill.bind(hex, t.name)} />
          )
        })}
      </div>
      {pill.node}

      <TweakScope>
        <Ramp onCopy={onCopy} isDark={isDark} />
        <GreyChoice />
      </TweakScope>

      <details className="co-more">
        <summary>
          <Icon name="chevron-down" /> Every role, and how readable the text is
        </summary>
        <div className="co-roles">
          {ROLES.map(([role, what]) => {
            const l = toHex(resolve(light[role]))
            const d = toHex(resolve(dark[role]))
            return (
              <button key={role} type="button" className="co-role" aria-label={`--${role}: ${l} in light, ${d} in dark. Copy the token`} onClick={() => onCopy(`--${role}`, `var(--${role})`)}>
                <span className="co-chip">
                  <span style={{ background: l }} />
                  <span style={{ background: d }} />
                </span>
                <span className="co-role-text">
                  <code>--{role}</code>
                  <span>{what}</span>
                  <span className="co-hexes">
                    {l} · {d}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="co-contrast">
          {(["light", "dark"] as const).map((t) => {
            const set = t === "light" ? light : dark
            const page = resolve(set["bg-page"])
            return (
              <div key={t} className="co-contrast-panel" data-theme={t}>
                <span className="co-contrast-head">
                  <Icon name={t === "light" ? "sun" : "moon"} /> {t === "light" ? "Light" : "Dark"} page
                </span>
                {(["text-primary", "text-secondary", "text-tertiary"] as const).map((r) => {
                  const ratio = contrast(resolve(set[r]), page)
                  return (
                    <div key={r} className="co-contrast-row">
                      <span style={{ color: `var(--${r})` }}>Building products that matter</span>
                      <code data-pass={ratio >= 4.5 || undefined}>
                        {ratio.toFixed(1)}:1 {ratio >= 4.5 ? "AA" : ratio >= 3 ? "large" : "fail"}
                      </code>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

      </details>
    </div>
  )
}

function Ramp({ onCopy, isDark }: { onCopy: Copy; isDark: boolean }) {
  const { name, steps } = useGreyRamp(isDark)
  return (
    <div className="ramp">
      {steps.map((st, i) => {
        const hex = toHex(st.value)
        return (
          <button
            key={st.step}
            type="button"
            className="ramp-chip"
            data-ink={(isDark ? i < 10 : i >= 8) ? "light" : undefined}
            style={{ background: st.value }}
            aria-label={`${name} ${st.step}, ${hex}. Copy`}
            onClick={() => onCopy(hex, hex)}
          >
            <span>{st.step}</span>
          </button>
        )
      })}
    </div>
  )
}

export { ColourShowcase, toHex }
