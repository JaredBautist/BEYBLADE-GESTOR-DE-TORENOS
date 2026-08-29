import React, { useState, useEffect } from 'react';
import { TournamentConfig, TournamentType, BattleScale } from '../../types';
import { soundManager } from '../../utils/audio';
import { syncTournamentFormatToSupabase, syncConfigToSupabase } from '../../lib/supabase';

interface TournamentFormatScreenProps {
  config: TournamentConfig;
  registeredBladersCount: number;
  onSaveConfig: (updated: TournamentConfig) => void;
  onStartTournament: () => void;
  onResetTournament?: () => void;
}

export const TournamentFormatScreen: React.FC<TournamentFormatScreenProps> = ({
  config,
  registeredBladersCount,
  onSaveConfig,
  onStartTournament,
  onResetTournament
}) => {
  const [formData, setFormData] = useState<TournamentConfig>({ ...config });
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string>('');

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  const triggerSave = (updated: TournamentConfig, msg = 'Reglas y formato de torneo actualizados') => {
    setFormData(updated);
    onSaveConfig(updated);
    syncTournamentFormatToSupabase({
      type: updated.type,
      battleScale: updated.battleScale,
      victoryConditions: updated.victoryConditions,
      maxParticipants: updated.maxParticipants,
      arenaStatus: updated.arenaStatus,
      isStarted: updated.isStarted,
      regularPhaseMatchesPerBlader: updated.regularPhaseMatchesPerBlader ?? 2,
      playoffCutoffType: updated.playoffCutoffType ?? 'top_n',
      playoffCutoffCount: updated.playoffCutoffCount ?? 4,
      minPointsToQualify: updated.minPointsToQualify ?? 4,
      tournamentPhase: updated.tournamentPhase ?? 'regular'
    });
    syncConfigToSupabase({
      name: updated.name,
      season: updated.season,
      leagueName: updated.leagueName,
      communityCity: updated.communityCity,
      communityTagline: updated.communityTagline,
      organizerName: updated.organizerName,
      logoUrl: updated.logoUrl
    });
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(''), 3000);
  };

  const handleTypeChange = (type: TournamentType) => {
    soundManager.playClick();
    const updated: TournamentConfig = {
      ...formData,
      type,
      ...(type === 'series' ? { battleScale: '1v1' } : {}),
      tournamentPhase: type === 'elimination' ? 'single_elimination' : 'regular'
    };
    triggerSave(updated);
  };

  const handleMatchesPerBladerChange = (count: number) => {
    soundManager.playClick();
    const updated: TournamentConfig = {
      ...formData,
      regularPhaseMatchesPerBlader: count
    };
    triggerSave(updated, `Límite de ${count} ${count === 1 ? 'batalla' : 'batallas'} por Blader establecido`);
  };

  const handlePlayoffCutoffTypeChange = (cutoffType: 'top_n' | 'min_points') => {
    soundManager.playClick();
    const updated: TournamentConfig = {
      ...formData,
      playoffCutoffType: cutoffType
    };
    triggerSave(updated);
  };

  const handlePlayoffCutoffCountChange = (count: 8 | 4 | 2) => {
    soundManager.playClick();
    const updated: TournamentConfig = {
      ...formData,
      playoffCutoffCount: count
    };
    triggerSave(updated, `Corte de clasificación establecido a Top ${count}`);
  };

  const handleMinPointsToQualifyChange = (pts: number) => {
    const updated: TournamentConfig = {
      ...formData,
      minPointsToQualify: Math.max(1, pts)
    };
    triggerSave(updated);
  };

  const handleScaleChange = (scale: BattleScale) => {
    soundManager.playClick();
    const updated = { ...formData, battleScale: scale };
    triggerSave(updated);
  };

  const handlePointsChange = (field: keyof TournamentConfig['victoryConditions'], value: number) => {
    const updated = {
      ...formData,
      victoryConditions: {
        ...formData.victoryConditions,
        [field]: Math.max(1, value)
      }
    };
    triggerSave(updated);
  };

  const handleStart = () => {
    soundManager.playVictory();
    setIsSaved(true);
    // Mark as started in format config
    const updated = { ...formData, isStarted: true };
    triggerSave(updated, '¡Torneo Inicializado! Redirigiendo a registro de Bladers...');
    setTimeout(() => {
      onStartTournament();
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#bec7d3]/30 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight mb-2">
            FORMATO DEL TORNEO
          </h1>
          <p className="font-body-text text-base md:text-lg text-gray-600 dark:text-gray-400">
            Define las reglas oficiales de combate, escala de deck, condiciones de victoria y sede de los enfrentamientos.
          </p>
        </div>
        {saveFeedback && (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 rounded-xl text-xs font-label-caps uppercase font-black flex items-center gap-2 animate-fade-in shadow-sm">
            <span className="material-symbols-outlined text-base">cloud_done</span>
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Format & Rules Panel (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group shadow-sm border border-[#bec7d3]/40 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
              <h3 className="font-headline font-bold text-xl text-[#04A8FC] flex items-center gap-2">
                <span className="material-symbols-outlined">tune</span>
                <span>Reglas de Combate y Formato</span>
              </h3>
              <span className="text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full bg-[#04A8FC]/10 text-[#04A8FC] font-black border border-[#04A8FC]/20">
                WBO / Oficial
              </span>
            </div>

            {/* Identidad Oficial del Torneo */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#04A8FC]/10 via-[#04A8FC]/5 to-transparent border border-[#04A8FC]/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#04A8FC] text-lg">badge</span>
                <span className="font-headline font-black text-xs uppercase text-[#04A8FC] tracking-wider">
                  Identidad Oficial del Torneo
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-caps text-[11px] text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-bold">
                    Título / Nombre del Torneo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const updated = { ...formData, name: e.target.value };
                      setFormData(updated);
                    }}
                    onBlur={() => triggerSave(formData, 'Nombre del torneo guardado')}
                    placeholder="Ej. 1er Torneo Oficial Beyblade X Cúcuta"
                    className="w-full bg-white dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white focus:border-[#04A8FC] focus:outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-[11px] text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-bold">
                    Temporada / Edición *
                  </label>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => {
                      const updated = { ...formData, season: e.target.value };
                      setFormData(updated);
                    }}
                    onBlur={() => triggerSave(formData, 'Temporada guardada')}
                    placeholder="Ej. Temporada 1 - 2026"
                    className="w-full bg-white dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white focus:border-[#04A8FC] focus:outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Formato del Torneo: Liga vs Bracket vs Serie */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider font-bold">
                FORMATO DEL TORNEO
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* League Format Option */}
                <label
                  onClick={() => handleTypeChange('league')}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    formData.type === 'league'
                      ? 'border-[#04A8FC] bg-[#04A8FC]/10 shadow-sm shadow-[#04A8FC]/10'
                      : 'border-[#bec7d3]/50 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-[#04A8FC] mt-0.5 flex-shrink-0 flex items-center justify-center">
                    {formData.type === 'league' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#04A8FC] shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white mb-1">
                      Liga / Round Robin
                    </div>
                    <div className="font-label-caps text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Acumulación de puntos por jornadas. Ideal para ranking estacional.
                    </div>
                  </div>
                </label>

                {/* Elimination Bracket Option */}
                <label
                  onClick={() => handleTypeChange('elimination')}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    formData.type === 'elimination'
                      ? 'border-[#04A8FC] bg-[#04A8FC]/10 shadow-sm shadow-[#04A8FC]/10'
                      : 'border-[#bec7d3]/50 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-[#04A8FC] mt-0.5 flex-shrink-0 flex items-center justify-center">
                    {formData.type === 'elimination' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#04A8FC] shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white mb-1">
                      Eliminación Directa
                    </div>
                    <div className="font-label-caps text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Árbol de eliminatorias directas (Bracket) hasta la Gran Final.
                    </div>
                  </div>
                </label>

                {/* Series Format Option (Anime Style) */}
                <label
                  onClick={() => handleTypeChange('series')}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    formData.type === 'series'
                      ? 'border-[#FF5500] bg-[#FF5500]/10 shadow-sm shadow-[#FF5500]/10 ring-1 ring-[#FF5500]/30'
                      : 'border-[#bec7d3]/50 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-[#FF5500] mt-0.5 flex-shrink-0 flex items-center justify-center">
                    {formData.type === 'series' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white">
                        Formato Serie
                      </div>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30">
                        1 Batalla y Chao
                      </span>
                    </div>
                    <div className="font-label-caps text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      1 solo combo por Blader. 1 ronda decisiva: cualquier finish gana la batalla inmediatamente. El perdedor queda fuera de inmediato ("una batalla y chao").
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* DELIMITACIÓN POR PUNTOS & CORTE A FASE FINAL (ONLY FOR LIGA) */}
            {formData.type === 'league' ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 dark:bg-black/40 border-2 border-[#04A8FC]/40 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#04A8FC] text-xl">score</span>
                    <div>
                      <h4 className="font-headline font-black text-sm sm:text-base uppercase text-white tracking-wide">
                        Delimitación por Puntos & Corte a Fase Final (Playoffs)
                      </h4>
                      <p className="text-[11px] font-label-caps text-slate-400 uppercase">
                        Fase 1: Acumulación de Puntos • Fase 2: Cuartos / Semis / Gran Final
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#04A8FC]/20 text-[#04A8FC] border border-[#04A8FC]/30 text-[10px] font-label-caps font-black uppercase">
                    Liga / Puntos
                  </span>
                </div>

                {/* Criterio de Corte a Playoffs (Cuartos, Semis o Final) */}
                <div className="space-y-3">
                  <label className="font-label-caps text-xs text-slate-300 uppercase font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-amber-400">filter_alt</span>
                    <span>Corte Clasificatorio a Fase Final (Playoffs):</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Top 8 */}
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayoffCutoffTypeChange('top_n');
                        handlePlayoffCutoffCountChange(8);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        (formData.playoffCutoffCount || 4) === 8
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-xs uppercase text-amber-400">Top 8</span>
                        <span className="text-[9px] font-label-caps font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Cuartos de Final</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">
                        Los 8 Bladers con más puntos pasan a Cuartos de Final (1º vs 8º, 2º vs 7º, 3º vs 6º, 4º vs 5º).
                      </p>
                    </button>

                    {/* Top 4 */}
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayoffCutoffTypeChange('top_n');
                        handlePlayoffCutoffCountChange(4);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        (formData.playoffCutoffCount || 4) === 4
                          ? 'bg-[#04A8FC]/20 border-[#04A8FC] text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-xs uppercase text-[#04A8FC]">Top 4</span>
                        <span className="text-[9px] font-label-caps font-bold px-1.5 py-0.5 rounded bg-[#04A8FC]/20 text-[#04A8FC]">Semifinales</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">
                        Los 4 Bladers con más puntos pasan a Semifinales (1º vs 4º, 2º vs 3º). Los ganadores van a la Gran Final.
                      </p>
                    </button>

                    {/* Top 2 */}
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayoffCutoffTypeChange('top_n');
                        handlePlayoffCutoffCountChange(2);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        (formData.playoffCutoffCount || 4) === 2
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-xs uppercase text-emerald-400">Top 2</span>
                        <span className="text-[9px] font-label-caps font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Gran Final Directa</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">
                        Los 2 Bladers con más puntos avanzan directamente a la Gran Final (1º vs 2º).
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            ) : formData.type === 'series' ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 dark:bg-black/40 border-2 border-[#FF5500]/40 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FF5500] text-xl">tv</span>
                    <div>
                      <h4 className="font-headline font-black text-sm sm:text-base uppercase text-white tracking-wide">
                        Delimitación por Puntos & Corte a Fase Final (Playoffs)
                      </h4>
                      <p className="text-[11px] font-label-caps text-slate-400 uppercase">
                        Fase 1: Acumulación de Puntos (1 Batalla y Chao) • Fase 2: Cuartos / Semis / Gran Final
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30 text-[10px] font-label-caps font-black uppercase">
                    Serie / Puntos
                  </span>
                </div>

                {/* Criterio de Corte a Playoffs (Cuartos, Semis o Final) */}
                <div className="space-y-3">
                  <label className="font-label-caps text-xs text-slate-300 uppercase font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-amber-400">filter_alt</span>
                    <span>Corte Clasificatorio a Fase Final (Playoffs):</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Top 8 */}
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayoffCutoffTypeChange('top_n');
                        handlePlayoffCutoffCountChange(8);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        (formData.playoffCutoffCount || 4) === 8
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-xs uppercase text-amber-400">Top 8</span>
                        <span className="text-[9px] font-label-caps font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Cuartos de Final</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">
                        Los 8 Bladers con más puntos pasan a Cuartos de Final (1º vs 8º, 2º vs 7º, 3º vs 6º, 4º vs 5º).
                      </p>
                    </button>

                    {/* Top 4 */}
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayoffCutoffTypeChange('top_n');
                        handlePlayoffCutoffCountChange(4);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        (formData.playoffCutoffCount || 4) === 4
                          ? 'bg-[#04A8FC]/20 border-[#04A8FC] text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-xs uppercase text-[#04A8FC]">Top 4</span>
                        <span className="text-[9px] font-label-caps font-bold px-1.5 py-0.5 rounded bg-[#04A8FC]/20 text-[#04A8FC]">Semifinales</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">
                        Los 4 Bladers con más puntos pasan a Semifinales (1º vs 4º, 2º vs 3º). Los ganadores van a la Gran Final.
                      </p>
                    </button>

                    {/* Top 2 */}
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayoffCutoffTypeChange('top_n');
                        handlePlayoffCutoffCountChange(2);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        (formData.playoffCutoffCount || 4) === 2
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-xs uppercase text-emerald-400">Top 2</span>
                        <span className="text-[9px] font-label-caps font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Gran Final Directa</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">
                        Los 2 Bladers con más puntos avanzan directamente a la Gran Final (1º vs 2º).
                      </p>
                    </button>
                  </div>
                </div>

                {/* Serie format banner */}
                <div className="p-3 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF5500] text-base flex-shrink-0">info</span>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    <strong className="text-[#FF5500]">Formato Serie:</strong> Cada batalla es decisiva — 1 ronda, cualquier finish gana. El perdedor queda eliminado de inmediato ("una batalla y chao").
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500 text-2xl flex-shrink-0">military_tech</span>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-amber-500 uppercase block font-headline font-black">Eliminación Directa (Knockout)</strong>
                  Árbol clásico por rondas al puntaje objetivo (ej. a 5 pts). El ganador avanza a la siguiente ronda del bracket y el perdedor queda automáticamente eliminado.
                </div>
              </div>
            )}

            {/* Battle Scale */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider font-bold">
                ESCALA DE BATALLA
              </label>
              <div className="flex flex-wrap gap-3">
                {(['1v1', '2v2', '3v3', '4v4'] as BattleScale[]).map((scale) => {
                  const label = scale === '1v1' ? '1 vs 1' : scale === '2v2' ? '2 vs 2' : scale === '3v3' ? '3 vs 3' : '4 vs 4';
                  const isSelected = formData.battleScale === scale;
                  return (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => handleScaleChange(scale)}
                      className={`px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-all ${
                        isSelected
                          ? 'bg-[#04A8FC]/15 border-2 border-[#04A8FC] text-[#04A8FC] shadow-sm shadow-[#04A8FC]/20'
                          : 'border border-[#bec7d3]/50 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Victory Conditions */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider font-bold">
                CONDICIONES DE VICTORIA (PUNTUACIÓN)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Points to Win / Series 1-Round Rule */}
                {formData.type === 'series' ? (
                  <div className="bg-[#FF5500]/10 border-2 border-[#FF5500]/40 rounded-xl p-3 text-center flex flex-col justify-center shadow-sm">
                    <div className="font-label-caps text-[10px] text-[#FF5500] uppercase font-black mb-1">
                      CONDICIÓN SERIE
                    </div>
                    <div className="font-headline font-black text-2xl text-[#FF5500] p-0.5 uppercase leading-none">
                      1 RONDA
                    </div>
                    <div className="text-[10px] font-label-caps text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                      Cualquier Finish Gana
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                    <div className="font-label-caps text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                      PUNTOS PARA GANAR
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.victoryConditions.pointsToWin}
                      onChange={(e) => handlePointsChange('pointsToWin', parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent border-b-2 border-[#04A8FC] text-center text-[#04A8FC] font-headline font-black text-2xl focus:outline-none p-1"
                    />
                  </div>
                )}

                {/* Xtreme Dash Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    XTREME FINISH
                  </div>
                  <div className="font-headline font-black text-2xl text-[#1a1c1e] dark:text-white p-1">
                    {formData.victoryConditions.xtremeDashPts} PTS
                  </div>
                </div>

                {/* Burst Finish Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    BURST FINISH
                  </div>
                  <div className="font-headline font-black text-2xl text-[#AC191F] p-1">
                    {formData.victoryConditions.burstFinishPts} PTS
                  </div>
                </div>

                {/* Over Finish Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    OVER FINISH
                  </div>
                  <div className="font-headline font-black text-2xl text-[#22c55e] p-1">
                    {formData.victoryConditions.overFinishPts} PTS
                  </div>
                </div>

                {/* Spin Finish Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    SPIN FINISH
                  </div>
                  <div className="font-headline font-black text-2xl text-[#04A8FC] p-1">
                    {formData.victoryConditions.spinFinishPts} PT
                  </div>
                </div>
              </div>
            </div>

            {/* Stadium Selection */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-bold">
                ESTADIO / SEDE HABITUAL
              </label>
              <input
                type="text"
                value={formData.arenaStatus}
                onChange={(e) => {
                  const updated = { ...formData, arenaStatus: e.target.value };
                  setFormData(updated);
                }}
                onBlur={() => triggerSave(formData, 'Estadio guardado')}
                placeholder="Ej. PARQUE EL MALECÓN, Coliseo Cúcuta Center..."
                className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 font-label-caps text-xs uppercase text-[#1a1c1e] dark:text-white focus:border-[#04A8FC] focus:outline-none font-semibold"
              />
            </div>

            {/* Capacity Participants */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-bold">
                CUPO MÁXIMO DE BLADERS (PARTICIPANTES)
              </label>
              <div className="flex flex-wrap gap-2">
                {[8, 16, 32, 64].map((max) => (
                  <button
                    key={max}
                    type="button"
                    onClick={() => {
                      const updated = { ...formData, maxParticipants: max };
                      triggerSave(updated, `Capacidad ajustada a ${max} Bladers`);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all ${
                      formData.maxParticipants === max
                        ? 'bg-[#04A8FC] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {max} Bladers
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  triggerSave(formData, '¡Formato de torneo guardado en Supabase!');
                }}
                className="px-5 py-2.5 bg-[#04A8FC] hover:bg-[#0096e6] text-white font-headline font-black text-xs uppercase rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Guardar Formato de Torneo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Area: Start Tournament Protocol (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#04A8FC]/30 flex flex-col items-center text-center relative overflow-hidden shadow-md bg-gradient-to-b from-white/90 to-[#04A8FC]/5 dark:from-[#131318]/90 dark:to-[#04A8FC]/10">
            <div className="absolute inset-0 bg-gradient-to-t from-[#04A8FC]/10 to-transparent pointer-events-none"></div>

            <span className="material-symbols-outlined text-5xl text-[#04A8FC] mb-3 animate-pulse">
              rocket_launch
            </span>

            <h4 className="font-headline font-black text-xl text-[#1a1c1e] dark:text-white mb-2 uppercase">
              INICIAR TORNEO
            </h4>

            <p className="font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-6">
              Confirmar configuración oficial y pasar al registro de Bladers y Roster para {formData.leagueName || 'el torneo'}.
            </p>

            <button
              id="btn-start-tournament-protocol"
              type="button"
              onClick={handleStart}
              className="w-full bg-[#04A8FC] hover:bg-[#0096e6] text-white font-headline font-black text-base py-4 px-6 rounded-xl uppercase tracking-wider border-b-4 border-[#004b74] hover:shadow-lg hover:shadow-[#04A8FC]/30 active:translate-y-1 active:border-b-0 transition-all duration-150 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>COMENZAR TORNEO</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </span>
              <div className="absolute inset-0 -translate-x-full bg-white/30 group-hover:animate-shimmer skew-x-12"></div>
            </button>

            {isSaved && (
              <p className="mt-3 text-xs font-label-caps text-[#22c55e] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check</span>
                <span>¡Protocolo inicializado! Abriendo Bladers & Roster...</span>
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 w-full text-left font-label-caps text-[11px] text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Formato:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formData.type === 'elimination'
                    ? 'Bracket Eliminación'
                    : formData.type === 'series'
                    ? 'Formato Serie (Anime)'
                    : 'Liga Puntos'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Escala:</span>
                <span className="font-bold text-[#04A8FC]">
                  {formData.battleScale === '1v1'
                    ? '1 vs 1'
                    : formData.battleScale === '2v2'
                    ? '2 vs 2'
                    : formData.battleScale === '3v3'
                    ? '3 vs 3'
                    : '4 vs 4'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{formData.type === 'series' ? 'Condición:' : 'Meta de Puntos:'}</span>
                <span className={`font-bold ${formData.type === 'series' ? 'text-[#FF5500]' : 'text-emerald-500'}`}>
                  {formData.type === 'series' ? '1 Ronda (Cualquier Finish)' : `${formData.victoryConditions.pointsToWin} Puntos`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Reset Tournament Action */}
          {onResetTournament && (
            <div className="glass-panel p-5 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                <h4 className="font-headline font-black text-xs uppercase tracking-wide">
                  Gestión del Torneo
                </h4>
              </div>
              <p className="text-[11px] font-body-text text-slate-500 dark:text-slate-400">
                ¿Finalizó el torneo actual o deseas comenzar uno nuevo desde cero? Archiva los resultados en el historial y reinicia los marcadores y combates.
              </p>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onResetTournament();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-headline font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reiniciar Torneo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
