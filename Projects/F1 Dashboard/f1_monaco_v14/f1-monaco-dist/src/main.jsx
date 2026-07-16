import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode removed — it double-mounts components in dev which
// destroys the WebGL renderer context on the second mount cycle
createRoot(document.getElementById('root')).render(<App />)
