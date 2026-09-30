interface WaveformProps {
  samples: number[];
  colorClassName?: string;
  heightClassName?: string;
  barWidth?: number;
  gap?: number;
}

// Renders a static or live-updating bar waveform from a normalized (0-1)
// sample array. Used for the recording view (live, updates every frame)
// and the mixer view (static, precomputed).
export function Waveform({
  samples,
  colorClassName = 'bg-gold-400',
  heightClassName = 'h-16',
  barWidth = 3,
  gap = 2,
}: WaveformProps) {
  return (
    <div className={`flex w-full items-center justify-between ${heightClassName}`} aria-hidden="true">
      {samples.map((v, i) => (
        <span
          key={i}
          className={`rounded-full ${colorClassName}`}
          style={{
            width: barWidth,
            height: `${Math.max(8, v * 100)}%`,
            marginRight: i === samples.length - 1 ? 0 : gap,
            opacity: 0.55 + v * 0.45,
          }}
        />
      ))}
    </div>
  );
}
