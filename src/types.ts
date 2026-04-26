export type EntryType = "Film" | "Series" | "Book";
export type SortMode = "Latest" | "Oldest" | "Highest";
export type TypeFilter = "All" | EntryType;

export interface PrivateNotes {
  algorithm: "PBKDF2-SHA-256/AES-GCM";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface Entry {
  id: string;
  coverUrl: string;
  title: string;
  type: EntryType;
  genres: string[];
  finished: string;
  aster: number | null;
  notes?: string;
  privateNotes?: PrivateNotes;
  createdAt: string;
}

export interface ReadonlyExport {
  app: "Asterlane";
  version: 1;
  exportedAt: string;
  entries: Entry[];
}
