"use client"

import type { ComponentProps } from "react"
import { Button as UIButton } from "@ui-sdk/react/button"

type ButtonVariant = "primary" | "secondary"
type ButtonSize = "sm" | "md"

type ButtonProps = Omit<ComponentProps<typeof UIButton>, "className" | "style" | "render"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Renders a real link (keeps Cmd/Ctrl-click and middle-click). */
  href?: string
  /** With href: download the file instead of opening it, saved under this name. */
  download?: string
}

function Button({ variant = "secondary", size = "md", href, download, ...props }: ButtonProps) {
  return <UIButton {...props} render={href ? <a href={href} download={download} /> : undefined} data-variant={variant} data-size={size} />
}

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
