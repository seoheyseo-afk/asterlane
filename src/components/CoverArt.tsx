import { useEffect, useState } from "react";

interface CoverArtProps {
  coverUrl: string;
  title: string;
  previewLabel?: string;
  className?: string;
}

export function CoverArt({ coverUrl, title, previewLabel = "Cover Preview", className = "" }: CoverArtProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [coverUrl]);

  const hasImage = coverUrl.trim().length > 0 && !failed;
  const label = title.trim() || previewLabel;

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-[0.6rem] border border-rose/35 bg-vellum shadow-cover ${className}`}
    >
      {hasImage ? (
        <img
          src={coverUrl}
          alt={`${label} cover`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <DefaultCover label={label} />
      )}
    </div>
  );
}

function DefaultCover({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-between bg-[radial-gradient(circle_at_top,#fffaf2_0%,#F7F0E6_42%,#E8D0D2_100%)] p-3 text-center">
      <div className="flex w-full justify-between text-champagne">
        <span>✦</span>
        <span>✧</span>
      </div>
      <div className="grid place-items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-champagne/70 bg-cream/80 text-deepRose">
          ✤
        </div>
        <p className="line-clamp-4 px-1 font-display text-xl leading-tight text-ink">{label}</p>
      </div>
      <div className="h-px w-12 bg-champagne/80" />
    </div>
  );
}
