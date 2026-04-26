import type { Entry, SortMode, TypeFilter } from "../types";

export const DEFAULT_GENRES = [
  "Romance",
  "Drama",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Comedy",
  "Animation",
  "Sci-Fi",
  "Historical",
  "Slice of Life",
  "Coming-of-age",
  "Essay",
  "Poetry",
  "Documentary",
];

export const ENTRY_TYPES = ["Film", "Series", "Book"] as const;

export function makeId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function todayInputValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function formatFinished(value: string) {
  if (!value) return "Undated";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatAster(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

export function filterAndSortEntries(entries: Entry[], find: string, type: TypeFilter, sort: SortMode) {
  const query = find.trim().toLowerCase();

  return entries
    .filter((entry) => {
      if (type !== "All" && entry.type !== type) return false;
      if (!query) return true;

      return [entry.title, entry.genres.join(" "), entry.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (sort === "Highest") {
        const aScore = a.aster ?? -1;
        const bScore = b.aster ?? -1;
        return bScore - aScore || compareFinishedDesc(a, b);
      }

      if (sort === "Oldest") {
        return compareFinishedAsc(a, b);
      }

      return compareFinishedDesc(a, b);
    });
}

function finishedTime(entry: Entry) {
  if (!entry.finished) return 0;
  return new Date(`${entry.finished}T00:00:00`).getTime();
}

function compareFinishedDesc(a: Entry, b: Entry) {
  return finishedTime(b) - finishedTime(a) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function compareFinishedAsc(a: Entry, b: Entry) {
  const aTime = finishedTime(a) || Number.MAX_SAFE_INTEGER;
  const bTime = finishedTime(b) || Number.MAX_SAFE_INTEGER;
  return aTime - bTime || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}
