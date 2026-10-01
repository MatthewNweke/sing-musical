import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSessionStore } from '@/state/sessionStore';

type Status = 'verifying' | 'success' | 'error';

export function AuthConfirmScreen() {
    const navigate = useNavigate();
    const hydrate = useSessionStore((s) => s.hydrate);
    const [status, setStatus] = useState<Status>('verifying');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const run = async () => {
            // Supabase puts the tokens in the URL hash: #access_token=...&type=signup
            // getSession() picks these up automatically from the hash.
            const { data, error } = await supabase.auth.getSession();

            if (error || !data.session) {
                // Hash tokens weren't present — try exchangeCodeForSession for PKCE flow
                const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
                const tokenHash = hashParams.get('token_hash') ?? new URLSearchParams(window.location.search).get('token_hash');
                const type = (hashParams.get('type') ?? new URLSearchParams(window.location.search).get('type')) as 'signup' | 'recovery' | null;

                if (tokenHash && type) {
                    const { error: verifyErr } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
                    if (verifyErr) {
                        setErrorMsg(verifyErr.message);
                        setStatus('error');
                        return;
                    }
                } else {
                    setErrorMsg('Invalid or expired confirmation link. Please sign up again or request a new link.');
                    setStatus('error');
                    return;
                }
            }

            // Refresh the session store so RequireAuth lets the user through
            await hydrate();
            setStatus('success');
            setTimeout(() => navigate('/'), 1800);
        };

        void run();
    }, [hydrate, navigate]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 px-6">
            <div className="w-full max-w-sm text-center">
                <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-500 to-gold-400 shadow-glow">
                    <Mic size={26} className="text-ink-950" />
                </span>

                {status === 'verifying' && (
                    <>
                        <Loader2 size={28} className="mx-auto mb-4 animate-spin text-mint-400" />
                        <h1 className="text-[20px] font-bold text-white">Confirming your email…</h1>
                        <p className="mt-2 text-[13px] text-white/45">Just a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={28} className="mx-auto mb-4 text-mint-400" />
                        <h1 className="text-[20px] font-bold text-white">Email confirmed!</h1>
                        <p className="mt-2 text-[13px] text-white/45">Taking you in…</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={28} className="mx-auto mb-4 text-red-400" />
                        <h1 className="text-[20px] font-bold text-white">Confirmation failed</h1>
                        <p className="mt-2 mb-6 text-[13px] text-white/50">{errorMsg}</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="focus-ring w-full rounded-card bg-mint-500 py-3 text-[14px] font-semibold text-ink-950 transition active:scale-[0.98]"
                        >
                            Back to sign up
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
