type NameMarkProps = {
  /** Accessible name; the mark itself is drawn. */
  label?: string
  className?: string
}

/** HARSHIT KHEMANI as a mark: two stacked lines in Anton, a heavy condensed sans, both set to one
 *  length so they run end to end (the shorter line takes letter space; glyphs are never stretched).
 *  The gap between the lines is a quarter of the cap height. Size it by width; it scales as one
 *  drawing. Needs Anton loaded (Google Fonts). */
function NameMark({ label = "Harshit Khemani", className }: NameMarkProps) {
  return (
    <svg className={className ? `khe-name ${className}` : "khe-name"} viewBox="0 0 74 41" role="img" aria-label={label}>
      <text x="0" y="18" textLength="74" lengthAdjust="spacing">
        HARSHIT
      </text>
      <text x="0" y="40" textLength="74" lengthAdjust="spacing">
        KHEMANI
      </text>
    </svg>
  )
}

export { NameMark }
export type { NameMarkProps }
