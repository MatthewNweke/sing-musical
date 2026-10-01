import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mic, MailCheck } from 'lucide-react';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';

type Stage = 'form' | 'confirm';

export function SignupScreen() {
  const navigate = useNavigate();
  const signUp = useSessionStore((s) => s.signUp);
  const [stage, setStage] = useState<Stage>('form');
  const [confirmedEmail, setConfirmedEmail] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signUp(email, password, displayName);
      // signUp returns without setting user when confirmation is required.
      // Check session store — if user is set, go straight to app.
      const { user } = useSessionStore.getState();
      if (user) {
        navigate('/');
      } else {
        setConfirmedEmail(email);
        setStage('confirm');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await dataService.resendConfirmation(confirmedEmail);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      // silently ignore — Supabase rate-limits resends
    } finally {
      setIsResending(false);
    }
  };

  // ── Confirmation waiting screen ───────────────────────────────────────────
  if (stage === 'confirm') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 px-6">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-400">
            <MailCheck size={32} />
          </span>

          <h1 className="mb-2 text-[22px] font-extrabold text-white">Check your email</h1>
          <p className="mb-1 text-[14px] text-white/60">
            We sent a confirmation link to
          </p>
          <p className="mb-6 text-[15px] font-semibold text-white">{confirmedEmail}</p>

          <p className="mb-8 text-[13px] text-white/45">
            Click the link in that email to activate your account. Once confirmed you'll be signed in automatically.
          </p>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 text-left text-[12px] text-white/40 space-y-1">
            <p>• Check your spam/junk folder if you don't see it.</p>
            <p>• The link expires after 24 hours.</p>
          </div>

          <button
            onClick={handleResend}
            disabled={isResending || resent}
            className="focus-ring mt-6 w-full rounded-card border border-white/[0.08] py-3 text-[14px] font-medium text-white/60 transition hover:bg-white/[0.04] disabled:opacity-50"
          >
            {resent ? 'Email sent!' : isResending ? 'Sending…' : 'Resend confirmation email'}
          </button>

          <p className="mt-6 text-[13px] text-white/40">
            Wrong email?{' '}
            <button
              onClick={() => { setStage('form'); setError(null); }}
              className="font-semibold text-mint-400 hover:text-mint-300"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Signup form ───────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-500 to-gold-400 shadow-glow">
            <Mic size={26} className="text-ink-950" />
          </span>
          <div className="text-center">
            <h1 className="text-[22px] font-extrabold text-white">Sing Musically</h1>
            <p className="text-[13px] text-white/40">Find your sound</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">Name</label>
            <input
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/25"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/25"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-11 text-[15px] text-white outline-none placeholder:text-white/25"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="focus-ring w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-mint-400 hover:text-mint-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
