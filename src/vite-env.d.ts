/// <reference types="vite/client" />

/** Browser-visible environment values (VITE_* only). See .env. */
interface ImportMetaEnv {
  /** Public URL of the app, e.g. https://taskora.example.com. Optional; falls back to the current origin. */
  readonly VITE_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
