import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Skeleton } from "skullet/react"
import { Button, CopyButton, Icon, SegmentedControl } from "../src"
import { AgentBrief } from "./agent"

const FILES = [
  { name: "khe.DESIGN", kind: "AGENT", what: "The whole system in one file, for agents." },
  { name: "tokens.json", kind: "JSON", what: "Every value, the source of truth." },
  { name: "tokens.css", kind: "CSS", what: "The values as CSS variables, light and dark." },
  { name: "khe.css", kind: "CSS", what: "Tokens plus every component's styles." },
  { name: "feel.css", kind: "CSS", what: "The cursors and the overlay scrollbar." },
  { name: "verse-text.css", kind: "CSS", what: "The Verse effect, on its own." },
] as const

type Name = (typeof FILES)[number]["name"]

const SOURCES: Record<Name, string> = {
  "khe.DESIGN": "khe.DESIGN",
  "tokens.json": "tokens/tokens.json",
  "tokens.css": "src/styles/tokens.css",
  "khe.css": "src/styles/khe.css",
  "feel.css": "src/styles/feel.css",
  "verse-text.css": "src/styles/verse-text.css",
}

// Stands in for a file while it loads, so the skeleton has its shape (skullet).
const SAMPLE = Array.from({ length: 40 }, (_, i) => (i % 5 === 0 ? "/* a comment */" : "  --a-token-name: its value;")).join("\n")

function size(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
}

function FileBrowser() {
  const [picked, setPicked] = useState<Name>("tokens.css")
  const [texts, setTexts] = useState<Partial<Record<Name, string>>>({})

  useEffect(() => {
    let live = true
    for (const f of FILES) {
      fetch(`/downloads/${f.name}`)
        .then((r) => (r.ok ? r.text() : ""))
        .then((t) => live && setTexts((p) => ({ ...p, [f.name]: t })))
        .catch(() => {})
    }
    return () => {
      live = false
    }
  }, [])

  const file = FILES.find((f) => f.name === picked) ?? FILES[0]
  const text = texts[picked] ?? ""

  return (
    <div className="dl">
      <div className="dl-files" role="group" aria-label="Files">
        {FILES.map((f) => {
          const t = texts[f.name]
          return (
            <button
              key={f.name}
              type="button"
              aria-pressed={picked === f.name}
              className="dl-file"
              onClick={() => setPicked(f.name)}
            >
              {picked === f.name && <motion.span layoutId="dl-pick" className="dl-file-bg" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
              <span className="dl-kind" data-kind={f.kind}>
                {f.kind}
              </span>
              <span className="dl-file-text">
                <code>{f.name}</code>
                <span>{f.what}</span>
              </span>
              <span className="dl-size">{t ? size(new Blob([t]).size) : ""}</span>
            </button>
          )
        })}
      </div>

      <div className="dl-view">
        <div className="dl-bar">
          <Icon name="file" />
          <a className="dl-src" href={`https://github.com/HKTITAN/khe/blob/main/${SOURCES[file.name]}`}>
            <code>{file.name}</code>
          </a>
          <span className="dl-meta">{text ? `${text.split("\n").length} lines · ${size(new Blob([text]).size)}` : ""}</span>
          <span className="grow" />
          <CopyButton value={text} label="Copy file" />
          <Button href={`/downloads/${file.name}`} download={file.name} size="sm">
            <Icon name="download" /> Download
          </Button>
        </div>
        <Skeleton key={picked} data={texts[picked] ?? null} sample={SAMPLE} label={`Loading ${file.name}`}>
          {(t) => (
            <pre className="dl-code" tabIndex={0} aria-label={`${file.name}, first lines`}>
              {t.split("\n").slice(0, 40).map((l, i) => (
                <span key={i} className="dl-line" data-comment={/^\s*(\/\*|\*|\/\/)/.test(l) || undefined}>
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

function Downloads() {
  const [who, setWho] = useState<"human" | "agent">("human")
  return (
    <div className="dl-wrap">
      <SegmentedControl
        aria-label="Who is this for"
        value={who}
        onValueChange={setWho}
        options={[
          { value: "human", label: "Human", icon: "user" },
          { value: "agent", label: "Agent", icon: "agent" },
        ]}
      />
      {who === "human" ? <FileBrowser /> : <AgentBrief />}
    </div>
  )
}

export { Downloads }
