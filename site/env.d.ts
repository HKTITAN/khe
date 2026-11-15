// Set by vite.config.ts at build time.
declare const __KHE_VERSION__: string
declare const __KHE_UPDATED__: string

declare module "*.md?raw" {
  const text: string
  export default text
}
