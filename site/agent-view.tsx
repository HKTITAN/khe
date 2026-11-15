import { useState } from "react"
import { Morph } from "./morph"
import source from "./agent/khe.md?raw"
import { Button, Icon } from "../src"

/* The page as an agent reads it, after parallel.ai's Human / Machine switch: the same Markdown
   ds.khe.money serves for Accept: text/markdown, with the files an agent would fetch next. */

function AgentView({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {}
  }
  return (
    <div className="av">
      <div className="av-bar">
        <span className="av-note">
          <Icon name="agent" /> This is the page as an agent reads it.
        </span>
        <span className="grow" />
        <Button size="sm" onClick={onBack}>
          <Icon name="arrow-right" style={{ rotate: "180deg" }} /> Back to the page
        </Button>
        <a className="av-link" href="/index.md">
          index.md
        </a>
        <a className="av-link" href="/llms.txt">
          llms.txt
        </a>
        <a className="av-link" href="https://raw.githubusercontent.com/HKTITAN/khe/main/khe.DESIGN">
          khe.DESIGN
        </a>
        <Button size="sm" onClick={copy}>
          <Icon name={copied ? "check" : "copy"} /> <Morph>{copied ? "Copied" : "Copy as Markdown"}</Morph>
        </Button>
      </div>
      <pre className="av-md" tabIndex={0} aria-label="khe as Markdown">
        {source.split("\n").map((line, i) => (
          <span key={i} className="av-line" data-h={/^#{1,3} /.test(line) || undefined} data-li={/^- /.test(line) || undefined}>
            {line || " "}
          </span>
        ))}
      </pre>
    </div>
  )
}

export { AgentView }
