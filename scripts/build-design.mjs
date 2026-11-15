// Builds khe.DESIGN (schema design.v1) from tokens/tokens.json plus khe's written rules, so the
// contract an agent reads can never drift from the values the site uses. Run by `npm run tokens`.
import { readFileSync, writeFileSync } from "node:fs"

const tokens = JSON.parse(readFileSync(new URL("../tokens/tokens.json", import.meta.url), "utf8"))
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))
const RAW = "https://raw.githubusercontent.com/HKTITAN/khe/main"

const q = (s) => JSON.stringify(String(s))
const lines = []
const out = (s = "") => lines.push(s)

// tokens: primitives as values, semantic roles as references, light and dark side by side
function dump(node, depth) {
  const pad = "  ".repeat(depth)
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) continue
    if (v && typeof v === "object" && "$value" in v) {
      const val = typeof v.$value === "object" ? `{ stiffness: ${v.$value.stiffness}, damping: ${v.$value.damping} }` : q(v.$value)
      out(`${pad}${q(k)}: ${val}`)
    } else {
      out(`${pad}${q(k)}:`)
      dump(v, depth + 1)
    }
  }
}

out(`$schema: https://raw.githubusercontent.com/AgentsORG/DESIGN/main/schema/design.v1.schema.json`)
out(`schema: design.v1`)
out(`name: khe`)
out(`version: ${pkg.version}`)
out(`status: draft`)
out(`updated_at: ${q(new Date().toISOString().slice(0, 10))}`)
out(`description: >`)
out(`  khe, Harshit Khemani's design system: quiet paper and ink, one sans, springs, and a yellow`)
out(`  highlighter. Used for khe.money, his papers, decks and posts.`)
out()
out(`agent:`)
out(`  skill: design`)
out(`  instructions: |`)
for (const l of [
  "You are holding khe's .DESIGN file (schema design.v1), written from tokens/tokens.json.",
  "If kheSkills (npx skills add HKTITAN/skills) is installed, use it, and still treat THIS file as the truth.",
  "",
  "READ",
  "- Load this file before making or reviewing anything for khe or khe.money: pages,",
  "  components, papers, decks, posts, UI copy.",
  "- Order: constraints -> tokens -> themes -> components -> voice -> assets.",
  "",
  "FOLLOW",
  "- Use the role tokens (themes.light / themes.dark), never a raw hex, size or easing.",
  "- Paper and ink do the work. Yellow is a highlighter: it marks words, never fills a button.",
  "- One typeface, Inter. Headings are Inter Black, uppercase, in the heading grey.",
  "  The khe mark is set in the heading face. Numbers, dates and file names are Geist Mono.",
  "  The hand font is for margin notes only, never body text.",
  "- Everything that moves uses a spring token; reduced motion turns movement off.",
  "- Components come from khe, which wraps ui-sdk. Never import ui-sdk directly in an app.",
  "- Light is the default theme. Both themes must work.",
  "",
  "DON'T",
  "- No gradients, glows, coloured shadows, or a second accent colour.",
  "- No invented copy, numbers or quotes in examples. Use real words or placeholder bars.",
  "- Nothing overflows the viewport, at any width, even on hover.",
]) out(`    ${l}`.trimEnd())
out()
out(`constraints:`)
for (const c of [
  "Light theme is the default; dark must work everywhere.",
  "Text meets 4.5:1 contrast; controls and focus rings 3:1.",
  "Text selection is grey (selection token), not blue or yellow.",
  "Section headings carry no numbers.",
  "Every interactive part is keyboard reachable and named.",
]) out(`  - ${q(c)}`)
out()
out(`tokens:`)
dump(tokens.primitive, 1)
out()
out(`themes:`)
for (const theme of ["light", "dark", "any"]) {
  out(`  ${theme}:`)
  for (const [k, v] of Object.entries(tokens.semantic[theme])) out(`    ${q(k)}: ${q(v)}`)
}
out()
out(`components:`)
for (const [name, detail] of [
  ["Button", "variant: primary | secondary; size: sm | md; href renders a real link; async onClick shows pending"],
  ["Switch", "label names the setting"],
  ["SegmentedControl", "two to five options"],
  ["Tabs", "one panel at a time, sliding indicator"],
  ["Menu", "also the page's right-click menu"],
  ["Dialog", "one focused task"],
  ["Tooltip", "plain text only, never a button inside"],
  ["Checkbox", "label says what"],
  ["Slider", "label says what, value says how much"],
  ["CopyButton", "icon button, label rolls to Copied"],
  ["CommandPalette", "search pill, Cmd/Ctrl+K, jump, copy, download, actions"],
  ["ThemeToggle", "one switch; circle sweep from the click, interruptible"],
  ["VerseText", "for a name that should feel alive; inspired by Spider-Verse"],
]) out(`  ${name}: ${q(detail)}`)
out()
out(`voice:`)
for (const v of [
  "Social posts and notes: lowercase, short lines, one idea per line.",
  "Product text and docs: sentence case, just as short.",
  "Open with a plain hook. Say what shipped, where to try it, and one detail of how it feels.",
  "No hashtags, almost no emoji. Say agents, never AI agents.",
]) out(`  - ${q(v)}`)
out()
out(`assets:`)
out(`  tokens_json: ${RAW}/tokens/tokens.json`)
out(`  tokens_css: ${RAW}/src/styles/tokens.css`)
out(`  khe_css: ${RAW}/src/styles/khe.css`)
out(`  components: ${RAW}/src/index.ts`)
out(`  logo: "Not drawn yet. Set 'khe' in the heading face (Inter Black, -0.04em) as a stand-in."`)
out()
out(`provenance:`)
out(`  source: https://github.com/HKTITAN/khe`)
out(`  generated_by: scripts/build-design.mjs`)

const text = lines.join("\n") + "\n"
writeFileSync(new URL("../khe.DESIGN", import.meta.url), text)
writeFileSync(new URL("../site/public/downloads/khe.DESIGN", import.meta.url), text)
console.log(`khe.DESIGN: ${lines.length} lines`)
