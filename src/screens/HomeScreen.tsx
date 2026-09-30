import { useNavigate } from 'react-router-dom';
import { Mic, Layers, Upload, Radio } from 'lucide-react';
import { Pill } from '@/components/ui/Pill';
import { ActionCard } from '@/components/ui/ActionCard';
import { Waveform } from '@/components/ui/Waveform';
import { fakeWaveform } from '@/data/mockData';

const heroWaveform = fakeWaveform(48, 9);

export function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <div className="mb-4">
            <Pill tone="gold">Your ideas, in full color</Pill>
          </div>

          <h1 className="mb-4 text-[36px] font-extrabold leading-[1.08] md:text-[48px]">
            <span className="block text-white">Bring your voice.</span>
            <span className="block text-gold-400">We'll bring the band.</span>
          </h1>
          <p className="mb-8 max-w-md text-[16px] text-white/50">
            Sing a line, shape the sound, and make it yours — right from your browser.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/record')}
              className="focus-ring rounded-card bg-mint-500 px-6 py-3.5 text-[15px] font-semibold text-ink-950 transition hover:bg-mint-400 active:scale-[0.98]"
            >
              Start recording
            </button>
            <button
              onClick={() => navigate('/library')}
              className="focus-ring rounded-card border border-white/[0.1] px-6 py-3.5 text-[15px] font-semibold text-white/80 transition hover:bg-white/[0.05]"
            >
              View your library
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-card border border-white/[0.05] bg-white/[0.02] py-14">
          <div className="relative flex h-24 w-full max-w-sm items-center justify-center">
            <Waveform samples={heroWaveform} colorClassName="bg-gradient-to-t from-mint-500 to-gold-400" heightClassName="h-24" barWidth={4} gap={4} />
            <span className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-mint-400 shadow-glow">
              <Mic size={20} />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard icon={Mic} title="Sing & add" subtitle="Start with your voice" tone="filled" onClick={() => navigate('/record')} />
        <ActionCard icon={Layers} title="Mix vocals" subtitle="Blend your harmonies" onClick={() => navigate('/library')} />
        <ActionCard icon={Upload} title="Upload a song" subtitle="Reimagine any track" onClick={() => navigate('/upload')} />
        <ActionCard icon={Radio} title="Go live" subtitle="Your band, on stage" onClick={() => navigate('/live')} />
      </div>
    </div>
  );
}
