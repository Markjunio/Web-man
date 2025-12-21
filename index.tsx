import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * ELON FLASHER: Main Entry Point
 * Highly optimized boot sequence to minimize Time-to-Interactive.
 */
const initializeCore = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("BOOT_ERROR:", err);
    rootElement.innerHTML = `
      <div style="background: #000; color: #0aff0a; padding: 40px; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h1 style="color: #ff0055;">CORE_ERROR</h1>
        <p>${err instanceof Error ? err.message : "Dimensional instability."}</p>
      </div>
    `;
  }
};

// Start as soon as the DOM is interactive
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCore, { once: true });
} else {
  initializeCore();
}
