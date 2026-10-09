import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["VITE_", "REACT_APP_"],
  build: {
    outDir: "build",
    sourcemap: false,
    target: ["chrome111", "edge111", "firefox128", "safari16.4"],
  },
});
