import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// StrictMode removed — it double-invokes effects in dev which causes WebGL context
// loss when both FaultyTerminal (OGL) and Lanyard (Three.js) are used on the same page.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
