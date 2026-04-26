import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Entry, EntryType } from "../types";
import { ENTRY_TYPES, makeId, todayInputValue } from "../utils/format";
import { AsterRating } from "./AsterRating";
import { CoverArt } from "./CoverArt";
import { GenrePicker } from "./GenrePicker";

interface EntryFormProps {
  entry?: Entry | null;
  cloudMode?: boolean;
  onKeep: (entry: Entry, privateNotePasscode?: string) => void | Promise<void>;
  onClose: () => void;
}

const ASTER_VALUES = Array.from({ length: 10 }, (_, index) => (index + 1) / 2);

export function EntryForm({ entry, cloudMode = false, onKeep, onClose }: EntryFormProps) {
  const [coverUrl, setCoverUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EntryType>("Film");
  const [genres, setGenres] = useState<string[]>([]);
  const [finished, setFinished] = useState("");
  const [aster, setAster] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [privateNotePasscode, setPrivateNotePasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  useEffect(() => {
    setCoverUrl(entry?.coverUrl ?? "");
    setTitle(entry?.title ?? "");
    setType(entry?.type ?? "Film");
    setGenres(entry?.genres ?? []);
    setFinished(entry?.finished ?? todayInputValue());
    setAster(entry?.aster ?? null);
    setNotes(entry?.notes ?? "");
    setPrivateNotePasscode("");
    setPasscodeError("");
  }, [entry]);

  const canKeep = useMemo(() => title.trim().length > 0, [title]);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canKeep) return;
    const trimmedNotes = notes.trim();
    const trimmedPasscode = privateNotePasscode.trim();

    if (cloudMode && trimmedNotes && !trimmedPasscode) {
      setPasscodeError("Enter a passcode to keep Private Notes.");
      return;
    }

    onKeep({
      id: entry?.id ?? makeId(),
      coverUrl: coverUrl.trim(),
      title: title.trim(),
      type,
      genres,
      finished,
      aster,
      notes: trimmedNotes,
      createdAt: entry?.createdAt ?? new Date().toISOString(),
    }, trimmedPasscode || undefined);
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink/35 px-3 py-4 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[1rem] border border-rose/25 bg-cream shadow-bloom">
        <div className="flex items-center justify-between border-b border-rose/20 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase text-deepRose">Asterlane</p>
            <h2 className="font-display text-3xl text-ink">Add to Asterlane</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="overflow-y-auto p-4 sm:p-6" onSubmit={submitForm}>
          <div className="grid gap-6 lg:grid-cols-[minmax(220px,320px)_1fr]">
            <section className="space-y-3">
              <label className="field-label">Cover Preview</label>
              <CoverArt coverUrl={coverUrl} title={title} className="mx-auto w-full max-w-[250px] lg:max-w-none" />
              <div className="rounded-[0.7rem] border border-champagne/45 bg-vellum/60 p-4">
                <p className="field-label mb-2">Aster</p>
                <AsterRating value={aster} />
              </div>
            </section>

            <section className="space-y-5">
              <label className="field-block">
                <span className="field-label">Cover image URL</span>
                <input
                  className="field-input"
                  type="url"
                  value={coverUrl}
                  onChange={(event) => setCoverUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="field-block">
                <span className="field-label">Title</span>
                <input
                  className="field-input"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              <div className="field-block">
                <span className="field-label">Type</span>
                <div className="grid grid-cols-3 gap-2">
                  {ENTRY_TYPES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setType(item)}
                      className={`min-h-11 rounded-full border text-sm font-semibold transition ${
                        type === item
                          ? "border-deepRose bg-deepRose text-vellum"
                          : "border-rose/35 bg-vellum text-cocoa hover:border-deepRose/60"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-block">
                <span className="field-label">Genre</span>
                <GenrePicker selected={genres} onChange={setGenres} />
              </div>

              <label className="field-block">
                <span className="field-label">Finished</span>
                <input
                  className="field-input"
                  type="date"
                  value={finished}
                  onChange={(event) => setFinished(event.target.value)}
                />
              </label>

              <label className="field-block">
                <span className="field-label">Aster</span>
                <select
                  className="field-input"
                  value={aster ?? ""}
                  onChange={(event) => setAster(event.target.value ? Number(event.target.value) : null)}
                >
                  <option value="">No Aster</option>
                  {ASTER_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {value.toFixed(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-block">
                <span className="field-label">Notes</span>
                <textarea
                  className="field-input min-h-[132px] resize-y"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={1200}
                />
              </label>

              {cloudMode && (
                <label className="field-block">
                  <span className="field-label">Private Notes Passcode</span>
                  <input
                    className="field-input"
                    type="password"
                    value={privateNotePasscode}
                    onChange={(event) => {
                      setPrivateNotePasscode(event.target.value);
                      setPasscodeError("");
                    }}
                    placeholder="Required when Notes are filled"
                  />
                  <span className="text-xs leading-5 text-muted">
                    This passcode is not saved. Share it separately with people who should unlock Notes.
                  </span>
                  {passcodeError && <span className="text-sm font-semibold text-deepRose">{passcodeError}</span>}
                </label>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button className="soft-button min-h-11 px-5" type="button" onClick={onClose}>
                  Cancel
                </button>
                <button className="primary-button min-h-11 px-7" type="submit" disabled={!canKeep}>
                  Keep
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
