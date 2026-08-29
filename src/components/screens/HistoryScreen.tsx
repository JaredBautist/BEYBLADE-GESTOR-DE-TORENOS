import React, { useState } from 'react';
import { Blader, TournamentRecord } from '../../types';
import { soundManager } from '../../utils/audio';
import { BladerAvatar } from '../BladerAvatar';

interface HistoryScreenProps {
  bladers: Blader[];
  history: TournamentRecord[];
  onAddHistoryRecord?: (record: TournamentRecord) => void;
  onDeleteHistoryRecord?: (id: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  bladers,
  history,
  onDeleteHistoryRecord
}) => {
  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'tournaments'>('hall_of_fame');
  const [selectedTournamentRecap, setSelectedTournamentRecap] = useState<TournamentRecord | null>(null);

  // Aggregate stats across ALL archived tournaments in history + current bladers
  const bladerStatsMap = new Map<
    string,
    {
      name: string;
      tournamentsWon: number;
      runnerUps: number;
      matchesWon: number;
      pointsScored: number;
      xtremeFinishes: number;
      burstFinishes: number;
    }
  >();

  // 1. Initialize from current bladers
  bladers.forEach((b) => {
    const key = b.name.trim().toLowerCase();
    bladerStatsMap.set(key, {
      name: b.name.trim(),
      tournamentsWon: 0,
      runnerUps: 0,
      matchesWon: b.stats?.wins || 0,
      pointsScored: b.stats?.pointsScored || 0,
      xtremeFinishes: b.stats?.xtremeFinishes || 0,
      burstFinishes: b.stats?.burstFinishes || 0
    });
  });

  // 2. Aggregate from all completed tournaments in history
  history.forEach((t) => {
    // Winner (Champion)
    if (t.winnerName) {
      const key = t.winnerName.trim().toLowerCase();
      const existing = bladerStatsMap.get(key) || {
        name: t.winnerName.trim(),
        tournamentsWon: 0,
        runnerUps: 0,
        matchesWon: 0,
        pointsScored: 0,
        xtremeFinishes: 0,
        burstFinishes: 0
      };
      existing.tournamentsWon += 1;
      bladerStatsMap.set(key, existing);
    }

    // Runner Up
    if (t.runnerUpName) {
      const key = t.runnerUpName.trim().toLowerCase();
      const existing = bladerStatsMap.get(key) || {
        name: t.runnerUpName.trim(),
        tournamentsWon: 0,
        runnerUps: 0,
        matchesWon: 0,
        pointsScored: 0,
        xtremeFinishes: 0,
        burstFinishes: 0
      };
      existing.runnerUps += 1;
      bladerStatsMap.set(key, existing);
    }

    // Matches in history summary
    if (t.matchesSummary && Array.isArray(t.matchesSummary)) {
      t.matchesSummary.forEach((m) => {
        if (m.winner) {
          const wKey = m.winner.trim().toLowerCase();
          const existingW = bladerStatsMap.get(wKey) || {
            name: m.winner.trim(),
            tournamentsWon: 0,
            runnerUps: 0,
            matchesWon: 0,
            pointsScored: 0,
            xtremeFinishes: 0,
            burstFinishes: 0
          };
          existingW.matchesWon += 1;
          bladerStatsMap.set(wKey, existingW);
        }
        if (m.bladerA && typeof m.scoreA === 'number') {
          const aKey = m.bladerA.trim().toLowerCase();
          const existingA = bladerStatsMap.get(aKey) || {
            name: m.bladerA.trim(),
            tournamentsWon: 0,
            runnerUps: 0,
            matchesWon: 0,
            pointsScored: 0,
            xtremeFinishes: 0,
            burstFinishes: 0
          };
          existingA.pointsScored += m.scoreA;
          bladerStatsMap.set(aKey, existingA);
        }
        if (m.bladerB && typeof m.scoreB === 'number') {
          const bKey = m.bladerB.trim().toLowerCase();
          const existingB = bladerStatsMap.get(bKey) || {
            name: m.bladerB.trim(),
            tournamentsWon: 0,
            runnerUps: 0,
            matchesWon: 0,
            pointsScored: 0,
            xtremeFinishes: 0,
            burstFinishes: 0
          };
          existingB.pointsScored += m.scoreB;
          bladerStatsMap.set(bKey, existingB);
        }
      });
    }
  });

  const allActiveBladers = Array.from(bladerStatsMap.values()).filter(
    (b) =>
      b.tournamentsWon > 0 ||
      b.matchesWon > 0 ||
      b.pointsScored > 0 ||
      b.xtremeFinishes > 0 ||
      b.burstFinishes > 0
  );

  const sortedByTitles = [...allActiveBladers].sort(
    (a, b) => b.tournamentsWon - a.tournamentsWon || b.matchesWon - a.matchesWon
  );
  const sortedByWins = [...allActiveBladers].sort(
    (a, b) => b.matchesWon - a.matchesWon || b.tournamentsWon - a.tournamentsWon
  );
  const sortedByPoints = [...allActiveBladers].sort((a, b) => b.pointsScored - a.pointsScored);
  const sortedByXtreme = [...allActiveBladers].sort((a, b) => b.xtremeFinishes - a.xtremeFinishes);

  const officialTournaments = history;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl md:text-5xl text-slate-900 dark:text-white uppercase tracking-tight mb-1">
            HISTORIAL & HALL OF FAME
          </h1>
          <p className="font-body-text text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
            Registros inmutables de torneos culminados, cuadros de honor y líderes históricos en Cúcuta.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-label-caps text-xs uppercase font-black shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Archivo Histórico 100% Automatizado</span>
        </div>
      </div>

      {/* Tabs Navigation (Responsive scroll/wrap) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-white/5 rounded-2xl w-full sm:w-fit overflow-x-auto max-w-full no-scrollbar">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('hall_of_fame');
          }}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl font-headline font-black text-xs uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'hall_of_fame'
              ? 'bg-[#04A8FC] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">emoji_events</span>
          <span>Hall of Fame & Récords</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('tournaments');
          }}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl font-headline font-black text-xs uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'tournaments'
              ? 'bg-[#04A8FC] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">military_tech</span>
          <span>Torneos Culminados ({officialTournaments.length})</span>
        </button>
      </div>

      {/* TAB 1: HALL OF FAME */}
      {activeTab === 'hall_of_fame' && (
        allActiveBladers.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3 bg-white dark:bg-[#15151c]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl">military_tech</span>
            </div>
            <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
              Salón de la Fama en Espera
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Aún no hay estadísticas acumuladas de combate. Los líderes en victorias, campeonatos, X-Dash y puntuación total aparecerán automáticamente aquí conforme se disputen los duelos reales.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Títulos de Campeón Oficiales */}
            <div className="glass-panel p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-md">
                  <span className="material-symbols-outlined">military_tech</span>
                </div>
                <div>
                  <h4 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white">
                    Títulos de Campeón
                  </h4>
                  <p className="text-[10px] font-label-caps text-slate-500 uppercase">
                    Trofeos de Torneo Ganados
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {sortedByTitles.slice(0, 5).map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                  >
                    <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                      #{i + 1} {b.name}
                    </span>
                    <span className="font-headline font-black text-amber-500 flex-shrink-0">
                      {b.tournamentsWon} 🏆
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Wins */}
            <div className="glass-panel p-5 rounded-3xl border border-[#04A8FC]/40 bg-gradient-to-b from-[#04A8FC]/10 to-transparent shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#04A8FC] text-white flex items-center justify-center font-bold shadow-md">
                  <span className="material-symbols-outlined">swords</span>
                </div>
                <div>
                  <h4 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white">
                    Récord de Victorias
                  </h4>
                  <p className="text-[10px] font-label-caps text-slate-500 uppercase">
                    Líderes en duelos ganados
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {sortedByWins.slice(0, 5).map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                  >
                    <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                      #{i + 1} {b.name}
                    </span>
                    <span className="font-headline font-black text-[#04A8FC] flex-shrink-0">
                      {b.matchesWon} Wins
                    </span>
                  </div>
                ))}
              </div>
            </div>

          {/* Most Xtreme Finishes */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-[#04A8FC]/40 bg-gradient-to-b from-[#04A8FC]/10 to-transparent shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#04A8FC] text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white truncate">
                  Reyes del X-Dash (+3)
                </h4>
                <p className="text-[10px] font-label-caps text-slate-500 uppercase truncate">
                  Mayor número de Xtreme Finishes
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {sortedByXtreme.slice(0, 5).map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                    #{i + 1} {b.name}
                  </span>
                  <span className="font-headline font-black text-[#04A8FC] flex-shrink-0">
                    {b.xtremeFinishes} X-Finishes
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Points Scored */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-transparent shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                <span className="material-symbols-outlined">scoreboard</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white truncate">
                  Puntuación Total
                </h4>
                <p className="text-[10px] font-label-caps text-slate-500 uppercase truncate">
                  Puntos oficiales sumados
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {sortedByPoints.slice(0, 5).map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                    #{i + 1} {b.name}
                  </span>
                  <span className="font-headline font-black text-purple-500 flex-shrink-0">
                    {b.pointsScored} Pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* TAB 2: TOURNAMENTS HISTORY */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          {officialTournaments.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3 bg-white dark:bg-[#15151c]">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">emoji_events</span>
              </div>
              <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                No hay torneos archivados todavía
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cuando finalices un torneo en la consola o uses el botón de <strong>Reiniciar Torneo &gt; Archivar en Historial</strong>, los resultados quedarán guardados permanentemente aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {officialTournaments.map((t) => (
                <div
                  key={t.id}
                  className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#15151c] shadow-sm hover:border-amber-500/50 transition-all space-y-4 relative group"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-label-caps uppercase text-amber-500 font-bold block">
                        Torneo Oficial • {t.date}
                      </span>
                      <h4 className="font-headline font-black text-base sm:text-lg uppercase text-slate-900 dark:text-white truncate">
                        {t.title}
                      </h4>
                    </div>

                    {onDeleteHistoryRecord && (
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onDeleteHistoryRecord(t.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 transition-opacity ml-2 flex-shrink-0"
                        title="Eliminar registro"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>

                  {/* Winner Banner */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold shadow flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">military_tech</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-label-caps uppercase text-amber-600 dark:text-amber-400 font-bold block">
                          Campeón del Torneo
                        </span>
                        <h5 className="font-headline font-black text-sm sm:text-base uppercase text-slate-900 dark:text-white truncate">
                          {t.winnerName}
                        </h5>
                      </div>
                    </div>

                    {t.runnerUpName && (
                      <div className="sm:text-right pl-13 sm:pl-0">
                        <span className="text-[10px] font-label-caps uppercase text-slate-400 font-bold block">
                          Subcampeón
                        </span>
                        <span className="font-headline font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                          {t.runnerUpName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs font-label-caps uppercase pt-1">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 min-w-0">
                      <span className="text-slate-400 block text-[9px] truncate">Participantes</span>
                      <span className="font-black text-slate-900 dark:text-white text-[11px] sm:text-xs block truncate">{t.totalBladers} Bladers</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 min-w-0">
                      <span className="text-slate-400 block text-[9px] truncate">Combates</span>
                      <span className="font-black text-slate-900 dark:text-white text-[11px] sm:text-xs block truncate">{t.totalMatches} Duelos</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 min-w-0">
                      <span className="text-slate-400 block text-[9px] truncate">Puntos</span>
                      <span className="font-black text-[#04A8FC] text-[11px] sm:text-xs block truncate">{t.totalPoints} Pts</span>
                    </div>
                  </div>

                  {/* Detailed match encounters list directly inside card */}
                  {t.matchesSummary && t.matchesSummary.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-label-caps uppercase text-slate-500 font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-[#04A8FC]">sports_kabaddi</span>
                          <span>Detalle de Enfrentamientos ({t.matchesSummary.length})</span>
                        </span>
                        <span className="text-[9px] font-label-caps uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-black">
                          {t.format === 'series' ? 'Serie 1 Ronda' : 'Bracket'}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {t.matchesSummary.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs gap-2"
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-slate-500 flex-shrink-0">
                                {m.roundName || `#${mIdx + 1}`}
                              </span>
                              <div className="truncate text-[11px] font-headline font-bold uppercase">
                                <span className={m.winner === m.bladerA ? 'text-amber-500 font-black' : 'text-slate-700 dark:text-slate-300'}>
                                  {m.bladerA} ({m.scoreA})
                                </span>
                                <span className="text-slate-400 mx-1 font-mono text-[9px]">vs</span>
                                <span className={m.winner === m.bladerB ? 'text-amber-500 font-black' : 'text-slate-700 dark:text-slate-300'}>
                                  {m.bladerB} ({m.scoreB})
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-headline font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                              <span className="material-symbols-outlined text-[10px]">crown</span>
                              <span className="max-w-[65px] truncate">{m.winner}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recap Action Buttons */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setRecapViewMode('bracket');
                        setSelectedTournamentRecap(t);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] font-headline font-black uppercase text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl py-2 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">account_tree</span>
                      <span>Ver Árbol Bracket</span>
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setRecapViewMode('summary');
                        setSelectedTournamentRecap(t);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] font-headline font-bold uppercase text-[#04A8FC] bg-[#04A8FC]/10 hover:bg-[#04A8FC]/20 border border-[#04A8FC]/30 rounded-xl py-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>Recapitulativo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* TOURNAMENT RECAP & BRACKET MODAL (READ-ONLY ARCHIVE VIEW) */}
      {selectedTournamentRecap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white dark:bg-[#15151c] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 my-auto max-h-[94vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3 sm:pb-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] sm:text-[10px] font-label-caps uppercase font-black">
                    {selectedTournamentRecap.season || 'Temporada Oficial'} • {selectedTournamentRecap.date}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#04A8FC]/10 text-[#04A8FC] border border-[#04A8FC]/20 text-[9px] sm:text-[10px] font-label-caps uppercase font-bold">
                    {selectedTournamentRecap.format === 'series'
                      ? 'Serie (1 Ronda)'
                      : selectedTournamentRecap.format === 'elimination'
                      ? 'Bracket Eliminación'
                      : 'Liga Puntos'}
                  </span>
                </div>
                <h2 className="font-headline font-black text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white uppercase tracking-tight break-words">
                  {selectedTournamentRecap.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setSelectedTournamentRecap(null);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">close</span>
              </button>
            </div>

            {/* View Mode Switcher: Tree Bracket vs Match List */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setRecapViewMode('bracket');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase transition-all flex items-center gap-1.5 ${
                    recapViewMode === 'bracket'
                      ? 'bg-amber-500 text-black shadow-md font-black'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">account_tree</span>
                  <span>Árbol del Bracket (Visual)</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setRecapViewMode('summary');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase transition-all flex items-center gap-1.5 ${
                    recapViewMode === 'summary'
                      ? 'bg-[#04A8FC] text-white shadow-md font-black'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">list_alt</span>
                  <span>Lista de Duelos & Métricas</span>
                </button>
              </div>

              <span className="text-[10px] font-label-caps uppercase text-amber-600 dark:text-amber-400 font-bold">
                Archivo Inmutable • Registro Oficial
              </span>
            </div>

            {/* TAB CONTENT: VISUAL BRACKET TREE */}
            {recapViewMode === 'bracket' && (
              <div className="space-y-4 animate-fade-in">
                {/* Visual Tree Canvas */}
                <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/60 overflow-x-auto min-h-[320px] flex items-center shadow-inner relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#04A8FC_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

                  {selectedTournamentRecap.matchesSummary && selectedTournamentRecap.matchesSummary.length > 0 ? (
                    <div className="flex items-center gap-6 sm:gap-10 min-w-max mx-auto py-2">
                      {/* Group matches by base round */}
                      {(() => {
                        const roundMap: { [key: string]: typeof selectedTournamentRecap.matchesSummary } = {};
                        const roundOrder: string[] = [];

                        selectedTournamentRecap.matchesSummary.forEach((m) => {
                          const rName = m.roundName || 'Duelo';
                          const cleanName = rName.replace(/\s*-\s*Duelo\s*\d+/i, '').trim();
                          if (!roundMap[cleanName]) {
                            roundMap[cleanName] = [];
                            roundOrder.push(cleanName);
                          }
                          roundMap[cleanName].push(m);
                        });

                        return roundOrder.map((roundName, rIdx) => (
                          <div key={roundName} className="space-y-4 flex flex-col justify-around min-w-[220px] sm:min-w-[260px]">
                            {/* Round Column Header */}
                            <div className="text-center pb-2 border-b border-slate-700">
                              <span className="text-[10px] font-label-caps uppercase font-black tracking-widest text-[#04A8FC] bg-[#04A8FC]/10 px-3 py-1 rounded-full border border-[#04A8FC]/30">
                                {roundName}
                              </span>
                            </div>

                            {/* Matches in this round */}
                            <div className="space-y-4">
                              {roundMap[roundName].map((match, mIdx) => (
                                <div
                                  key={mIdx}
                                  className="p-3.5 rounded-2xl bg-[#1a1c23] border border-slate-700/80 shadow-md space-y-2 relative group hover:border-[#04A8FC] transition-all"
                                >
                                  <div className="flex items-center justify-between text-[9px] font-label-caps uppercase text-slate-400 pb-1 border-b border-slate-800 font-bold">
                                    <span>{match.roundName || `Combate #${mIdx + 1}`}</span>
                                    <span className="text-amber-400 font-black">FIN</span>
                                  </div>

                                  {/* Red Corner */}
                                  <div
                                    className={`flex items-center justify-between p-2 rounded-xl text-xs uppercase font-headline font-bold ${
                                      match.winner === match.bladerA
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-black'
                                        : 'bg-white/5 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate min-w-0">
                                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                                      <span className="truncate">{match.bladerA}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {match.winner === match.bladerA && (
                                        <span className="material-symbols-outlined text-xs text-amber-400">crown</span>
                                      )}
                                      <span className="font-mono text-sm">{match.scoreA}</span>
                                    </div>
                                  </div>

                                  {/* Blue Corner */}
                                  <div
                                    className={`flex items-center justify-between p-2 rounded-xl text-xs uppercase font-headline font-bold ${
                                      match.winner === match.bladerB
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-black'
                                        : 'bg-white/5 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate min-w-0">
                                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                      <span className="truncate">{match.bladerB}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {match.winner === match.bladerB && (
                                        <span className="material-symbols-outlined text-xs text-amber-400">crown</span>
                                      )}
                                      <span className="font-mono text-sm">{match.scoreB}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}

                      {/* Final Grand Champion Pillar */}
                      <div className="flex flex-col items-center justify-center min-w-[200px] pl-4 border-l-2 border-dashed border-amber-500/30">
                        <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent border-2 border-amber-400/80 shadow-2xl text-center space-y-3 relative overflow-hidden">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black mx-auto shadow-lg shadow-amber-500/30 animate-pulse">
                            <span className="material-symbols-outlined text-3xl">emoji_events</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-label-caps uppercase text-amber-400 font-black tracking-widest block">
                              🏆 GRAN CAMPEÓN
                            </span>
                            <h4 className="font-headline font-black text-lg uppercase text-white truncate max-w-[170px]">
                              {selectedTournamentRecap.winnerName}
                            </h4>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                            {selectedTournamentRecap.totalPoints} PTS TOTALES
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs mx-auto">
                      No hay datos de enfrentamientos registrados para generar el árbol de este torneo.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SUMMARY & MATCH LIST */}
            {recapViewMode === 'summary' && (
              <div className="space-y-4 animate-fade-in">
                {/* Honor Podium Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Champion Card */}
                  <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent flex items-center gap-3 sm:gap-4 shadow-md min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shadow-md flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl">military_tech</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] sm:text-[10px] font-label-caps uppercase text-amber-600 dark:text-amber-400 font-black tracking-widest block">
                        🥇 Gran Campeón
                      </span>
                      <h3 className="font-headline font-black text-base sm:text-xl uppercase text-slate-900 dark:text-white truncate">
                        {selectedTournamentRecap.winnerName}
                      </h3>
                    </div>
                  </div>

                  {/* Runner Up Card */}
                  <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center gap-3 sm:gap-4 shadow-sm min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-black shadow-sm flex-shrink-0">
                      <span className="material-symbols-outlined text-xl sm:text-2xl">workspace_premium</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] sm:text-[10px] font-label-caps uppercase text-slate-500 font-bold tracking-widest block">
                        🥈 Subcampeón
                      </span>
                      <h3 className="font-headline font-black text-base sm:text-lg uppercase text-slate-800 dark:text-slate-200 truncate">
                        {selectedTournamentRecap.runnerUpName || 'Por Definir'}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Metrics Overview */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 min-w-0">
                    <span className="text-slate-400 text-[9px] sm:text-[10px] font-label-caps uppercase block truncate">Bladers</span>
                    <span className="font-headline font-black text-sm sm:text-xl text-slate-900 dark:text-white block truncate">
                      {selectedTournamentRecap.totalBladers}
                    </span>
                  </div>
                  <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 min-w-0">
                    <span className="text-slate-400 text-[9px] sm:text-[10px] font-label-caps uppercase block truncate">Combates</span>
                    <span className="font-headline font-black text-sm sm:text-xl text-slate-900 dark:text-white block truncate">
                      {selectedTournamentRecap.totalMatches}
                    </span>
                  </div>
                  <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 min-w-0">
                    <span className="text-slate-400 text-[9px] sm:text-[10px] font-label-caps uppercase block truncate">Puntos</span>
                    <span className="font-headline font-black text-sm sm:text-xl text-[#04A8FC] block truncate">
                      {selectedTournamentRecap.totalPoints}
                    </span>
                  </div>
                </div>

                {/* Match History Table / Grid */}
                <div className="space-y-2.5 sm:space-y-3">
                  <h4 className="font-headline font-black text-xs sm:text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#04A8FC]">sports_kabaddi</span>
                    <span>Detalle Completo de Enfrentamientos Disputados</span>
                  </h4>

                  {selectedTournamentRecap.matchesSummary && selectedTournamentRecap.matchesSummary.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
                      {selectedTournamentRecap.matchesSummary.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between gap-3 text-xs min-w-0 shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 font-headline font-bold uppercase min-w-0 flex-1">
                            <span className="px-2 py-1 rounded-lg bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-black flex-shrink-0">
                              {m.roundName || `#${idx + 1}`}
                            </span>
                            <div className="truncate min-w-0 flex-1 text-[11px] sm:text-xs">
                              <span className={m.winner === m.bladerA ? 'text-amber-500 font-black' : 'text-slate-700 dark:text-slate-300'}>
                                {m.bladerA} ({m.scoreA})
                              </span>
                              <span className="text-slate-400 mx-1.5 font-mono text-[9px]">VS</span>
                              <span className={m.winner === m.bladerB ? 'text-amber-500 font-black' : 'text-slate-700 dark:text-slate-300'}>
                                {m.bladerB} ({m.scoreB})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-headline font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                            <span className="material-symbols-outlined text-xs">crown</span>
                            <span className="max-w-[75px] truncate">{m.winner}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center">
                      Resultados generales consolidados por el juez oficial del torneo.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setSelectedTournamentRecap(null);
                }}
                className="w-full sm:w-auto bg-[#04A8FC] hover:bg-[#008fe0] text-white px-6 py-2.5 rounded-xl text-xs font-headline font-black uppercase tracking-wider shadow-md transition-all text-center"
              >
                Cerrar Recapitulativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
