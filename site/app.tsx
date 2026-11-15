import { useEffect, useRef, useState, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { AnimatePresence, motion, MotionConfig, type Transition } from "motion/react"
import { annotate } from "rough-notation"
import tokens from "../tokens/tokens.json"
import { overlayScrollbar } from "../src/feel"
import { Construction, Frame } from "./construction"
import { BuildSpot, DeskScene, NoteSpot, ShipSpot } from "./illos"
import { InUseShowcase } from "./inuse"
import { AgentView } from "./agent-view"
import { Downloads } from "./downloads"
import { MotionShowcase } from "./motion"
import { ColourShowcase, toHex } from "./colour"
import { SurfaceShowcase } from "./surface"
import { Skills } from "./skills"
import { NameSection } from "./name"
import { HeadingChoices, HighlightDots, TweakScope } from "./tweaks"
import {
  Button,
  Checkbox,
  CommandPalette,
  SoundToggle,
  playSound,
  typingSound,
  CopyButton,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Icon,
  iconNames,
  iconPaths,
  Menu,
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuItemIcon,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
  SegmentedControl,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  ThemeToggle,
  Tooltip,
  VerseText,
  type IconName,
  type VerseTextHandle,
  type PaletteGroup,
} from "../src"

type Theme = "light" | "dark"

const smooth: Transition = { type: "spring", stiffness: 260, damping: 32 }
const snappy: Transition = { type: "spring", stiffness: 500, damping: 30 }

const SECTIONS = [
  { id: "colour", n: "01", title: "Colour", icon: "droplet" },
  { id: "type", n: "02", title: "Type", icon: "type" },
  { id: "motion", n: "03", title: "Motion", icon: "wave" },
  { id: "surface", n: "04", title: "Surface", icon: "corner" },
  { id: "components", n: "05", title: "Components", icon: "component" },
  { id: "lockups", n: "06", title: "Lockups", icon: "lockup" },
  { id: "name", n: "07", title: "Name", icon: "user" },
  { id: "illustration", n: "07", title: "Illustration", icon: "image" },
  { id: "icons", n: "08", title: "Icons", icon: "shapes" },
  { id: "practices", n: "09", title: "Best practices", icon: "check-circle" },
  { id: "voice", n: "10", title: "Voice", icon: "message" },
  { id: "in-use", n: "11", title: "In use", icon: "slides" },
  { id: "skills", n: "12", title: "Skills", icon: "terminal" },
  { id: "downloads", n: "13", title: "Downloads", icon: "download" },
] as const


const sand = Object.entries(tokens.primitive.color.sand).map(([k, v]) => ({ step: k, value: v.$value }))
const springs = tokens.primitive.spring as Record<string, { $value: { stiffness: number; damping: number } }>

type View = "human" | "agent"

// ?view=agent opens the Markdown view; otherwise the last choice, then Human.
function readView(): View {
  const asked = new URLSearchParams(location.search).get("view")
  if (asked === "agent" || asked === "human") return asked
  try {
    return localStorage.getItem("khe-view") === "agent" ? "agent" : "human"
  } catch {
    return "human"
  }
}

function readTheme(): Theme {
  // ?theme=dark opens the page in that theme, for links and for the README shots
  const asked = new URLSearchParams(location.search).get("theme")
  if (asked === "dark" || asked === "light") return asked
  try {
    const t = localStorage.getItem("khe-theme")
    return t === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  const bar = getComputedStyle(document.documentElement).getPropertyValue("--bg-page").trim()
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => bar && m.setAttribute("content", bar))
}

function App() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [active, setActive] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [view, setView] = useState<View>(readView)
  const changeView = (next: View) => {
    setView(next)
    try {
      localStorage.setItem("khe-view", next)
    } catch {}
    scrollTo({ top: 0, behavior: "instant" })
  }
  const dark = theme === "dark"
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number>(undefined)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem("khe-theme", theme)
    } catch {}
  }, [theme])

  useEffect(() => overlayScrollbar(), [])

  // A #section link opened cold lands before the page has rendered, so jump once it has.
  useEffect(() => {
    const el = location.hash && document.getElementById(location.hash.slice(1))
    if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 72, behavior: "instant" })
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = innerHeight * 0.4
      let current = ""
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) current = s.id
      }
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = SECTIONS[SECTIONS.length - 1].id
      setActive(current)
      setScrolled(scrollY > 8)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("resize", onScroll)
    return () => {
      removeEventListener("scroll", onScroll)
      removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".chips")
    const chip = bar?.querySelector<HTMLElement>(`a[href="#${active}"]`)
    if (bar && chip && getComputedStyle(bar).display !== "none") {
      bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" })
    }
  }, [active])

  const changeTheme = (next: Theme) => {
    setTheme(next)
    applyTheme(next)
  }

  const ctx = useRef<{ section: string; selection: string }>({ section: "", selection: "" })
  const [ctxSelection, setCtxSelection] = useState("")
  const [ctxSection, setCtxSection] = useState("")

  const onContextCapture = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.stopPropagation()
      return
    }
    const section = (e.target as HTMLElement).closest("section[id]")?.id ?? ""
    const selection = window.getSelection()?.toString().trim() ?? ""
    ctx.current = { section, selection }
    setCtxSection(section)
    setCtxSelection(selection)
  }

  const onMenuAction = (value: string) => {
    // copies make their own sound when the copy lands
    if (!["copy", "section", "page"].includes(value) && !value.startsWith("hex:")) playSound("select")
    const base = location.href.split("#")[0]
    if (value === "copy") copy("selection", ctx.current.selection)
    if (value === "section") copy("link", `${base}#${ctx.current.section}`)
    if (value === "page") copy("link", base)
    if (value === "theme") {
      const root = document.documentElement
      root.classList.add("khe-theme-fading")
      window.setTimeout(() => root.classList.remove("khe-theme-fading"), 420)
      changeTheme(root.dataset.theme === "dark" ? "light" : "dark")
    }
    if (value === "tokens") {
      const a = document.createElement("a")
      a.href = "/downloads/tokens.css"
      a.download = "tokens.css"
      a.click()
    }
    if (value === "github") window.open("https://github.com/HKTITAN/khe", "_blank", "noopener")
    if (value.startsWith("go:")) document.getElementById(value.slice(3))?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
    if (value.startsWith("hex:")) copy(value.slice(4), value.slice(4))
    if (value.startsWith("dl:")) {
      const a = document.createElement("a")
      a.href = `/downloads/${value.slice(3)}`
      a.download = value.slice(3)
      a.click()
    }
    if (value === "top") scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
  }

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      playSound("copy")
      setToast(`Copied ${label}`)
    } catch {
      setToast("Couldn’t copy")
    }
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1400)
  }

  return (
    <MotionConfig reducedMotion="user" transition={smooth}>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="hd" data-scrolled={scrolled || undefined}>
        <div className="hd-in">
          <a className="hd-brand" href="#top" aria-label="khe design system, back to top">
            <span className="hd-mark" translate="no">khe</span>
            <span className="hd-name">Design system</span>
            <span className="hd-badge">Draft</span>
          </a>
          <div className="hd-tools">
            <SegmentedControl
              aria-label="Read as"
              value={view}
              onValueChange={changeView}
              options={[
                { value: "human", label: "Human", icon: "user" },
                { value: "agent", label: "Agent", icon: "agent" },
              ]}
            />
            <SoundToggle />
            <Tooltip content="Source on GitHub">
              <a className="hd-icon" href="https://github.com/HKTITAN/khe" aria-label="khe on GitHub">
                <Icon name="github" size={18} />
              </a>
            </Tooltip>
            <ThemeToggle value={theme} onChange={changeTheme} />
          </div>
        </div>
        <span className="hd-progress" aria-hidden="true" />
      </header>

      <nav className="chips" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined} onClick={() => playSound("tick")}>
            {active === s.id && <motion.span layoutId="chip" className="chip-bg" transition={snappy} />}
            <span className="chip-label">
              <Icon name={s.icon} size={14} />
              {s.title}
            </span>
          </a>
        ))}
      </nav>

      <Menu onAction={onMenuAction}>
      <MenuContextTrigger tabIndex={-1} onContextMenuCapture={onContextCapture}>
      {view === "agent" ? (
        <AgentView onBack={() => changeView("human")} />
      ) : (
      <div className="layout" id="top">
        <aside className="index" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined} onClick={() => playSound("tick")}>
              {active === s.id && <motion.span layoutId="index" className="index-bg" transition={snappy} />}
              <span className="index-n"><Icon name={s.icon} /></span>
              <span>{s.title}</span>
            </a>
          ))}
        </aside>

        <main id="content">
          <Hero dark={dark} />

          <Section id="colour" n="01" title="Colour" rule="Paper and ink do almost all the work. Yellow only ever highlights.">
            <ColourShowcase onCopy={copy} isDark={dark} />
            <p className="caption">Each colour gets room for how much it is used. Hover one to copy it.</p>
            <TweakScope className="highlight-row">
              <p className="highlight-demo">
                When something needs pointing at, it gets a <mark>highlight</mark>, <Rough type="underline" tone="ink">never a new colour</Rough>.
              </p>
              <HighlightDots />
            </TweakScope>
          </Section>

          <Section id="type" n="02" title="Type" rule="One sans for reading and for names, mono for numbers, a hand for notes.">
            <LiveHeading />
            <figure className="construct-fig">
              <Construction />
              <figcaption>
                The wordmark, under construction: Inter Black, the heading face, every anchor point showing. The real mark will be
                drawn on these same guides.
              </figcaption>
            </figure>
            <div className="specimen">
              <div className="spec-big"><a className="name-link" href="https://www.khe.money">Harshit Khemani</a></div>
              <div className="spec-label"><a href="https://rsms.me/inter/">Inter</a> Semibold · names and headings</div>
            </div>
            <div className="spec-grid">
              <div className="spec-cell">
                <p className="spec-body">
                  Building products that matter. Body copy sits at 16px with lines kept under 65 characters, so a
                  paragraph never turns into a wall.
                </p>
                <div className="spec-label"><a href="https://rsms.me/inter/">Inter</a> Regular · everything you read</div>
              </div>
              <div className="spec-cell">
                <p className="spec-mono">khe.money · 2026 · v0.1</p>
                <div className="spec-label"><a href="https://vercel.com/font">Geist Mono</a> · numbers, dates, code</div>
              </div>
              <div className="spec-cell">
                <p className="spec-hand">notes in the margin, like this</p>
                <div className="spec-label"><a href="https://fonts.google.com/specimen/Nothing+You+Could+Do">Nothing You Could Do</a> · notes only, never body</div>
              </div>
            </div>
            <div className="scale">
              {(["display", "title", "lead", "body", "label", "caption"] as const).map((role) => (
                <div key={role} className="scale-row">
                  <code>{role}</code>
                  <span
                    className="scale-sample"
                    style={{
                      fontSize: `var(--text-${role})`,
                      fontFamily: role === "display" || role === "title" ? "var(--font-display)" : "var(--font-body)",
                    }}
                  >
                    <a className="name-link" href="https://www.khe.money">Harshit Khemani</a>
                  </span>
                  <code className="scale-px">{parseFloat((tokens.primitive.size as Record<string, { $value: string }>)[String(sizeOf(role))].$value) * 16}px</code>
                </div>
              ))}
            </div>
          </Section>

          <Section id="motion" n="03" title="Motion" rule="Everything moves on a spring. Nothing moves on a keystroke, and reduced motion turns it all off.">
            <MotionShowcase />
            <VerseDemo dark={dark} />
          </Section>

          <Section id="surface" n="04" title="Surface" rule="Flat paper and hairlines. In the dark, depth comes from a lighter surface, never a shadow.">
            <SurfaceShowcase />
          </Section>

          <Section id="components" n="05" title="Components" rule="A short list with fixed options. If a component doesn’t have the variant you want, the answer is no.">
            <div className="stage">
              <Demo name="Button" detail="primary | secondary · sm | md">
                <Button variant="primary">Publish</Button>
                <Button>Cancel</Button>
                <Button onClick={() => new Promise((r) => setTimeout(r, 1400))}>Save</Button>
              </Demo>
              <Demo name="Switch" detail="label names the setting">
                <Switch label="Reduce motion" />
              </Demo>
              <Demo name="SegmentedControl" detail="two to five options">
                <SegmentedControl
                  aria-label="View"
                  defaultValue="grid"
                  options={[
                    { value: "list", label: "List" },
                    { value: "grid", label: "Grid" },
                    { value: "board", label: "Board" },
                  ]}
                />
              </Demo>
              <Demo name="Menu" detail="also the right-click menu">
                <Menu>
                  <MenuTrigger>
                    Actions <Icon name="chevron-down" size={14} />
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem value="rename">
                      <MenuItemIcon><Icon name="pencil" /></MenuItemIcon>
                      Rename
                    </MenuItem>
                    <MenuItem value="duplicate">
                      <MenuItemIcon><Icon name="copy" /></MenuItemIcon>
                      Duplicate
                      <MenuShortcut>Ctrl D</MenuShortcut>
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem value="share">
                      <MenuItemIcon><Icon name="link" /></MenuItemIcon>
                      Copy link
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </Demo>
              <Demo name="Dialog" detail="one focused task">
                <Dialog>
                  <DialogTrigger>Publish changes</DialogTrigger>
                  <DialogBackdrop />
                  <DialogContent>
                    <DialogTitle>Publish 3 changes?</DialogTitle>
                    <DialogDescription>They go live on khe.money straight away. You can roll back from the history.</DialogDescription>
                    <div className="dialog-actions">
                      <DialogClose>Cancel</DialogClose>
                      <DialogClose data-primary="">Publish</DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </Demo>
              <Demo name="Tooltip" detail="plain text, never a button inside">
                <Tooltip content="Search the site">
                  <Button aria-label="Search">
                    <Icon name="search" />
                  </Button>
                </Tooltip>
                <Tooltip content="Copy the page link">
                  <Button aria-label="Copy link">
                    <Icon name="link" />
                  </Button>
                </Tooltip>
              </Demo>
              <Demo name="Checkbox + Slider" detail="label says what, value says how much">
                <div className="demo-stack">
                  <Checkbox label="Email me when it ships" defaultChecked />
                  <Slider aria-label="Volume" defaultValue={64} />
                </div>
              </Demo>
              <Demo name="CommandPalette" detail="also Ctrl/Cmd + K, anywhere">
                <CommandPalette groups={paletteGroups} onAction={onMenuAction} />
              </Demo>
              <Demo name="Tabs" detail="one panel at a time">
                <Tabs defaultValue="work">
                  <TabsList aria-label="Example">
                    <TabsTab value="work">Work</TabsTab>
                    <TabsTab value="about">About</TabsTab>
                    <TabsTab value="contact">Contact</TabsTab>
                  </TabsList>
                  <TabsPanel value="work">
                    <p className="caption">Smash&amp;Clash, Campus Binge, AgentsORG.</p>
                  </TabsPanel>
                  <TabsPanel value="about">
                    <p className="caption">Building since 14.</p>
                  </TabsPanel>
                  <TabsPanel value="contact">
                    <p className="caption">Say hi.</p>
                  </TabsPanel>
                </Tabs>
              </Demo>
            </div>
            <p className="caption">
              Built on <a href="https://ui-sdk.dev/docs">ui-sdk</a>, so keyboard, focus and screen readers come free. khe
              only decides how they look.
            </p>
          </Section>

          <Lockups />
          <NameSection Section={Section} />

          <Illustration />

          <Icons />

          <Practices />

          <Voice />

          <InUse />

          <Section
            id="skills"
            n="12"
            title="Skills"
            badge={
              <a className="section-badge" href="https://skills.sh/HKTITAN/skills">
                <img src="https://skills.sh/b/HKTITAN/skills" alt="HKTITAN/skills on skills.sh" width={87} height={20} />
              </a>
            } rule="The skills I build with every day, so an agent works to these rules too. Type the job; the skill does the rest.">
            <Skills />
          </Section>

          <Section id="downloads" n="13" title="Downloads" rule="Take the files, not screenshots of them. Pick one to read it here first.">
            <Downloads />
          </Section>

          <footer className="foot">
            <span>khe v0 · draft · <a className="name-link" href="https://www.khe.money">Harshit Khemani</a></span>
            <a className="foot-link" href="https://github.com/HKTITAN/khe">
              <Icon name="github" /> Source
            </a>
          </footer>
        </main>
      </div>
      )}
      </MenuContextTrigger>
      <MenuContent>
        {ctxSelection && (
          <MenuItem value="copy">
            <MenuItemIcon><Icon name="copy" /></MenuItemIcon>
            Copy
            <MenuShortcut>Ctrl C</MenuShortcut>
          </MenuItem>
        )}
        {ctxSection && (
          <MenuItem value="section">
            <MenuItemIcon><Icon name="link" /></MenuItemIcon>
            Copy link to {SECTIONS.find((x) => x.id === ctxSection)?.title ?? "section"}
          </MenuItem>
        )}
        <MenuItem value="page">
          <MenuItemIcon><Icon name="link" /></MenuItemIcon>
          Copy page link
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="theme">
          <MenuItemIcon><Icon name={theme === "dark" ? "sun" : "moon"} /></MenuItemIcon>
          {theme === "dark" ? "Switch to light" : "Switch to dark"}
        </MenuItem>
        <MenuItem value="tokens">
          <MenuItemIcon><Icon name="download" /></MenuItemIcon>
          Download tokens.css
        </MenuItem>
        <MenuItem value="github">
          <MenuItemIcon><Icon name="github" /></MenuItemIcon>
          View source on GitHub
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="top">
          <MenuItemIcon><Icon name="arrow-up" /></MenuItemIcon>
          Back to top
        </MenuItem>
        <div className="ctx-hint">Shift + right-click for the browser menu</div>
      </MenuContent>
      </Menu>

      <div className="sr-only" aria-live="polite">
        {toast ?? ""}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            aria-hidden="true"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={snappy}
          >
            <Icon name="check" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

