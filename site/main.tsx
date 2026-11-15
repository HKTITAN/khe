import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "../src/styles/khe.css"
import "./site.css"
import { App } from "./app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
