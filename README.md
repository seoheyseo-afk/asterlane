# Asterlane

Asterlane is a calm personal atlas for keeping films, series, and books. It is a static React app built with Vite and Tailwind CSS, with local browser storage by default and optional Supabase link sharing.

## Local Run

```bash
npm install
npm run dev
```

## How Records Are Stored

If Supabase is not configured, edit mode saves entries in the current browser's `localStorage` under the deployed site URL. They do not sync across devices or browsers automatically.

If `VITE_SUPABASE_ANON_KEY` is configured, Asterlane switches to Supabase mode. Each visitor gets an Atlas with an edit token stored only in that browser. **Copy Share Link** creates a read-only link like:

```text
https://seoheyseo-afk.github.io/asterlane/#/atlas/abc123
```

## Edit Mode And Readonly Mode

Change `APP_MODE` in `src/config.ts`.

```ts
export const APP_MODE = "edit";
// or
export const APP_MODE = "readonly";
```

- `edit`: add, edit, delete, and export records from `localStorage`.
- `readonly`: hide editing controls and load public records from `public/entries.json`.

Supabase mode is enabled automatically in edit mode when `VITE_SUPABASE_ANON_KEY` exists.

## Supabase Link Sharing

Run `supabase/schema.sql` in your Supabase project's SQL Editor. Then create `.env.local` for local development:

```bash
VITE_SUPABASE_URL=https://jwpejesxayxoslqeatvq.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For GitHub Pages, add repository variables:

```bash
gh variable set VITE_SUPABASE_URL --body "https://jwpejesxayxoslqeatvq.supabase.co"
gh variable set VITE_SUPABASE_ANON_KEY --body "your-anon-key"
```

The anon key is public by design. Table access is blocked with RLS, and the app uses security-definer RPC functions for create/list/update/delete.

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

This encryption applies to the JSON readonly export flow. In Supabase link-sharing mode, a shared Atlas link is read-only but its entries, including notes, are visible to people with the link.

## Image URLs

Cover images are loaded from external URLs. Some sites block hotlinking or change image URLs, so a cover may stop showing depending on the original site's policy.
