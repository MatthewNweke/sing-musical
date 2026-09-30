import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileAudio } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Card } from '@/components/ui/Card';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';

export function UploadScreen() {
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File | null) => {
    if (f && f.type.startsWith('audio/')) setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setIsUploading(true);
    const song = await dataService.uploadAudioFile(file, file.name.replace(/\.[^/.]+$/, ''), user.id);
    setIsUploading(false);
    navigate(`/mix/${song.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
      <TopBar title="Upload a song" showBack />

      <p className="mb-5 text-[14px] text-white/45">
        Bring in an existing track and reimagine it — remix the vocals, layer new harmonies, or rebalance the mix.
      </p>

      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0] ?? null); }}
        className={`focus-ring mb-4 flex cursor-pointer flex-col items-center gap-3 rounded-card border-2 border-dashed p-10 text-center transition ${
          isDragging ? 'border-mint-400 bg-mint-500/10' : 'border-white/[0.12] bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <UploadCloud className="text-mint-400" size={28} />
        <span className="text-[14px] font-semibold text-white">Drop an audio file, or tap to browse</span>
        <span className="text-[12px] text-white/35">MP3, WAV or M4A up to 50MB</span>
      </label>

      {file && (
        <Card className="mb-4 flex items-center gap-3 p-4">
          <FileAudio className="shrink-0 text-gold-400" size={20} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-white">{file.name}</p>
            <p className="text-[12px] text-white/40">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </Card>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="focus-ring w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-40"
      >
        {isUploading ? 'Analyzing track…' : 'Upload & continue'}
      </button>
    </div>
  );
}
