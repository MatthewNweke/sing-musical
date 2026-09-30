interface MixerSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  accentColor: string; // hex, applied via native accent-color for the thumb/track
  onChange: (value: number) => void;
}

export function MixerSlider({ label, value, min, max, accentColor, onChange }: MixerSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-[10px] font-medium uppercase text-white/35">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer rounded-pill"
        style={{ accentColor }}
        aria-label={label}
      />
    </div>
  );
}
