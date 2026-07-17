import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deployed as a GitHub Pages project site under this sub-path.
export default defineConfig({
  base: "/Le-Tuan-Hung-Porfolio/",
  plugins: [react()],
});
