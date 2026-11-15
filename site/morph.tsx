import { TextMorph } from "torph/react"

/* Text that changes in place morphs letter by letter (torph) instead of swapping. Screen readers
   get one plain copy; the animated one is hidden from them, since torph's own markup reads twice. */
function Morph({ children }: { children: string }) {
  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        <TextMorph ease={{ stiffness: 420, damping: 34 }}>{children}</TextMorph>
      </span>
    </>
  )
}

export { Morph }
