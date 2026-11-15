import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { marked } from "marked"
import type { Plugin } from "vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

// The page says when khe last changed: the last commit's date, or today outside a git checkout.
function lastUpdated() {
  try {
    return execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim() || new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

const SITE = "https://ds.khe.money"

/* Agents and crawlers that run no JavaScript should still read khe. One Markdown file,
   site/agent/khe.md, becomes the text inside #root (React replaces it on load), /index.md,
   /llms.txt, /sitemap.xml and /robots.txt. */
function agentReadable(): Plugin {
  const md = () => readFileSync(new URL("./site/agent/khe.md", import.meta.url), "utf8")
  const llms = (src: string) => {
    const when = src.split("## When to use khe")[1]?.split("\n## ")[0]?.trim() ?? ""
    return `# khe

> Harshit Khemani's design system: how his things look, read and move. Colours, type, springs and components, written once in one file. Open source, MIT.

## When to use khe

${when}

## Docs

- [khe as Markdown](${SITE}/index.md): the whole brand page in plain text.
- [khe.DESIGN](https://raw.githubusercontent.com/HKTITAN/khe/main/khe.DESIGN): the contract for agents, schema design.v1.
- [tokens.json](${SITE}/downloads/tokens.json): every value.
- [Source on GitHub](https://github.com/HKTITAN/khe)
- [Skills](https://github.com/HKTITAN/skills): the skills Harshit builds with.
`
  }
  return {
    name: "khe-agent-readable",
    transformIndexHtml(html) {
      return html.replace("<!--agent-content-->", `<main class="agent-text">${marked.parse(md())}</main>`)
    },
    generateBundle() {
      const src = md()
      const lastmod = lastUpdated().slice(0, 10)
      this.emitFile({ type: "asset", fileName: "index.md", source: src })
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llms(src) })
      this.emitFile({
        type: "asset",
        fileName: "404.md",
        source: `# Not found

There is no page at this address on ds.khe.money. khe is one page: read it as Markdown at ${SITE}/index.md, or start from ${SITE}/llms.txt.
`,
      })
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>${SITE}/index.md</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>${SITE}/llms.txt</loc><lastmod>${lastmod}</lastmod></url>
</urlset>
`,
      })
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` })
      this.emitFile({ type: "asset", fileName: "og.png", source: readFileSync(new URL("./docs/readme/og.png", import.meta.url)) })
    },
  }
}

export default defineConfig({
  root: "site",
  plugins: [react(), agentReadable()],
  define: {
    __KHE_VERSION__: JSON.stringify(version),
    __KHE_UPDATED__: JSON.stringify(lastUpdated()),
  },
  optimizeDeps: {
    include: ["button", "checkbox", "command", "dialog", "field", "menu", "segmented-control", "slider", "switch", "tabs", "tooltip"].map((c) => `@ui-sdk/react/${c}`).concat(["motion/react", "rough-notation", "react-dom/server"]),
  },
  server: { port: 4680, strictPort: true, fs: { allow: [".."] } },
  build: { outDir: "../dist-site", emptyOutDir: true },
})
