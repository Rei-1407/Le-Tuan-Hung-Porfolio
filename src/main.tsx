import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App";

/* Last-resort net: if anything ever tears React down (stale cached bundle,
   extension interference, unexpected crash), show what happened instead of a
   silent black page. */
function showFatal(message: string) {
  const root = document.getElementById("root");
  if (!root || root.childElementCount > 0) return;
  root.innerHTML = `
    <div style="color:#fff;font-family:system-ui;padding:48px;text-align:center">
      <h1 style="font-size:20px">Trang gặp lỗi khi tải</h1>
      <p style="opacity:.8;max-width:640px;margin:12px auto;word-break:break-word">${message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</p>
      <button style="padding:10px 24px;border-radius:8px;border:0;cursor:pointer;font-weight:600"
        onclick="location.reload()">Tải lại trang</button>
    </div>`;
}

window.addEventListener("error", (e) => showFatal(String(e.message ?? e.error ?? "Unknown error")));
window.addEventListener("unhandledrejection", (e) => showFatal(String(e.reason ?? "Unhandled rejection")));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
