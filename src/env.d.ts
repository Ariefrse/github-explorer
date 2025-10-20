/// <reference types="vite/client" />

interface ImportMetaEnv {
  // GitHub token is only for development use, never set in production
  readonly VITE_GITHUB_TOKEN?: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_PER_PAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}