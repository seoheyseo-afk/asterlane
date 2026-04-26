import { createClient } from "@supabase/supabase-js";
import { CLOUD_CURRENT_ATLAS_KEY, CLOUD_EDIT_TOKEN_PREFIX, SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";
import type { CloudAtlasSession, Entry, EntryType, PrivateNotes } from "../types";

interface CloudEntryRow {
  id: string;
  cover_url: string | null;
  title: string | null;
  entry_type: EntryType | string | null;
  genres: string[] | null;
  finished: string | null;
  aster: number | null;
  notes: string | null;
  private_notes: PrivateNotes | null;
  created_at: string | null;
}

export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = isCloudConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export function parseSharedAtlasId() {
  const hashMatch = window.location.hash.match(/^#\/atlas\/([a-zA-Z0-9_-]+)$/);
  if (hashMatch) return hashMatch[1];

  const params = new URLSearchParams(window.location.search);
  return params.get("atlas");
}

export function getShareUrl(shareId: string) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `/atlas/${shareId}`;
  return url.toString();
}

export function getStoredCloudSession(shareId?: string | null): CloudAtlasSession | null {
  const currentShareId = shareId || localStorage.getItem(CLOUD_CURRENT_ATLAS_KEY);
  if (!currentShareId) return null;

  return {
    shareId: currentShareId,
    editToken: localStorage.getItem(`${CLOUD_EDIT_TOKEN_PREFIX}${currentShareId}`),
  };
}

export function storeCloudSession(session: CloudAtlasSession) {
  localStorage.setItem(CLOUD_CURRENT_ATLAS_KEY, session.shareId);
  if (session.editToken) {
    localStorage.setItem(`${CLOUD_EDIT_TOKEN_PREFIX}${session.shareId}`, session.editToken);
  }
}

export function makeEditToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function createCloudAtlas(editToken: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("create_atlas", {
    p_edit_token: editToken,
  });

  if (error || typeof data !== "string") {
    throw new Error(error?.message || "Could not create Atlas.");
  }

  return data;
}

export async function loadCloudEntries(shareId: string): Promise<Entry[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("list_entries", {
    p_share_id: shareId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data as CloudEntryRow[]).map(mapCloudEntry);
}

export async function saveCloudEntry(shareId: string, editToken: string, entry: Entry) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.rpc("upsert_entry", {
    p_share_id: shareId,
    p_edit_token: editToken,
    p_entry: {
      id: entry.id,
      coverUrl: entry.coverUrl,
      title: entry.title,
      type: entry.type,
      genres: entry.genres,
      finished: entry.finished,
      aster: entry.aster,
      notes: entry.notes ?? "",
      privateNotes: entry.privateNotes ? JSON.stringify(entry.privateNotes) : "",
      createdAt: entry.createdAt,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCloudEntry(shareId: string, editToken: string, entryId: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.rpc("delete_entry", {
    p_share_id: shareId,
    p_edit_token: editToken,
    p_entry_id: entryId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function mapCloudEntry(row: CloudEntryRow): Entry {
  const entryType = row.entry_type === "Series" || row.entry_type === "Book" ? row.entry_type : "Film";
  const privateNotes = row.private_notes ?? undefined;

  return {
    id: row.id,
    coverUrl: row.cover_url ?? "",
    title: row.title ?? "",
    type: entryType,
    genres: row.genres ?? [],
    finished: row.finished ?? "",
    aster: typeof row.aster === "number" ? row.aster : row.aster === null ? null : Number(row.aster),
    notes: privateNotes ? row.notes || undefined : row.notes ?? "",
    privateNotes,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}
