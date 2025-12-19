import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * ELON FLASHER: Main Entry Point
 * Handles application mounting with fallback error states for 
 * deployment environments like Vercel and Netlify.
 */
const initializeCore = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("FATAL: Root container missing from DOM.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("ELON_FLASHER_v5.0: Quantum core status OK.");
  } catch (err) {
    console.error("MOUNT_ERROR:", err);
    rootElement.innerHTML = `
      <div style="background: #000; color: #0aff0a; padding: 40px; font-family: 'JetBrains Mono', monospace; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h1 style="color: #ff0055; font-size: 2rem; margin-bottom: 1rem;">BOOT_SEQUENCE_INTERRUPTED</h1>
        <p style="max-width: 600px; line-height: 1.6;">${err instanceof Error ? err.message : "Dimensional instability detected."}</p>
        <div style="margin-top: 2rem; font-size: 0.8rem; opacity: 0.5;">
          <p>Please check the terminal console for a full stack trace.</p>
        </div>
      </div>
    `;
  }
};

// Initiate boot sequence
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCore);
} else {
  initializeCore();
}