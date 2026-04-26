import { useEffect, useMemo, useState } from "react";
import { APP_MODE } from "./config";
import { Atlas } from "./components/Atlas";
import { EntryDetail } from "./components/EntryDetail";
import { EntryForm } from "./components/EntryForm";
import { ExportModal } from "./components/ExportModal";
import { PasscodeModal } from "./components/PasscodeModal";
import { loadLocalEntries, loadReadonlyEntries, saveLocalEntries } from "./data/storage";
import type { Entry, SortMode, TypeFilter } from "./types";
import { decryptNote } from "./utils/crypto";
import { filterAndSortEntries } from "./utils/format";

const readonlyMode = APP_MODE === "readonly";

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
  const [unlockEntry, setUnlockEntry] = useState<Entry | null>(null);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [unlockedNotes, setUnlockedNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (readonlyMode) {
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

    setEntries(loadLocalEntries());
  }, []);

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

  function replaceEntries(nextEntries: Entry[]) {
    setEntries(nextEntries);
    if (!readonlyMode) {
      saveLocalEntries(nextEntries);
    }
  }

  function openAddForm() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  function keepEntry(entry: Entry) {
    const exists = entries.some((item) => item.id === entry.id);
    const nextEntries = exists ? entries.map((item) => (item.id === entry.id ? entry : item)) : [entry, ...entries];
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

  function deleteSelected() {
    if (!selectedEntry) return;
    const confirmed = window.confirm(`Delete "${selectedEntry.title}" from Asterlane?`);
    if (!confirmed) return;

    replaceEntries(entries.filter((entry) => entry.id !== selectedEntry.id));
    setSelectedId(null);
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
        loadError={loadError}
        onFindChange={setFind}
        onTypeChange={setTypeFilter}
        onSortChange={setSort}
        onOpenEntry={(entry) => setSelectedId(entry.id)}
        onAdd={openAddForm}
        onExport={() => setExportOpen(true)}
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

      {!readonlyMode && exportOpen && <ExportModal entries={entries} onClose={() => setExportOpen(false)} />}

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
