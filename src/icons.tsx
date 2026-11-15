import type { ReactNode, SVGProps } from "react"

/* khe icons. Drawn on a 16-unit grid with a 1.25 stroke and round caps, after the method in
   "The making of Cursor's icons" (Minor Adventures): straight and 45° lines with rounded joins,
   closed shapes, flat slashes, natural proportions, diagonals running bottom-left to top-right.
   Good from 12 to 20px; a 24px cut comes later. */

const paths: Record<string, ReactNode> = {
  copy: (
    <>
      <rect x="2.5" y="2.5" width="8" height="8" rx="1.5" />
      <path d="M12 5.5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5V12" />
    </>
  ),
  check: <path d="M3 8.5l3.25 3.25L13 5" />,
  download: <path d="M8 2.5v7.5M4.75 6.75L8 10l3.25-3.25M2.5 11v1.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V11" />,
  "arrow-up-right": <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />,
  "arrow-right": <path d="M2.75 8h10.5M9.5 4.25L13.25 8 9.5 11.75" />,
  plus: <path d="M8 2.75v10.5M2.75 8h10.5" />,
  minus: <path d="M2.75 8h10.5" />,
  x: <path d="M4 4l8 8M12 4l-8 8" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.25 10.25l3.25 3.25" />
    </>
  ),
  sun: (
    <>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.6 3.6l1.06 1.06M11.34 11.34l1.06 1.06M3.6 12.4l1.06-1.06M11.34 4.66l1.06-1.06" />
    </>
  ),
  moon: <path d="M13.25 9.5A5.5 5.5 0 1 1 6.5 2.75a4.5 4.5 0 0 0 6.75 6.75z" />,
  "align-left": <path d="M2.5 4h11M2.5 8h7M2.5 12h9" />,
  list: <path d="M6 4h7.5M6 8h7.5M6 12h7.5M2.5 4h.01M2.5 8h.01M2.5 12h.01" />,
  calendar: (
    <>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M5.25 1.75v2.5M10.75 1.75v2.5M2 6.75h12" />
    </>
  ),
  monitor: (
    <>
      <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.5" />
      <path d="M5.5 13.75h5M8 11.25v2.5" />
    </>
  ),
  pencil: <path d="M3 13l.75-3.25L10.5 3a1.6 1.6 0 0 1 2.25 0l.25.25a1.6 1.6 0 0 1 0 2.25L6.25 12.25zM9.25 4.25l2.5 2.5" />,
  file: <path d="M4 1.75h5l3.5 3.5v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10.5a1 1 0 0 1 1-1zM9 1.75v3.5h3.5" />,
  folder: <path d="M1.75 4.5a1 1 0 0 1 1-1h3.5l1.5 1.5h5.5a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H2.75a1 1 0 0 1-1-1z" />,
  link: <path d="M6.75 9.25l2.5-2.5M7.5 4.75l1-1a2.83 2.83 0 0 1 4 4l-1 1M8.5 11.25l-1 1a2.83 2.83 0 0 1-4-4l1-1" />,
  mail: (
    <>
      <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
      <path d="M2.25 4.25L8 8.75l5.75-4.5" />
    </>
  ),
  eye: (
    <>
      <path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  grid: (
    <>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </>
  ),
  heart: <path d="M8 13.25S2 9.75 2 5.9A3.15 3.15 0 0 1 8 4.4a3.15 3.15 0 0 1 6 1.5c0 3.85-6 7.35-6 7.35z" />,
  "chevron-down": <path d="M4.25 6.25L8 10l3.75-3.75" />,
  speaker: <path d="M2.75 6h2.5L8.5 3.25v9.5L5.25 10h-2.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5zM10.75 5.75a3.25 3.25 0 0 1 0 4.5M12.5 4a5.75 5.75 0 0 1 0 8" />,
  "speaker-off": <path d="M2.75 6h2.5L8.5 3.25v9.5L5.25 10h-2.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5zM10.75 6.25l3 3.5M13.75 6.25l-3 3.5" />,
  droplet: <path d="M8 2.25s4.25 4.6 4.25 7.6a4.25 4.25 0 0 1-8.5 0c0-3 4.25-7.6 4.25-7.6z" />,
  type: <path d="M3.25 4.5V3h9.5v1.5M8 3v10.25M6 13.25h4" />,
  wave: <path d="M1.75 8c1.25-3.25 2.5-3.25 3.13 0s1.87 3.25 3.12 0 1.88-3.25 3.13 0 1.87 3.25 3.12 0" />,
  corner: <path d="M3 13.25V7.5A4.5 4.5 0 0 1 7.5 3h5.75" />,
  layers: <path d="M8 2.5l5.75 3L8 8.5 2.25 5.5zM2.25 8.25L8 11.25l5.75-3M2.25 11L8 14l5.75-3" />,
  component: (
    <>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <circle cx="11.25" cy="11.25" r="2.25" />
    </>
  ),
  lockup: (
    <>
      <rect x="2" y="5" width="4.5" height="6" rx="1" />
      <path d="M9.25 6.5h4.75M9.25 9.5h3.25" />
    </>
  ),
  image: (
    <>
      <rect x="2.25" y="3" width="11.5" height="10" rx="1.5" />
      <path d="M2.75 11.25L6 8l2.5 2.5L10 9l3.25 3.25" />
      <circle cx="10.5" cy="6" r="1" />
    </>
  ),
  shapes: (
    <>
      <circle cx="5" cy="5" r="2.5" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
      <path d="M11.25 2.5l2.5 4.25h-5zM2.5 13.5l4.5-4.5" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8.25l1.75 1.75L10.75 6.5" />
    </>
  ),
  message: <path d="M3 3.25h10a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H8.25l-3.25 2.5v-2.5H3a1 1 0 0 1-1-1v-6.5a1 1 0 0 1 1-1z" />,
  slides: (
    <>
      <rect x="1.75" y="3.25" width="12.5" height="8" rx="1.5" />
      <path d="M8 11.25v2.5M5.75 13.75h4.5" />
    </>
  ),
  terminal: (
    <>
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" />
      <path d="M4.75 6.5l2 1.75-2 1.75M8.5 10h3" />
    </>
  ),
  user: (
    <>
      <circle cx="8" cy="5.5" r="2.75" />
      <path d="M3 13.5c.8-2.4 2.7-3.5 5-3.5s4.2 1.1 5 3.5" />
    </>
  ),
  agent: (
    <>
      <rect x="2.75" y="5.25" width="10.5" height="8" rx="2" />
      <path d="M8 5.25v-2.5M6 8.75v1M10 8.75v1" />
    </>
  ),
  "arrow-up": <path d="M8 13.25V2.75M4.25 6.5L8 2.75l3.75 3.75" />,
  play: <path d="M4.75 3.4v9.2a.6.6 0 0 0 .9.52l7.6-4.6a.6.6 0 0 0 0-1.04l-7.6-4.6a.6.6 0 0 0-.9.52z" />,
  // The GitHub mark redrawn as a line icon: head, ears, and the tail curling off the left.
  github: (
    <>
      <path d="M10 14.25v-2.1a1.9 1.9 0 0 0-.55-1.45c1.95-.2 3.8-.95 3.8-4.05a3.1 3.1 0 0 0-.85-2.2 2.9 2.9 0 0 0-.05-2.2s-.7-.2-2.25.85a7.7 7.7 0 0 0-4.1 0C4.45 2.05 3.75 2.25 3.75 2.25a2.9 2.9 0 0 0-.05 2.2 3.1 3.1 0 0 0-.85 2.2c0 3.1 1.85 3.85 3.8 4.05A1.9 1.9 0 0 0 6.1 12.15v2.1" />
      <path d="M6.1 12.6c-2.35.7-2.35-1.25-3.35-1.5" />
    </>
  ),
}

type IconName = keyof typeof paths
const iconNames = Object.keys(paths) as IconName[]

function Icon({ name, size = 16, ...rest }: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}

export { Icon, iconNames, paths as iconPaths }
export type { IconName }
