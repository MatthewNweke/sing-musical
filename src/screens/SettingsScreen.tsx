import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/ui/TopBar';
import { Card } from '@/components/ui/Card';
import { useSessionStore } from '@/state/sessionStore';
import { useToast } from '@/components/ui/toastContext';

export function SettingsScreen() {
    const navigate = useNavigate();
    const { user, signOut, updateProfile } = useSessionStore();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [bio, setBio] = useState(user?.bio ?? '');
    const [isSaving, setIsSaving] = useState(false);

    if (!user) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({ displayName: displayName.trim() || user.displayName, bio });
            toast('Profile updated!', 'success');
        } catch {
            toast('Could not save changes.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
            <TopBar title="Settings" showBack />

            <form onSubmit={handleSave} className="space-y-4 mb-6">
                <Card className="p-5 space-y-4">
                    <h2 className="text-[14px] font-semibold text-white/60 uppercase tracking-wide">Profile</h2>

                    <div>
                        <label className="mb-1.5 block text-[12px] font-medium text-white/50">Display name</label>
                        <input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="focus-ring w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[14px] text-white outline-none placeholder:text-white/25"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[12px] font-medium text-white/50">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="focus-ring w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[14px] text-white outline-none placeholder:text-white/25"
                            placeholder="Tell people about yourself…"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[12px] font-medium text-white/50">Handle</label>
                        <input
                            value={user.handle}
                            readOnly
                            className="w-full rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-2.5 text-[14px] text-white/40 outline-none cursor-default"
                        />
                    </div>
                </Card>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="focus-ring w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
                >
                    {isSaving ? 'Saving…' : 'Save changes'}
                </button>
            </form>

            <Card className="p-5 space-y-1">
                <h2 className="text-[14px] font-semibold text-white/60 uppercase tracking-wide mb-3">Account</h2>
                <button
                    onClick={handleSignOut}
                    className="focus-ring flex w-full items-center justify-between rounded-xl px-0 py-2 text-[14px] text-red-400 transition hover:text-red-300"
                >
                    Sign out
                    <span className="text-white/30">→</span>
                </button>
            </Card>
        </div>
    );
}
