import React from 'react'
import ReactDOM from 'react-dom/client'
import DesktopApp from './entries/DesktopApp'
import WebApp from './entries/WebApp'
import './globals.css'

const params = new URLSearchParams(window.location.search)
const mode = params.get('mode') || (window.location.hostname === 'localhost' ? 'desktop' : 'web')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {mode === 'desktop' ? <DesktopApp /> : <WebApp />}
  </React.StrictMode>,
)