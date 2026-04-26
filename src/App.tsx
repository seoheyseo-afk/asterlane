import { useEffect, useMemo, useState } from "react";
import { APP_MODE, DATA_BACKEND } from "./config";
import { Atlas } from "./components/Atlas";
import { EntryDetail } from "./components/EntryDetail";
import { EntryForm } from "./components/EntryForm";
import { ExportModal } from "./components/ExportModal";
import { PasscodeModal } from "./components/PasscodeModal";
import {
  createCloudAtlas,
  deleteCloudEntry,
  getShareUrl,
  getStoredCloudSession,
  isCloudConfigured,
  loadCloudEntries,
  makeEditToken,
  parseSharedAtlasId,
  saveCloudEntry,
  storeCloudSession,
} from "./data/cloud";
import { loadLocalEntries, loadReadonlyEntries, saveLocalEntries } from "./data/storage";
import type { Entry, SortMode, TypeFilter } from "./types";
import { decryptNote } from "./utils/crypto";
import { filterAndSortEntries } from "./utils/format";

const staticReadonlyMode = APP_MODE === "readonly";
const cloudMode = APP_MODE === "edit" && DATA_BACKEND === "supabase";

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [find, setFind] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [sort, setSort] = useState<SortMode>("Latest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [shareId, setShareId] = useState<string | null>(null);
  const [editToken, setEditToken] = useState<string | null>(null);
  const [unlockEntry, setUnlockEntry] = useState<Entry | null>(null);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [unlockedNotes, setUnlockedNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staticReadonlyMode) {
      loadReadonlyEntries()
        .then((readonlyEntries) => {
          setEntries(readonlyEntries);
          setLoadError("");
        })
        .catch(() => {
          setEntries([]);
          setLoadError("The public Atlas could not be opened.");
        });
      return;
    }

    if (cloudMode) {
      initializeCloudAtlas();
      return;
    }

    setEntries(loadLocalEntries());
  }, []);

  const readonlyMode = staticReadonlyMode || (cloudMode && !editToken);

  const searchableEntries = useMemo(
    () =>
      entries.map((entry) =>
        unlockedNotes[entry.id] !== undefined ? { ...entry, notes: unlockedNotes[entry.id] } : entry,
      ),
    [entries, unlockedNotes],
  );
  const visibleEntries = useMemo(
    () => filterAndSortEntries(searchableEntries, find, typeFilter, sort),
    [searchableEntries, find, typeFilter, sort],
  );
  const selectedEntry = selectedId ? entries.find((entry) => entry.id === selectedId) ?? null : null;

  async function initializeCloudAtlas() {
    if (!isCloudConfigured) {
      setLoadError("Supabase is not configured yet. Add VITE_SUPABASE_ANON_KEY to enable link sharing.");
      setEntries(loadLocalEntries());
      return;
    }

    try {
      setLoadError("");
      const sharedAtlasId = parseSharedAtlasId();
      const storedSession = getStoredCloudSession(sharedAtlasId);

      if (storedSession) {
        setShareId(storedSession.shareId);
        setEditToken(storedSession.editToken);
        setEntries(await loadCloudEntries(storedSession.shareId));
        return;
      }

      if (sharedAtlasId) {
        setShareId(sharedAtlasId);
        setEditToken(null);
        setEntries(await loadCloudEntries(sharedAtlasId));
        return;
      }

      const newEditToken = makeEditToken();
      const newShareId = await createCloudAtlas(newEditToken);
      const session = { shareId: newShareId, editToken: newEditToken };
      storeCloudSession(session);
      setShareId(newShareId);
      setEditToken(newEditToken);
      setEntries([]);
    } catch {
      setLoadError("The cloud Atlas could not be opened.");
      setEntries([]);
    }
  }

  function replaceEntries(nextEntries: Entry[]) {
    setEntries(nextEntries);
    if (!staticReadonlyMode && !cloudMode) {
      saveLocalEntries(nextEntries);
    }
  }

  function openAddForm() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  async function keepEntry(entry: Entry) {
    const exists = entries.some((item) => item.id === entry.id);
    const nextEntries = exists ? entries.map((item) => (item.id === entry.id ? entry : item)) : [entry, ...entries];

    if (cloudMode) {
      if (!shareId || !editToken) {
        setLoadError("This Atlas is read-only here.");
        return;
      }

      try {
        await saveCloudEntry(shareId, editToken, entry);
        setLoadError("");
      } catch {
        setLoadError("Could not keep this entry in Supabase.");
        return;
      }
    }

    replaceEntries(nextEntries);
    setSelectedId(entry.id);
    setFormOpen(false);
    setEditingEntry(null);
  }

  function editSelected() {
    if (!selectedEntry) return;
    setEditingEntry(selectedEntry);
    setFormOpen(true);
  }

  async function deleteSelected() {
    if (!selectedEntry) return;
    const confirmed = window.confirm(`Delete "${selectedEntry.title}" from Asterlane?`);
    if (!confirmed) return;

    if (cloudMode) {
      if (!shareId || !editToken) {
        setLoadError("This Atlas is read-only here.");
        return;
      }

      try {
        await deleteCloudEntry(shareId, editToken, selectedEntry.id);
        setLoadError("");
      } catch {
        setLoadError("Could not delete this entry in Supabase.");
        return;
      }
    }

    replaceEntries(entries.filter((entry) => entry.id !== selectedEntry.id));
    setSelectedId(null);
  }

  async function shareAtlas() {
    if (!shareId) return;
    const shareUrl = getShareUrl(shareId);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Share link copied. Anyone with the link can view this Atlas.");
    } catch {
      window.prompt("Copy this share link:", shareUrl);
      setShareStatus("Share link is ready.");
    }
  }

  async function unlockNotes(passcode: string) {
    if (!unlockEntry?.privateNotes) return;

    try {
      setUnlockBusy(true);
      setUnlockError("");
      const note = await decryptNote(unlockEntry.privateNotes, passcode);
      setUnlockedNotes((current) => ({ ...current, [unlockEntry.id]: note }));
      setUnlockEntry(null);
    } catch {
      setUnlockError("Couldn’t unlock this note.");
    } finally {
      setUnlockBusy(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <Atlas
        entries={visibleEntries}
        find={find}
        typeFilter={typeFilter}
        sort={sort}
        readonlyMode={readonlyMode}
        cloudMode={cloudMode}
        loadError={loadError}
        shareStatus={shareStatus}
        onFindChange={setFind}
        onTypeChange={setTypeFilter}
        onSortChange={setSort}
        onOpenEntry={(entry) => setSelectedId(entry.id)}
        onAdd={openAddForm}
        onExport={() => setExportOpen(true)}
        onShare={shareAtlas}
      />

      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          readonlyMode={readonlyMode}
          unlockedNote={unlockedNotes[selectedEntry.id]}
          onClose={() => setSelectedId(null)}
          onEdit={editSelected}
          onDelete={deleteSelected}
          onUnlock={() => {
            setUnlockEntry(selectedEntry);
            setUnlockError("");
          }}
        />
      )}

      {!readonlyMode && formOpen && (
        <EntryForm
          entry={editingEntry}
          onKeep={keepEntry}
          onClose={() => {
            setFormOpen(false);
            setEditingEntry(null);
          }}
        />
      )}

      {!readonlyMode && !cloudMode && exportOpen && <ExportModal entries={entries} onClose={() => setExportOpen(false)} />}

      {unlockEntry && (
        <PasscodeModal
          busy={unlockBusy}
          error={unlockError}
          onClose={() => setUnlockEntry(null)}
          onUnlock={unlockNotes}
        />
      )}
    </div>
  );
}
