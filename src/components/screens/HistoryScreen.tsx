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
  onAddHistoryRecord,
  onDeleteHistoryRecord
}) => {
  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'tournaments' | 'casuals'>('hall_of_fame');
  const [showAddCasualModal, setShowAddCasualModal] = useState<boolean>(false);
  const [selectedTournamentRecap, setSelectedTournamentRecap] = useState<TournamentRecord | null>(null);

  // Casual match form state
  const [casualBladerA, setCasualBladerA] = useState<string>(bladers[0]?.name || '');
  const [casualBladerB, setCasualBladerB] = useState<string>(bladers[1]?.name || '');
  const [casualScoreA, setCasualScoreA] = useState<number>(4);
  const [casualScoreB, setCasualScoreB] = useState<number>(2);
  const [casualNotes, setCasualNotes] = useState<string>('Duelo Amistoso Cúcuta');

  const activeBladers = bladers.filter((b) => (b.stats?.matchesPlayed || 0) > 0 || (b.stats?.pointsScored || 0) > 0 || (b.stats?.wins || 0) > 0);
  const sortedByWins = [...activeBladers].sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0));
  const sortedByXtreme = [...activeBladers].sort((a, b) => (b.stats?.xtremeFinishes || 0) - (a.stats?.xtremeFinishes || 0));
  const sortedByBurst = [...activeBladers].sort((a, b) => (b.stats?.burstFinishes || 0) - (a.stats?.burstFinishes || 0));
  const sortedByPoints = [...activeBladers].sort((a, b) => (b.stats?.pointsScored || 0) - (a.stats?.pointsScored || 0));

  const officialTournaments = history.filter((h) => h.type === 'tournament');
  const casualEncounters = history.filter((h) => h.type === 'casual');

  const handleCreateCasualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!casualBladerA.trim() || !casualBladerB.trim() || !onAddHistoryRecord) return;

    soundManager.playScore();

    const winnerName = casualScoreA >= casualScoreB ? casualBladerA.trim() : casualBladerB.trim();
    const runnerUpName = casualScoreA >= casualScoreB ? casualBladerB.trim() : casualBladerA.trim();

    const newRecord: TournamentRecord = {
      id: `casual-${Date.now()}`,
      title: casualNotes.trim() || 'Encuentro Casual',
      date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }),
      type: 'casual',
      format: 'elimination',
      winnerName,
      runnerUpName,
      totalMatches: 1,
      totalBladers: 2,
      totalPoints: casualScoreA + casualScoreB,
      matchesSummary: [
        {
          bladerA: casualBladerA.trim(),
          bladerB: casualBladerB.trim(),
          scoreA: casualScoreA,
          scoreB: casualScoreB,
          winner: winnerName
        }
      ]
    };

    onAddHistoryRecord(newRecord);
    setShowAddCasualModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl md:text-5xl text-slate-900 dark:text-white uppercase tracking-tight mb-1">
            HISTORIAL & HALL OF FAME
          </h1>
          <p className="font-body-text text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
            Registros de torneos culminados, encuentros casuales amistosos y líderes históricos en Cúcuta.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            setShowAddCasualModal(true);
          }}
          className="w-full sm:w-auto justify-center bg-[#04A8FC] hover:bg-[#008fe0] text-white px-4 py-2.5 rounded-xl font-headline font-black text-xs uppercase flex items-center gap-2 shadow-md shadow-[#04A8FC]/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <span className="material-symbols-outlined text-base">sports_kabaddi</span>
          <span>Registrar Encuentro Casual</span>
        </button>
      </div>

      {/* Tabs Navigation (Responsive scroll/wrap) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-white/5 rounded-2xl w-full sm:w-fit overflow-x-auto max-w-full no-scrollbar">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('hall_of_fame');
          }}
          className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-headline font-black text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap ${
            activeTab === 'hall_of_fame'
              ? 'bg-[#04A8FC] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">emoji_events</span>
          <span>Hall of Fame</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('tournaments');
          }}
          className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-headline font-black text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap ${
            activeTab === 'tournaments'
              ? 'bg-[#04A8FC] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">military_tech</span>
          <span>Torneos ({officialTournaments.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('casuals');
          }}
          className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-headline font-black text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap ${
            activeTab === 'casuals'
              ? 'bg-[#04A8FC] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">swords</span>
          <span>Casuales ({casualEncounters.length})</span>
        </button>
      </div>

      {/* TAB 1: HALL OF FAME */}
      {activeTab === 'hall_of_fame' && (
        activeBladers.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3 bg-white dark:bg-[#15151c]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl">military_tech</span>
            </div>
            <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
              Salón de la Fama en Espera
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Aún no hay estadísticas acumuladas de combate. Los líderes en victorias, X-Dash, Bursts y puntuación total aparecerán automáticamente aquí conforme se disputen los duelos reales.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Most Wins */}
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-md">
                <span className="material-symbols-outlined">military_tech</span>
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
                  key={b.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                    #{i + 1} {b.name}
                  </span>
                  <span className="font-headline font-black text-amber-500 flex-shrink-0">
                    {b.stats.wins} Wins
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
                  key={b.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                    #{i + 1} {b.name}
                  </span>
                  <span className="font-headline font-black text-[#04A8FC] flex-shrink-0">
                    {b.stats.xtremeFinishes} X-Finishes
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Burst Finishes */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-[#DC2626]/40 bg-gradient-to-b from-[#DC2626]/10 to-transparent shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                <span className="material-symbols-outlined">explosion</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white truncate">
                  Burst Masters (+2)
                </h4>
                <p className="text-[10px] font-label-caps text-slate-500 uppercase truncate">
                  Desarmadores de Ratchet rival
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {sortedByBurst.slice(0, 5).map((b, i) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                    #{i + 1} {b.name}
                  </span>
                  <span className="font-headline font-black text-[#DC2626] flex-shrink-0">
                    {b.stats.burstFinishes} Bursts
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
                  key={b.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-label-caps uppercase min-w-0"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate min-w-0 flex-1">
                    #{i + 1} {b.name}
                  </span>
                  <span className="font-headline font-black text-purple-500 flex-shrink-0">
                    {b.stats.pointsScored} Pts
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

                  {/* Recap Action Button */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedTournamentRecap(t);
                    }}
                    className="w-full pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-xs font-headline font-bold uppercase text-[#04A8FC] hover:text-[#008fe0] transition-colors py-2"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                    <span>Ver Recapitulativo Completo</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CASUAL ENCOUNTERS */}
      {activeTab === 'casuals' && (
        <div className="space-y-4">
          {casualEncounters.length === 0 ? (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3 bg-white dark:bg-[#15151c]">
              <div className="w-14 h-14 rounded-2xl bg-[#04A8FC]/10 text-[#04A8FC] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">sports_kabaddi</span>
              </div>
              <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                No hay encuentros casuales registrados
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Registra duelos rápidos y combates amistosos entre los miembros de la comunidad para que cuenten en el historial.
              </p>
              <button
                onClick={() => setShowAddCasualModal(true)}
                className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase"
              >
                Registrar Primer Duelo Casual
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {casualEncounters.map((c) => (
                <div
                  key={c.id}
                  className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#15151c] shadow-sm hover:border-[#04A8FC] transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="text-[10px] font-label-caps uppercase text-[#04A8FC] font-bold">
                      Casual • {c.date}
                    </span>
                    {onDeleteHistoryRecord && (
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onDeleteHistoryRecord(c.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-0.5 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>

                  <h5 className="font-headline font-bold text-sm uppercase text-slate-900 dark:text-white truncate">
                    {c.title}
                  </h5>

                  {c.matchesSummary && c.matchesSummary.length > 0 ? (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between font-headline font-bold uppercase text-xs gap-2 min-w-0">
                      <span className={`truncate min-w-0 ${c.matchesSummary[0].winner === c.matchesSummary[0].bladerA ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {c.matchesSummary[0].bladerA} ({c.matchesSummary[0].scoreA})
                      </span>
                      <span className="text-slate-400 font-mono text-[10px] flex-shrink-0">VS</span>
                      <span className={`truncate min-w-0 text-right ${c.matchesSummary[0].winner === c.matchesSummary[0].bladerB ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {c.matchesSummary[0].bladerB} ({c.matchesSummary[0].scoreB})
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs font-headline font-bold uppercase text-emerald-500 truncate">
                      Ganador: {c.winnerName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal to register casual encounter */}
      {showAddCasualModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15151c] border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                REGISTRAR ENCUENTRO CASUAL
              </h3>
              <button
                onClick={() => setShowAddCasualModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCasualRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-label-caps uppercase font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título o Lugar del Duelo
                </label>
                <input
                  type="text"
                  value={casualNotes}
                  onChange={(e) => setCasualNotes(e.target.value)}
                  placeholder="Ej. Reto en Parque Santander"
                  className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-headline focus:ring-2 focus:ring-[#04A8FC] focus:outline-none shadow-sm"
                />
              </div>

              {/* Blader A and Score */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-label-caps uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Blader A
                  </label>
                  <input
                    type="text"
                    required
                    value={casualBladerA}
                    onChange={(e) => setCasualBladerA(e.target.value)}
                    placeholder="Nombre Blader A"
                    className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-headline focus:ring-2 focus:ring-[#04A8FC] shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label-caps uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Puntos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={casualScoreA}
                    onChange={(e) => setCasualScoreA(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold text-center"
                  />
                </div>
              </div>

              {/* Blader B and Score */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-label-caps uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Blader B
                  </label>
                  <input
                    type="text"
                    required
                    value={casualBladerB}
                    onChange={(e) => setCasualBladerB(e.target.value)}
                    placeholder="Nombre Blader B"
                    className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-headline focus:ring-2 focus:ring-[#04A8FC] shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label-caps uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Puntos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={casualScoreB}
                    onChange={(e) => setCasualScoreB(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddCasualModal(false)}
                  className="px-4 py-2 text-xs font-label-caps uppercase font-bold text-slate-600 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-5 py-2 rounded-xl text-xs font-headline font-black uppercase shadow-md transition-all"
                >
                  Guardar Encuentro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOURNAMENT RECAP MODAL (READ-ONLY ARCHIVE VIEW) */}
      {selectedTournamentRecap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#15151c] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3 sm:pb-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] sm:text-[10px] font-label-caps uppercase font-black">
                    {selectedTournamentRecap.season || 'Temporada Oficial'} • {selectedTournamentRecap.date}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#04A8FC]/10 text-[#04A8FC] border border-[#04A8FC]/20 text-[9px] sm:text-[10px] font-label-caps uppercase font-bold">
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

            {/* Read-Only Status Banner */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 flex items-center gap-2.5 sm:gap-3 text-xs text-amber-800 dark:text-amber-300 font-label-caps uppercase">
              <span className="material-symbols-outlined text-base sm:text-lg text-amber-500 flex-shrink-0">lock</span>
              <span className="text-[11px] sm:text-xs leading-tight">
                <strong>Registro Oficial (Solo Lectura):</strong> Resultados oficiales y definitivos de la comunidad.
              </span>
            </div>

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
                <span>Resultados de Combates Disputados</span>
              </h4>

              {selectedTournamentRecap.matchesSummary && selectedTournamentRecap.matchesSummary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
                  {selectedTournamentRecap.matchesSummary.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between gap-2 text-xs min-w-0"
                    >
                      <div className="flex items-center gap-2 font-headline font-bold uppercase min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] sm:text-[10px] font-black flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="truncate min-w-0 flex-1 text-[11px] sm:text-xs">
                          <span className={m.winner === m.bladerA ? 'text-amber-500 font-black' : 'text-slate-700 dark:text-slate-300'}>
                            {m.bladerA} ({m.scoreA})
                          </span>
                          <span className="text-slate-400 mx-1 font-mono text-[9px]">VS</span>
                          <span className={m.winner === m.bladerB ? 'text-amber-500 font-black' : 'text-slate-700 dark:text-slate-300'}>
                            {m.bladerB} ({m.scoreB})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-headline font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                        <span className="material-symbols-outlined text-xs">crown</span>
                        <span className="max-w-[70px] truncate">{m.winner}</span>
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
