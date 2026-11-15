import { useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CopyButton, Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, Icon, playSound } from "../src"

/* From HKTITAN/skills: skills.sh.json for the groups, README.md for "say" and "what you get". */
const GROUPS = [
  {
    title: "Start here",
    note: "The mode that picks the playbook and runs the rest.",
    skills: [{ id: "khe-auto", say: "auto", get: "The job done in the right order. It picks the playbook and runs the skills it needs." }],
  },
  {
    title: "Design",
    note: "UI craft, tokens, vectors, stickers, diagrams, sound, launch films and real-app demos.",
    skills: [
      { id: "khe-ui", say: "review this", get: "A screen built or judged against exact values across eleven areas, ending in Blocked, Approve with changes or Ship it." },
      { id: "khe-design-tokens", say: "use our tokens", get: "Your .design file or DESIGN.md threaded through the UI, so the agent stops inventing colours and sizes." },
      { id: "khe-svg", say: "animate this logo", get: "A clean, token-aware SVG that moves, or a flat clip turned into one editable vector file." },
      { id: "khe-sticker", say: "make a sticker pack", get: "Stickers built to pop once and hold still, and a pack in the formats WhatsApp and Telegram take." },
      { id: "khe-diagram", say: "diagram this", get: "A figure that reads as designed, a live tldraw board, or an honest “this does not need a diagram”." },
      { id: "khe-sound", say: "add sound", get: "One family of sounds, generated, wired and placed on the frame the motion lands. Most moments get none." },
      { id: "khe-launch-film", say: "launch film", get: "A launch video planned beat by beat and reviewed against 47 films measured frame by frame." },
      { id: "khe-demo", say: "record a demo", get: "The real app, driven through one planned flow on seeded data and recorded as a clean take." },
    ],
  },
  {
    title: "Brains",
    note: "Answers from one source’s public writing, talks or notes, with the source named.",
    skills: [
      { id: "khe-brain-emil", say: "what would Emil say", get: "An answer from Emil Kowalski’s public writing with the article named." },
      { id: "khe-brain-benji", say: "would Benji ship this", get: "An answer from Benji Taylor’s public writing and skills, and a design pressure-tested against it." },
      { id: "khe-brain-varun", say: "what would Varun say", get: "An answer from 18 of Varun Mayya’s public videos with the video and the minute named." },
      { id: "khe-brain-isb", say: "what do the ISB notes say", get: "An answer from the public isb-skills notes with the file named." },
      { id: "khe-brain-yc", say: "what does YC say about", get: "An answer from 88 Y Combinator essays, posts and talks with the piece linked." },
    ],
  },
  {
    title: "Content",
    note: "A content engine in your own voice.",
    skills: [{ id: "khe-content-engine", say: "build me a content engine", get: "Your voice, audience and platforms written down once, then one idea turned into a draft for each platform." }],
  },
]

const PROMPTS = [
  ["I need a launch video for Friday. 30 seconds, product-led.", "khe-auto"],
  ["review this settings page and tell me if it ships", "khe-ui"],
  ["we have a .design file, use our tokens", "khe-design-tokens"],
  ["animate this logo so it draws itself in", "khe-svg"],
  ["make a sticker pack for the launch", "khe-sticker"],
  ["would Benji ship this hero?", "khe-brain-benji"],
  ["add sound to the checkout, only where it earns it", "khe-sound"],
  ["turn this post into one draft per platform", "khe-content-engine"],
]

const ALL = GROUPS.flatMap((g) => g.skills)

/* One glyph per skill, on a 32 grid: ink lines, one part in highlighter yellow, and a small move
   that acts out the skill. Classes: fill (paper behind a shape), hl (highlighter), draw (redraws on
   hover), and sk-* parts that move. Motion lives in site.css. */
