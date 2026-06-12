import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
      include: "./src/assets/icons/*.svg",
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },

});
