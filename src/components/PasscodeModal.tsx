import { useState } from "react";

interface PasscodeModalProps {
  busy: boolean;
  error: string;
  onClose: () => void;
  onUnlock: (passcode: string) => void;
}

export function PasscodeModal({ busy, error, onClose, onUnlock }: PasscodeModalProps) {
  const [passcode, setPasscode] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <form
        className="w-full max-w-sm rounded-[1rem] border border-rose/25 bg-cream p-5 shadow-bloom"
        onSubmit={(event) => {
          event.preventDefault();
          onUnlock(passcode);
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-ink">Unlock Notes</h2>
            <p className="mt-1 text-sm text-muted">Enter the passcode for this Atlas.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <label className="field-block">
          <span className="field-label">Passcode</span>
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
            Unlock
          </button>
        </div>
      </form>
    </div>
  );
}
