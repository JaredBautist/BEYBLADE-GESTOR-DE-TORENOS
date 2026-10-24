import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Blader, Match } from '../types';
import { soundManager } from '../utils/audio';
import { BladerAvatar } from './BladerAvatar';

interface WinnerModalProps {
  winner: Blader;
  match: Match;
  isTournamentFinal?: boolean;
  nextMatch?: Match | null;
  onClose: () => void;
  onGoToBracket: () => void;
  onNextMatch?: (match?: Match | null) => void;
  onSaveVideoUrl?: (matchId: string, videoUrl: string) => void;
  autoAdvanceEnabled?: boolean;
  onToggleAutoAdvance?: (enabled?: boolean) => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  match,
  isTournamentFinal = false,
  nextMatch = null,
  onClose,
  onGoToBracket,
  onNextMatch,
  onSaveVideoUrl,
  autoAdvanceEnabled = true,
  onToggleAutoAdvance
}) => {
  const [videoUrlInput, setVideoUrlInput] = useState(match.videoUrl || '');
  const [savedVideoMsg, setSavedVideoMsg] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(Boolean(match.videoUrl));
  const [countdown, setCountdown] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-advance countdown timer
  useEffect(() => {
    if (!autoAdvanceEnabled || isTournamentFinal || !nextMatch || isPaused) return;

    if (countdown <= 0) {
      if (onNextMatch) {
        onNextMatch(nextMatch);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoAdvanceEnabled, isTournamentFinal, nextMatch, isPaused, countdown, onNextMatch]);
  useEffect(() => {
    soundManager.playVictory();

    try {
      confetti({
        particleCount: isTournamentFinal ? 150 : 100,
        spread: isTournamentFinal ? 100 : 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: isTournamentFinal ? 100 : 75,
          angle: 60,
          spread: 60,
          origin: { x: 0 }
        });
        confetti({
          particleCount: isTournamentFinal ? 100 : 75,
          angle: 120,
          spread: 60,
          origin: { x: 1 }
        });
      }, 300);
    } catch {
      // ignore
    }
  }, [isTournamentFinal]);

  return (
    <div
      id="winner-modal"
      data-testid="winner-celebration-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#13131a] border-2 border-[#FCEE21] rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-8 shadow-2xl relative text-center space-y-4 sm:space-y-6">
        {/* Glow background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCEE21]/15 via-transparent to-transparent pointer-events-none"></div>

        {/* Trophy icon & Blader Avatar */}
        <div className="relative inline-block mx-auto pt-1">
          <BladerAvatar blader={winner} size="xl" cornerColor="gold" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FCEE21] border-2 border-white flex items-center justify-center text-black font-black shadow-md text-base sm:text-lg">
            {isTournamentFinal ? '👑' : '🏆'}
          </div>
        </div>

        {/* Victory Header */}
        <div>
          <span className="font-label-caps text-[11px] sm:text-xs text-amber-500 uppercase tracking-widest font-black block mb-1">
            {isTournamentFinal
              ? '👑 ¡CAMPEÓN DEL TORNEO CORONADO! • GRAN FINAL'
              : `¡VICTORIA CONFIRMADA! • ${match.roundName || 'Duelo Finalizado'}`}
          </span>
          <h2 className="font-headline font-black text-2xl sm:text-4xl text-[#1a1c1e] dark:text-white uppercase tracking-tight">
            {winner.name}
          </h2>
          <p className="font-label-caps text-xs text-gray-500 uppercase mt-0.5 truncate">
            {winner.team || 'Independiente'} {winner.combos?.[0]?.name ? `• ${winner.combos[0].name}` : ''}
          </p>
        </div>

        {/* Match Final Score Display */}
        <div className="p-3 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#bec7d3]/30 dark:border-white/10 flex items-center justify-around">
          <div className="text-center min-w-0 flex-1">
            <span className="font-label-caps text-[10px] text-gray-500 uppercase block truncate">
              {match.bladerA?.name || 'Esquina Roja'}
            </span>
            <span className="font-headline font-black text-3xl sm:text-4xl text-[#AC191F]">
              {match.scoreA}
            </span>
          </div>

          <div className="font-headline font-black text-xs sm:text-base text-amber-500 px-2 sm:px-3 flex flex-col items-center">
            <span className="material-symbols-outlined text-base sm:text-lg">military_tech</span>
            <span>FINAL</span>
          </div>

          <div className="text-center min-w-0 flex-1">
            <span className="font-label-caps text-[10px] text-gray-500 uppercase block truncate">
              {match.bladerB?.name || 'Esquina Azul'}
            </span>
            <span className="font-headline font-black text-3xl sm:text-4xl text-[#04A8FC]">
              {match.scoreB}
            </span>
          </div>
        </div>

        {/* Video Attachment Section */}
        {onSaveVideoUrl && (
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left space-y-2">
            {!showVideoInput && !match.videoUrl ? (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowVideoInput(true);
                }}
                className="w-full py-2.5 px-3 min-h-[44px] rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-red-500 hover:text-red-500 dark:hover:border-red-400 text-slate-600 dark:text-slate-300 text-xs font-headline font-bold uppercase flex items-center justify-center gap-1.5 transition-all active:scale-[0.96] touch-manipulation"
              >
                <span className="material-symbols-outlined text-base text-red-500">video_camera_front</span>
                <span>¿Deseas vincular el video de esta batalla?</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-label-caps uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-red-500">movie</span>
                    <span>Video de la Batalla (YouTube / Drive / MP4)</span>
                  </span>
                  {savedVideoMsg && (
                    <span className="text-[10px] font-headline font-bold text-emerald-500 uppercase flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">check</span>
                      ¡Guardado!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://youtu.be/... o drive.google.com/..."
                    className="flex-1 px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 text-slate-900 dark:text-white placeholder-slate-400 text-base md:text-xs font-mono focus:outline-none focus:border-[#04A8FC]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onSaveVideoUrl(match.id, videoUrlInput.trim());
                      setSavedVideoMsg(true);
                      setTimeout(() => setSavedVideoMsg(false), 2500);
                    }}
                    className="px-3.5 py-2 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-headline font-bold uppercase transition-all flex items-center gap-1 active:scale-[0.95] touch-manipulation"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto-Advance Notification & Control Banner */}
        {autoAdvanceEnabled && nextMatch && !isTournamentFinal && (
          <div
            id="winner-modal-auto-advance-banner"
            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#04A8FC]/15 via-emerald-500/15 to-[#04A8FC]/15 border border-[#04A8FC]/30 text-left space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-headline font-black text-xs uppercase tracking-wider text-[#04A8FC] dark:text-sky-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>AUTO-AVANCE ACTIVO</span>
                </span>
              </div>
              <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white">
                {!isPaused ? (countdown > 0 ? `Siguiente en ${countdown}s` : '¡Cargando!') : 'En Pausa'}
              </span>
            </div>

            {/* Visual Animated Countdown Bar */}
            <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#04A8FC] to-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: isPaused ? '100%' : `${(countdown / 3) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-label-caps pt-0.5 text-slate-600 dark:text-slate-300 flex-wrap gap-2">
              <span className="truncate mr-1 max-w-[190px]">
                Próximo: <strong className="text-slate-900 dark:text-white">{nextMatch.bladerA?.name || 'Rojo'} vs {nextMatch.bladerB?.name || 'Azul'}</strong>
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  id="btn-winner-modal-pause-toggle"
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setIsPaused((p) => !p);
                  }}
                  className="px-2.5 py-1 min-h-[36px] rounded-lg border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 font-bold uppercase text-[10px] active:scale-[0.95] touch-manipulation"
                >
                  {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
                </button>
                <button
                  id="btn-winner-modal-load-now"
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onNextMatch?.(nextMatch);
                  }}
                  className="px-2.5 py-1 min-h-[36px] rounded-lg bg-[#04A8FC] hover:bg-[#008fe0] text-white font-bold uppercase text-[10px] flex items-center gap-0.5 shadow-sm active:scale-[0.95] touch-manipulation"
                >
                  <span>Cargar Ya</span>
                  <span className="material-symbols-outlined text-[12px]">bolt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-1">
          {isTournamentFinal ? (
            <>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 min-h-[48px] rounded-xl border border-gray-400 dark:border-gray-600 font-headline font-bold text-xs uppercase text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.96] touch-manipulation"
              >
                Cerrar y Revisar
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onGoToBracket();
                }}
                className="w-full sm:flex-1 py-3 px-4 min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-headline font-black text-xs uppercase shadow-lg shadow-amber-500/30 transition-all active:scale-[0.96] touch-manipulation flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">emoji_events</span>
                <span>Ver Podio en Bracket</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onGoToBracket();
                }}
                className="w-full sm:flex-1 py-3 px-4 min-h-[48px] rounded-xl border border-gray-400 dark:border-gray-600 font-headline font-bold text-xs uppercase text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.96] touch-manipulation"
              >
                Ver en Bracket
              </button>

              {onNextMatch && nextMatch ? (
                <button
                  id="btn-next-match"
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onNextMatch(nextMatch);
                  }}
                  className="w-full sm:flex-1 py-3 px-4 min-h-[48px] rounded-xl bg-[#04A8FC] hover:bg-[#008fe0] text-white font-headline font-black text-xs uppercase shadow-lg shadow-[#04A8FC]/30 transition-all active:scale-[0.96] touch-manipulation flex items-center justify-center gap-1.5"
                >
                  <span>
                    Siguiente Duelo {autoAdvanceEnabled && !isPaused && countdown > 0 ? `(${countdown}s)` : ''}
                  </span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <button
                  id="btn-modal-continue"
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 min-h-[48px] rounded-xl bg-[#04A8FC] hover:bg-[#008fe0] text-white font-headline font-black text-xs uppercase shadow-lg shadow-[#04A8FC]/30 transition-all active:scale-[0.96] touch-manipulation"
                >
                  Continuar
                </button>
              )}
            </>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all active:scale-[0.92] touch-manipulation"
          title="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
