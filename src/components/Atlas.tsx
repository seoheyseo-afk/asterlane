import type { Entry, SortMode, TypeFilter } from "../types";
import { AsterRating } from "./AsterRating";
import { CoverArt } from "./CoverArt";

interface AtlasProps {
  entries: Entry[];
  find: string;
  typeFilter: TypeFilter;
  sort: SortMode;
  readonlyMode: boolean;
  cloudMode: boolean;
  loadError: string;
  shareStatus: string;
  onFindChange: (value: string) => void;
  onTypeChange: (value: TypeFilter) => void;
  onSortChange: (value: SortMode) => void;
  onOpenEntry: (entry: Entry) => void;
  onAdd: () => void;
  onExport: () => void;
  onShare: () => void;
}

export function Atlas({
  entries,
  find,
  typeFilter,
  sort,
  readonlyMode,
  cloudMode,
  loadError,
  shareStatus,
  onFindChange,
  onTypeChange,
  onSortChange,
  onOpenEntry,
  onAdd,
  onExport,
  onShare,
}: AtlasProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-col gap-5 border-b border-rose/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none text-deepRose sm:text-6xl">Asterlane</h1>
          <p className="mt-2 font-display text-4xl leading-none text-ink">Atlas</p>
        </div>
        {!readonlyMode && (
          <div className="flex flex-wrap gap-2">
            {cloudMode ? (
              <button className="soft-button min-h-11 px-4" type="button" onClick={onShare}>
                Copy Share Link
              </button>
            ) : (
              <button className="soft-button min-h-11 px-4" type="button" onClick={onExport}>
                Export Read-only Data
              </button>
            )}
            <button className="primary-button min-h-11 px-5" type="button" onClick={onAdd}>
              Add to Asterlane
            </button>
          </div>
        )}
      </header>

      <section className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="field-block">
          <span className="field-label">Find</span>
          <input
            className="field-input"
            type="search"
            value={find}
            onChange={(event) => onFindChange(event.target.value)}
            placeholder="Find a story..."
          />
        </label>
        <label className="field-block">
          <span className="field-label">Type</span>
          <select
            className="field-input min-w-[150px]"
            value={typeFilter}
            onChange={(event) => onTypeChange(event.target.value as TypeFilter)}
          >
            <option>All</option>
            <option>Film</option>
            <option>Series</option>
            <option>Book</option>
          </select>
        </label>
        <label className="field-block">
          <span className="field-label">Sort</span>
          <select
            className="field-input min-w-[150px]"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
          >
            <option>Latest</option>
            <option>Oldest</option>
            <option>Highest</option>
          </select>
        </label>
      </section>

      {loadError && (
        <p className="mb-4 rounded-[0.7rem] border border-rose/35 bg-vellum px-4 py-3 text-sm text-deepRose">
          {loadError}
        </p>
      )}
      {shareStatus && (
        <p className="mb-4 rounded-[0.7rem] border border-champagne/50 bg-vellum px-4 py-3 text-sm text-cocoa">
          {shareStatus}
        </p>
      )}

      {entries.length > 0 ? (
        <section className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:gap-x-4 lg:grid-cols-5 xl:grid-cols-6">
          {entries.map((entry) => (
            <button
              key={entry.id}
              className="group min-w-0 text-left"
              type="button"
              onClick={() => onOpenEntry(entry)}
            >
              <CoverArt
                coverUrl={entry.coverUrl}
                title={entry.title}
                className="transition duration-200 group-hover:-translate-y-1 group-hover:shadow-bloom"
              />
              <div className="mt-2 min-w-0 px-0.5">
                <p className="truncate text-sm font-semibold text-ink">{entry.title}</p>
                <AsterRating value={entry.aster} compact />
              </div>
            </button>
          ))}
        </section>
      ) : (
        <section className="grid min-h-[42vh] place-items-center rounded-[1rem] border border-dashed border-rose/35 bg-vellum/50 px-5 text-center">
          <div>
            <p className="font-display text-4xl text-deepRose">A quiet atlas</p>
            <p className="mt-2 text-sm text-muted">Stories you keep will gather here.</p>
          </div>
        </section>
      )}
    </main>
  );
}
