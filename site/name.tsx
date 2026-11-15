import { useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import data from "./name-construction.json"
import { Icon, NameMark, Switch } from "../src"

/* The name as a mark: HARSHIT / KHEMANI, after David Senra's. Shown with its construction and its own
   best practices, the way the page does for "khe". */

const snappy = { type: "spring", stiffness: 520, damping: 40 } as const

const PAD_X = 120
const PAD_Y = 80
const [inkL, inkR] = data.ink
const box = { x: inkL - PAD_X, y: -data.cap - PAD_Y, w: inkR - inkL + PAD_X * 2, h: data.lead + data.cap + PAD_Y * 2 }
const GUIDES = [
  { y: -data.cap, label: "cap height" },
  { y: 0, label: "baseline" },
  { y: data.lead - data.cap, label: "cap height" },
  { y: data.lead, label: "baseline" },
]

/** The name under construction: Anton outlines with every anchor point, both lines meeting the same
 *  two verticals, and the guides it is drawn on (after the khe wordmark's construction). */
function NameConstruction() {
  const reduce = useReducedMotion()
  return (
    <svg className="construct nm-construct" viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="img" aria-label="HARSHIT KHEMANI drawn in Anton, with its anchor points and guides">
      {[inkL, inkR].map((x) => (
        <line key={`v${x}`} x1={x} x2={x} y1={box.y} y2={box.y + box.h} className="g g-v nm-edge" />
      ))}
      {GUIDES.map((g, i) => (
        <g key={i}>
          <line x1={box.x} x2={box.x + box.w} y1={g.y} y2={g.y} className="g" />
          <text x={box.x + 16} y={g.y - 10} className="g-label">
            {g.label}
          </text>
          {[inkL, inkR].map((x) => (
            <rect key={x} x={x - 6} y={g.y - 6} width={12} height={12} className="handle" />
          ))}
        </g>
      ))}
      <motion.path
        d={data.d}
        className="outline"
        initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
        whileInView={{ pathLength: 1, fillOpacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ pathLength: { duration: 1.8, ease: "easeInOut" }, fillOpacity: { delay: 1.6, duration: 0.6 } }}
      />
      {data.points.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={5}
          className="anchor"
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 500, damping: 26, delay: 0.3 + i * 0.008 }}
        />
      ))}
    </svg>
  )
}

/** A one-off drawing of the name for the don'ts, so each mistake is drawn honestly. */
function Wrong({ kind }: { kind: string }) {
  if (kind === "one-line")
    return (
      <svg className="nm-wrong" viewBox="0 0 150 24" aria-hidden="true">
        <text x="0" y="20">
          HARSHIT KHEMANI
        </text>
      </svg>
    )
  if (kind === "case")
    return (
      <svg className="nm-wrong" viewBox="0 0 74 41" aria-hidden="true">
        <text x="0" y="18" textLength="74" lengthAdjust="spacing">
          Harshit
        </text>
        <text x="0" y="40" textLength="74" lengthAdjust="spacing">
          Khemani
        </text>
      </svg>
    )
  if (kind === "stretch")
    return (
      <svg className="nm-wrong" viewBox="0 0 74 41" aria-hidden="true">
        <text x="0" y="18" textLength="74" lengthAdjust="spacingAndGlyphs" style={{ fontSize: "15px" }}>
          HARSHIT
        </text>
        <text x="0" y="40" textLength="74" lengthAdjust="spacingAndGlyphs" style={{ fontSize: "30px" }}>
          KHEMANI
        </text>
      </svg>
    )
  return <NameMark className="nm-wrong" />
}

const DONTS = [
  { id: "stretch", text: "Stretching letters to make the lines meet.", fixed: "Letter space makes them meet. The glyphs keep their shape." },
  { id: "one-line", text: "Running it on one line.", fixed: "Two lines, stacked. One line is just my name in a font." },
  { id: "case", text: "Setting it in lowercase or title case.", fixed: "All caps, always." },
  { id: "colour", text: "Setting it in a colour.", fixed: "Ink on paper, paper on ink." },
  { id: "outline", text: "Turning it into an outline.", fixed: "Solid ink, never a stroke." },
  { id: "crowd", text: "Crowding it.", fixed: "Clear space of one line's height on every side." },
] as const

function Do({ art, title, line }: { art: ReactNode; title: string; line: string }) {
  return (
    <figure className="do">
      <div className="do-art">{art}</div>
      <figcaption>
        <b>
          <Icon name="check" /> {title}
        </b>
        <span>{line}</span>
      </figcaption>
    </figure>
  )
}

function NameSection({ Section }: { Section: (p: { id: string; n: string; title: string; rule: string; children: ReactNode }) => ReactNode }) {
  const [fixed, setFixed] = useState(false)
  return (
    <Section id="name" n="07" title="Name" rule="HARSHIT KHEMANI, stacked and end to end. The name is the mark wherever it’s me, not the system.">
      <figure className="nm-hero">
        <div className="nm-hero-art">
          <NameConstruction />
        </div>
        <figcaption>The name, under construction: Anton, every anchor point showing. Both lines meet the same two verticals; the shorter one takes the letter space, never a stretched glyph.</figcaption>
      </figure>

      <h3 className="sub">
        <Icon name="check" /> Do
      </h3>
      <div className="dos">
        <Do art={<NameMark className="nm-do" />} title="End to end" line="Both lines one length. Letter space does it, never stretched glyphs." />
        <Do
          art={
            <span className="do-pair nm-pair">
              <span className="do-half do-paper">
                <NameMark className="nm-do" />
              </span>
              <span className="do-half do-ink">
                <NameMark className="nm-do" />
              </span>
            </span>
          }
          title="Ink on paper, paper on ink"
          line="Two versions. Nothing in between."
        />
        <Do
          art={
            <span className="nm-clear">
              <NameMark className="nm-do" />
            </span>
          }
          title="Give it room"
          line="Clear space on every side equals one line’s height."
        />
        <Do
          art={
            <span className="nm-cover">
              <NameMark className="nm-cover-mark" />
              <img src="/assets/harshit.jpg" alt="" width={120} height={120} loading="lazy" />
            </span>
          }
          title="With a portrait"
          line="Top left, big, over a black and white photo. A cover, not a caption."
        />
      </div>

      <h3 className="sub">
        <Icon name="x" /> Don&rsquo;t
        <span className="grow" />
        <Switch label="Show the fix" checked={fixed} onCheckedChange={setFixed} />
      </h3>
      <div className="donts">
        {DONTS.map((a) => (
          <figure key={a.id} className={`dont nm-dont ${fixed ? "fixed" : ""}`} data-nm={a.id}>
            <span className="dont-art">
              {a.id === "crowd" && (
                <>
                  <span className="crowd crowd-a" />
                  <span className="crowd crowd-b" />
                </>
              )}
              {fixed ? <NameMark className="nm-wrong" /> : <Wrong kind={a.id} />}
              <span className="slash" />
            </span>
            <figcaption className="dont-text">
              <motion.span key={fixed ? "fix" : "dont"} className="fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={snappy}>
                {fixed ? a.fixed : a.text}
              </motion.span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}

export { NameSection }
