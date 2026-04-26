# Asterlane

Asterlane is a calm personal atlas for keeping films, series, and books. The MVP is a static React app built with Vite, Tailwind CSS, and browser storage.

## Local Run

```bash
npm install
npm run dev
```

## How Records Are Stored

In edit mode, entries are saved in the current browser's `localStorage` under the deployed site URL. They do not sync across devices or browsers automatically.

## Edit Mode And Readonly Mode

Change `APP_MODE` in `src/config.ts`.

```ts
export const APP_MODE = "edit";
// or
export const APP_MODE = "readonly";
```

- `edit`: add, edit, delete, and export records from `localStorage`.
- `readonly`: hide editing controls and load public records from `public/entries.json`.

## Export Read-only Data

In edit mode, click **Export Read-only Data**, enter a sharing passcode, and download `entries.json`. Put that file in `public/entries.json` before building a readonly deployment.

Public fields remain readable. `notes` are encrypted into `privateNotes` and the original note text is not included in the exported JSON.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds on pushes to `main` and deploys to GitHub Pages. For a repository named `asterlane`, the workflow uses:

```bash
VITE_BASE_PATH=/asterlane/
```

If the repository name changes, update `VITE_BASE_PATH` in the workflow or `repositoryName` in `vite.config.ts`.

## Notes Privacy

The passcode is not stored in the code, in JSON, in environment variables, or in `localStorage`. Notes are encrypted with Web Crypto API using PBKDF2 and AES-GCM. Each entry gets its own random salt and iv. The passcode only lives in memory while the page is open.

## Image URLs

Cover images are loaded from external URLs. Some sites block hotlinking or change image URLs, so a cover may stop showing depending on the original site's policy.
