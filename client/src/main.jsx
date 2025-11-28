import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./css/index.css";

// Global error handlers for better error visibility
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  console.error("Error message:", event.message);
  console.error("Error source:", event.filename, "line", event.lineno);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault(); // Prevent default browser error handling
});

// Log React errors
const root = ReactDOM.createRoot(document.getElementById("root"));

try {
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
} catch (error) {
  console.error("Failed to render React app:", error);
  document.getElementById("root").innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Failed to load application</h1>
      <pre>${error.toString()}</pre>
      <p>Check the browser console for more details.</p>
    </div>
  `;
}
