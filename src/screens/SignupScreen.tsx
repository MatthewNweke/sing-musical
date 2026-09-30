import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';

export function SignupScreen() {
  const navigate = useNavigate();
  const signUp = useSessionStore((s) => s.signUp);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signUp(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6">
      <h1 className="mb-1 text-[26px] font-extrabold">Find your sound</h1>
      <p className="mb-8 text-[14px] text-white/45">Create an account to start recording.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-white/50">Name</label>
          <input
            required
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/25"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-white/50">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/25"
            placeholder="At least 8 characters"
          />
        </div>

        {error && <p className="text-[13px] text-red-400">{error}</p>}

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
        <Link to="/login" className="font-semibold text-mint-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
