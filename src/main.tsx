import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeExtensionSync } from './utils/extensionSync'

// Initialize extension sync
initializeExtensionSync();

createRoot(document.getElementById("root")!).render(<App />);
