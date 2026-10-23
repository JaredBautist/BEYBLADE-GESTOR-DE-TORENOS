import React, { useState, useEffect } from 'react';
import { parseVideoUrl } from '../utils/videoUtils';
import { soundManager } from '../utils/audio';

interface AttachVideoModalProps {
  isOpen: boolean;
  initialUrl?: string;
  matchTitle?: string;
  onSave: (url: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export const AttachVideoModal: React.FC<AttachVideoModalProps> = ({
  isOpen,
  initialUrl = '',
  matchTitle = 'Vincular Video de la Batalla',
  onSave,
  onDelete,
  onClose
}) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl || '');
  }, [initialUrl, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const parsed = parseVideoUrl(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    onSave(url.trim());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="attach-video-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#14151e] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold flex-shrink-0">
              <span className="material-symbols-outlined text-xl">video_camera_front</span>
            </div>
            <div>
              <h3
                id="attach-video-title"
                className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white"
              >
                Video del Combate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {matchTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Enlace del Video (YouTube, TikTok, Drive, Instagram o MP4)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                link
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... o drive.google.com/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-none focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Platform Detection Preview Badge */}
          {url.trim() && (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#04A8FC]">
                  {parsed?.icon || 'check_circle'}
                </span>
                <span className="font-headline font-bold text-slate-700 dark:text-slate-200">
                  {parsed?.platformName ? `Detectado: ${parsed.platformName}` : 'Enlace válido'}
                </span>
              </div>
              {parsed?.embedUrl && (
                <span className="text-[10px] font-label-caps px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold uppercase">
                  Reproducible Integrado
                </span>
              )}
            </div>
          )}

          {/* Hint */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">💡 Plataformas compatibles:</p>
            <p>• YouTube (Videos normales, Shorts y enlaces youtu.be)</p>
            <p>• Google Drive (Enlaces públicos con vista previa)</p>
            <p>• TikTok / Instagram Reels (Enlaces directos a la publicación)</p>
            <p>• Archivos directos en la nube (.mp4 / .webm)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {initialUrl && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onDelete();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-red-500 hover:bg-red-500/10 text-xs font-headline font-bold uppercase transition-all flex items-center gap-1 active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Quitar Video</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-headline font-bold uppercase transition-all active:scale-[0.97]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#04A8FC] hover:bg-[#008fe0] text-white text-xs font-headline font-black uppercase shadow-md shadow-[#04A8FC]/20 transition-all flex items-center gap-1.5 active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Guardar Video</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
