import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Apply cached theme instantly before first paint to prevent flash of default colors.
// This runs synchronously before React renders, so there is no layout shift.
//
// Dark mode awareness: in dark mode the API-provided bgPrimary/bgCard/textColor are
// light-mode values that must NOT be applied — applyTheme.ts computes dark-mode
// equivalents from the brand hue. This IIFE mirrors that same logic so the
// pre-React paint is consistent with what applyTheme produces.
(function applyCachedTheme() {
  try {
    return; // DISABLED FOR PARIMATCH HARDCODE
  } catch (_) {}
})();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