function sizeOf(role: string) {
  const ref = (tokens.semantic.any as Record<string, string>)[`text-${role}`]
  return ref.replace(/[{}]/g, "").split(".")[1]
}

// Written the way benji.org dates a page: 15 November, 2026.
const updated = (() => {
  const d = new Date(__KHE_UPDATED__)
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "long" })}, ${d.getFullYear()}`
})()

function Hero({ dark }: { dark: boolean }) {
  return (
    <section className="hero">
      <p className="hero-meta">
        <span>v{__KHE_VERSION__}</span>
        <span aria-hidden="true">·</span>
        <span>
          Updated <time dateTime={__KHE_UPDATED__}>{updated}</time>
        </span>
      </p>
      <h1 className="hero-title" aria-label="How Harshit’s things look, read and move.">
        <VerseText text="How Harshit’s things look, read and move." tone={dark ? "dark" : "light"} idle className="hero-verse" />
      </h1>
      <Annotated note="values are still a draft" delay={900}>
        <motion.p className="hero-sub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...smooth, delay: 0.08 }}>
          <a className="inline-link" href="https://github.com/HKTITAN/khe" translate="no">khe</a> is one set of colours, type, springs and parts for the website, documents and whatever comes next. Every
          value is <Rough type="highlight" tone="highlight" delay={500}>written once</Rough>, in one file, and used everywhere.
        </motion.p>
      </Annotated>
      <motion.div className="hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...smooth, delay: 0.16 }}>
        <Button variant="primary" href="#downloads">
          Get the tokens
        </Button>
        <Button href="https://github.com/HKTITAN/khe">
          <Icon name="github" /> GitHub
        </Button>
      </motion.div>
    </section>
  )
}

function Section({ id, title, rule, badge, children }: { id: string; n: string; title: string; rule: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <motion.section
      id={id}
      className="section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
    >
      <header className="section-head">
        <h2>
          {title}
          {badge}
        </h2>
        <p className="section-rule">{rule}</p>
      </header>
      {children}
    </motion.section>
  )
}

function Lockups() {
  const [guides, setGuides] = useState(true)
  return (
    <Section id="lockups" n="06" title="Lockups" rule="The mark keeps its clear space. Everything else lines up to it.">
      <div className="lockup-bar">
        <Switch label="Show guides" checked={guides} onCheckedChange={setGuides} />
        <span className="caption">The real mark is still being drawn; plain text stands in.</span>
      </div>
      <div className={`lockups ${guides ? "with-guides" : ""}`}>
        <figure className="lockup-tile">
          <div className="lockup">
            <span className="mark-box">
              <span className="mark" translate="no">khe</span>
            </span>
            <span className="handle">@harshitkhemani</span>
            <span className="guide-line guide-top" />
            <span className="guide-line guide-base" />
          </div>
          <figcaption>Handle lockup. The mark matches the handle’s cap height; the gap is one clear space.</figcaption>
        </figure>
        <figure className="lockup-tile">
          <div className="lockup">
            <span className="mark-box">
              <span className="mark" translate="no">khe</span>
            </span>
            <span className="divider" />
            <img className="partner-logo" src="/assets/smashandclash.svg" alt="Smash&Clash" width={460} height={276} loading="lazy" />
            <span className="guide-line guide-top" />
            <span className="guide-line guide-base" />
          </div>
          <figcaption>Partnership lockup. A hairline at the edge of the clear space, the partner’s mark at equal height.</figcaption>
        </figure>
        <figure className="lockup-tile lockup-card-tile">
          <div className="card-wrap">
            <Frame className="post-frame">
            <div className="post-card">
              <div className="post-head">
                <img className="post-avatar" src="/assets/harshit.jpg" alt="" width={40} height={40} loading="lazy" />
                <span className="post-who">
                  <b><a className="name-link" href="https://www.khe.money">Harshit Khemani</a></b>
                  <span>@harshitkhemani</span>
                </span>
                <span className="post-mark" translate="no">khe</span>
              </div>
              <p className="post-body">Building products that matter.</p>
              <code className="post-date">{postDate}</code>
            </div>
            </Frame>
            {[
              ["Name", "label-name"],
              ["Handle", "label-handle"],
              ["Mark", "label-mark"],
              ["Content", "label-content"],
              ["Date", "label-date"],
            ].map(([label, cls]) => (
              <span key={label} className={`anno ${cls}`}>
                {label}
              </span>
            ))}
          </div>
          <figcaption>Post card, for sharing a line or a quote. Real words only, never edited after the fact.</figcaption>
        </figure>
      </div>
    </Section>
  )
}


const SWATCHES: [string, string, string[]][] = [
  ["Paper", tokens.primitive.color.sand["1"].$value, ["background", "page"]],
  ["Ink", tokens.primitive.color.sand["12"].$value, ["text", "black"]],
  ["Highlight", tokens.primitive.color.yellow.$value, ["yellow", "marker"]],
  ["Guide", tokens.primitive.color.blue.$value, ["blue", "construction"]],
]

const paletteGroups: PaletteGroup[] = [
  { label: "Sections", items: SECTIONS.map((s) => ({ value: `go:${s.id}`, label: s.title, icon: s.icon })) },
  {
    label: "Copy a colour",
    items: SWATCHES.map(([name, value, keywords]) => {
      const hex = toHex(value)
      return { value: `hex:${hex}`, label: name, icon: "copy" as const, keywords, hint: <><span className="swatch-dot" style={{ background: value }} />{hex}</> }
    }),
  },
  {
    label: "Download",
    items: ["tokens.json", "tokens.css", "khe.css"].map((f) => ({ value: `dl:${f}`, label: f, icon: "download" as const })),
  },
  {
    label: "Actions",
    items: [
      { value: "theme", label: "Switch light and dark", icon: "moon" as const, keywords: ["theme", "dark", "light"] },
      { value: "page", label: "Copy page link", icon: "link" as const },
      { value: "github", label: "View source on GitHub", icon: "github" as const },
      { value: "top", label: "Back to top", icon: "arrow-up" as const },
    ],
  },
]

const postDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(2026, 10, 15))
const c = tokens.primitive.color

function Illustration() {
  return (
    <Section id="illustration" n="07" title="Illustration" rule="Small spot drawings in the same hand as the icons and skill glyphs: one ink line, one thing in highlighter, one move.">
      <figure className="spot-fig scene-fig">
        <DeskScene />
        <figcaption>One scene from the same parts. The rules are written on it; every piece below follows them.</figcaption>
      </figure>
      <div className="spots">
        <figure className="spot-fig">
          <ShipSpot />
          <figcaption>
            <b>ships</b> The plane leaves once, along a line you can follow.
          </figcaption>
        </figure>
        <figure className="spot-fig">
          <NoteSpot />
          <figcaption>
            <b>writes</b> The pencil moves, the lines appear, one is highlighted.
          </figcaption>
        </figure>
        <figure className="spot-fig">
          <BuildSpot />
          <figcaption>
            <b>stacks</b> The last block drops in, settles, and stays.
          </figcaption>
        </figure>
      </div>
      <ul className="pills icon-rules">
        {[
          "One ink line with round ends",
          "Shapes are filled with paper, so overlaps stay clean",
          "Exactly one part in highlighter",
          "They sit on the dot-grid plate",
          "Move once, on the verb, then rest",
          "Same family as the icons and skill glyphs",
        ].map((t) => (
          <li key={t}>
            <Icon name="check" />
            {t}
          </li>
        ))}
      </ul>
      <p className="caption">They play as they scroll into view. Click one to play it again; with reduced motion they stay still.</p>
    </Section>
  )
}

const iconSvg = (name: IconName) => renderToStaticMarkup(<Icon name={name} />).replace(' aria-hidden="true"', "")

function IconConstruct({ name }: { name: IconName }) {
  return (
    <svg className="icon-construct-svg" viewBox="-1 -1 18 18" role="img" aria-label={`${name}, drawn on its grid`}>
      {Array.from({ length: 17 }, (_, i) => (
        <g key={i}>
          <line x1={i} x2={i} y1={0} y2={16} className="ig" />
          <line y1={i} y2={i} x1={0} x2={16} className="ig" />
        </g>
      ))}
      <rect x={2} y={2} width={12} height={12} rx={1.5} className="ik" />
      <circle cx={8} cy={8} r={6.75} className="ik" />
      {[0, 16].flatMap((x) => [0, 16].map((y) => <rect key={`${x}${y}`} x={x - 0.3} y={y - 0.3} width={0.6} height={0.6} className="ih" />))}
      <motion.g
        key={name}
        className="ip"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={snappy}
        style={{ transformOrigin: "8px 8px" }}
      >
        {iconPaths[name]}
      </motion.g>
    </svg>
  )
}

function Icons() {
  const [selected, setSelected] = useState<IconName>("pencil")
  const [size, setSize] = useState<"16" | "20" | "24">("16")
  const [q, setQ] = useState("")
  const shown = iconNames.filter((n) => n.includes(q.trim().toLowerCase()))
  const svg = iconSvg(selected)
  const jsx = `<Icon name="${selected}" />`
  return (
    <Section id="icons" n="08" title="Icons" rule="Small diagrams on a 16 grid. One stroke, round ends, nothing there to decorate.">
      <div className="ic">
        <aside className="ic-detail">
          <IconConstruct name={selected} />
          <div className="ic-detail-meta">
            <code className="ic-detail-name">{selected}</code>
            <span className="ic-detail-sizes" aria-hidden="true">
              {[16, 20, 24].map((px) => (
                <Icon key={px} name={selected} size={px} />
              ))}
            </span>
          </div>
          <div className="ic-detail-copy">
            <span>
              <code>{jsx}</code>
              <CopyButton value={jsx} label="Copy JSX" />
            </span>
            <span>
              <code>SVG</code>
              <CopyButton value={svg} label="Copy SVG" />
            </span>
          </div>
        </aside>
        <div className="ic-main">
          <div className="ic-tools">
            <label className="ic-search">
              <Icon name="search" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={typingSound}
                placeholder={`Search ${iconNames.length} icons`}
                aria-label="Search icons"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <SegmentedControl
              aria-label="Icon size"
              value={size}
              onValueChange={setSize}
              options={[
                { value: "16", label: "16" },
                { value: "20", label: "20" },
                { value: "24", label: "24" },
              ]}
            />
          </div>
          <div className="ic-grid">
            {shown.map((n) => (
              <button key={n} type="button" className="ic-cell" aria-pressed={selected === n} onClick={() => setSelected(n)}>
                <Icon name={n} size={Number(size)} />
                <span>{n}</span>
              </button>
            ))}
            {shown.length === 0 && <p className="ic-empty">No icon called &ldquo;{q}&rdquo; yet.</p>}
          </div>
        </div>
      </div>
      <ul className="pills icon-rules">
        {[
          "16-unit grid, 1.25 stroke, round caps",
          "Straight and 45° lines, then round the corners",
          "Close the shapes; slashes cut flat",
          "Tall things stay tall",
          "Diagonals run bottom-left to top-right",
          "Same object, same drawing, everywhere",
        ].map((t) => (
          <li key={t}>
            <Icon name="check" />
            {t}
          </li>
        ))}
      </ul>
      <p className="caption">
        Method after Marek Minor&rsquo;s <a href="https://www.minoradventures.co/blog/the-making-of-cursors-icons">icons for Cursor</a>.
        Every icon is in <a href="https://github.com/HKTITAN/khe/blob/main/src/icons.tsx">src/icons.tsx</a>.
      </p>
    </Section>
  )
}


function InUse() {
  return (
    <Section id="in-use" n="11" title="In use" rule="The same tokens make the paper, the deck and the post. Nothing is restyled by hand.">
      <InUseShowcase />
    </Section>
  )
}

const DONTS = [
  { id: "stretch", text: "Stretching or squashing it.", fixed: "Kept at its own proportions." },
  { id: "rotate", text: "Tilting it for energy.", fixed: "Straight. The notes can lean, the mark can’t." },
  { id: "colour", text: "Setting it in a colour.", fixed: "Ink on paper, paper on ink." },
  { id: "shadow", text: "Shadows, glows or gradients.", fixed: "Flat, always." },
  { id: "font", text: "Retyping it in another font.", fixed: "Use the file, not a typeface." },
  { id: "outline", text: "Turning it into an outline.", fixed: "Solid ink, never a stroke." },
  { id: "contrast", text: "Placing it where it can’t be read.", fixed: "Enough contrast to read at a glance." },
  { id: "crowd", text: "Crowding it.", fixed: "Clear space on every side." },
] as const

function Practices() {
  const [fixed, setFixed] = useState(false)
  return (
    <Section id="practices" n="09" title="Best practices" rule="A handful of rules keep khe recognisable wherever it ends up.">
      <div className="dos">
        <figure className="do">
          <div className="do-art">
            <span className="do-clear">
              <span className="do-mark" translate="no">khe</span>
            </span>
          </div>
          <figcaption>
            <b><Icon name="check" /> Give it room</b>
            <span>Clear space on every side equals the height of the x.</span>
          </figcaption>
        </figure>
        <figure className="do">
          <div className="do-art do-pair">
            <span className="do-half do-paper"><span className="do-mark" translate="no">khe</span></span>
            <span className="do-half do-ink"><span className="do-mark" translate="no">khe</span></span>
          </div>
          <figcaption>
            <b><Icon name="check" /> Ink on paper, paper on ink</b>
            <span>Two versions. Nothing in between.</span>
          </figcaption>
        </figure>
        <figure className="do">
          <div className="do-art do-text">
            <p>
              point at it with a <mark>highlight</mark>
            </p>
          </div>
          <figcaption>
            <b><Icon name="check" /> Yellow is a highlighter</b>
            <span>It marks words. It is never text, never a fill.</span>
          </figcaption>
        </figure>
        <figure className="do">
          <div className="do-art">
            <span className="do-lockup">
              <span className="do-mark" translate="no">khe</span>
              <span className="do-rule" />
              <span>@harshitkhemani</span>
            </span>
          </div>
          <figcaption>
            <b><Icon name="check" /> Use a lockup for context</b>
            <span>When it sits beside a handle or a partner.</span>
          </figcaption>
        </figure>
      </div>

      <h3 className="sub">
        <Icon name="x" /> Don&rsquo;t
        <span className="grow" />
        <Switch label="Show the fix" checked={fixed} onCheckedChange={setFixed} />
      </h3>
      <div className="donts">
        {DONTS.map((a) => (
          <figure key={a.id} className={`dont ${fixed ? "fixed" : ""}`} data-dont={a.id}>
            <span className="dont-art">
              {a.id === "crowd" && (
                <>
                  <span className="crowd crowd-a" />
                  <span className="crowd crowd-b" />
                </>
              )}
              <span className="dont-mark" translate="no">
                khe
              </span>
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

const VOICE_RULES = [
  { rule: "lowercase, short lines, one idea per line.", why: "how the posts have read since mid-2025." },
  { rule: "open with a plain hook.", why: "a line that would hold up on its own." },
  { rule: "say what shipped, where to try it, and one detail of how it feels. then the link.", why: "product posts." },
  { rule: "tell a lesson through one small story, and end on the takeaway.", why: "reflection posts." },
  { rule: "be honest, a little self-deprecating. own what you quit, skip the drama.", why: "the 2025 recap." },
  { rule: "no hashtags, almost no emoji.", why: "and never “AI agents”. just agents." },
]

const VOICE_POSTS = [
  { text: "if you have to explain your product before someone can use it, you’ve probably already failed.", shows: "a plain hook" },
  { text: "Smash&Clash is now playable inside GTA V", shows: "what shipped, said once" },
  { text: "keep betting on yourself!", shows: "the takeaway, last" },
]

const VOICE_PAIRS = [
  ["if you have to explain your product before someone can use it, you’ve probably already failed.", "Your habits are like compound interest 👇"],
  ["Smash&Clash is now playable inside GTA V", "🧵Thread: 10 tips to grow your startup 🚀"],
  ["keep betting on yourself!", "Leveraging AI agents to disrupt gaming. #startup #founder"],
]

function Voice() {
  const [mine, setMine] = useState(false)
  return (
    <Section id="voice" n="10" title="Voice" rule="It should sound like a person typed it, because one did.">
      <div className="vo">
        <div className="vo-feed" aria-label="Real lines from Harshit's posts">
          {VOICE_POSTS.map((post) => (
            <article key={post.text} className="vo-post">
              <header>
                <img src="/assets/harshit.jpg" alt="" width={28} height={28} loading="lazy" />
                <b><a className="name-link" href="https://www.khe.money">Harshit Khemani</a></b>
                <span>@harshitkhemani</span>
              </header>
              <p>{post.text}</p>
              <span className="vo-tag">
                <Icon name="check" size={12} /> {post.shows}
              </span>
            </article>
          ))}
        </div>
        <ul className="vo-rules">
          {VOICE_RULES.map((v) => (
            <li key={v.rule}>
              <Icon name="check" />
              <span>
                <span className="vo-rule">{v.rule}</span>
                <span className="vo-why hand">{v.why}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="vo-fix">
        <div className="vo-fix-head">
          <h3 className="sub">
            <Icon name="message" /> Same idea, two voices
          </h3>
          <Switch label="Make it sound like me" checked={mine} onCheckedChange={setMine} />
        </div>
        <div className="vo-pairs">
          {VOICE_PAIRS.map(([good, bad]) => (
            <div key={good} className="vo-pair" data-mine={mine || undefined}>
              <span className="vo-pair-label">
                <Icon name={mine ? "check" : "x"} size={12} /> {mine ? "sounds like me" : "doesn’t"}
              </span>
<motion.p key={mine ? "good" : "bad"} className={mine ? "vo-good" : "vo-bad"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={snappy}>
                {mine ? good : bad}
              </motion.p>
            </div>
          ))}
        </div>
      </div>

      <div className="vo-case">
        <div>
          <code>posts, notes</code>
          <p className="vo-case-low">lowercase, short lines</p>
        </div>
        <div>
          <code>product, docs</code>
          <p>Sentence case, just as short</p>
        </div>
      </div>
    </Section>
  )
}

function LiveHeading() {
  const [text, setText] = useState("Building products that matter")
  return (
    <TweakScope className="live-heading">
      <input
        id="live-heading"
        className="live-heading-input"
        aria-label="Try the heading style"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={typingSound}
        spellCheck={false}
        autoComplete="off"
      />
      <span className="live-heading-hint hand" aria-hidden="true">type here</span>
      <HeadingChoices />
    </TweakScope>
  )
}

function VerseDemo({ dark }: { dark: boolean }) {
  const [text, setText] = useState("Building products that matter.")
  const [mode, setMode] = useState<"idle" | "replay">("idle")
  const verse = useRef<VerseTextHandle>(null)
  return (
    <div className="verse-demo">
      <VerseText ref={verse} key={mode} text={text || " "} tone={dark ? "dark" : "light"} idle={mode === "idle"} className="verse-line" />
      <div className="verse-tools">
        <label className="verse-input">
          <Icon name="pencil" />
          <input value={text} onChange={(e) => setText(e.target.value.slice(0, 48))} onKeyDown={typingSound} aria-label="Type a line for Verse" spellCheck={false} autoComplete="off" />
        </label>
        <SegmentedControl
          aria-label="Verse mode"
          value={mode}
          onValueChange={setMode}
          options={[
            { value: "idle", label: "Idle glitch", icon: "wave" },
            { value: "replay", label: "Replay", icon: "play" },
          ]}
        />
        {mode === "replay" && (
          <Button onClick={() => verse.current?.replay()}>
            <Icon name="play" /> Print again
          </Button>
        )}
      </div>
      <span className="caption">Inspired by Spider-Verse.</span>
    </div>
  )
}

function Demo({ name, detail, children }: { name: string; detail: string; children: ReactNode }) {
  return (
    <div className="demo">
      <div className="demo-body">{children}</div>
      <div className="demo-meta">
        <b>{name}</b>
        <span>{detail}</span>
      </div>
    </div>
  )
}

type RoughType = "highlight" | "underline" | "circle" | "bracket" | "box"

function useRough(ref: React.RefObject<HTMLElement | null>, type: RoughType, delay = 0) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Below 1180px the margin note drops under its paragraph, as on benji.org, and a bracket
    // drawn past the text's right edge would run off a phone screen, so it is left out.
    if (type === "bracket" && matchMedia("(max-width: 1180px)").matches) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    const a = annotate(el, {
      type,
      color: "currentColor",
      strokeWidth: type === "highlight" ? 1 : 1.4,
      padding: type === "bracket" ? [4, 14] : type === "circle" ? [4, 8] : 2,
      brackets: ["right"],
      multiline: true,
      iterations: 2,
      animate: !reduce,
      animationDuration: type === "highlight" ? 650 : 450,
    })
    let timer = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        timer = window.setTimeout(() => {
          a.show()
          el.parentElement?.setAttribute("data-shown", "")
        }, delay)
        io.disconnect()
      },
      { rootMargin: "0px 0px -15% 0px" },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(timer)
      a.remove()
    }
  }, [ref, type, delay])
}

function Rough({ type, tone, delay, children }: { type: RoughType; tone: "ink" | "highlight" | "pop"; delay?: number; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  useRough(ref, type, delay)
  return (
    <span className="rough" data-tone={tone} data-type={type}>
      <span ref={ref}>{children}</span>
    </span>
  )
}

function Annotated({ note, delay = 200, children }: { note: string; delay?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useRough(ref, "bracket", delay)
  return (
    <div className="annotated rough" data-tone="ink" data-type="bracket">
      <div ref={ref}>{children}</div>
      <motion.span
        className="margin-note hand"
        initial={{ opacity: 0, x: -6 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ ...smooth, delay: delay / 1000 + 0.45 }}
      >
        {note}
      </motion.span>
    </div>
  )
}

export { App }
