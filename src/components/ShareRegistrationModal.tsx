import React, { useState } from 'react';
import { TournamentConfig, Blader } from '../types';
import { soundManager } from '../utils/audio';

interface ShareRegistrationModalProps {
  isOpen: boolean;
  config: TournamentConfig;
  bladers: Blader[];
  onClose: () => void;
  onToggleRegistrationOpen?: (isOpen: boolean) => void;
  onNavigateToRegistrationPreview?: () => void;
}

export const ShareRegistrationModal: React.FC<ShareRegistrationModalProps> = ({
  isOpen,
  config,
  bladers,
  onClose,
  onToggleRegistrationOpen,
  onNavigateToRegistrationPreview
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Construct registration URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const registrationUrl = `${origin}${pathname}?mode=registro`;

  const isRegistrationOpen = config.isRegistrationOpen !== false && !config.isStarted;
  const isFull = bladers.length >= config.maxParticipants;
  const progressPct = Math.min(100, Math.round((bladers.length / (config.maxParticipants || 1)) * 100));

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    registrationUrl
  )}`;

  const handleCopyLink = () => {
    soundManager.playClick();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    soundManager.playClick();
    const message = `⚡ ¡INSCRIPCIONES ABIERTAS - ${config.leagueName.toUpperCase()}! ⚡\n\n🏆 Torneo: ${config.name}\n📍 Sede: ${config.communityCity || 'Cúcuta'}\n⚔️ Formato: ${config.type === 'league' ? 'Liga' : config.type === 'series' ? 'Serie 1v1' : 'Eliminatoria'}\n\n📲 Inscríbete con tu nombre y Beyblade X aquí:\n${registrationUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-registration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#14151e] border-2 border-[#04A8FC]/40 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
      >
        {/* Glow decorative background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[#04A8FC]/10 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#04A8FC]/15 text-[#04A8FC] flex items-center justify-center font-black flex-shrink-0 shadow-md">
              <span className="material-symbols-outlined text-2xl">qr_code_2</span>
            </div>
            <div>
              <span className="text-[10px] font-label-caps font-black uppercase text-[#04A8FC] tracking-widest block">
                Auto-Inscripción de Participantes
              </span>
              <h3
                id="share-registration-title"
                className="font-headline font-black text-xl sm:text-2xl uppercase text-slate-900 dark:text-white leading-tight"
              >
                Link & Código QR
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Status & Capacity Tracker */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRegistrationOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              ></span>
              <span className="font-headline font-bold uppercase text-slate-900 dark:text-white">
                {isRegistrationOpen
                  ? isFull
                    ? '⚠️ Cupos Llenos'
                    : 'Inscripciones Activas'
                  : 'Inscripciones Pausadas'}
              </span>
            </div>

            <span className="font-mono text-xs font-black text-slate-600 dark:text-slate-300">
              {bladers.length} / {config.maxParticipants} Bladers
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFull ? 'bg-amber-500' : 'bg-[#04A8FC]'
              }`}
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>

          {onToggleRegistrationOpen && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Permitir que nuevos jugadores se registren:
              </span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onToggleRegistrationOpen(!isRegistrationOpen);
                }}
                className={`px-3 py-1 rounded-xl font-headline font-bold text-[10px] uppercase transition-all ${
                  isRegistrationOpen
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                }`}
              >
                {isRegistrationOpen ? 'Abiertas ✓' : 'Pausadas ✕'}
              </button>
            </div>
          )}
        </div>

        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-100 dark:bg-[#101118] border border-slate-200 dark:border-white/10 text-center space-y-3 shadow-inner">
          <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-[#04A8FC]/30">
            <img
              src={qrImageUrl}
              alt="Código QR para auto-inscripción de Bladers"
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
              loading="lazy"
            />
          </div>
          <div>
            <p className="font-headline font-black text-xs sm:text-sm uppercase text-slate-900 dark:text-white">
              Escanea para Inscribirte al Torneo
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Los jugadores pueden escanear esto con la cámara de su teléfono
            </p>
          </div>
        </div>

        {/* Direct Link Input & Copy */}
        <div className="space-y-2">
          <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Enlace Directo de Auto-Inscripción
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={registrationUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 text-xs font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-[#04A8FC] hover:bg-[#008fe0] text-white text-xs font-headline font-black uppercase flex items-center gap-1.5 shadow-md shadow-[#04A8FC]/20 transition-all active:scale-[0.97] flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-headline font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-base">send</span>
            <span>Compartir por WhatsApp</span>
          </button>

          {onNavigateToRegistrationPreview && (
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onNavigateToRegistrationPreview();
              }}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#04A8FC] text-slate-700 dark:text-slate-200 text-xs font-headline font-bold uppercase flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-base text-[#04A8FC]">open_in_new</span>
              <span>Abrir Vista Blader</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
