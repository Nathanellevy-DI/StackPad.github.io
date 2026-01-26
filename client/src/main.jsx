/**
 * main.jsx - Application Entry Point
 * 
 * This is the first file that runs when the React app starts.
 * It mounts the root React component (App) to the DOM.
 * 
 * Key concepts:
 * - createRoot: React 18's new way to render apps (replaces ReactDOM.render)
 * - StrictMode: A development tool that highlights potential problems
 * - The 'root' element is defined in index.html
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // Global styles (CSS variables, base styles)
import App from './App.jsx'  // Main application component

// Find the 'root' div in index.html and mount our React app there
createRoot(document.getElementById('root')).render(
  // StrictMode helps catch common mistakes during development
  // It renders components twice to detect side effects (only in dev mode)
  <StrictMode>
    <App />
  </StrictMode>,
)
