import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function TopBar({ title, showBack = false, right }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-10">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
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
