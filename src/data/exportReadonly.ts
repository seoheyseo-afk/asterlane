import type { Entry, ReadonlyExport } from "../types";
import { encryptNote } from "../utils/crypto";

export async function createReadonlyExport(entries: Entry[], passcode: string): Promise<ReadonlyExport> {
  const encryptedEntries = await Promise.all(
    entries.map(async (entry) => {
      const { notes, ...publicEntry } = entry;
      return {
        ...publicEntry,
        privateNotes: await encryptNote(notes ?? "", passcode),
      };
    }),
  );

  return {
    app: "Asterlane",
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: encryptedEntries,
  };
}

export function downloadJson(payload: ReadonlyExport) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "entries.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
