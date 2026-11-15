import tokens from "../tokens/tokens.json"
import { Button, Icon } from "../src"
import { RadiusChoice, TweakScope } from "./tweaks"

/* Surface: the same nested surfaces in light and dark, side by side, so "depth comes from a lighter
   surface" is something you see. Then corners on real parts, then the two hairlines. */

const radius = (r: "badge" | "control" | "card") => (tokens.semantic.any as Record<string, string>)[`radius-${r}`].replace(/[{}]/g, "").replace("radius.", "")

function Stack({ theme }: { theme: "light" | "dark" }) {
  return (
    <figure className="sf-theme" data-theme={theme}>
      <figcaption className="sf-theme-name">
        <Icon name={theme === "light" ? "sun" : "moon"} /> {theme === "light" ? "Light" : "Dark"}
      </figcaption>
      <div className="sf-page">
        <code className="sf-tag">--bg-page</code>
        <div className="sf-subtle">
          <code className="sf-tag">--bg-subtle</code>
          <div className="sf-surface">
            <code className="sf-tag">--bg-surface</code>
            <div className="sf-row">
              <span className="sf-dot" />
              <span className="sf-bar" />
            </div>
            <div className="sf-row sf-row-hover">
              <span className="sf-dot" />
              <span className="sf-bar" />
              <code className="sf-tag sf-tag-in">--bg-hover</code>
            </div>
            <div className="sf-row">
              <span className="sf-dot" />
              <span className="sf-bar sf-bar-short" />
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}

function SurfaceShowcase() {
  return (
    <div className="sf">
      <div className="sf-themes">
        <Stack theme="light" />
        <Stack theme="dark" />
      </div>
      <p className="caption">
        Light steps down from white; dark steps up from near-black. Each layer in is one step lighter in the dark,
        and nothing casts a shadow.
      </p>

      <TweakScope className="sf-corners">
        <RadiusChoice />
        <div className="sf-parts">
          <div className="sf-part">
            <span className="sf-badge">Draft</span>
            <code>--radius-badge · {radius("badge")}px</code>
          </div>
          <div className="sf-part">
            <Button variant="primary">Publish</Button>
            <code>--radius-control · {radius("control")}px</code>
          </div>
          <div className="sf-part">
            <div className="sf-card">
              <span className="sf-bar" />
              <span className="sf-bar sf-bar-short" />
            </div>
            <code>--radius-card · {radius("card")}px</code>
          </div>
        </div>
      </TweakScope>

      <div className="sf-lines">
        <div className="sf-line">
          <span className="sf-rule" />
          <code>--border-subtle</code>
          <span>Between things that belong together.</span>
        </div>
        <div className="sf-line">
          <span className="sf-rule sf-rule-strong" />
          <code>--border-strong</code>
          <span>Around things you can press, and on hover.</span>
        </div>
      </div>
    </div>
  )
}

export { SurfaceShowcase }
