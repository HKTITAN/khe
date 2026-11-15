import { readFileSync, writeFileSync, mkdirSync } from "node:fs"

const tokens = JSON.parse(readFileSync(new URL("../tokens/tokens.json", import.meta.url), "utf8"))

function springCurve({ stiffness, damping }) {
  let x = 0, v = 0, t = 0
  const dt = 1 / 120, pts = []
  while (t < 2) {
    v += (-stiffness * (x - 1) - damping * v) * dt
    x += v * dt
    t += dt
    pts.push(x)
    if (t > 0.25 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break
  }
  const step = Math.max(1, Math.floor(pts.length / 40))
  const samples = [0]
  for (let i = step; i < pts.length; i += step) samples.push(+pts[i].toFixed(3))
  samples.push(1)
  return { ease: `linear(${samples.join(", ")})`, duration: `${Math.round(pts.length * dt * 1000)}ms` }
}

const primitives = []
const walk = (node, path) => {
  if (node && typeof node === "object" && "$value" in node) {
    if (typeof node.$value === "string") primitives.push([path.join("-"), node.$value])
    else if ("stiffness" in node.$value) {
      const { ease, duration } = springCurve(node.$value)
      primitives.push([[...path, "ease"].join("-"), ease], [[...path, "duration"].join("-"), duration])
    }
    return
  }
  if (!node || typeof node !== "object") return
  for (const [k, v] of Object.entries(node)) if (!k.startsWith("$")) walk(v, [...path, k])
}
walk(tokens.primitive, [])

const ref = (value) =>
  value.replace(/\{([^}]+)\}/g, (_, p) => {
    const name = p.split(".").join("-")
    if (!primitives.some(([n]) => n === name)) throw new Error(`unknown token reference {${p}}`)
    return `var(--${name})`
  })

for (const set of Object.values(tokens.semantic))
  for (const name of Object.keys(set))
    if (primitives.some(([n]) => n === name)) throw new Error(`semantic token --${name} has the same name as a primitive`)

const block = (entries) => Object.entries(entries).map(([k, v]) => `  --${k}: ${ref(v)};`).join("\n")
const { light, dark, any } = tokens.semantic

const css = `/* generated from tokens/tokens.json by scripts/build-tokens.mjs. don't edit by hand. */
:root {
${primitives.map(([n, v]) => `  --${n}: ${v};`).join("\n")}
${block(any)}
${block(light)}
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${block(dark).replace(/^/gm, "  ")}
    color-scheme: dark;
  }
}
:root[data-theme="dark"],
[data-theme="dark"] {
${block(dark)}
  color-scheme: dark;
}
/* any element can force a theme for what's inside it, like a light card shown in a dark page */
[data-theme="light"]:not(:root) {
${block(light)}
  color-scheme: light;
}
`

mkdirSync(new URL("../src/styles/", import.meta.url), { recursive: true })
writeFileSync(new URL("../src/styles/tokens.css", import.meta.url), css)
console.log(`tokens.css: ${primitives.length} primitives, ${Object.keys(light).length + Object.keys(any).length} semantic`)
