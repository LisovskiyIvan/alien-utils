import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: __dirname,
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "@dayme/utils": path.resolve(__dirname, "../../dist/index.js"),
    },
  },
});
