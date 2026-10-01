import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mic, MailCheck } from 'lucide-react';
import { useSessionStore } from '@/state/sessionStore';
import { dataService } from '@/services';

export function LoginScreen() {
  const navigate = useNavigate();
  const signIn = useSessionStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resent, setResent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsConfirmation(false);
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not sign in.';
      // Supabase returns this exact message when email hasn't been confirmed
      if (msg.toLowerCase().includes('email not confirmed')) {
        setNeedsConfirmation(true);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await dataService.resendConfirmation(email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      // Supabase silently rate-limits resends
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-500 to-gold-400 shadow-glow">
            <Mic size={26} className="text-ink-950" />
          </span>
          <div className="text-center">
            <h1 className="text-[22px] font-extrabold text-white">Sing Musically</h1>
            <p className="text-[13px] text-white/40">Welcome back</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-11 text-[15px] text-white outline-none placeholder:text-white/25"
                placeholder="••••••••"
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

          {/* Standard error */}
          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
              {error}
            </p>
          )}

          {/* Email not confirmed banner */}
          {needsConfirmation && (
            <div className="rounded-xl border border-gold-400/20 bg-gold-400/10 px-4 py-3 text-[13px]">
              <div className="mb-2 flex items-center gap-2 font-semibold text-gold-300">
                <MailCheck size={14} /> Email not confirmed
              </div>
              <p className="mb-3 text-white/60">
                You need to confirm your email before signing in. Check your inbox for the link we sent.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resent}
                className="text-[12px] font-semibold text-mint-400 hover:text-mint-300 disabled:opacity-50"
              >
                {resent ? 'Sent! Check your inbox.' : isResending ? 'Sending…' : 'Resend confirmation email →'}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="focus-ring w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-white/40">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-mint-400 hover:text-mint-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
