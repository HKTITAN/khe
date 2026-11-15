import { useLayoutEffect, useRef, useState } from "react"
import { BuildSpot, NoteSpot, ShipSpot } from "./illos"
import { Phone } from "./kit/phone"

/* Things made with khe, drawn at their true proportions and scaled with container units, so a page
   reads like a page and a slide like a slide. Every word here is true of khe itself. */

const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(2026, 10, 15))

function Paper() {
  return (
    <div className="iu-row iu-paper-row">
      <article className="iu-page iu-cover" aria-label="Write-up, cover page">
        <header className="iu-run">
          <span className="iu-mark" translate="no">khe</span>
          <span>notes · {date}</span>
        </header>
        <div className="iu-cover-art">
          <BuildSpot />
        </div>
        <h4 className="iu-cover-title">Written once</h4>
        <p className="iu-cover-sub">
          How one file of tokens makes the website, the papers and the decks <mark>look alike</mark>.
        </p>
        <footer className="iu-cover-foot">
          <span><a className="name-link" href="https://www.khe.money">Harshit Khemani</a></span>
          <span>draft</span>
        </footer>
      </article>
      <article className="iu-page iu-inner" aria-label="Write-up, first page of text">
        <header className="iu-run">
          <span>Written once</span>
          <span>2</span>
        </header>
        <h5 className="iu-h">1. One file</h5>
        <p className="iu-p">
          Every colour, size and spring lives in tokens.json. A script turns it into CSS variables, and everything
          else reads those.
        </p>
        <blockquote className="iu-quote">
          Change a value once and <mark>every page follows</mark>.
        </blockquote>
        <p className="iu-p">
          Body text is Inter at reading size. Numbers and file names sit in mono, like tokens.css. Headings are
          numbered.
        </p>
        <span className="iu-note">notes stay in the margin</span>
        <div className="iu-lines" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </article>
    </div>
  )
}

function Deck() {
  return (
    <div className="iu-row iu-deck-row">
      <div className="iu-slide iu-slide-ink" aria-label="Slide 1, title">
        <span className="iu-slide-meta">design system · {date}</span>
        <h4 className="iu-slide-big" translate="no">
          khe
        </h4>
        <p className="iu-slide-kick">written once, used everywhere</p>
      </div>
      <div className="iu-slide" aria-label="Slide 2, the idea">
        <span className="iu-slide-meta">02 · the idea</span>
        <h4 className="iu-slide-title">
          Every value is written <mark>once</mark>, in one file.
        </h4>
        <p className="iu-slide-foot">tokens.json → CSS variables → every page</p>
      </div>
      <div className="iu-slide" aria-label="Slide 3, how it flows">
        <span className="iu-slide-meta">03 · how</span>
        <div className="iu-steps">
          <div className="iu-step">
            <NoteSpot />
            <span>Write the value</span>
          </div>
          <div className="iu-step">
            <BuildSpot />
            <span>Build the parts</span>
          </div>
          <div className="iu-step">
            <ShipSpot />
            <span>Ship the page</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** khe.money on a phone, sized from the card so it scales with it, cropped by the card's foot. */
function SitePhone() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  const [dark, setDark] = useState(false)
  useLayoutEffect(() => {
    const root = document.documentElement
    const sync = () => setDark(root.dataset.theme === "dark")
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] })
    return () => mo.disconnect()
  }, [])
  useLayoutEffect(() => {
    const card = ref.current?.parentElement
    if (!card) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width * 0.4)))
    ro.observe(card)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="iu-og-phone" aria-hidden="true">
      {w > 0 && (
        <Phone width={w} frame="pro" dark={dark} wallpaper="var(--bg-page)">
          <div className="iu-app">
            <div className="iu-app-nav">
              <span className="iu-mark" translate="no">khe</span>
              <span className="iu-app-menu">
                <i />
                <i />
              </span>
            </div>
            <h4 className="iu-app-hero">
              Building products <mark>that matter</mark>.
            </h4>
            <span className="iu-app-bar" style={{ width: "88%" }} />
            <span className="iu-app-bar" style={{ width: "64%" }} />
            <span className="iu-app-label">Work</span>
            {["72%", "58%", "66%"].map((bw) => (
              <div key={bw} className="iu-app-row">
                <span className="iu-app-tile" />
                <span className="iu-app-lines">
                  <span className="iu-app-bar iu-app-bar-strong" style={{ width: bw }} />
                  <span className="iu-app-bar" style={{ width: "44%" }} />
                </span>
              </div>
            ))}
          </div>
        </Phone>
      )}
    </div>
  )
}

function Social() {
  return (
    <div className="iu-row iu-social-row">
      <div className="iu-post" aria-label="Post image, 1:1">
        <span className="iu-mark" translate="no">khe</span>
        <p className="iu-post-text">
          if you have to explain your product before someone can use it, you&rsquo;ve probably <mark>already failed</mark>.
        </p>
        <span className="iu-post-by">
          <img src="/assets/harshit.jpg" alt="" width={28} height={28} loading="lazy" />
          @harshitkhemani
        </span>
      </div>
      <div className="iu-og" aria-label="Link preview for khe.money, 1200 by 630">
        <div className="iu-og-copy">
          <span className="iu-mark" translate="no">khe</span>
          <h4 className="iu-og-title">
            Building products <mark>that matter</mark>.
          </h4>
          <span className="iu-og-url">khe.money</span>
        </div>
        <SitePhone />
      </div>
    </div>
  )
}

function InUseShowcase() {
  return (
    <div className="iu">
      <figure className="iu-fig">
        <Paper />
        <figcaption>
          <b>Paper</b> A4, printed from HTML with the same tokens. Cover, then numbered sections; one highlight a page.
        </figcaption>
      </figure>
      <figure className="iu-fig">
        <Deck />
        <figcaption>
          <b>Deck</b> 16:9. Ink opens, paper carries the rest. One idea a slide, said in a sentence.
        </figcaption>
      </figure>
      <figure className="iu-fig">
        <Social />
        <figcaption>
          <b>Social</b> A square for posts, 1200×630 for link previews: the line on the left, the site itself on the right.
        </figcaption>
      </figure>
    </div>
  )
}

export { InUseShowcase }
