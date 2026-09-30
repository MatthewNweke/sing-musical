import { useCallback, useRef, useState, type ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastContext, type ToastType } from './toastContext';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle size={16} className="text-mint-400 shrink-0" />,
    error: <XCircle size={16} className="text-red-400 shrink-0" />,
    info: <Info size={16} className="text-gold-400 shrink-0" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const counterRef = useRef(0);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++counterRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    }, []);

    const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 md:bottom-6" aria-live="polite">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="flex min-w-[240px] items-center gap-2.5 rounded-2xl border border-white/[0.1] bg-ink-800/95 px-4 py-3 text-[13px] text-white shadow-xl backdrop-blur-sm"
                    >
                        {icons[t.type]}
                        <span className="flex-1">{t.message}</span>
                        <button onClick={() => dismiss(t.id)} className="ml-1 text-white/40 hover:text-white/80" aria-label="Dismiss">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
