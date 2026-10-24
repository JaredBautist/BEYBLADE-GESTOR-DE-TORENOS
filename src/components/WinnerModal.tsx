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
  onNextMatch?: () => void;
  onSaveVideoUrl?: (matchId: string, videoUrl: string) => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  match,
  isTournamentFinal = false,
  nextMatch = null,
  onClose,
  onGoToBracket,
  onNextMatch,
  onSaveVideoUrl
}) => {
  const [videoUrlInput, setVideoUrlInput] = useState(match.videoUrl || '');
  const [savedVideoMsg, setSavedVideoMsg] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(Boolean(match.videoUrl));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#13131a] border-2 border-[#FCEE21] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCEE21]/15 via-transparent to-transparent pointer-events-none"></div>

        {/* Trophy icon & Blader Avatar */}
        <div className="relative inline-block mx-auto">
          <BladerAvatar blader={winner} size="2xl" cornerColor="gold" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#FCEE21] border-2 border-white flex items-center justify-center text-black font-black shadow-md text-lg">
            {isTournamentFinal ? '👑' : '🏆'}
          </div>
        </div>

        {/* Victory Header */}
        <div>
          <span className="font-label-caps text-xs text-amber-500 uppercase tracking-widest font-black block mb-1">
            {isTournamentFinal
              ? '👑 ¡CAMPEÓN DEL TORNEO CORONADO! • GRAN FINAL'
              : `¡VICTORIA CONFIRMADA! • ${match.roundName || 'Duelo Finalizado'}`}
          </span>
          <h2 className="font-headline font-black text-2xl sm:text-4xl text-[#1a1c1e] dark:text-white uppercase tracking-tight">
            {winner.name}
          </h2>
          <p className="font-label-caps text-xs text-gray-500 uppercase mt-1">
            {winner.team || 'Independiente'} {winner.combos?.[0]?.name ? `• ${winner.combos[0].name}` : ''}
          </p>
        </div>

        {/* Match Final Score Display */}
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#bec7d3]/30 dark:border-white/10 flex items-center justify-around">
          <div className="text-center min-w-0 flex-1">
            <span className="font-label-caps text-[10px] text-gray-500 uppercase block truncate">
              {match.bladerA?.name || 'Esquina Roja'}
            </span>
            <span className="font-headline font-black text-3xl sm:text-4xl text-[#AC191F]">
              {match.scoreA}
            </span>
          </div>

          <div className="font-headline font-black text-sm sm:text-base text-amber-500 px-3 flex flex-col items-center">
            <span className="material-symbols-outlined text-lg">military_tech</span>
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
                className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-red-500 hover:text-red-500 dark:hover:border-red-400 text-slate-600 dark:text-slate-300 text-xs font-headline font-bold uppercase flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
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
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-none focus:border-[#04A8FC]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onSaveVideoUrl(match.id, videoUrlInput.trim());
                      setSavedVideoMsg(true);
                      setTimeout(() => setSavedVideoMsg(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-headline font-bold uppercase transition-all flex items-center gap-1 active:scale-[0.97]"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {isTournamentFinal ? (
            <>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-400 dark:border-gray-600 font-headline font-bold text-xs uppercase text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Cerrar y Revisar
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onGoToBracket();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-headline font-black text-xs uppercase shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">emoji_events</span>
                <span>Ver Podio en Bracket</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onGoToBracket();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-400 dark:border-gray-600 font-headline font-bold text-xs uppercase text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Ver en Bracket
              </button>

              {onNextMatch && nextMatch ? (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onNextMatch();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#04A8FC] hover:bg-[#008fe0] text-white font-headline font-black text-xs uppercase shadow-lg shadow-[#04A8FC]/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <span>Siguiente Duelo</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#04A8FC] hover:bg-[#008fe0] text-white font-headline font-black text-xs uppercase shadow-lg shadow-[#04A8FC]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continuar
                </button>
              )}
            </>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
