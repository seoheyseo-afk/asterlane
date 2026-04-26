import { ENTRIES_URL, STORAGE_KEY } from "../config";
import type { Entry, ReadonlyExport } from "../types";

export function loadLocalEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeEntries(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveLocalEntries(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function loadReadonlyEntries(): Promise<Entry[]> {
  const response = await fetch(ENTRIES_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load entries.json");
  }

  const payload = (await response.json()) as ReadonlyExport | Entry[];
  return normalizeEntries(Array.isArray(payload) ? payload : payload.entries);
}

function normalizeEntries(value: unknown): Entry[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is Entry => {
      return Boolean(entry && typeof entry === "object" && "title" in entry);
    })
    .map((entry) => ({
      id: String(entry.id),
      coverUrl: entry.coverUrl ?? "",
      title: entry.title ?? "",
      type: entry.type === "Series" || entry.type === "Book" ? entry.type : "Film",
      genres: Array.isArray(entry.genres) ? entry.genres.map(String) : [],
      finished: entry.finished ?? "",
      aster: typeof entry.aster === "number" ? entry.aster : null,
      notes: typeof entry.notes === "string" ? entry.notes : undefined,
      privateNotes: entry.privateNotes,
      createdAt: entry.createdAt ?? new Date().toISOString(),
    }));
}
