import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function TopBar({ title, showBack = false, onBack, right }: TopBarProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header className="flex items-center justify-between px-0 py-6">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            aria-label="Go back"
            onClick={handleBack}
            className="focus-ring -ml-2 flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/[0.06]"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="text-[20px] font-semibold text-white/90">{title}</h1>
      </div>
      {right}
    </header>
  );
}
