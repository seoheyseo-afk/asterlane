import { formatAster } from "../utils/format";

interface AsterRatingProps {
  value: number | null | undefined;
  compact?: boolean;
}

export function AsterRating({ value, compact = false }: AsterRatingProps) {
  if (value === null || value === undefined) {
    return compact ? (
      <span className="text-[0.72rem] font-medium text-muted">No Aster</span>
    ) : (
      <span className="text-sm text-muted">No Aster chosen</span>
    );
  }

  if (compact) {
    return <span className="text-[0.75rem] font-semibold text-deepRose">{formatAster(value)} ✦</span>;
  }

  return (
    <div className="flex items-center gap-3" aria-label={`Aster ${formatAster(value)} out of 5`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, value - index));
          return <AsterPetal key={index} fill={fill} />;
        })}
      </div>
      <span className="text-sm font-semibold text-deepRose">{formatAster(value)} Aster</span>
    </div>
  );
}

function AsterPetal({ fill }: { fill: number }) {
  const width = `${Math.round(fill * 100)}%`;

  return (
    <span className="relative inline-grid h-6 w-6 place-items-center overflow-hidden text-xl leading-none">
      <span className="text-blush">✤</span>
      <span className="absolute inset-0 overflow-hidden" style={{ width }}>
        <span className="inline-grid h-6 w-6 place-items-center text-champagne">✤</span>
      </span>
    </span>
  );
}
