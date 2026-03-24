import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
  // TODO: Send to error reporting service (e.g., Sentry) in production
});

// Global handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('[Uncaught Error]', event.error);
  // TODO: Send to error reporting service (e.g., Sentry) in production
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
