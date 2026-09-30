import type { PropsWithChildren } from 'react';

type PillTone = 'gold' | 'mint' | 'neutral';

const toneClasses: Record<PillTone, string> = {
  gold: 'bg-gold-400 text-ink-950',
  mint: 'bg-mint-500/20 text-mint-300 border border-mint-500/30',
  neutral: 'bg-white/[0.06] text-white/70',
};

export function Pill({ tone = 'neutral', children }: PropsWithChildren<{ tone?: PillTone }>) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
