import { useEffect, useState } from "react"
import { Morph } from "./morph"
import { Skeleton } from "skullet/react"
import { Button, CopyButton, Icon } from "../src"

/* Brief an agent in one file, after campusbinge.in/brand: a short paste that points the agent at the
   hosted khe.DESIGN, and the file itself beside it. */

const RAW = "https://raw.githubusercontent.com/HKTITAN/khe/main"

const BRIEF = `You're helping me make something in khe, Harshit Khemani's design system. Everything you need is public, so don't ask me to upload files.

1. Read the contract first: ${RAW}/khe.DESIGN
   It's a .DESIGN file (YAML, schema design.v1) and the source of truth for colour, type, motion, components and voice. Follow its agent.instructions.

2. Work out what I'm asking for, then fetch only what that needs:
   - A question, some copy, or a check against khe: the .DESIGN file alone is enough.
   - A page, component, paper, deck or post: use the role tokens in ${RAW}/src/styles/tokens.css and the components listed in ${RAW}/src/index.ts.
   - Work inside a codebase: clone https://github.com/HKTITAN/khe and import the components from src/. Never import ui-sdk directly.

3. Before you hand anything back, check it against the file's constraints and say which ones you could not check.`

// Stands in for the file while it loads, so the skeleton has its shape (skullet).
const SAMPLE = Array.from({ length: 60 }, (_, i) => (i % 4 === 0 ? "section:" : "  key: a value of about this length")).join("\n")

function AgentBrief() {
  const [design, setDesign] = useState("")
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let live = true
    fetch("/downloads/khe.DESIGN")
      .then((r) => (r.ok ? r.text() : ""))
      .then((t) => live && setDesign(t))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BRIEF)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  const all = design.split("\n")
  return (
    <div className="ab">
      <div className="ab-copy">
        <p className="ab-lead">
          Hand your agent <a href="https://github.com/HKTITAN/khe/blob/main/khe.DESIGN"><code>khe.DESIGN</code></a>: every colour, size, spring, component and rule this page uses, in the
          open <a href="https://github.com/AgentsORG/DESIGN">.DESIGN format</a>. It is built from{" "}
          <a href="https://github.com/HKTITAN/khe/blob/main/tokens/tokens.json">tokens.json</a>, so it never drifts.
        </p>
        <ul className="ab-chips">
          <li className="ab-chip-on">khe.DESIGN</li>
          <li>tokens</li>
          <li>light + dark</li>
          <li>13 components</li>
          <li>voice</li>
        </ul>
        <div className="ab-actions">
          <Button variant="primary" onClick={copy}>
            <Icon name={copied ? "check" : "copy"} /> <Morph>{copied ? "Copied" : "Copy instructions for agents"}</Morph>
          </Button>
          <Button href="/downloads/khe.DESIGN" download="khe.DESIGN">
            <Icon name="download" /> khe.DESIGN
          </Button>
        </div>
        <p className="ab-note">
          Paste it into any agent. It reads the hosted file first and fetches only what the job needs.{" "}
          <button type="button" className="ab-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? "Hide" : "See"} what gets copied
          </button>
        </p>
        {open && <pre className="ab-brief">{BRIEF}</pre>}
        <div className="ab-skill">
          <span>
            Works best with <a href="https://github.com/HKTITAN/skills">kheSkills</a>:
          </span>
          <div className="skills-install">
            <code>npx skills add HKTITAN/skills</code>
            <CopyButton value="npx skills add HKTITAN/skills" label="Copy command" />
          </div>
        </div>
      </div>
      <div className="dl-view">
        <div className="dl-bar">
          <Icon name="file" />
          <code>khe.DESIGN</code>
          <span className="dl-meta">{design ? `${all.length} lines` : ""}</span>
          <span className="grow" />
          <CopyButton value={design} label="Copy file" />
        </div>
        <Skeleton data={design || null} sample={SAMPLE} label="Loading khe.DESIGN">
          {(text) => (
            <pre className="dl-code" tabIndex={0} aria-label="khe.DESIGN, first lines">
              {text.split("\n").slice(0, 60).map((l, i) => (
                <span key={i} className="dl-line" data-comment={/^\s*#/.test(l) || undefined}>
                  <span className="dl-n">{i + 1}</span>
                  {l || " "}
                </span>
              ))}
            </pre>
          )}
        </Skeleton>
      </div>
    </div>
  )
}

export { AgentBrief }
