import React, { useEffect, useState } from 'react';
import { parseVideoUrl } from '../utils/videoUtils';
import { soundManager } from '../utils/audio';

interface VideoPlayerModalProps {
  isOpen: boolean;
  videoUrl?: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onEditVideoUrl?: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  videoUrl,
  title = 'Repetición del Combate',
  subtitle,
  onClose,
  onEditVideoUrl
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const parsed = parseVideoUrl(videoUrl);

  const handleCopyLink = () => {
    soundManager.playClick();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#12131a] border border-slate-200 dark:border-white/10 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold flex-shrink-0">
              <span className="material-symbols-outlined text-xl">{parsed?.icon || 'play_circle'}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-label-caps font-black px-2 py-0.5 rounded-full uppercase bg-[#04A8FC]/15 text-[#04A8FC]">
                  {parsed?.platformName || 'Video Oficial'}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline truncate max-w-xs">
                  {videoUrl}
                </span>
              </div>
              <h3
                id="video-modal-title"
                className="font-headline font-black text-base sm:text-lg uppercase text-slate-900 dark:text-white truncate mt-0.5"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditVideoUrl && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onEditVideoUrl();
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs font-headline font-bold uppercase flex items-center gap-1 active:scale-[0.97]"
                title="Cambiar o editar enlace del video"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-[0.97]"
              aria-label="Cerrar reproductor"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Video Screen Body */}
        <div className="p-3 sm:p-5 bg-black/95 flex-1 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[460px]">
          {parsed?.type === 'youtube' && parsed.embedUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
              <iframe
                src={parsed.embedUrl}
                title={title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          {parsed?.type === 'drive' && parsed.embedUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
              <iframe
                src={parsed.embedUrl}
                title={title}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          )}

          {parsed?.type === 'direct' && parsed.embedUrl && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src={parsed.embedUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Tu navegador no soporta el tag de video.
              </video>
            </div>
          )}

          {parsed?.type === 'external' && (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 text-center space-y-4 max-w-md mx-auto my-auto bg-[#1a1b26]/90 text-white">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg">
                <span className="material-symbols-outlined text-4xl">{parsed.icon}</span>
              </div>
              <div>
                <h4 className="font-headline font-black text-xl uppercase tracking-wide">
                  Video en {parsed.platformName}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                  Este combate fue subido a {parsed.platformName}. Puedes abrirlo directamente para verlo en alta definición o con la app nativa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={parsed.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundManager.playClick()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-headline font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-[0.97]"
                >
                  <span>Abrir en {parsed.platformName}</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#04A8FC] text-slate-700 dark:text-slate-300 text-xs font-headline font-bold uppercase flex items-center gap-1.5 transition-all active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
            </button>

            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundManager.playClick()}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#04A8FC] text-slate-700 dark:text-slate-300 text-xs font-headline font-bold uppercase flex items-center gap-1.5 transition-all active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Abrir Fuera</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-headline font-bold uppercase transition-all active:scale-[0.97]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
