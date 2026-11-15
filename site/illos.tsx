import { useEffect, useRef, useState, type ReactNode } from "react"

/* Spot illustrations in the same hand as the skill glyphs: one ink line, shapes filled with paper so
   they overlap cleanly, exactly one part in highlighter, and one move on the verb, then rest.
   They play when they scroll into view; click to play again. Motion lives in site.css. */

function Spot({ label, children, viewBox = "0 0 96 64", wide = false }: { label: string; children: ReactNode; viewBox?: string; wide?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setPlay(true)
        io.disconnect()
      },
      { rootMargin: "0px 0px -20% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const replay = () => {
    setPlay(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setPlay(true)))
  }

  return (
    <button ref={ref} type="button" className={`sk-plate spot${wide ? " spot-wide" : ""}`} data-play={play || undefined} aria-label={`${label}. Play again`} onClick={replay}>
      <svg className="sk-glyph spot-svg" viewBox={viewBox} aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}

function ShipSpot() {
  return (
    <Spot label="A laptop sending a paper plane">
      <path d="M8 53h80" />
      <rect className="fill" x="25" y="29" width="28" height="20" rx="2.5" />
      <path className="fill" d="M19 53h40l-3.5-4h-33z" />
      <path d="M30 35h10M30 39.5h15M30 44h7" />
      <path className="hl-stroke draw" pathLength={1} d="M50 35c6-1 9-4 12-8" />
      <path className="dash draw" pathLength={1} d="M50 35c6-1 9-4 12-8" />
      <g className="spot-plane">
        <path className="fill" d="M60 25l22-10-7.5 20.5-4.5-6.5z" />
        <path d="M70 29l12-14" />
      </g>
      <path className="sk-pop" d="M84 30v4M82 32h4" />
    </Spot>
  )
}

function NoteSpot() {
  return (
    <Spot label="A notebook with one line highlighted and a pencil">
      <rect className="fill" x="16" y="9" width="46" height="47" rx="3" />
      <path d="M23 9v47" />
      <rect className="hl" x="28" y="27.5" width="24" height="5" rx="2.5" />
      <path className="draw" pathLength={1} d="M30 21h24M30 30h20M30 39h24M30 48h13" />
      <g className="spot-pencil">
        <path className="fill" d="M69 53l13-25 5.5 2.8-13 25z" />
        <path className="fill" d="M69 53l-.8 6.2 6.3-3.4" />
        <path d="M80.4 31.1l5.5 2.8" />
      </g>
    </Spot>
  )
}

function BuildSpot() {
  return (
    <Spot label="Blocks stacking, the last one dropping in">
      <path d="M8 54h80" />
      <rect className="fill" x="22" y="40" width="24" height="14" rx="2" />
      <rect className="fill" x="48" y="40" width="24" height="14" rx="2" />
      <g className="spot-drop">
        <rect className="hl-fill" x="34" y="24" width="26" height="16" rx="2" />
        <path d="M40 32h14" />
      </g>
      <path className="spot-lines" d="M30 20l-3-3M47 16v-4M64 20l3-3" />
    </Spot>
  )
}

/** One scene built from the same parts, with its rules written on it in the margin hand. */
function DeskScene() {
  return (
    <Spot label="A desk: a laptop showing a page, a sticky note, a mug and a paper plane leaving, labelled with the rules" viewBox="0 0 240 112" wide>
      <path d="M18 92h204" />
      <g className="scene-laptop">
        <rect className="fill" x="70" y="40" width="64" height="44" rx="3" />
        <path className="fill" d="M58 92h88l-6-8H64z" />
        <path d="M78 50h22M78 57h36M78 64h30M78 71h18" />
        <rect className="hl scene-note" x="112" y="46" width="16" height="16" rx="1.5" transform="rotate(6 120 54)" />
        <path className="scene-note" d="M115.5 52.5h9M115.5 56.5h6" transform="rotate(6 120 54)" />
      </g>
      <g className="scene-mug">
        <path className="fill" d="M158 70h16v18a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" />
        <path d="M174 74h2.5a4 4 0 0 1 0 8H174" />
        <path className="scene-steam" d="M163 64c-2-2.5 2-4 0-6.5M169 64c-2-2.5 2-4 0-6.5" />
      </g>
      <path className="dash draw" pathLength={1} d="M134 44c14-6 26-14 36-26" />
      <g className="spot-plane scene-plane">
        <path className="fill" d="M168 16l20-9-7 19-4-6z" />
        <path d="M177 20l11-13" />
      </g>
      <g className="scene-labels">
        <path className="thin" d="M50 30c6 2 12 8 18 14" />
        <text x="14" y="26">one ink line</text>
        <path className="thin" d="M132 28c-3 2-5 5-6 9" />
        <text x="118" y="24">one highlight</text>
        <path className="thin" d="M206 70c-6 2-12 6-16 10" />
        <text x="190" y="64">paper fills</text>
        <path className="thin" d="M206 26c-6-2-10-6-14-10" />
        <text x="196" y="36">one move</text>
      </g>
    </Spot>
  )
}

export { BuildSpot, DeskScene, NoteSpot, ShipSpot }
