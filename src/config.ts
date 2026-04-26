export type AppMode = "edit" | "readonly";
export type DataBackend = "local" | "supabase";

export const APP_MODE: AppMode = "edit";
export const ENTRIES_URL = `${import.meta.env.BASE_URL}entries.json`;
export const STORAGE_KEY = "asterlane:entries:v1";
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://jwpejesxayxoslqeatvq.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
export const DATA_BACKEND: DataBackend = SUPABASE_ANON_KEY ? "supabase" : "local";
export const CLOUD_CURRENT_ATLAS_KEY = "asterlane:cloud-current-atlas:v1";
export const CLOUD_EDIT_TOKEN_PREFIX = "asterlane:cloud-edit-token:v1:";
