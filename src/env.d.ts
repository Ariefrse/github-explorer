/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_API_BASE_URL: string
  readonly VITE_GITHUB_API_VERSION: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_PER_PAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}