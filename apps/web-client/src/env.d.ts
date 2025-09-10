interface ImportMetaEnv {
  readonly VITE_UI_TARGET?: 'desktop' | 'web'
  readonly MODE: string
  readonly BASE_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}