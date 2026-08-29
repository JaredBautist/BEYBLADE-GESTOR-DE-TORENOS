import React, { useState } from 'react';
import { Blader, Match, TournamentConfig } from '../../types';
import { soundManager } from '../../utils/audio';
import { BladerAvatar } from '../BladerAvatar';
import { getRankedBladers } from '../../utils/bracketGenerator';

interface BracketScreenProps {
  bladers: Blader[];
  matches: Match[];
  config: TournamentConfig;
  onSelectMatchForConsole: (match: Match) => void;
  onSetMatchWinner: (matchId: string, winnerId: string) => void;
  onGenerateBracket: () => void;
  onGeneratePlayoffs?: () => void;
}

export const BracketScreen: React.FC<BracketScreenProps> = ({
  bladers,
  matches,
  config,
  onSelectMatchForConsole,
  onSetMatchWinner,
  onGenerateBracket,
  onGeneratePlayoffs
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const isRegularPhase = config.type !== 'elimination' && config.tournamentPhase !== 'playoffs';
  const [viewMode, setViewMode] = useState<'standings' | 'tree' | 'rounds'>(
    isRegularPhase ? 'standings' : 'tree'
  );

  const handleCopyLink = () => {
    soundManager.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Group matches by round
  const roundsMap = matches.reduce((acc, match) => {
    const r = match.roundNumber || 1;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
  }, {} as { [round: number]: Match[] });

  const roundNumbers = Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const totalRounds = roundNumbers.length > 0 ? Math.max(...roundNumbers) : 1;

  // Identify final match & champion (only when final match is concluded/finished)
  const finalMatch = matches.find((m) => m.roundNumber === totalRounds) || matches.find((m) => m.roundName?.toLowerCase().includes('final'));
  const champion = (finalMatch?.status === 'finished' && finalMatch?.winnerId)
    ? bladers.find((b) => b.id === finalMatch.winnerId)
    : undefined;

  const renderMatchCard = (match: Match, compact = false) => {
    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';
    const bladerA = match.bladerA;
    const bladerB = match.bladerB;
    const isPlayable = !!bladerA && !!bladerB;

    return (
      <div
        key={match.id}
        className={`glass-panel rounded-2xl transition-all relative overflow-hidden bg-white dark:bg-[#15151e] ${
          isLive
            ? 'border-2 border-[#39FF14] shadow-lg shadow-[#39FF14]/15 ring-2 ring-[#39FF14]/20'
            : isFinished
            ? 'border border-blue-500/30 dark:border-blue-500/20'
            : 'border border-slate-200 dark:border-white/10'
        } ${compact ? 'p-3 text-xs' : 'p-3.5 sm:p-4 text-xs sm:text-sm'}`}
      >
        {/* Node Header */}
        <div className="flex items-center justify-between text-[10px] font-label-caps uppercase font-bold text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-white/5 pb-1.5 gap-2">
          <span className="truncate font-black text-slate-700 dark:text-slate-300">
            {match.roundName || `Duelo #${match.matchNumber}`}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex-shrink-0 flex items-center gap-1 ${
              isLive
                ? 'bg-[#39FF14] text-black animate-pulse font-black'
                : isFinished
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}
          >
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
            {isLive ? 'EN VIVO' : isFinished ? 'FINAL' : 'EN ESPERA'}
          </span>
        </div>

        {/* Blader A Slot (Red Corner) */}
        <div
          onClick={() => {
            if (bladerA && !isFinished) {
              soundManager.playClick();
              onSetMatchWinner(match.id, bladerA.id);
            }
          }}
          className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition-all ${
            match.winnerId === bladerA?.id
              ? 'bg-red-500/20 font-black text-[#DC2626] border border-red-500/40'
              : !bladerA
              ? 'bg-slate-50 dark:bg-white/5 text-slate-400 border border-dashed border-slate-200 dark:border-white/5'
              : 'hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer'
          }`}
          title={bladerA ? 'Clic para declarar ganador' : 'Por definir'}
        >
          <div className="flex items-center gap-2 min-w-0">
            <BladerAvatar blader={bladerA || undefined} size="xs" cornerColor="red" />
            <span className="font-headline font-bold text-xs uppercase truncate text-slate-900 dark:text-white">
              {bladerA?.name || 'Por Definir'}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {match.winnerId === bladerA?.id && (
              <span className="material-symbols-outlined text-xs text-amber-500">crown</span>
            )}
            <span className="font-headline font-black text-xs text-[#DC2626] px-1.5 min-w-[20px] text-right">
              {match.scoreA}
            </span>
          </div>
        </div>

        {/* Blader B Slot (Blue Corner) */}
        <div
          onClick={() => {
            if (bladerB && !isFinished) {
              soundManager.playClick();
              onSetMatchWinner(match.id, bladerB.id);
            }
          }}
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            match.winnerId === bladerB?.id
              ? 'bg-sky-500/20 font-black text-[#0284C7] dark:text-[#38bdf8] border border-sky-500/40'
              : !bladerB
              ? 'bg-slate-50 dark:bg-white/5 text-slate-400 border border-dashed border-slate-200 dark:border-white/5'
              : 'hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer'
          }`}
          title={bladerB ? 'Clic para declarar ganador' : 'Por definir'}
        >
          <div className="flex items-center gap-2 min-w-0">
            <BladerAvatar blader={bladerB || undefined} size="xs" cornerColor="blue" />
            <span className="font-headline font-bold text-xs uppercase truncate text-slate-900 dark:text-white">
              {bladerB?.name || 'Por Definir'}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {match.winnerId === bladerB?.id && (
              <span className="material-symbols-outlined text-xs text-amber-500">crown</span>
            )}
            <span className="font-headline font-black text-xs text-[#0284C7] dark:text-[#38bdf8] px-1.5 min-w-[20px] text-right">
              {match.scoreB}
            </span>
          </div>
        </div>

        {/* Quick action: Load in console */}
        {isPlayable && (
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMatchForConsole(match);
            }}
            className={`w-full mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-headline font-black uppercase flex items-center justify-center gap-1.5 min-h-[32px] transition-colors ${
              isFinished
                ? 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'
                : 'text-[#0284c7] dark:text-[#04A8FC] hover:underline'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isFinished ? 'visibility' : 'sports_kabaddi'}
            </span>
            <span>{isFinished ? 'Ver en Battle Console' : 'Lanzar a Battle Console'}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#04A8FC] animate-pulse"></span>
            <span className="font-label-caps text-xs text-[#04A8FC] uppercase tracking-widest font-bold">
              ÁRBOL EN TIEMPO REAL • {bladers.length} BLADERS
            </span>
          </div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight italic">
            TOURNAMENT BRACKET
          </h1>
          <p className="font-body-text text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Árbol oficial de eliminación directa Comunidad Beyblade Cúcuta. Los ganadores avanzan automáticamente de ronda.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View mode switcher */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-headline font-bold uppercase">
            {config.type !== 'elimination' && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewMode('standings');
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'standings'
                    ? 'bg-[#04A8FC] text-white shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">leaderboard</span>
                <span>Clasificación</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('tree');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-[#1a1a24] text-[#0284c7] dark:text-[#04A8FC] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">account_tree</span>
              <span>Árbol</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('rounds');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'rounds'
                  ? 'bg-white dark:bg-[#1a1a24] text-[#0284c7] dark:text-[#04A8FC] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">view_agenda</span>
              <span>Duelos</span>
            </button>
          </div>

          {bladers.length >= 2 && (
            <button
              onClick={() => {
                soundManager.playClick();
                onGenerateBracket();
              }}
              className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-3.5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#04A8FC]/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">shuffle</span>
              <span>{config.type === 'elimination' ? 'Sortear Bracket' : 'Generar Fase Regular'}</span>
            </button>
          )}

          {viewMode === 'tree' && matches.length > 0 && (
            <div className="glass-panel px-2 py-1 rounded-xl flex items-center gap-1 border-[#bec7d3]/30">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                title="Reducir Zoom"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="text-[10px] font-mono text-gray-500 px-1 font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                title="Aumentar Zoom"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          )}

          <button
            onClick={handleCopyLink}
            className="bg-white dark:bg-[#1f1f25] border border-[#04A8FC] text-[#04A8FC] dark:text-white px-3 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#04A8FC]/10 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">
              {copiedLink ? 'check' : 'share'}
            </span>
            <span className="hidden xs:inline">{copiedLink ? '¡Copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Champion Podium Display */}
      {champion ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-400/50 dark:border-amber-400/30 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <BladerAvatar blader={champion} size="xl" cornerColor="gold" />
              <div>
                <div className="inline-flex items-center gap-1.5 text-amber-500 font-black font-label-caps text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mb-1.5">
                  <span className="material-symbols-outlined text-base">military_tech</span>
                  <span>CAMPEÓN OFICIAL DEL TORNEO</span>
                </div>
                <h2 className="font-headline font-black text-2xl sm:text-4xl uppercase text-slate-900 dark:text-white">
                  {champion.name} {champion.alias ? `"${champion.alias}"` : ''}
                </h2>
                <p className="font-label-caps text-xs text-slate-600 dark:text-slate-300 uppercase mt-1">
                  Equipo: {champion.team || 'Independiente'} • Victorias: {champion.stats.wins} • Puntos: {champion.stats.pointsScored}
                </p>
              </div>
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/30 flex-shrink-0 animate-bounce">
              <span className="material-symbols-outlined text-4xl">emoji_events</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-center flex items-center justify-center gap-2 text-xs font-label-caps text-slate-500 uppercase bg-slate-50 dark:bg-white/5">
          <span className="material-symbols-outlined text-base text-amber-500 animate-pulse">emoji_events</span>
          <span>Torneo en desarrollo • El ganador de la Gran Final será coronado automáticamente aquí</span>
        </div>
      )}

      {/* VIEW MODE: STANDINGS LEADERBOARD (FOR LEAGUE / SERIES FORMATS) */}
      {viewMode === 'standings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Phase Banner & Cutoff Rules */}
          {(() => {
            const ranked = getRankedBladers(bladers);
            const cutoffTarget = config.playoffCutoffType === 'min_points'
              ? 0
              : (config.playoffCutoffCount || (ranked.length >= 8 ? 8 : ranked.length >= 4 ? 4 : 2));
            const minPts = config.minPointsToQualify || 4;

            const regularMatches = matches.filter((m) => m.stage === 'regular');
            const finishedRegularMatches = regularMatches.filter((m) => m.status === 'finished');
            const isRegularComplete = regularMatches.length > 0 && finishedRegularMatches.length === regularMatches.length;

            return (
              <div className="space-y-4">
                {/* Rules & Cutoff Status Header */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-transparent border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#04A8FC] text-xl">tune</span>
                      <h3 className="font-headline font-black text-sm sm:text-base uppercase text-slate-900 dark:text-white">
                        Criterio de Corte para Fase Final (Playoffs)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-label-caps uppercase">
                      {config.playoffCutoffType === 'min_points'
                        ? `Avanzan a Playoffs los Bladers con ≥ ${minPts} PUNTOS acumulados. Los demás quedan eliminados.`
                        : `Clasifican los TOP ${cutoffTarget} Bladers (${cutoffTarget === 8 ? 'Cuartos de Final' : cutoffTarget === 4 ? 'Semifinales' : 'Gran Final'}). Los demás quedan descalificados.`}
                    </p>
                  </div>

                  {/* Playoff Trigger Button */}
                  {onGeneratePlayoffs && (
                    <button
                      onClick={() => {
                        soundManager.playVictory();
                        onGeneratePlayoffs();
                      }}
                      className={`px-5 py-2.5 rounded-xl font-headline font-black text-xs uppercase transition-all shadow-lg flex items-center gap-2 flex-shrink-0 ${
                        isRegularComplete
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/30 animate-pulse'
                          : 'bg-[#04A8FC] hover:bg-[#008fe0] text-white shadow-[#04A8FC]/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      <span>{isRegularComplete ? 'Generar Playoffs con Clasificados' : 'Forzar Corte a Playoffs'}</span>
                    </button>
                  )}
                </div>

                {/* Leaderboard Table */}
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-label-caps uppercase">
                      <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[10px] text-slate-500 font-black">
                        <tr>
                          <th className="py-3 px-3 sm:px-4 text-center w-12">Pos</th>
                          <th className="py-3 px-3 sm:px-4">Blader</th>
                          <th className="py-3 px-2 sm:px-3 text-center">Duelos</th>
                          <th className="py-3 px-2 sm:px-3 text-center">V - D</th>
                          <th className="py-3 px-3 sm:px-4 text-center font-headline text-slate-900 dark:text-white">Puntos</th>
                          <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">Finishes</th>
                          <th className="py-3 px-3 sm:px-4 text-center">Estado Oficial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold">
                        {ranked.map((b, idx) => {
                          const isQualifying = config.playoffCutoffType === 'min_points'
                            ? (b.stats?.pointsScored || 0) >= minPts
                            : idx < cutoffTarget;

                          const matchesPlayed = b.stats?.matchesPlayed || 0;
                          const matchesLimit = config.regularPhaseMatchesPerBlader || 2;

                          return (
                            <tr
                              key={b.id}
                              className={`transition-colors ${
                                isQualifying
                                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                              }`}
                            >
                              {/* Position */}
                              <td className="py-3 px-3 sm:px-4 text-center font-headline font-black text-xs sm:text-sm">
                                {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                              </td>

                              {/* Blader Info */}
                              <td className="py-3 px-3 sm:px-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <BladerAvatar blader={b} size="sm" />
                                  <div className="min-w-0">
                                    <span className="font-headline font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate block">
                                      {b.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 truncate block">
                                      {b.team || 'Independiente'} {b.alias ? `• "${b.alias}"` : ''}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Matches Played */}
                              <td className="py-3 px-2 sm:px-3 text-center font-mono text-xs">
                                <span className={matchesPlayed >= matchesLimit ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                                  {matchesPlayed}/{matchesLimit}
                                </span>
                              </td>

                              {/* Wins - Losses */}
                              <td className="py-3 px-2 sm:px-3 text-center font-mono text-xs">
                                <span className="text-emerald-500">{b.stats?.wins || 0}V</span>
                                <span className="text-slate-400 mx-1">-</span>
                                <span className="text-red-400">{b.stats?.losses || 0}D</span>
                              </td>

                              {/* Points */}
                              <td className="py-3 px-3 sm:px-4 text-center font-headline font-black text-sm sm:text-base text-[#04A8FC]">
                                {b.stats?.pointsScored || 0} PTS
                              </td>

                              {/* Finishes breakdown */}
                              <td className="py-3 px-2 sm:px-3 text-center hidden md:table-cell text-[10px] font-mono text-slate-400">
                                <span>⚡{b.stats?.xtremeFinishes || 0}</span>
                                <span className="mx-1.5">💥{b.stats?.burstFinishes || 0}</span>
                                <span className="mx-1.5">🛡️{b.stats?.overFinishes || 0}</span>
                                <span>🌪️{b.stats?.spinFinishes || 0}</span>
                              </td>

                              {/* Status Tag */}
                              <td className="py-3 px-3 sm:px-4 text-center">
                                {isQualifying ? (
                                  <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">check_circle</span>
                                    <span>
                                      {cutoffTarget === 8 ? 'Pasa a Cuartos' : cutoffTarget === 4 ? 'Pasa a Semis' : 'Pasa a Final'}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">cancel</span>
                                    <span>Eliminado</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Bracket Tree Display */}
      {viewMode !== 'standings' && (
        <>
          {matches.length === 0 ? (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dashed border-[#bec7d3]/40 dark:border-white/10 text-center space-y-4 bg-white dark:bg-[#15151c]">
              <div className="w-16 h-16 rounded-2xl bg-[#04A8FC]/10 border border-[#04A8FC]/30 flex items-center justify-center text-[#04A8FC] mx-auto">
                <span className="material-symbols-outlined text-3xl">account_tree</span>
              </div>
              <h3 className="font-headline font-black text-xl uppercase text-slate-900 dark:text-white">
                {config.type === 'elimination' ? 'Árbol de Eliminación en Espera' : 'Fase de Torneo en Espera'}
              </h3>
              <p className="font-body-text text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {bladers.length >= 2
                  ? `Hay ${bladers.length} Bladers inscritos listos para competir. Genera el calendario de combates para iniciar la competencia.`
                  : 'Inscribe al menos a 2 Bladers en el padrón para poder generar el fixture del torneo.'}
              </p>
              {bladers.length >= 2 && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onGenerateBracket();
                  }}
                  className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-6 py-3 rounded-xl font-headline font-black text-xs uppercase shadow-lg shadow-[#04A8FC]/20 transition-all hover:scale-105"
                >
                  Generar Fixture con los {bladers.length} Bladers Inscritos
                </button>
              )}
            </div>
          ) : viewMode === 'rounds' ? (
            /* Rounds List View */
            <div className="space-y-6">
              {roundNumbers.map((rNum) => {
                const rMatches = roundsMap[rNum] || [];
                const rTitle = rMatches[0]?.roundName?.split(' - ')[0] || `Ronda ${rNum}`;

                return (
                  <div key={rNum} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                      <span className="w-2 h-2 rounded-full bg-[#04A8FC]"></span>
                      <h3 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white">
                        {rTitle} ({rMatches.length} {rMatches.length === 1 ? 'Combate' : 'Combates'})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {rMatches.map((m) => renderMatchCard(m))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Interactive Multi-Column Tree Bracket Canvas */
            <div
              className="overflow-x-auto pb-8 pt-4 transition-transform duration-200 origin-top-left"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="flex items-stretch gap-6 sm:gap-8 min-w-max">
                {roundNumbers.map((rNum, idx) => {
                  const rMatches = roundsMap[rNum] || [];
                  const rTitle = rMatches[0]?.roundName?.split(' - ')[0] || `Ronda ${rNum}`;
                  const isFinalRound = rNum === totalRounds;

                  return (
                    <div key={rNum} className="w-72 sm:w-80 flex flex-col flex-shrink-0 space-y-4">
                      {/* Round Column Header */}
                      <div className={`p-3 rounded-2xl text-center border font-headline font-black uppercase text-xs sm:text-sm shadow-sm ${
                        isFinalRound
                          ? 'bg-amber-500 text-black border-amber-400 font-black'
                          : 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white border-slate-200 dark:border-white/10'
                      }`}>
                        <div className="flex items-center justify-center gap-1.5">
                          {isFinalRound && <span className="material-symbols-outlined text-sm">emoji_events</span>}
                          <span>{rTitle}</span>
                        </div>
                        <div className={`text-[10px] font-label-caps uppercase mt-0.5 ${
                          isFinalRound ? 'text-black/70' : 'text-slate-400'
                        }`}>
                          {rMatches.length} {rMatches.length === 1 ? 'Duelo Decisivo' : 'Duelos'}
                        </div>
                      </div>

                      {/* Matches Column */}
                      <div className="flex flex-col justify-around flex-1 gap-4">
                        {rMatches.map((m) => (
                          <div key={m.id} className="relative">
                            {renderMatchCard(m, rMatches.length > 4)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Final Champion Column */}
                <div className="w-64 sm:w-72 flex flex-col flex-shrink-0 space-y-4 justify-center">
                  <div className="p-3 rounded-2xl text-center border border-amber-500/40 bg-amber-500/10 font-headline font-black uppercase text-xs sm:text-sm text-amber-500 shadow-sm flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-base">military_tech</span>
                    <span>CAMPEÓN</span>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/15 to-transparent text-center space-y-3 shadow-lg">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500 text-black flex items-center justify-center mx-auto shadow-md">
                      <span className="material-symbols-outlined text-3xl">emoji_events</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-black text-base uppercase text-slate-900 dark:text-white">
                        {champion ? champion.name : 'Por Definir'}
                      </h4>
                      <p className="text-[11px] font-label-caps text-slate-500 uppercase mt-0.5">
                        {champion ? `${champion.team || 'Independiente'}` : 'Ganador Gran Final'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

