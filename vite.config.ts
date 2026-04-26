import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

const repositoryName = "asterlane";
const pagesBase = process.env.VITE_BASE_PATH ?? `/${repositoryName}/`;

export default defineConfig({
  plugins: [react(), copyEntriesJson()],
  base: process.env.GITHUB_PAGES === "true" ? pagesBase : "/",
  publicDir: false,
});

function copyEntriesJson() {
  let outDir = "dist";

  return {
    name: "copy-entries-json",
    configResolved(config: { root: string; build: { outDir: string } }) {
      outDir = isAbsolute(config.build.outDir) ? config.build.outDir : resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const source = resolve(process.cwd(), "public/entries.json");
      const target = resolve(outDir, "entries.json");
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, readFileSync(source));
    },
  };
}
