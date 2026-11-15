# khe, Harshit Khemani's design system

How [Harshit Khemani](https://www.khe.money)'s things look, read and move. khe is one set of colours, type, springs and parts for the website [khe.money](https://www.khe.money), papers, decks and whatever comes next. Every value is written once, in one file, and used everywhere. It is open source under the MIT licence: [github.com/HKTITAN/khe](https://github.com/HKTITAN/khe).

Status: draft, v0.1. The mark is still being drawn; the word set in Inter Black stands in.

## When to use khe

- You are making or reviewing anything for Harshit Khemani or khe.money: a page, a component, a paper, a deck, a social post or UI copy.
- You need the exact colour, type size, radius or spring khe uses, in light or dark.
- You are an agent: read [khe.DESIGN](https://raw.githubusercontent.com/HKTITAN/khe/main/khe.DESIGN) first. It is the whole system in one file (YAML, schema design.v1) and the source of truth. Follow its `agent.instructions`.
- You are working in a codebase: clone the repository and import the components from `src/`. Never import ui-sdk directly.

## Colour

Paper and ink do almost all the work. Yellow only ever highlights: it marks words, never fills a button. The greys are a 12-step sand ramp (gray and slate are alternatives). In dark mode the steps flip, depth comes from a lighter surface instead of a shadow, and text is bright white. Roles: `--bg-page`, `--bg-subtle`, `--bg-surface`, `--border-subtle`, `--border-strong`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--highlight`, `--guide`.

## Type

One sans, Inter, for reading and for names. Headings are Inter Black, uppercase, in a heading grey. The khe mark is set in the heading face. Numbers, dates, code and file names are Geist Mono. A thin hand, Nothing You Could Do, is for margin notes only, never body text.

## Motion

Everything moves on a spring token: smooth (stiffness 260, damping 32) for sections and dialogs, snappy (500, 30) for toggles, tabs and menus, bouncy (380, 16) for small moments of delight. Things enter from where they were and leave the way they came. Nothing moves on a keystroke. Reduced motion turns movement off and keeps the change.

## Surface

Flat paper and hairlines. Three radii: badge, control and card. In the dark, each layer in is one step lighter, and nothing casts a shadow.

## Components

Button, Switch, SegmentedControl, Tabs, Menu, Dialog, Tooltip, Checkbox, Slider, CopyButton, CommandPalette and ThemeToggle. Behaviour (keyboard, focus, screen readers) comes from [ui-sdk](https://ui-sdk.dev/docs); the look comes from khe. Variants are closed and there is no `className` escape hatch.

## Name

HARSHIT KHEMANI is the mark wherever it's Harshit himself, not the system: two stacked lines in Anton (a heavy condensed sans), both set to one length so they run end to end; the shorter line takes letter space, glyphs are never stretched. Use the `NameMark` component (it draws the SVG). All caps, ink on paper or paper on ink, never a colour or an outline, never on one line, clear space of one line's height on every side. Paired with a portrait, it sits top left, big, over a black-and-white photo.

## Illustration and icons

Spot drawings in one ink line, shapes filled with paper, exactly one part in highlighter, and one move on the verb. Icons are drawn on a 16-unit grid with a 1.25 stroke and round caps.

## Voice

Social posts and notes are lowercase, short lines, one idea per line. Product text and docs use sentence case and stay just as short. Open with a plain hook. No hashtags, almost no emoji. Say agents, never AI agents.

## Skills

The skills Harshit builds with are at [github.com/HKTITAN/skills](https://github.com/HKTITAN/skills). Install them all with `npx skills add HKTITAN/skills`.

## Files

- [khe.DESIGN](https://raw.githubusercontent.com/HKTITAN/khe/main/khe.DESIGN): the whole system for agents.
- [tokens.json](https://ds.khe.money/downloads/tokens.json): every value, the source of truth.
- [tokens.css](https://ds.khe.money/downloads/tokens.css): the values as CSS variables, light and dark.
- [khe.css](https://ds.khe.money/downloads/khe.css): tokens plus every component's styles.

Made by [Harshit Khemani](https://www.khe.money).
