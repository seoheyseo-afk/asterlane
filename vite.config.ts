import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = "asterlane";
const pagesBase = process.env.VITE_BASE_PATH ?? `/${repositoryName}/`;

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === "true" ? pagesBase : "/",
  publicDir: "public",
});
