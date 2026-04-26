import { DEFAULT_GENRES } from "../utils/format";

interface GenrePickerProps {
  selected: string[];
  onChange: (genres: string[]) => void;
}

export function GenrePicker({ selected, onChange }: GenrePickerProps) {
  const options = Array.from(new Set([...DEFAULT_GENRES, ...selected])).filter(Boolean);

  function toggleGenre(genre: string) {
    if (selected.includes(genre)) {
      onChange(selected.filter((item) => item !== genre));
      return;
    }
    onChange([...selected, genre]);
  }

  function addCustomGenre(formData: FormData) {
    const value = String(formData.get("genre") ?? "").trim();
    if (!value) return;
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((genre) => {
          const active = selected.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`min-h-9 rounded-full border px-3 text-sm font-medium transition ${
                active
                  ? "border-deepRose bg-deepRose text-vellum"
                  : "border-rose/35 bg-vellum/70 text-cocoa hover:border-deepRose/60"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          addCustomGenre(new FormData(event.currentTarget));
          event.currentTarget.reset();
        }}
      >
        <input className="field-input min-w-0 flex-1" name="genre" type="text" placeholder="Add a genre" />
        <button className="soft-button px-4" type="submit">
          Add
        </button>
      </form>
    </div>
  );
}
