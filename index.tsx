import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical Boot Error:", error);
    container.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #0aff0a; font-family: monospace; text-align: center; padding: 20px;">
        <div>
          <h1 style="color: #ff3333;">SYSTEM_CRASH</h1>
          <p>Quantum Core Initialization Failed</p>
          <button onclick="location.reload()" style="background: #0aff0a; color: #000; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px; font-weight: bold;">REBOOT_SYSTEM</button>
        </div>
      </div>
    `;
  }
}