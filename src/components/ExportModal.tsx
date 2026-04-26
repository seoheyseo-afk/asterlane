import { useState } from "react";
import type { FormEvent } from "react";
import type { Entry } from "../types";
import { createReadonlyExport, downloadJson } from "../data/exportReadonly";

interface ExportModalProps {
  entries: Entry[];
  onClose: () => void;
}

export function ExportModal({ entries, onClose }: ExportModalProps) {
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function exportData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passcode) return;

    try {
      setBusy(true);
      setError("");
      const payload = await createReadonlyExport(entries, passcode);
      downloadJson(payload);
      onClose();
    } catch {
      setError("Could not prepare read-only data.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <form className="w-full max-w-md rounded-[1rem] border border-rose/25 bg-cream p-5 shadow-bloom" onSubmit={exportData}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-ink">Export Read-only Data</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Notes will be encrypted into privateNotes. The passcode is not stored.
            </p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <label className="field-block">
          <span className="field-label">Sharing passcode</span>
          <input
            className="field-input"
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            autoFocus
          />
        </label>

        {error && <p className="mt-3 text-sm font-medium text-deepRose">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button className="soft-button min-h-10 px-4" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button min-h-10 px-5" type="submit" disabled={!passcode || busy}>
            Export
          </button>
        </div>
      </form>
    </div>
  );
}
