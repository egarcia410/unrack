import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/unrack/",
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), tailwindcss(), react()],
});
