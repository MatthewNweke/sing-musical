interface LevelMeterProps {
  level: number; // 0-1
}

export function LevelMeter({ level }: LevelMeterProps) {
  const pct = Math.round(level * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">Input</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-white/[0.08]">
        <div
          className="h-full rounded-pill bg-mint-400 transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-[10px] tabular-nums text-white/40">
        {String(pct).padStart(4, '0')}
      </span>
    </div>
  );
}
