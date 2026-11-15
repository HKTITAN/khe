/* khe's interaction sounds: one family, one material (a soft felt tap on a small wooden block),
   synthesized with Web Audio so there are no files to load. After designme.agency, built to the
   khe-sound rules:
   - silence is the default: nothing on hover or a plain press; a sound only marks a result (a
     toggle that changed, a copy that landed, a dialog, the theme);
   - typing is the one exception, by Harshit's call (after getkeeby.com): a soft mechanical key per
     keystroke in text fields, through typingSound(), varied so no two presses sound the same;
   - on by default (Harshit's call for khe), off once the person turns it off, and remembered;
     browsers keep it silent until the first click or key anyway;
   - the audio context is created inside a gesture, never at load, and a hidden tab stays silent;
   - every sound has a visual twin, so muted is never worse off. */

type SoundName = "tick" | "select" | "open" | "close" | "copy" | "dark" | "light" | "key" | "key-heavy"

const KEY = "khe-sound"
const listeners = new Set<(on: boolean) => void>()

let ctx: AudioContext | null = null
let out: GainNode | null = null
let noise: AudioBuffer | null = null
let last = 0

function stored(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off"
  } catch {
    return true
  }
}

let on = typeof window !== "undefined" && stored()

/** Creates and resumes the context; call only from inside a user gesture. */
function unlock() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx = new AC()
    out = ctx.createGain()
    out.gain.value = 10 ** (-12 / 20) // the whole family sits 12 dB down
    out.connect(ctx.destination)
    noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === "suspended") void ctx.resume()
}

if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "keydown"]) addEventListener(type, () => on && unlock(), { capture: true, passive: true })
}

/** A pitched tone with an instant attack and an exponential fall: the tap of the mallet. */
function tone(c: AudioContext, wave: OscillatorType, from: number, to: number, peak: number, length: number, delay = 0) {
  const t = c.currentTime + 0.002 + delay
  const osc = c.createOscillator()
  const env = c.createGain()
  osc.type = wave
  osc.frequency.setValueAtTime(from, t)
  osc.frequency.exponentialRampToValueAtTime(to, t + length)
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(peak, t + 0.0015)
  env.gain.exponentialRampToValueAtTime(0.0001, t + length)
  osc.connect(env).connect(out!)
  osc.start(t)
  osc.stop(t + length + 0.02)
}

/** A band of noise: the felt touching the wood. */
function brush(c: AudioContext, centre: number, peak: number, length: number, delay = 0) {
  const t = c.currentTime + 0.002 + delay
  const src = c.createBufferSource()
  src.buffer = noise
  const band = c.createBiquadFilter()
  band.type = "bandpass"
  band.frequency.value = centre
  band.Q.value = 1.2
  const env = c.createGain()
  env.gain.setValueAtTime(peak, t)
  env.gain.exponentialRampToValueAtTime(0.0001, t + length)
  src.connect(band).connect(env).connect(out!)
  src.start(t)
  src.stop(t + length + 0.01)
}

/** Plays one member of the family, if sound is on and the page is visible. */
function playSound(name: SoundName) {
  if (!on || document.hidden) return
  unlock()
  if (!ctx || !out) return
  // The first gesture may still be waking the context; play once it is running rather than drop it.
  if (ctx.state !== "running") {
    void ctx.resume().then(() => ctx?.state === "running" && playSound(name))
    return
  }
  const now = performance.now()
  if (name === "tick" && now - last < 40) return // a run of ticks thins out instead of buzzing
  last = now
  const vary = 1 + (Math.random() - 0.5) * 0.03 // a few cents of drift, so repeats are not identical
  // keys vary more, like a real board: pitch about 8%, level about 15%
  const kp = 1 + (Math.random() - 0.5) * 0.16
  const kg = 1 + (Math.random() - 0.5) * 0.3
  switch (name) {
    case "key":
      // the switch's click on top, the keycap's thock under it, the bottom-out a beat later
      brush(ctx, 5200 * kp, 0.5 * kg, 0.008)
      tone(ctx, "sine", 260 * kp, 150 * kp, 0.55 * kg, 0.03)
      return brush(ctx, 1500 * kp, 0.18 * kg, 0.014, 0.012)
    case "key-heavy":
      brush(ctx, 4200 * kp, 0.45 * kg, 0.01)
      tone(ctx, "sine", 170 * kp, 95 * kp, 0.75 * kg, 0.05)
      return brush(ctx, 900 * kp, 0.3 * kg, 0.03, 0.014)
    case "tick":
      return tone(ctx, "triangle", 2400 * vary, 1700 * vary, 0.45, 0.022)
    case "select":
      tone(ctx, "sine", 560 * vary, 320 * vary, 0.8, 0.04)
      return brush(ctx, 3200 * vary, 0.3, 0.012)
    case "open":
      tone(ctx, "sine", 640 * vary, 420 * vary, 0.8, 0.04)
      return brush(ctx, 3400, 0.3, 0.012)
    case "close":
      tone(ctx, "sine", 460 * vary, 260 * vary, 0.7, 0.04)
      return brush(ctx, 2800, 0.25, 0.012)
    case "copy":
      tone(ctx, "sine", 660 * vary, 640 * vary, 0.5, 0.06)
      return tone(ctx, "sine", 880 * vary, 860 * vary, 0.4, 0.07, 0.05)
    case "dark":
      tone(ctx, "triangle", 520, 510, 0.4, 0.04)
      return tone(ctx, "triangle", 780, 765, 0.4, 0.04, 0.055)
    case "light":
      tone(ctx, "triangle", 780, 765, 0.4, 0.04)
      return tone(ctx, "triangle", 520, 510, 0.4, 0.04, 0.055)
  }
}

const SILENT_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"])

/** The key sound for a keystroke in a text field: letters click, space, Enter and Backspace land
 *  heavier. Modifiers, navigation, shortcuts and a held key's auto-repeat stay silent. Wire it to a
 *  field's onKeyDown. */
function typingSound(e: { key: string; repeat?: boolean; metaKey?: boolean; ctrlKey?: boolean; altKey?: boolean }) {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || SILENT_KEYS.has(e.key)) return
  playSound(e.key === " " || e.key === "Enter" || e.key === "Backspace" || e.key === "Delete" ? "key-heavy" : "key")
}

function soundOn() {
  return on
}

/** Turns the family on or off, remembers it, and confirms "on" with its own tap. */
function setSound(next: boolean) {
  on = next
  try {
    localStorage.setItem(KEY, next ? "on" : "off")
  } catch {}
  if (next) {
    unlock()
    playSound("select")
  }
  listeners.forEach((l) => l(next))
}

function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export { onSoundChange, playSound, setSound, soundOn, typingSound }
export type { SoundName }
