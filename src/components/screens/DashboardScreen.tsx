import React, { useState } from 'react';
import { Blader, Match, TournamentConfig } from '../../types';
import { soundManager } from '../../utils/audio';
import { BladerAvatar } from '../BladerAvatar';

interface DashboardScreenProps {
  currentMatch: Match | null;
  config: TournamentConfig;
  allBladers: Blader[];
  matches?: Match[];
  onUpdateScore: (corner: 'A' | 'B', pointType: 'xtreme' | 'burst' | 'over' | 'spin' | 'stadium', points: number) => void;
  onResetMatch: () => void;
  onSelectOnDeckMatch: (bladerAId: string, bladerBId: string) => void;
  onRandomizeOnDeck: () => void;
  onSwapCorners: () => void;
  onOpenNewBattle: () => void;
  onNavigateToBladers: () => void;
  onNavigateToBracket?: () => void;
  onSelectMatchForConsole?: (match: Match) => void;
  onQuickStartMatch: (nameA: string, nameB: string, targetScore: number) => void;
  onGeneratePlayoffs?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentMatch,
  config,
  allBladers,
  matches = [],
  onUpdateScore,
  onResetMatch,
  onSelectOnDeckMatch,
  onRandomizeOnDeck,
  onSwapCorners,
  onOpenNewBattle,
  onNavigateToBladers,
  onNavigateToBracket,
  onSelectMatchForConsole,
  onQuickStartMatch,
  onGeneratePlayoffs
}) => {
  const [selectedComboSlotA, setSelectedComboSlotA] = useState<number>(1);
  const [selectedComboSlotB, setSelectedComboSlotB] = useState<number>(1);
  const [showEventLog, setShowEventLog] = useState<boolean>(true);
  const [mobileCornerFilter, setMobileCornerFilter] = useState<'both' | 'A' | 'B'>('both');

  // State for selecting bladers when console is in standby
  const [selectedBladerAId, setSelectedBladerAId] = useState<string>(allBladers[0]?.id || '');
  const [selectedBladerBId, setSelectedBladerBId] = useState<string>(allBladers[1]?.id || allBladers[0]?.id || '');

  // Keep selection updated if allBladers changes
  React.useEffect(() => {
    if (allBladers.length > 0) {
      if (!selectedBladerAId || !allBladers.some((b) => b.id === selectedBladerAId)) {
        setSelectedBladerAId(allBladers[0].id);
      }
      if (!selectedBladerBId || !allBladers.some((b) => b.id === selectedBladerBId)) {
        setSelectedBladerBId(allBladers[1]?.id || allBladers[0].id);
      }
    }
  }, [allBladers]);

  const handleLaunchBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (allBladers.length === 0) {
      onNavigateToBladers();
      return;
    }
    if (!selectedBladerAId || !selectedBladerBId) {
      alert('Por favor selecciona los dos bladers para el combate.');
      return;
    }
    if (selectedBladerAId === selectedBladerBId && allBladers.length > 1) {
      alert('Por favor selecciona dos bladers diferentes para las esquinas Roja y Azul.');
      return;
    }
    soundManager.playClick();
    onSelectOnDeckMatch(selectedBladerAId, selectedBladerBId);
  };

  // If no match is currently active in the console
  if (!currentMatch) {
    const activeBladerA = allBladers.find((b) => b.id === selectedBladerAId);
    const activeBladerB = allBladers.find((b) => b.id === selectedBladerBId);

    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-label-caps text-xs text-[#04A8FC] uppercase tracking-widest font-bold">
                ARENA EN ESPERA • {config.arenaStatus}
              </span>
              <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded-full bg-[#04A8FC]/10 text-[#04A8FC] border border-[#04A8FC]/20 font-black">
                {config.type === 'series'
                  ? 'Formato Serie (1 Ronda)'
                  : config.type === 'elimination'
                  ? 'Bracket Eliminación'
                  : 'Liga / Round Robin'}
              </span>
            </div>
            <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight italic">
              BATTLE CONSOLE
            </h1>
          </div>
        </div>

        {/* Empty State / Launch Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden bg-white dark:bg-[#15151c] space-y-6">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#04A8FC]/10 border border-[#04A8FC]/30 flex items-center justify-center text-[#04A8FC]">
              <span className="material-symbols-outlined text-3xl">sports_kabaddi</span>
            </div>

            <div>
              <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase text-slate-900 dark:text-white">
                Consola Lista para Batalla
              </h2>
              <p className="font-body-text text-sm text-slate-600 dark:text-slate-400 mt-1">
                Selecciona los Bladers inscritos para las esquinas Roja y Azul y lanza el combate a la consola con las reglas oficiales configuradas.
              </p>
            </div>
          </div>

          {allBladers.length === 0 ? (
            <div className="p-8 text-center space-y-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 max-w-xl mx-auto">
              <span className="material-symbols-outlined text-4xl text-slate-400">group_off</span>
              <div>
                <h3 className="font-headline font-black text-base uppercase text-slate-900 dark:text-white">
                  No hay Bladers inscritos en el padrón
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Registra a los competidores de la comunidad para poder iniciar enfrentamientos en la consola de batalla.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToBladers}
                className="inline-flex items-center gap-2 bg-[#04A8FC] hover:bg-[#008fe0] text-white py-3 px-6 rounded-xl font-headline font-black text-xs uppercase shadow-md shadow-[#04A8FC]/20 transition-all hover:scale-105"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Inscribir Bladers & Roster</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLaunchBattle} className="space-y-6">
              {/* Corner Selectors Card */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* Red Corner Selector (Col 5) */}
                <div className="md:col-span-5 p-5 rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-label-caps uppercase font-black text-[#DC2626] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
                      <span>Esquina Roja (Blader A)</span>
                    </label>
                  </div>

                  <select
                    value={selectedBladerAId}
                    onChange={(e) => setSelectedBladerAId(e.target.value)}
                    className="w-full bg-white dark:bg-[#1a1a24] border border-red-300 dark:border-red-800 rounded-xl p-3 text-sm font-headline font-bold text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-[#DC2626] focus:outline-none shadow-sm"
                  >
                    {allBladers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.alias ? `"${b.alias}"` : ''} ({b.team || 'Independiente'})
                      </option>
                    ))}
                  </select>

                  {activeBladerA && (
                    <div className="flex items-center gap-3 p-2.5 bg-white/70 dark:bg-white/5 rounded-xl border border-red-200 dark:border-red-900/40">
                      <BladerAvatar blader={activeBladerA} size="sm" cornerColor="red" />
                      <div className="min-w-0 flex-1">
                        <div className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white truncate">
                          {activeBladerA.name}
                        </div>
                        <div className="text-[11px] font-label-caps text-slate-500 uppercase truncate">
                          {activeBladerA.combos?.[0]?.name || `${activeBladerA.team || 'Independiente'}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* VS Badge (Col 1) */}
                <div className="md:col-span-1 flex justify-center items-center py-2 md:py-0">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1a24] border-2 border-[#04A8FC] shadow flex items-center justify-center font-headline font-black text-lg text-slate-900 dark:text-white italic">
                    VS
                  </div>
                </div>

                {/* Blue Corner Selector (Col 5) */}
                <div className="md:col-span-5 p-5 rounded-2xl border-2 border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-label-caps uppercase font-black text-[#0284C7] dark:text-[#38bdf8] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
                      <span>Esquina Azul (Blader B)</span>
                    </label>
                  </div>

                  <select
                    value={selectedBladerBId}
                    onChange={(e) => setSelectedBladerBId(e.target.value)}
                    className="w-full bg-white dark:bg-[#1a1a24] border border-sky-300 dark:border-sky-800 rounded-xl p-3 text-sm font-headline font-bold text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-[#0284C7] focus:outline-none shadow-sm"
                  >
                    {allBladers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.alias ? `"${b.alias}"` : ''} ({b.team || 'Independiente'})
                      </option>
                    ))}
                  </select>

                  {activeBladerB && (
                    <div className="flex items-center gap-3 p-2.5 bg-white/70 dark:bg-white/5 rounded-xl border border-sky-200 dark:border-sky-900/40">
                      <BladerAvatar blader={activeBladerB} size="sm" cornerColor="blue" />
                      <div className="min-w-0 flex-1">
                        <div className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white truncate">
                          {activeBladerB.name}
                        </div>
                        <div className="text-[11px] font-label-caps text-slate-500 uppercase truncate">
                          {activeBladerB.combos?.[0]?.name || `${activeBladerB.team || 'Independiente'}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registered Bladers Quick Assignment Roster */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#04A8FC]">groups</span>
                    <span>Padrón de Bladers Inscritos ({allBladers.length})</span>
                  </h3>
                  <span className="text-[10px] font-label-caps text-slate-400 uppercase">
                    Haz clic para asignar a una esquina
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {allBladers.map((b) => {
                    const isRed = selectedBladerAId === b.id;
                    const isBlue = selectedBladerBId === b.id;

                    return (
                      <div
                        key={b.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          isRed
                            ? 'border-red-500 bg-red-500/10'
                            : isBlue
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a24]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <BladerAvatar blader={b} size="xs" />
                          <div className="min-w-0">
                            <p className="font-headline font-bold text-xs uppercase text-slate-900 dark:text-white truncate">
                              {b.name}
                            </p>
                            <p className="text-[10px] font-label-caps text-slate-500 uppercase truncate">
                              {b.team || 'Independiente'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setSelectedBladerAId(b.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-headline font-black uppercase transition-all ${
                              isRed
                                ? 'bg-[#DC2626] text-white shadow-sm'
                                : 'bg-red-100 dark:bg-red-950/40 text-[#DC2626] hover:bg-[#DC2626] hover:text-white'
                            }`}
                            title="Asignar a Esquina Roja"
                          >
                            Roja
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setSelectedBladerBId(b.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-headline font-black uppercase transition-all ${
                              isBlue
                                ? 'bg-[#0284C7] text-white shadow-sm'
                                : 'bg-sky-100 dark:bg-sky-950/40 text-[#0284C7] hover:bg-[#0284C7] hover:text-white'
                            }`}
                            title="Asignar a Esquina Azul"
                          >
                            Azul
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main CTA Button */}
              <div className="pt-2">
                <button
                  id="btn-launch-battle-console"
                  type="submit"
                  className="w-full bg-[#04A8FC] hover:bg-[#008fe0] text-white py-4 px-6 rounded-2xl font-headline font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#04A8FC]/30 hover:scale-[1.01] active:scale-[0.99] transition-all border-b-4 border-[#0066a3]"
                >
                  <span className="material-symbols-outlined text-xl">play_arrow</span>
                  <span>LANZAR COMBATE A LA CONSOLA</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const bladerA = currentMatch.bladerA;
  const bladerB = currentMatch.bladerB;

  const currentComboA = bladerA?.combos?.find((c) => c.slot === selectedComboSlotA) || bladerA?.combos?.[0];
  const currentComboB = bladerB?.combos?.find((c) => c.slot === selectedComboSlotB) || bladerB?.combos?.[0];

  // Candidates for on-deck
  const remainingBladers = allBladers.filter(
    (b) => b.id !== bladerA?.id && b.id !== bladerB?.id
  );
  const onDeckA = remainingBladers[0];
  const onDeckB = remainingBladers[1];

  const isMatchFinished = currentMatch.status === 'finished';
  const isRegularPhase = config.type !== 'elimination' && config.tournamentPhase !== 'playoffs';
  const areAllRegularMatchesFinished =
    isRegularPhase &&
    matches.length > 0 &&
    matches.every((m) => m.stage !== 'regular' || m.status === 'finished');

  const totalRounds = matches && matches.length > 0 ? Math.max(...matches.map((m) => m.roundNumber || 1)) : 1;
  const isTournamentFinal = isMatchFinished && (
    !currentMatch.nextMatchId ||
    currentMatch.roundNumber === totalRounds ||
    currentMatch.roundName?.toLowerCase().includes('final')
  );

  const nextPlayableBracketMatch = matches.find(
    (m) => m.id !== currentMatch.id && m.status !== 'finished' && m.bladerA && m.bladerB
  );

  const handlePointClick = (
    corner: 'A' | 'B',
    type: 'xtreme' | 'burst' | 'over' | 'spin' | 'stadium',
    pts: number
  ) => {
    if (isMatchFinished) return;
    soundManager.playPoint(type);
    onUpdateScore(corner, type, pts);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`w-2.5 h-2.5 rounded-full ${isMatchFinished ? 'bg-amber-400' : 'bg-[#39FF14] animate-pulse'}`}></span>
            <span className="font-label-caps text-xs text-[#04A8FC] uppercase tracking-widest font-bold">
              {isMatchFinished ? 'COMBATE CULMINADO' : 'ENGAGEMENT ACTIVO'} • {currentMatch.roundName || 'Ronda de Batalla'}
            </span>
            {isRegularPhase && (
              <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-black border border-blue-500/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">repeat</span>
                <span>FASE REGULAR (ACUMULACIÓN)</span>
              </span>
            )}
            {config.type === 'series' && (
              <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-black border border-[#FF5500]/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">tv</span>
                <span>FORMATO SERIE (1 RONDA DECISIVA)</span>
              </span>
            )}
          </div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight italic">
            BATTLE CONSOLE
          </h1>
        </div>

        {/* Quick stadium stats & controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onSwapCorners();
            }}
            disabled={isMatchFinished}
            title="Intercambiar Esquinas Roja/Azul"
            className="glass-panel px-3 py-1.5 rounded-lg text-xs font-label-caps uppercase flex items-center gap-1.5 hover:border-[#04A8FC] text-gray-700 dark:text-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            <span className="hidden sm:inline">Invertir Esquinas</span>
          </button>
          <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 border-[#04A8FC]/30">
            <span className="material-symbols-outlined text-[#04A8FC] text-sm">stadium</span>
            <span className="font-label-caps text-xs text-gray-600 dark:text-gray-300 uppercase">
              {config.arenaStatus}
            </span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenNewBattle();
            }}
            className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-3 py-1.5 rounded-lg text-xs font-label-caps uppercase font-bold flex items-center gap-1 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="hidden sm:inline">Nuevo Duelo</span>
          </button>
        </div>
      </div>

      {/* MATCH COMPLETION BANNER (IF STATUS IS FINISHED) */}
      {isMatchFinished && (
        <div className={`p-4 sm:p-6 rounded-3xl border-2 shadow-xl animate-in fade-in text-center space-y-3 ${
          isTournamentFinal
            ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-400 dark:border-amber-400/50'
            : 'bg-emerald-500/15 border-emerald-500/40 dark:bg-emerald-950/30'
        }`}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-3xl text-amber-500">
              {isTournamentFinal ? 'military_tech' : 'emoji_events'}
            </span>
            <h3 className="font-headline font-black text-lg sm:text-2xl uppercase text-slate-900 dark:text-white">
              {isTournamentFinal
                ? `¡GRAN FINAL CONCLUIDA! • CAMPEÓN: ${currentMatch.winnerName || 'Blader Ganador'} 👑`
                : `COMBATE FINALIZADO • GANADOR: ${currentMatch.winnerName || 'Blader Ganador'} ✅`}
            </h3>
          </div>
          <p className="text-xs sm:text-sm font-label-caps uppercase text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            {isTournamentFinal
              ? 'El torneo ha concluido oficialmente. El cuadro de honor, podio y ceremonia de premiación están listos en el Bracket.'
              : 'El resultado oficial ha sido registrado en la base de datos y el ganador sumó puntos para la clasificación.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {areAllRegularMatchesFinished && onGeneratePlayoffs && (
              <button
                onClick={() => {
                  soundManager.playVictory();
                  onGeneratePlayoffs();
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-6 py-3 rounded-xl font-headline font-black text-xs uppercase shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2 hover:scale-105 animate-pulse"
              >
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                <span>Fase Regular Lista • Clasificar a Playoffs (Top Cut)</span>
              </button>
            )}

            {!isTournamentFinal && nextPlayableBracketMatch && onSelectMatchForConsole && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onSelectMatchForConsole(nextPlayableBracketMatch);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-headline font-black text-xs uppercase shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
              >
                <span>Cargar Siguiente Duelo ({nextPlayableBracketMatch.roundName})</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            )}

            {onNavigateToBracket && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigateToBracket();
                }}
                className={`px-6 py-3 rounded-xl font-headline font-black text-xs uppercase shadow-lg transition-all flex items-center gap-2 hover:scale-105 ${
                  isTournamentFinal
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
                    : 'bg-[#04A8FC] hover:bg-[#008fe0] text-white shadow-[#04A8FC]/20'
                }`}
              >
                <span className="material-symbols-outlined text-base">account_tree</span>
                <span>{isTournamentFinal ? 'Ver Podio Oficial y Bracket' : isRegularPhase ? 'Ver Tabla de Posiciones' : 'Ver Árbol Bracket'}</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playClick();
                onResetMatch();
              }}
              className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl font-headline font-bold text-xs uppercase transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Reiniciar Este Duelo (0-0)</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Corner Quick-Switch Tabs (visible only on mobile) */}
      <div className="lg:hidden flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
        <button
          onClick={() => {
            soundManager.playClick();
            setMobileCornerFilter('both');
          }}
          className={`flex-1 py-2 rounded-xl font-headline font-bold text-xs uppercase transition-all ${
            mobileCornerFilter === 'both'
              ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Ambas Esquinas
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            setMobileCornerFilter('A');
          }}
          className={`flex-1 py-2 rounded-xl font-headline font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 ${
            mobileCornerFilter === 'A'
              ? 'bg-[#DC2626] text-white shadow-sm font-black'
              : 'text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-950/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Roja ({currentMatch.scoreA})</span>
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            setMobileCornerFilter('B');
          }}
          className={`flex-1 py-2 rounded-xl font-headline font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 ${
            mobileCornerFilter === 'B'
              ? 'bg-[#0284C7] text-white shadow-sm font-black'
              : 'text-[#0284C7] hover:bg-sky-50 dark:hover:bg-sky-950/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Azul ({currentMatch.scoreB})</span>
        </button>
      </div>

      {/* Main Battle Arena 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* RED CORNER (Blader A) */}
        <div className={`lg:col-span-5 flex flex-col ${mobileCornerFilter === 'B' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="glass-panel p-4 sm:p-5 rounded-2xl relative overflow-hidden group border-l-4 border-l-[#DC2626] border-t border-r border-b border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between h-full bg-white dark:bg-[#15151e]">
            {/* Tactical background glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

            {/* Profile Info */}
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <BladerAvatar
                blader={bladerA}
                size="xl"
                cornerColor="red"
                showBadge={true}
                badgeText="RED"
              />
              <div className="flex-1 min-w-0">
                <p className="font-label-caps text-xs text-[#DC2626] dark:text-[#f87171] uppercase font-black tracking-wider">
                  Esquina Roja {bladerA?.team ? `• ${bladerA.team}` : ''}
                </p>
                <h3 className="font-headline font-black text-2xl md:text-3xl text-slate-900 dark:text-white uppercase truncate">
                  {bladerA?.name || 'Esquina Roja'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-label-caps uppercase truncate">
                  {currentComboA?.name || (bladerA?.combos?.length ? bladerA.combos[0].name : 'Configuración de Combate')}
                </p>
              </div>
            </div>

            {/* Combo selector chips (if combos available) */}
            {bladerA && bladerA.combos && bladerA.combos.length > 0 && (
              <div className="flex items-center gap-1.5 mb-4 p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-label-caps text-slate-500 uppercase px-1 font-bold">
                  Deck:
                </span>
                {bladerA.combos.map((combo) => (
                  <button
                    key={combo.slot}
                    onClick={() => setSelectedComboSlotA(combo.slot)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-label-caps uppercase truncate transition-all ${
                      selectedComboSlotA === combo.slot
                        ? 'bg-[#DC2626] text-white font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10'
                    }`}
                  >
                    {combo.blade.substring(0, 8)}
                  </button>
                ))}
              </div>
            )}

            {/* Large Score Display */}
            <div className="flex justify-center items-center py-5 my-2 bg-red-50/70 dark:bg-red-950/20 rounded-2xl border-2 border-red-200 dark:border-red-900/40 shadow-inner">
              <div className="text-center">
                <span className="block text-slate-500 dark:text-slate-400 font-label-caps text-xs uppercase tracking-widest font-black mb-1">
                  PUNTOS
                </span>
                <span
                  id="score-display-a"
                  className="font-headline font-black text-6xl md:text-8xl text-[#DC2626] dark:text-[#f87171] leading-none drop-shadow-sm tracking-tighter inline-block"
                >
                  {currentMatch.scoreA}
                </span>
              </div>
            </div>

            {/* Tactical Scoring Controls */}
            <div className="space-y-2.5 mt-4">
              {/* Xtreme Finish (3 PTS) */}
              <button
                id="btn-red-xtreme-finish"
                disabled={isMatchFinished}
                onClick={() => handlePointClick('A', 'xtreme', config.victoryConditions.xtremeDashPts)}
                className={`w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white py-3 px-4 rounded-xl flex items-center justify-between font-label-caps uppercase tracking-wider font-black shadow-md shadow-red-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-red-900 ${
                  isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">bolt</span>
                  <span>XTREME FINISH</span>
                </div>
                <span className="bg-black/25 px-2.5 py-0.5 rounded-lg text-xs font-mono">
                  +{config.victoryConditions.xtremeDashPts} PTS
                </span>
              </button>

              {/* Burst Finish & Over Finish (2 PTS each) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-red-burst-finish"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('A', 'burst', config.victoryConditions.burstFinishPts)}
                  className={`bg-[#D97706] hover:bg-[#B45309] text-white py-2.5 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-amber-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>BURST FINISH</span>
                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.burstFinishPts} PTS
                  </span>
                </button>

                <button
                  id="btn-red-over-finish"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('A', 'over', config.victoryConditions.overFinishPts)}
                  className={`bg-[#16A34A] hover:bg-[#15803D] text-white py-2.5 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-green-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>OVER FINISH</span>
                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.overFinishPts} PTS
                  </span>
                </button>
              </div>

              {/* Stadium Out & Spin Finish */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-red-stadium-out"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('A', 'stadium', config.victoryConditions.stadiumOutPts)}
                  className={`bg-slate-600 hover:bg-slate-700 text-white py-2 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm transition-all border-b-4 border-slate-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>STADIUM OUT</span>
                  <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.stadiumOutPts} PTS
                  </span>
                </button>

                <button
                  id="btn-red-spin-finish"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('A', 'spin', config.victoryConditions.spinFinishPts)}
                  className={`bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm transition-all border-b-4 border-sky-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>SPIN FINISH</span>
                  <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.spinFinishPts} PTS
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER VS & TARGET MODULE */}
        <div className={`lg:col-span-2 flex flex-col justify-center items-center gap-3 sm:gap-4 py-2 lg:py-0 ${mobileCornerFilter !== 'both' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Circular VS badge */}
          <div className="relative flex justify-center items-center w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-[#1c1c27] border-2 border-[#04A8FC] shadow-md flex items-center justify-center rotate-6 hover:rotate-0 transition-transform">
              <span className="font-headline font-black text-xl sm:text-2xl text-slate-900 dark:text-white italic">
                VS
              </span>
            </div>
          </div>

          {/* Target Score Chip */}
          <div className={`glass-panel p-3 sm:p-4 rounded-2xl flex flex-col items-center gap-1 w-full text-center border-2 shadow-sm ${
            config.type === 'series'
              ? 'border-[#FF5500] bg-[#FF5500]/10 text-[#FF5500]'
              : 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20'
          }`}>
            <span className={`font-label-caps text-[10px] sm:text-[11px] uppercase font-black tracking-wider ${
              config.type === 'series' ? 'text-[#FF5500]' : 'text-amber-800 dark:text-amber-300'
            }`}>
              {config.type === 'series' ? 'FORMATO SERIE' : 'OBJETIVO'}
            </span>
            <span className={`font-headline font-black text-2xl sm:text-3xl leading-none ${
              config.type === 'series' ? 'text-[#FF5500]' : 'text-amber-600 dark:text-yellow-400'
            }`}>
              {config.type === 'series' ? '1 RONDA' : `${currentMatch.targetScore} PTS`}
            </span>
            <span className="text-[9px] sm:text-[10px] font-label-caps text-slate-500 dark:text-slate-400 uppercase font-bold">
              {config.type === 'series' ? 'Muerte Súbita' : 'Para Ganar'}
            </span>
          </div>

          {/* Reset button */}
          <button
            id="btn-reset-match"
            onClick={() => {
              soundManager.playClick();
              onResetMatch();
            }}
            className="w-full glass-panel py-2 px-3 rounded-xl font-label-caps text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-white hover:border-red-300 dark:hover:border-red-500/40 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reiniciar Marcador</span>
          </button>

          {/* Toggle Point Log view */}
          <button
            onClick={() => setShowEventLog(!showEventLog)}
            className="text-[11px] font-label-caps uppercase text-[#0284c7] dark:text-[#04A8FC] hover:underline flex items-center gap-1 font-bold"
          >
            <span className="material-symbols-outlined text-sm">
              {showEventLog ? 'expand_less' : 'history'}
            </span>
            <span>{showEventLog ? 'Ocultar Registro' : 'Ver Registro'}</span>
          </button>
        </div>

        {/* BLUE CORNER (Blader B) */}
        <div className={`lg:col-span-5 flex flex-col ${mobileCornerFilter === 'A' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="glass-panel p-4 sm:p-5 rounded-2xl relative overflow-hidden group border-r-4 border-r-[#0284C7] border-t border-l border-b border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between h-full bg-white dark:bg-[#15151e]">
            {/* Tactical background glow */}
            <div className="absolute top-0 left-0 w-36 h-36 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -ml-10 -mt-10"></div>

            {/* Profile Info */}
            <div className="flex flex-row-reverse items-center gap-4 mb-4 relative z-10 text-right">
              <BladerAvatar
                blader={bladerB}
                size="xl"
                cornerColor="blue"
                showBadge={true}
                badgeText="BLUE"
              />
              <div className="flex-1 min-w-0">
                <p className="font-label-caps text-xs text-[#0284C7] dark:text-[#38bdf8] uppercase font-black tracking-wider">
                  Esquina Azul {bladerB?.team ? `• ${bladerB.team}` : ''}
                </p>
                <h3 className="font-headline font-black text-2xl md:text-3xl text-slate-900 dark:text-white uppercase truncate">
                  {bladerB?.name || 'Esquina Azul'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-label-caps uppercase truncate">
                  {currentComboB?.name || (bladerB?.combos?.length ? bladerB.combos[0].name : 'Configuración de Combate')}
                </p>
              </div>
            </div>

            {/* Combo selector chips (if combos available) */}
            {bladerB && bladerB.combos && bladerB.combos.length > 0 && (
              <div className="flex items-center justify-end gap-1.5 mb-4 p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-label-caps text-slate-500 uppercase px-1 font-bold">
                  Deck:
                </span>
                {bladerB.combos.map((combo) => (
                  <button
                    key={combo.slot}
                    onClick={() => setSelectedComboSlotB(combo.slot)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-label-caps uppercase truncate transition-all ${
                      selectedComboSlotB === combo.slot
                        ? 'bg-[#0284C7] text-white font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10'
                    }`}
                  >
                    {combo.blade.substring(0, 8)}
                  </button>
                ))}
              </div>
            )}

            {/* Large Score Display */}
            <div className="flex justify-center items-center py-5 my-2 bg-sky-50/70 dark:bg-sky-950/20 rounded-2xl border-2 border-sky-200 dark:border-sky-900/40 shadow-inner">
              <div className="text-center">
                <span className="block text-slate-500 dark:text-slate-400 font-label-caps text-xs uppercase tracking-widest font-black mb-1">
                  PUNTOS
                </span>
                <span
                  id="score-display-b"
                  className="font-headline font-black text-6xl md:text-8xl text-[#0284C7] dark:text-[#38bdf8] leading-none drop-shadow-sm tracking-tighter inline-block"
                >
                  {currentMatch.scoreB}
                </span>
              </div>
            </div>

            {/* Tactical Scoring Controls */}
            <div className="space-y-2.5 mt-4">
              {/* Xtreme Finish (3 PTS) */}
              <button
                id="btn-blue-xtreme-finish"
                disabled={isMatchFinished}
                onClick={() => handlePointClick('B', 'xtreme', config.victoryConditions.xtremeDashPts)}
                className={`w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-3 px-4 rounded-xl flex items-center justify-between font-label-caps uppercase tracking-wider font-black shadow-md shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-sky-900 ${
                  isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">bolt</span>
                  <span>XTREME FINISH</span>
                </div>
                <span className="bg-black/25 px-2.5 py-0.5 rounded-lg text-xs font-mono">
                  +{config.victoryConditions.xtremeDashPts} PTS
                </span>
              </button>

              {/* Burst Finish & Over Finish (2 PTS each) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-blue-burst-finish"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('B', 'burst', config.victoryConditions.burstFinishPts)}
                  className={`bg-[#D97706] hover:bg-[#B45309] text-white py-2.5 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-amber-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>BURST FINISH</span>
                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.burstFinishPts} PTS
                  </span>
                </button>

                <button
                  id="btn-blue-over-finish"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('B', 'over', config.victoryConditions.overFinishPts)}
                  className={`bg-[#16A34A] hover:bg-[#15803D] text-white py-2.5 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-green-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>OVER FINISH</span>
                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.overFinishPts} PTS
                  </span>
                </button>
              </div>

              {/* Stadium Out & Spin Finish */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-blue-stadium-out"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('B', 'stadium', config.victoryConditions.stadiumOutPts)}
                  className={`bg-slate-600 hover:bg-slate-700 text-white py-2 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm transition-all border-b-4 border-slate-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>STADIUM OUT</span>
                  <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.stadiumOutPts} PTS
                  </span>
                </button>

                <button
                  id="btn-blue-spin-finish"
                  disabled={isMatchFinished}
                  onClick={() => handlePointClick('B', 'spin', config.victoryConditions.spinFinishPts)}
                  className={`bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 px-3 rounded-xl flex flex-col items-center justify-center font-label-caps uppercase font-bold text-xs shadow-sm transition-all border-b-4 border-sky-900 ${
                    isMatchFinished ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                  }`}
                >
                  <span>SPIN FINISH</span>
                  <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded mt-0.5 font-mono">
                    +{config.victoryConditions.spinFinishPts} PTS
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Point Logs Stream */}
      {showEventLog && currentMatch.events && currentMatch.events.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-[#bec7d3]/30 dark:border-white/10">
          <div className="flex items-center justify-between mb-3 border-b border-[#bec7d3]/30 dark:border-white/10 pb-2">
            <h4 className="font-headline font-black text-sm uppercase text-[#1a1c1e] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#04A8FC]">history</span>
              <span>Historial de Puntos del Combate</span>
            </h4>
            <span className="text-xs font-label-caps text-gray-500">
              {currentMatch.events.length} Eventos Registrados
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {currentMatch.events.slice().reverse().map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-label-caps"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono text-[10px]">{ev.timestamp}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                      ev.bladerCorner === 'A' ? 'bg-[#AC191F] text-white' : 'bg-[#04A8FC] text-white'
                    }`}
                  >
                    {ev.bladerCorner === 'A' ? 'ESQUINA ROJA' : 'ESQUINA AZUL'}
                  </span>
                  <span className="font-bold text-[#1a1c1e] dark:text-white">{ev.bladerName}</span>
                  <span className="text-gray-600 dark:text-gray-300">{ev.description}</span>
                </div>
                <div className="font-headline font-bold text-sm text-[#04A8FC]">
                  {ev.scoreAAfter} - {ev.scoreBAfter}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ON DECK (Siguiente Enfrentamiento) Section - Only if there are other bladers available */}
      {remainingBladers.length >= 2 && onDeckA && onDeckB && (
        <div className="glass-panel p-5 rounded-2xl border border-[#bec7d3]/30 dark:border-white/10 relative overflow-hidden bg-gradient-to-r from-transparent via-[#04A8FC]/5 to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <span className="text-[10px] font-label-caps text-[#04A8FC] uppercase tracking-widest font-bold">
                LISTO EN BANQUILLO
              </span>
              <h3 className="font-headline font-black text-xl text-[#1a1c1e] dark:text-white uppercase italic">
                ON DECK (Siguiente Duelo)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-randomize-on-deck"
                onClick={() => {
                  soundManager.playClick();
                  onRandomizeOnDeck();
                }}
                className="bg-white dark:bg-white/10 border border-[#04A8FC] text-[#04A8FC] dark:text-white px-3.5 py-1.5 rounded-xl font-label-caps text-xs uppercase tracking-wider hover:bg-[#04A8FC]/10 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">casino</span>
                <span>Aleatorizar</span>
              </button>
              <button
                id="btn-load-on-deck"
                onClick={() => {
                  if (onDeckA && onDeckB) {
                    soundManager.playClick();
                    onSelectOnDeckMatch(onDeckA.id, onDeckB.id);
                  }
                }}
                className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-4 py-1.5 rounded-xl font-label-caps text-xs uppercase tracking-wider font-bold shadow-md shadow-[#04A8FC]/20 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                <span>Cargar en Consola</span>
              </button>
            </div>
          </div>

          {/* On Deck Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Blader Left */}
            <div className="bg-white dark:bg-[#191922] p-4 rounded-xl flex items-center gap-4 border-l-4 border-[#AC191F] shadow-sm">
              <BladerAvatar blader={onDeckA} size="md" cornerColor="red" />
              <div className="min-w-0 flex-1">
                <p className="font-label-caps text-[10px] text-gray-500 uppercase">
                  {onDeckA.team || 'Equipo / Solo'}
                </p>
                <h4 className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white truncate">
                  {onDeckA.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-label-caps truncate">
                  {onDeckA.combos?.[0]?.name || 'Deck Registrado'}
                </p>
              </div>
            </div>

            {/* VS Divider */}
            <div className="text-center font-headline font-black text-xl text-gray-400 dark:text-gray-600 italic">
              VS
            </div>

            {/* Blader Right */}
            <div className="bg-white dark:bg-[#191922] p-4 rounded-xl flex items-center gap-4 border-r-4 border-[#04A8FC] flex-row-reverse text-right shadow-sm">
              <BladerAvatar blader={onDeckB} size="md" cornerColor="blue" />
              <div className="min-w-0 flex-1">
                <p className="font-label-caps text-[10px] text-gray-500 uppercase">
                  {onDeckB.team || 'Equipo / Solo'}
                </p>
                <h4 className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white truncate">
                  {onDeckB.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-label-caps truncate">
                  {onDeckB.combos?.[0]?.name || 'Deck Registrado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
