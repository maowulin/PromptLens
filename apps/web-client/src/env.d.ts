interface ImportMetaEnv {
  readonly VITE_UI_TARGET?: 'desktop' | 'web'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}