import { useState } from 'react';
import { Mic, Copy, CheckCheck } from 'lucide-react';

export function SetupScreen() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(
            'VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key'
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 px-6 py-12">
            <div className="w-full max-w-lg">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-500 to-gold-400">
                        <Mic size={26} className="text-ink-950" />
                    </span>
                    <h1 className="text-[22px] font-extrabold text-white">Almost ready</h1>
                    <p className="text-[14px] text-white/50">
                        Sing Musically needs a Supabase project for auth, the database, and audio storage.
                    </p>
                </div>

                <ol className="space-y-6">
                    <Step n={1} title="Create a free Supabase project">
                        <p className="text-[13px] text-white/60">
                            Go to{' '}
                            <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-mint-400 underline hover:text-mint-300">
                                supabase.com
                            </a>{' '}
                            → New project. Free tier is fine.
                        </p>
                    </Step>

                    <Step n={2} title="Run the database schema">
                        <p className="text-[13px] text-white/60">
                            In your project's SQL Editor, paste the full contents of{' '}
                            <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[12px] text-gold-300">supabase/schema.sql</code>{' '}
                            and click Run.
                        </p>
                    </Step>

                    <Step n={3} title="Create the audio storage bucket">
                        <p className="text-[13px] text-white/60">
                            Storage → New bucket → name it{' '}
                            <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[12px] text-gold-300">audio</code>,
                            set it to <strong className="text-white/80">private</strong>.
                        </p>
                    </Step>

                    <Step n={4} title="Add your credentials to .env.local">
                        <p className="mb-2 text-[13px] text-white/60">
                            Find these in your project under Settings → API:
                        </p>
                        <div className="relative">
                            <pre className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-[12px] leading-loose text-white/70">
                                {'VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key'}
                            </pre>
                            <button
                                onClick={handleCopy}
                                className="absolute right-2 top-2 flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-ink-800 px-2.5 py-1.5 text-[11px] text-white/60 transition hover:text-white/90"
                            >
                                {copied ? <CheckCheck size={12} className="text-mint-400" /> : <Copy size={12} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </Step>

                    <Step n={5} title="Restart the dev server">
                        <p className="text-[13px] text-white/60">
                            Stop and run{' '}
                            <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[12px] text-gold-300">npm run dev</code>{' '}
                            again. This screen will disappear once credentials are detected.
                        </p>
                    </Step>
                </ol>
            </div>
        </div>
    );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
    return (
        <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint-500/20 text-[12px] font-bold text-mint-400">
                {n}
            </span>
            <div>
                <p className="mb-1 text-[14px] font-semibold text-white">{title}</p>
                {children}
            </div>
        </li>
    );
}