const GLYPHS: Record<string, ReactNode> = {
  "khe-auto": (
    <>
      <path d="M8.25 16H13l6-7h5" />
      <path className="hl-stroke draw" pathLength={1} d="M13 16l6 7h5" />
      <path className="draw" pathLength={1} d="M13 16l6 7h5" />
      <circle className="fill" cx="6" cy="16" r="2.25" />
      <circle className="fill" cx="26.25" cy="9" r="2.25" />
      <circle className="hl-fill sk-pop" cx="26.25" cy="23" r="2.25" />
    </>
  ),
  "khe-ui": (
    <>
      <rect className="fill" x="4.5" y="6.5" width="23" height="19" rx="3" />
      <path d="M4.5 11h23" />
      <rect className="hl sk-ui-fill" x="9" y="17.6" width="14" height="2.8" rx="1.4" />
      <path d="M9 19h14" />
      <circle className="fill sk-ui-knob" cx="11" cy="19" r="2.25" />
    </>
  ),
  "khe-design-tokens": (
    <>
      <circle className="fill sk-tok-a" cx="11" cy="16" r="5.5" />
      <circle className="fill sk-tok-c" cx="21" cy="16" r="5.5" />
      <circle className="hl-fill" cx="16" cy="16" r="5.5" />
    </>
  ),
  "khe-svg": (
    <>
      <path className="thin" d="M6 24L11 9M26 24L21 9" />
      <path className="hl-stroke draw" pathLength={1} d="M6 24C11 9 21 9 26 24" />
      <path className="draw" pathLength={1} d="M6 24C11 9 21 9 26 24" />
      <rect className="fill" x="9.75" y="7.75" width="2.5" height="2.5" />
      <rect className="fill" x="19.75" y="7.75" width="2.5" height="2.5" />
      <circle className="fill" cx="6" cy="24" r="1.75" />
      <circle className="fill" cx="26" cy="24" r="1.75" />
    </>
  ),
  "khe-sticker": (
    <g className="sk-stk">
      <path className="hl-fill" d="M10 7h12a3 3 0 0 1 3 3v8l-7 7h-8a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z" />
      <path className="fill" d="M25 18h-4a3 3 0 0 0-3 3v4z" />
      <circle className="ink" cx="13" cy="13.5" r="0.9" />
      <circle className="ink" cx="18.5" cy="13.5" r="0.9" />
      <path d="M12.5 17.5c1.6 1.6 4.4 1.6 6 0" />
    </g>
  ),
  "khe-diagram": (
    <>
      <rect className="fill" x="4" y="6" width="10" height="7" rx="2" />
      <rect className="hl-fill" x="18" y="19" width="10" height="7" rx="2" />
      <path className="draw" pathLength={1} d="M14 9.5h3a3 3 0 0 1 3 3V18" />
      <path className="sk-pop" d="M17.5 15.75L20 18.25l2.5-2.5" />
    </>
  ),
  "khe-sound": (
    <>
      <path className="hl-fill" d="M5 13h4l5-4.5v15L9 19H5z" />
      <path className="sk-w1" d="M18 12.5a5 5 0 0 1 0 7" />
      <path className="sk-w2" d="M21.5 9.5a9.5 9.5 0 0 1 0 13" />
    </>
  ),
  "khe-launch-film": (
    <>
      <rect className="fill" x="5" y="13" width="22" height="13" rx="2" />
      <path d="M5 18h22" />
      <g className="sk-clap">
        <rect className="hl-fill" x="5" y="8" width="22" height="5" rx="1.2" />
        <path d="M11 8l-2 5M17 8l-2 5M23 8l-2 5" />
      </g>
    </>
  ),
  "khe-demo": (
    <>
      <rect className="hl-fill sk-demo-btn" x="4.5" y="17" width="15" height="7" rx="3.5" />
      <path className="sk-demo-btn" d="M8.5 20.5h7" />
      <path className="fill sk-demo-cursor" d="M20 5.5l7.5 6.5-3.6.7 2 4.2-2 .9-2-4.2-2.4 2.4z" />
    </>
  ),
  "khe-brain-emil": (
    <>
      <path className="fill" d="M7 7h18a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-9l-5 4v-4H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z" />
      <path className="hl-stroke draw" pathLength={1} d="M9 19.5C15 19.5 14 10.5 23 10.5" />
      <path className="draw" pathLength={1} d="M9 19.5C15 19.5 14 10.5 23 10.5" />
    </>
  ),
  "khe-brain-benji": (
    <>
      <path className="fill" d="M7 7h18a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-9l-5 4v-4H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z" />
      <path className="hl-fill sk-spark" d="M16 9.5l1.4 4.1 4.1 1.4-4.1 1.4L16 20.5l-1.4-4.1-4.1-1.4 4.1-1.4z" />
    </>
  ),
  "khe-brain-varun": (
    <>
      <path className="fill" d="M7 7h18a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-9l-5 4v-4H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z" />
      <path className="hl-fill sk-play" d="M13.5 11.25v7.5L20 15z" />
    </>
  ),
  "khe-brain-isb": (
    <>
      <path className="fill" d="M16 9.5C13 7.5 8.5 7.3 4.5 8.5v15c4-1.2 8.5-1 11.5 1 3-2 7.5-2.2 11.5-1v-15c-4-1.2-8.5-1-11.5 1z" />
      <path d="M16 9.5v15" />
      <rect className="hl" x="18.5" y="14.2" width="6.5" height="2.6" rx="1.3" />
      <path className="draw" pathLength={1} d="M19 12.5h5.5M19 15.5h5.5M19 18.5h3.5" />
    </>
  ),
  "khe-brain-yc": (
    <>
      <rect className="fill sk-yc-back" x="11" y="5" width="15" height="19" rx="2" />
      <rect className="fill sk-yc-mid" x="8.5" y="7" width="15" height="19" rx="2" />
      <rect className="fill" x="6" y="9" width="15" height="19" rx="2" />
      <rect className="hl" x="8.5" y="12" width="9" height="3" rx="1.5" />
      <path d="M9.5 13.5h7M9.5 18h9M9.5 21.5h6" />
    </>
  ),
  "khe-content-engine": (
    <>
      <path className="draw" pathLength={1} d="M8.5 16C13 16 13 8 18 8M8.5 16H18M8.5 16C13 16 13 24 18 24" />
      <circle className="hl-fill" cx="6.5" cy="16" r="2.5" />
      <rect className="fill sk-ce-a" x="18" y="5.5" width="9" height="5" rx="1.5" />
      <rect className="fill sk-ce-b" x="18" y="13.5" width="9" height="5" rx="1.5" />
      <rect className="fill sk-ce-c" x="18" y="21.5" width="9" height="5" rx="1.5" />
    </>
  ),
}

