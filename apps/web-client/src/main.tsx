import React from 'react'
import ReactDOM from 'react-dom/client'
import DesktopApp from './entries/DesktopApp'
import WebApp from './entries/WebApp'
import './globals.css'

enum UIMode {
  Desktop = 'desktop',
  Web = 'web',
}

const parseMode = (input: string | null | undefined): UIMode | null => {
  if (!input) return null
  const v = input.toLowerCase()
  if (v === UIMode.Desktop) return UIMode.Desktop
  if (v === UIMode.Web) return UIMode.Web
  return null
}

const params = new URLSearchParams(window.location.search)
const modeParam = params.get('mode')

const envMode = parseMode(import.meta.env.VITE_UI_TARGET)
const urlMode = parseMode(modeParam)

const mode: UIMode = urlMode ?? envMode ?? (('__TAURI__' in window) ? UIMode.Desktop : UIMode.Web)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {mode === UIMode.Desktop ? <DesktopApp /> : <WebApp />}
  </React.StrictMode>,
)