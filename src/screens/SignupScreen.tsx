import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mic } from 'lucide-react';
import { useSessionStore } from '@/state/sessionStore';

export function SignupScreen() {
  const navigate = useNavigate();
  const signUp = useSessionStore((s) => s.signUp);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
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
