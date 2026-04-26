export type AppMode = "edit" | "readonly";

export const APP_MODE: AppMode = "edit";
export const ENTRIES_URL = `${import.meta.env.BASE_URL}entries.json`;
export const STORAGE_KEY = "asterlane:entries:v1";
