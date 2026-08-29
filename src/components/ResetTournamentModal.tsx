import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { Blader, Match, TournamentConfig } from '../types';

export type ResetMode = 'archive_and_clean' | 'archive_and_reset' | 'matches_only' | 'factory_reset';

interface ResetTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (mode: ResetMode) => void;
  bladers: Blader[];
  matches: Match[];
  config: TournamentConfig;
}

export const ResetTournamentModal: React.FC<ResetTournamentModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  bladers,
  matches,
  config
}) => {
  const [selectedMode, setSelectedMode] = useState<ResetMode>('archive_and_clean');

  if (!isOpen) return null;

  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const leadingBlader = [...bladers].sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0))[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#15151c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-5 sm:p-7 md:p-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">restart_alt</span>
            </div>
            <div>
              <h2 className="font-headline font-black text-xl md:text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
                REINICIAR TORNEO
              </h2>
              <p className="font-body-text text-xs text-slate-500 dark:text-slate-400">
                Selecciona cómo deseas reiniciar el torneo en la comunidad.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Current State Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-label-caps uppercase">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Bladers:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{bladers.length} Registrados</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Combates:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{finishedMatches.length} de {matches.length}</span>
          </div>
          {leadingBlader && (
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Líder:</span>
              <span className="font-bold text-amber-500 text-sm truncate max-w-[90px] block">{leadingBlader.name}</span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {/* Option 1: Archive & Clean Everything for New Tournament */}
          <div
            onClick={() => {
              soundManager.playClick();
              setSelectedMode('archive_and_clean');
            }}
            className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedMode === 'archive_and_clean'
                ? 'border-[#04A8FC] bg-[#04A8FC]/10 ring-2 ring-[#04A8FC]/30 shadow-sm'
                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="mt-0.5">
              <input
                type="radio"
                name="reset_mode"
                checked={selectedMode === 'archive_and_clean'}
                onChange={() => setSelectedMode('archive_and_clean')}
                className="w-4 h-4 text-[#04A8FC] focus:ring-[#04A8FC] cursor-pointer"
              />
            </div>
            <div className="space-y-1 select-none flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase">
                  Archivar en Historial y Limpiar Todo a 0
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase">
                  Nuevo Torneo
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Guarda este torneo completo en el <strong>Historial & Hall of Fame</strong> y <strong>limpia totalmente la Battle Console, el Bracket y el Padrón de Bladers</strong> a 0 para empezar las inscripciones del nuevo torneo desde cero.
              </p>
            </div>
          </div>

          {/* Option 2: Archive & Keep Bladers */}
          <div
            onClick={() => {
              soundManager.playClick();
              setSelectedMode('archive_and_reset');
            }}
            className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedMode === 'archive_and_reset'
                ? 'border-[#04A8FC] bg-[#04A8FC]/10 ring-2 ring-[#04A8FC]/30 shadow-sm'
                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="mt-0.5">
              <input
                type="radio"
                name="reset_mode"
                checked={selectedMode === 'archive_and_reset'}
                onChange={() => setSelectedMode('archive_and_reset')}
                className="w-4 h-4 text-[#04A8FC] focus:ring-[#04A8FC] cursor-pointer"
              />
            </div>
            <div className="space-y-1 select-none flex-1">
              <span className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase">
                Archivar en Historial y Mantener Mismos Bladers
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Guarda el torneo actual en el Historial y <strong>conserva a los Bladers ya registrados</strong>, restableciendo sus marcadores a 0 - 0 y generando nuevos cruces.
              </p>
            </div>
          </div>

          {/* Option 3: Matches only */}
          <div
            onClick={() => {
              soundManager.playClick();
              setSelectedMode('matches_only');
            }}
            className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedMode === 'matches_only'
                ? 'border-[#04A8FC] bg-[#04A8FC]/10 ring-2 ring-[#04A8FC]/30 shadow-sm'
                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="mt-0.5">
              <input
                type="radio"
                name="reset_mode"
                checked={selectedMode === 'matches_only'}
                onChange={() => setSelectedMode('matches_only')}
                className="w-4 h-4 text-[#04A8FC] focus:ring-[#04A8FC] cursor-pointer"
              />
            </div>
            <div className="space-y-1 select-none flex-1">
              <span className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase">
                Reiniciar Solo Marcadores y Cruces (0 - 0)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pone los marcadores a 0 y limpia los combates sin archivar en el historial. Mantiene los Bladers intactos.
              </p>
            </div>
          </div>

          {/* Option 4: Factory Reset */}
          <div
            onClick={() => {
              soundManager.playClick();
              setSelectedMode('factory_reset');
            }}
            className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedMode === 'factory_reset'
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-sm'
                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="mt-0.5">
              <input
                type="radio"
                name="reset_mode"
                checked={selectedMode === 'factory_reset'}
                onChange={() => setSelectedMode('factory_reset')}
                className="w-4 h-4 text-red-500 focus:ring-red-500 cursor-pointer"
              />
            </div>
            <div className="space-y-1 select-none flex-1">
              <span className="font-headline font-bold text-xs sm:text-sm text-red-600 dark:text-red-400 uppercase">
                Reinicio Completo de Fábrica (Borrar Todo)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Elimina todos los Bladers, combates activos y piezas para restaurar la base de datos limpia.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 font-headline font-bold text-xs uppercase text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playImpact();
              onConfirmReset(selectedMode);
            }}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-headline font-black text-xs uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Confirmar Reinicio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
