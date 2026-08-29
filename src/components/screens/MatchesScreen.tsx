import React, { useState } from 'react';
import { Match, Blader } from '../../types';
import { soundManager } from '../../utils/audio';
import { BladerAvatar } from '../BladerAvatar';

interface MatchesScreenProps {
  matches: Match[];
  allBladers: Blader[];
  onSelectMatchForConsole: (match: Match) => void;
  onAddNewMatch: (bladerAId: string, bladerBId: string, roundName: string) => void;
  onQuickAddMatchByName?: (nameA: string, nameB: string, roundName: string) => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  matches,
  allBladers,
  onSelectMatchForConsole,
  onAddNewMatch,
  onQuickAddMatchByName
}) => {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newBladerA, setNewBladerA] = useState<string>(allBladers[0]?.id || '');
  const [newBladerB, setNewBladerB] = useState<string>(allBladers[1]?.id || '');
  const [customNameA, setCustomNameA] = useState<string>('');
  const [customNameB, setCustomNameB] = useState<string>('');
  const [newRound, setNewRound] = useState<string>('Ronda Clasificatoria');

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (allBladers.length >= 2) {
      if (!newBladerA || !newBladerB || newBladerA === newBladerB) {
        alert('Por favor selecciona dos bladers diferentes.');
        return;
      }
      soundManager.playClick();
      onAddNewMatch(newBladerA, newBladerB, newRound);
    } else {
      const finalA = customNameA.trim() || 'Blader Rojo';
      const finalB = customNameB.trim() || 'Blader Azul';
      soundManager.playClick();
      if (onQuickAddMatchByName) {
        onQuickAddMatchByName(finalA, finalB, newRound);
      }
    }
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-4">
        <div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight mb-2">
            TOURNAMENT MATCHES
          </h1>
          <p className="font-body-text text-base text-gray-600 dark:text-gray-400">
            Programación de partidas, marcadores en tiempo real y fixture del torneo.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            setNewBladerA(allBladers[0]?.id || '');
            setNewBladerB(allBladers[1]?.id || '');
            setShowAddModal(true);
          }}
          className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase flex items-center gap-2 shadow-md shadow-[#04A8FC]/20 transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Programar Enfrentamiento</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#bec7d3]/30 dark:border-white/10 pb-3 overflow-x-auto">
        {(['all', 'live', 'upcoming', 'finished'] as const).map((tab) => {
          const labels = {
            all: 'Todos los Combates',
            live: 'En Vivo',
            upcoming: 'Próximos',
            finished: 'Finalizados'
          };
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                soundManager.playClick();
                setFilter(tab);
              }}
              className={`px-4 py-2 rounded-xl font-label-caps text-xs uppercase tracking-wider font-bold transition-all ${
                isActive
                  ? 'bg-[#04A8FC] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-dashed border-[#bec7d3]/40 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#04A8FC]/10 border border-[#04A8FC]/30 flex items-center justify-center text-[#04A8FC] mx-auto">
            <span className="material-symbols-outlined text-3xl">sports_kabaddi</span>
          </div>
          <h3 className="font-headline font-black text-xl uppercase text-[#1a1c1e] dark:text-white">
            Sin Combates Programados
          </h3>
          <p className="font-body-text text-sm text-gray-500 max-w-md mx-auto">
            No hay enfrentamientos en este filtro. Puedes crear un nuevo enfrentamiento haciendo clic en el botón inferior.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-6 py-2.5 rounded-xl font-headline font-bold text-xs uppercase shadow-md shadow-[#04A8FC]/20"
          >
            Programar Primer Duelo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((match) => {
            const isLive = match.status === 'live';
            const isFinished = match.status === 'finished';

            return (
              <div
                key={match.id}
                className={`glass-panel p-5 rounded-2xl border transition-all relative overflow-hidden group shadow-sm ${
                  isLive
                    ? 'border-[#39FF14] ring-2 ring-[#39FF14]/20'
                    : 'border-[#bec7d3]/40 dark:border-white/10'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-1 font-label-caps text-xs uppercase font-bold text-gray-500 mb-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-2">
                  <span className="text-[#04A8FC] font-black">{match.roundName}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        isLive
                          ? 'bg-[#39FF14] text-black animate-pulse'
                          : isFinished
                          ? 'bg-blue-600 text-white'
                          : 'bg-black/10 dark:bg-white/10 text-gray-500'
                      }`}
                    >
                      {isLive ? '🔴 EN VIVO' : isFinished ? 'FINALIZADO' : 'PROGRAMADO'}
                    </span>
                    <span className="text-gray-400 font-normal text-[10px] sm:text-xs">
                      {match.targetScore} PTS
                    </span>
                  </div>
                </div>

                {/* Combatants VS Row */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {/* Blader A */}
                  <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
                    <BladerAvatar blader={match.bladerA} size="sm" cornerColor="red" />
                    <div className="min-w-0 flex-1">
                      <p className="font-headline font-bold text-xs sm:text-sm uppercase text-[#1a1c1e] dark:text-white truncate">
                        {match.bladerA?.name || 'Esquina Roja'}
                      </p>
                      <p className="font-label-caps text-[9px] sm:text-[10px] text-gray-500 uppercase truncate">
                        {match.bladerA?.team || 'Solo'}
                      </p>
                    </div>
                  </div>

                  {/* Score / VS Center */}
                  <div className="px-2 sm:px-3 text-center flex-shrink-0">
                    <div className="font-headline font-black text-xl sm:text-2xl text-[#1a1c1e] dark:text-white leading-none">
                      {match.scoreA} - {match.scoreB}
                    </div>
                    <span className="font-label-caps text-[9px] text-gray-400 uppercase font-bold">
                      VS
                    </span>
                  </div>

                  {/* Blader B */}
                  <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 min-w-0 text-right flex-row-reverse">
                    <BladerAvatar blader={match.bladerB} size="sm" cornerColor="blue" />
                    <div className="min-w-0 flex-1">
                      <p className="font-headline font-bold text-xs sm:text-sm uppercase text-[#1a1c1e] dark:text-white truncate">
                        {match.bladerB?.name || 'Esquina Azul'}
                      </p>
                      <p className="font-label-caps text-[9px] sm:text-[10px] text-gray-500 uppercase truncate">
                        {match.bladerB?.team || 'Solo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Winner Note if finished */}
                {isFinished && match.winnerName && (
                  <div className="bg-[#04A8FC]/10 border border-[#04A8FC]/30 rounded-lg px-3 py-1.5 mb-3 flex items-center justify-between text-xs font-label-caps uppercase">
                    <span className="text-gray-500">Ganador:</span>
                    <span className="font-bold text-[#04A8FC] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">trophy</span>
                      <span>{match.winnerName}</span>
                    </span>
                  </div>
                )}

                {/* Action */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onSelectMatchForConsole(match);
                  }}
                  className="w-full py-2.5 px-4 bg-[#04A8FC] hover:bg-[#008fe0] text-white rounded-xl font-headline font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
                >
                  <span className="material-symbols-outlined text-base">sports_kabaddi</span>
                  <span>{isLive ? 'Abrir Consola en Vivo' : 'Cargar en Battle Console'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to add new match */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15151c] border border-[#bec7d3]/40 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
              <h3 className="font-headline font-bold text-lg uppercase text-[#1a1c1e] dark:text-white">
                Programar Enfrentamiento
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div>
                <label className="block text-xs font-label-caps uppercase font-bold text-gray-500 mb-1">
                  Ronda o Fase
                </label>
                <input
                  type="text"
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  placeholder="Ej. Ronda 1, Cuartos, Semifinal"
                  className="w-full bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1a1c1e] dark:text-white font-headline"
                />
              </div>

              {allBladers.length >= 2 ? (
                <>
                  <div>
                    <label className="block text-xs font-label-caps uppercase font-bold text-[#AC191F] mb-1">
                      Blader Esquina Roja
                    </label>
                    <select
                      value={newBladerA}
                      onChange={(e) => setNewBladerA(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1a1c1e] dark:text-white font-headline"
                    >
                      {allBladers.map((b) => (
                        <option key={b.id} value={b.id} className="bg-white dark:bg-[#15151c]">
                          {b.name} ({b.team})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-label-caps uppercase font-bold text-[#04A8FC] mb-1">
                      Blader Esquina Azul
                    </label>
                    <select
                      value={newBladerB}
                      onChange={(e) => setNewBladerB(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1a1c1e] dark:text-white font-headline"
                    >
                      {allBladers.map((b) => (
                        <option key={b.id} value={b.id} className="bg-white dark:bg-[#15151c]">
                          {b.name} ({b.team})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-label-caps uppercase font-bold text-[#AC191F] mb-1">
                      Nombre Blader Esquina Roja
                    </label>
                    <input
                      type="text"
                      value={customNameA}
                      onChange={(e) => setCustomNameA(e.target.value)}
                      placeholder="Nombre Blader Rojo"
                      className="w-full bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1a1c1e] dark:text-white font-headline"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label-caps uppercase font-bold text-[#04A8FC] mb-1">
                      Nombre Blader Esquina Azul
                    </label>
                    <input
                      type="text"
                      value={customNameB}
                      onChange={(e) => setCustomNameB(e.target.value)}
                      placeholder="Nombre Blader Azul"
                      className="w-full bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1a1c1e] dark:text-white font-headline"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#bec7d3]/30 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-label-caps uppercase text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-5 py-2 rounded-xl text-xs font-headline font-bold uppercase shadow-sm"
                >
                  Crear Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
