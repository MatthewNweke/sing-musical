import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone?: 'filled' | 'outline';
  onClick: () => void;
}

export function ActionCard({ icon: Icon, title, subtitle, tone = 'outline', onClick }: ActionCardProps) {
  const filled = tone === 'filled';
  return (
    <button
      onClick={onClick}
      className={`focus-ring group flex w-full items-center gap-4 rounded-card border p-4 text-left transition active:scale-[0.98] ${
        filled
          ? 'border-mint-500/30 bg-mint-500/15'
          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          filled ? 'bg-mint-500 text-ink-950' : 'bg-white/[0.06] text-gold-400'
        }`}
      >
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-white">{title}</span>
        <span className="block truncate text-[13px] text-white/45">{subtitle}</span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-white/30 transition group-hover:text-white/60" />
    </button>
  );
}
