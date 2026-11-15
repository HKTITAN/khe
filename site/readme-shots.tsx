import { createRoot } from "react-dom/client"
import "../src/styles/tokens.css"
import "./kit/stage.css"
import { Window } from "./kit/window"

/* Dev-only page that the README images are filmed from (scripts/readme-shots.mjs).
   Every window shows the real brand page in an iframe, so nothing here is mocked.
   ?shot=hero | hero-dark | sections */

const shot = new URLSearchParams(location.search).get("shot") ?? "hero"
const page = (theme: string, hash = "") => `/?theme=${theme}${hash}`

/** The real page, laid out at desktop width and scaled into the window. */
function Live({ src, width, height, scale }: { src: string; width: number; height: number; scale: number }) {
  return (
    <div className="rs-live" style={{ width: width * scale, height: height * scale }}>
      <iframe title="khe brand page" src={src} width={width} height={height} style={{ transform: `scale(${scale})` }} />
    </div>
  )
}

function Hero({ theme }: { theme: "light" | "dark" }) {
  return (
    <div id="shot" className="ss-stage rs-stage" data-theme={theme} style={{ width: 1280, height: 640 }}>
      <div className="rs-hero-window">
        <Window url="ds.khe.money" urlShape="pill" nav>
          <Live src={page(theme)} width={1440} height={900} scale={1088 / 1440} />
        </Window>
      </div>
    </div>
  )
}

function Sections() {
  const panes = [
    { hash: "#colour", left: -150 },
    { hash: "#skills", left: 380 },
    { hash: "#motion", left: 910 },
  ]
  return (
    <div id="shot" className="ss-stage rs-stage" data-theme="light" style={{ width: 1280, height: 470 }}>
      {panes.map((p, i) => (
        <div key={p.hash} className="rs-row-window" data-front={i === 1 || undefined} style={{ left: p.left }}>
          <Window url={`ds.khe.money/${p.hash}`} urlShape="pill">
            <Live src={page("light", p.hash)} width={1280} height={1200} scale={520 / 1280} />
          </Window>
        </div>
      ))}
    </div>
  )
}

/** The Open Graph card: 1200 × 630, the line on the left, the live page running off the right. */
function Og() {
  return (
    <div id="shot" className="ss-stage rs-stage rs-og" data-theme="light" style={{ width: 1200, height: 630 }}>
      <div className="rs-og-copy">
        <span className="rs-og-mark">khe</span>
        <h1 className="rs-og-title">How Harshit’s things look, read and move.</h1>
        <span className="rs-og-url">ds.khe.money</span>
      </div>
      <div className="rs-og-window">
        <Window url="ds.khe.money" urlShape="pill" nav>
          <Live src={page("light")} width={1440} height={1200} scale={760 / 1440} />
        </Window>
      </div>
    </div>
  )
}

const css = `
  html, body { margin: 0; }
  .rs-stage { position: relative; overflow: hidden; background: var(--bg-page); }
  .rs-live { overflow: hidden; }
  .rs-live iframe { border: 0; display: block; transform-origin: 0 0; background: var(--bg-page); }
  .rs-hero-window { position: absolute; left: 96px; top: 56px; width: 1088px; }
  .rs-row-window { position: absolute; top: 48px; width: 520px; }
  .rs-row-window:not([data-front]) { opacity: 0.55; scale: 0.94; }
  .rs-row-window[data-front] { z-index: 1; }
  .rs-og { font-family: Inter, system-ui, sans-serif; color: var(--text-primary); }
  .rs-og-copy { position: absolute; left: 72px; top: 0; bottom: 0; width: 380px; display: flex; flex-direction: column; justify-content: center; gap: 22px; }
  .rs-og-mark { font-weight: 900; font-size: 44px; letter-spacing: -0.045em; line-height: 1; }
  .rs-og-title { margin: 0; font-weight: 600; font-size: 50px; line-height: 1.04; letter-spacing: -0.035em; }
  .rs-og-url { font: 500 20px ui-monospace, monospace; color: var(--text-tertiary); }
  .rs-og-window { position: absolute; left: 500px; top: 96px; width: 760px; }
`

function Shots() {
  return (
    <>
      <style>{css}</style>
      {shot === "og" ? <Og /> : shot === "sections" ? <Sections /> : <Hero theme={shot === "hero-dark" ? "dark" : "light"} />}
    </>
  )
}

createRoot(document.getElementById("root")!).render(<Shots />)
