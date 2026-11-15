/** Overlay page scrollbar: no track, no layout space. Shows while scrolling or near the edge, fades after 800ms,
 *  widens under the pointer, can be dragged. Touch devices keep their own bar. Returns a cleanup function. */
export function overlayScrollbar(): () => void {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {}
  const root = document.documentElement
  root.classList.add("overlay-sb")
  const thumb = document.createElement("div")
  thumb.className = "page-thumb"
  thumb.setAttribute("aria-hidden", "true")
  document.body.append(thumb)
  let idle = 0
  let drag: { y: number; s: number } | null = null

  const place = () => {
    const view = innerHeight
    const full = root.scrollHeight
    const h = Math.max(40, (view / full) * view)
    thumb.style.height = `${h}px`
    thumb.style.transform = `translateY(${(scrollY / Math.max(1, full - view)) * (view - h)}px)`
  }
  const show = () => {
    place()
    thumb.classList.add("show")
    clearTimeout(idle)
    idle = window.setTimeout(() => {
      if (!drag && !thumb.matches(":hover")) thumb.classList.remove("show")
    }, 800)
  }
  const nearEdge = (e: PointerEvent) => {
    if (innerWidth - e.clientX < 16) show()
  }
  const down = (e: PointerEvent) => {
    e.preventDefault()
    thumb.setPointerCapture(e.pointerId)
    drag = { y: e.clientY, s: scrollY }
    thumb.classList.add("dragging")
  }
  const move = (e: PointerEvent) => {
    if (!drag) return
    const view = innerHeight
    const full = root.scrollHeight
    scrollTo({ top: drag.s + ((e.clientY - drag.y) / (view - thumb.offsetHeight)) * (full - view), behavior: "instant" })
  }
  const end = () => {
    drag = null
    thumb.classList.remove("dragging")
    show()
  }

  addEventListener("scroll", show, { passive: true })
  addEventListener("resize", place)
  addEventListener("pointermove", nearEdge, { passive: true })
  thumb.addEventListener("pointerleave", show)
  thumb.addEventListener("pointerdown", down)
  thumb.addEventListener("pointermove", move)
  thumb.addEventListener("pointerup", end)
  thumb.addEventListener("pointercancel", end)

  return () => {
    removeEventListener("scroll", show)
    removeEventListener("resize", place)
    removeEventListener("pointermove", nearEdge)
    clearTimeout(idle)
    thumb.remove()
    root.classList.remove("overlay-sb")
  }
}
