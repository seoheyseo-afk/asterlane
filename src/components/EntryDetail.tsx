import type { ReactNode } from "react";
import type { Entry } from "../types";
import { formatFinished } from "../utils/format";
import { AsterRating } from "./AsterRating";
import { CoverArt } from "./CoverArt";

interface EntryDetailProps {
  entry: Entry;
  readonlyMode: boolean;
  unlockedNote?: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUnlock: () => void;
}

export function EntryDetail({
  entry,
  readonlyMode,
  unlockedNote,
  onClose,
  onEdit,
  onDelete,
  onUnlock,
}: EntryDetailProps) {
  return (
    <div className="fixed inset-0 z-30 bg-ink/35 backdrop-blur-sm" role="dialog" aria-modal="true">
      <aside className="ml-auto flex h-full w-full flex-col overflow-y-auto bg-cream shadow-bloom sm:max-w-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rose/20 bg-cream/95 px-4 py-3 backdrop-blur sm:px-6">
          <p className="font-display text-3xl text-deepRose">Asterlane</p>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="grid gap-5 p-4 sm:p-6">
          <CoverArt coverUrl={entry.coverUrl} title={entry.title} className="mx-auto w-full max-w-[280px]" />

          <section className="space-y-4">
            <div>
              <h2 className="font-display text-4xl leading-tight text-ink">{entry.title}</h2>
              <p className="mt-1 text-sm font-semibold text-deepRose">{entry.type}</p>
            </div>

            <DetailRow label="Genre">
              <div className="flex flex-wrap gap-2">
                {entry.genres.length ? (
                  entry.genres.map((genre) => (
                    <span key={genre} className="rounded-full border border-rose/30 bg-vellum px-3 py-1 text-sm text-cocoa">
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">None</span>
                )}
              </div>
            </DetailRow>

            <DetailRow label="Finished">{formatFinished(entry.finished)}</DetailRow>

            <DetailRow label="Aster">
              <AsterRating value={entry.aster} />
            </DetailRow>

            {readonlyMode ? (
              <section className="rounded-[0.8rem] border border-champagne/45 bg-vellum/70 p-4">
                <h3 className="field-label mb-2">Private Notes</h3>
                {unlockedNote !== undefined ? (
                  <p className="whitespace-pre-wrap text-sm leading-7 text-ink">{unlockedNote || "No notes kept."}</p>
                ) : !entry.privateNotes ? (
                  <p className="text-sm text-muted">No notes kept.</p>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">This memory is tucked away.</p>
                    <button className="primary-button min-h-10 px-5" type="button" onClick={onUnlock}>
                      Unlock
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <DetailRow label="Notes">
                <p className="whitespace-pre-wrap text-sm leading-7 text-ink">{entry.notes || "No notes kept."}</p>
              </DetailRow>
            )}
          </section>
        </div>

        {!readonlyMode && (
          <div className="mt-auto flex gap-3 border-t border-rose/20 p-4 sm:p-6">
            <button className="soft-button min-h-11 flex-1" type="button" onClick={onEdit}>
              Edit
            </button>
            <button
              className="min-h-11 flex-1 rounded-full border border-deepRose/35 bg-transparent px-5 font-semibold text-deepRose transition hover:bg-deepRose hover:text-vellum"
              type="button"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="field-label">{label}</p>
      <div className="text-sm font-medium text-ink">{children}</div>
    </div>
  );
}
