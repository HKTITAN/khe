// Rules that keep khe honest, enforced instead of written down. Each error says what to do instead.
// Run: npm run check
import { execSync } from "node:child_process"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const errors = []

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue
    const p = join(dir, name)
    statSync(p).isDirectory() ? walk(p, out) : out.push(p)
  }
  return out
}

const files = [...walk(join(root, "src")), ...walk(join(root, "site"))]
const rel = (p) => relative(root, p).split(sep).join("/")

for (const file of files) {
  const r = rel(file)
  // site/kit and src/verse are copied from elsewhere unchanged; site/public holds built output.
  if (r.startsWith("site/public/") || r.startsWith("site/kit/") || r.startsWith("src/verse/")) continue
  const text = readFileSync(file, "utf8")
  const lines = text.split("\n")

  // 1. ui-sdk is wrapped once, in src/components. Everything else uses the khe component.
  if (/\.(tsx?|mjs)$/.test(r) && !r.startsWith("src/components/")) {
    lines.forEach((l, i) => {
      if (/from ["']@ui-sdk\//.test(l))
        errors.push(`${r}:${i + 1}  imports @ui-sdk directly. Import the khe component from "../src" instead, or wrap the part in src/components first.`)
    })
  }

  // 2. Colours come from tokens. A raw hex anywhere else is a value that will drift.
  if (/\.(css|tsx?)$/.test(r) && r !== "src/styles/tokens.css") {
    lines.forEach((l, i) => {
      if (/mask-image|^\s*(\/\/|\*|\/\*)/.test(l)) return
      const m = l.match(/#[0-9a-fA-F]{3,8}\b/)
      if (m && !/(href|id|url)\s*[=(]\s*["'`]?#/.test(l))
        errors.push(`${r}:${i + 1}  hard-codes ${m[0]}. Use a token (var(--…)) from tokens/tokens.json, or add one there.`)
      if (/cubic-bezier\(/.test(l))
        errors.push(`${r}:${i + 1}  hard-codes a cubic-bezier. Use a spring, or an --ease-* token from tokens/tokens.json.`)
    })
  }
}

// 3. tokens.css is generated. If it differs from what tokens.json produces, someone edited the output.
const before = readFileSync(join(root, "src/styles/tokens.css"), "utf8")
execSync("node scripts/build-tokens.mjs", { cwd: root, stdio: "ignore" })
const after = readFileSync(join(root, "src/styles/tokens.css"), "utf8")
if (before.replace(/\r/g, "") !== after.replace(/\r/g, ""))
  errors.push("src/styles/tokens.css  was out of date with tokens/tokens.json. It has been regenerated; edit tokens.json, never tokens.css.")

if (errors.length) {
  console.error(errors.join("\n"))
  console.error(`\n${errors.length} problem${errors.length === 1 ? "" : "s"}.`)
  process.exit(1)
}
console.log("check passed: ui-sdk wrapped once, colours from tokens, tokens.css in sync.")
