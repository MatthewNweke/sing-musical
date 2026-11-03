import { useState } from 'react';
import { Check, Zap, Crown, Music2 } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import type { Plan, PlanId } from '@/lib/types';

const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Get started, no card needed.',
        highlighted: false,
        features: [
            'Record up to 3 takes/month',
            'Upload 1 song',
            '5 genre suggestions',
            'Basic mixer (2 tracks)',
            'Public library access',
        ],
    },
    {
        id: 'creator',
        name: 'Creator',
        price: '$9',
        period: 'per month',
        description: 'For singers ready to create more.',
        highlighted: true,
        features: [
            'Unlimited recording',
            'Upload unlimited songs',
            'Unlimited genre suggestions',
            'Full mixer (8 tracks)',
            'Live Mode — both paths',
            'Instrument editor',
            'Export MP3 / WAV',
            'Remove ads',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$24',
        period: 'per month',
        description: 'For professional vocalists and producers.',
        highlighted: false,
        features: [
            'Everything in Creator',
            'AI harmony generation',
            'Multi-track export (stems)',
            'Priority support',
            'Early access to new features',
            'Custom instrument packs',
            'Collaboration (share sessions)',
        ],
    },
];

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
    free: <Music2 size={20} />,
    creator: <Zap size={20} />,
    pro: <Crown size={20} />,
};

const PLAN_COLORS: Record<PlanId, string> = {
    free: 'text-white/50',
    creator: 'text-mint-400',
    pro: 'text-gold-400',
};

export function SubscriptionScreen() {
    const [selected, setSelected] = useState<PlanId>('creator');
    // In a real app this comes from the user's profile / Stripe subscription status
    const currentPlan = 'free' as PlanId;

    const handleSubscribe = (planId: PlanId) => {
        if (planId === 'free') return;
        alert(`Payment integration coming soon! You selected: ${planId}`);
    };

    const isCurrentPlan = selected === currentPlan;
    const canSubscribe = selected !== 'free' && !isCurrentPlan;

    return (
        <div className="mx-auto w-full max-w-4xl px-6 py-4 md:px-10">
            <TopBar title="Choose a plan" showBack />
            <p className="mb-8 text-center text-[14px] text-white/50">
                Unlock the full Sing Musically experience.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
                {PLANS.map((plan) => (
                    <button
                        key={plan.id}
                        onClick={() => setSelected(plan.id)}
                        className={`focus-ring relative w-full rounded-card border p-5 text-left transition active:scale-[0.98] ${selected === plan.id
                                ? plan.highlighted
                                    ? 'border-mint-400 bg-mint-500/10'
                                    : 'border-white/30 bg-white/[0.05]'
                                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                            }`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="rounded-pill bg-mint-500 px-3 py-0.5 text-[11px] font-bold text-ink-950">
                                    Most popular
                                </span>
                            </div>
                        )}

                        <div className={`mb-3 flex items-center gap-2 ${PLAN_COLORS[plan.id]}`}>
                            {PLAN_ICONS[plan.id]}
                            <span className="text-[15px] font-bold">{plan.name}</span>
                            {plan.id === currentPlan && (
                                <span className="ml-auto rounded-pill bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                                    Current
                                </span>
                            )}
                        </div>

                        <div className="mb-1">
                            <span className="text-[28px] font-extrabold text-white">{plan.price}</span>
                            <span className="ml-1 text-[12px] text-white/40">/{plan.period}</span>
                        </div>
                        <p className="mb-4 text-[12px] text-white/50">{plan.description}</p>

                        <ul className="space-y-2">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-[12px] text-white/70">
                                    <Check size={13} className="mt-0.5 shrink-0 text-mint-400" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {canSubscribe ? (
                    <button
                        onClick={() => handleSubscribe(selected)}
                        className="focus-ring w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98]"
                    >
                        Get {PLANS.find((p) => p.id === selected)?.name} →
                    </button>
                ) : isCurrentPlan ? (
                    <p className="text-center text-[13px] text-white/40">You&apos;re already on this plan.</p>
                ) : null}
                <p className="mt-3 text-center text-[11px] text-white/25">
                    Cancel anytime. No hidden fees.
                </p>
            </div>
        </div>
    );
}