function Glyph({ id }: { id: string }) {
  return (
    <svg className="sk-glyph" viewBox="0 0 32 32" aria-hidden="true">
      {GLYPHS[id]}
    </svg>
  )
}

/** The plate plays its move once it has been on screen for a moment (used in the dialog). */
function Plate({ id, autoplay = false, big = false }: { id: string; autoplay?: boolean; big?: boolean }) {
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => setPlay(true), 180)
    return () => clearTimeout(t)
  }, [autoplay])
  return (
    <span className={`sk-plate${big ? " sk-plate-big" : ""}`} data-skill={id} data-play={play || undefined}>
      <Glyph id={id} />
    </span>
  )
}

function Skills() {
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const t = window.setInterval(() => setI((n) => (n + 1) % PROMPTS.length), 2800)
    return () => clearInterval(t)
  }, [reduce])

  // Each opening gets a new number, so the plate replays on open and is left alone while it closes.
  const [opens, setOpens] = useState(0)
  const show = (id: string) => {
    setSelected(id)
    setOpens((n) => n + 1)
    setOpen(true)
  }
  const skill = ALL.find((s) => s.id === selected) ?? ALL[0]
  const group = GROUPS.find((g) => g.skills.some((s) => s.id === skill.id))?.title
  const install = `npx skills add HKTITAN/skills --skill ${skill.id}`
  const [prompt, target] = PROMPTS[i]

  return (
    <div className="skills">
      <div className="skills-ticker" aria-live="off">
        <span className="skills-caret">&gt;</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.button
            key={i}
            type="button"
            className="skills-prompt"
            initial={{ y: 18, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onClick={() => show(target)}
          >
            <span>{prompt}</span>
            <span className="skills-arrow">&rarr;</span>
            <code>/{target}</code>
          </motion.button>
        </AnimatePresence>
      </div>

      {GROUPS.map((g) => (
        <div key={g.title} className="sk-group">
          <div className="sk-group-head">
            <h3>{g.title}</h3>
            <p>{g.note}</p>
          </div>
          <div className="sk-grid">
            {g.skills.map((s) => (
              <button key={s.id} type="button" className="sk-card" onClick={() => show(s.id)} aria-label={`${s.id}: ${s.get}`}>
                <Plate id={s.id} />
                <span className="sk-text">
                  <span className="sk-name">/{s.id}</span>
                  <span className="sk-say">&ldquo;{s.say}&rdquo;</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="skills-all">
        <code>npx skills add HKTITAN/skills</code>
        <CopyButton value="npx skills add HKTITAN/skills" label="Copy install" />
        <span className="hand">all of them, one line</span>
        <a className="skills-repo" href="https://github.com/HKTITAN/skills">
          <Icon name="github" /> HKTITAN/skills
        </a>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          playSound(next ? "open" : "close")
          setOpen(next)
        }}
      >
        <DialogBackdrop />
        <DialogContent>
          <div className="sk-detail">
            <Plate key={opens} id={skill.id} autoplay big />
            <span className="sk-detail-group">{group}</span>
            <DialogTitle>/{skill.id}</DialogTitle>
            <p className="sk-detail-say">
              say <span className="hand">&ldquo;{skill.say}&rdquo;</span>
            </p>
            <DialogDescription>{skill.get}</DialogDescription>
            <div className="skills-install">
              <code>{install}</code>
              <CopyButton value={install} label="Copy command" />
            </div>
            <div className="sk-detail-foot">
              <a className="skills-link" href={`https://github.com/HKTITAN/skills/tree/main/skills/${skill.id}`}>
                <Icon name="github" /> Read the skill on GitHub
              </a>
              <DialogClose>Close</DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Skills }
