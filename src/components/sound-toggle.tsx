"use client"

import { useEffect, useState } from "react"
import { Button as UIButton } from "@ui-sdk/react/button"
import { Icon } from "../icons"
import { onSoundChange, setSound, soundOn } from "../sound"

/** Turns khe's interaction sounds on and off. Off until pressed, and remembered. */
function SoundToggle() {
  // Starts off and reads the stored choice after hydration, so server HTML and the first client
  // render agree (the server cannot see localStorage).
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(soundOn())
    const off = onSoundChange(setOn)
    return () => {
      off()
    }
  }, [])
  return (
    <UIButton className="khe-sound" aria-label="Sound effects" aria-pressed={on} title={on ? "Sound effects on" : "Sound effects off"} onClick={() => setSound(!on)}>
      <Icon name={on ? "speaker" : "speaker-off"} size={18} />
    </UIButton>
  )
}

export { SoundToggle }
