import React, { useState, useEffect } from 'react';
import {
  ActiveScreen,
  Blader,
  BeybladePart,
  Match,
  TournamentConfig,
  RegisteredCombo,
  TournamentRecord
} from './types';
import {
  INITIAL_BLADERS,
  INITIAL_CONFIG,
  INITIAL_MATCHES,
  INITIAL_BEYBLADE_PARTS
} from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { TournamentFormatScreen } from './components/screens/TournamentFormatScreen';
import { CommunityConfigScreen } from './components/screens/CommunityConfigScreen';
import { BladersScreen } from './components/screens/BladersScreen';
import { BracketScreen } from './components/screens/BracketScreen';
import { EquipmentScreen } from './components/screens/EquipmentScreen';
import { RulesScreen } from './components/screens/RulesScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { WinnerModal } from './components/WinnerModal';
import { NewBattleModal } from './components/NewBattleModal';
import { SupportModal } from './components/SupportModal';
import { ResetTournamentModal } from './components/ResetTournamentModal';
import {
  syncBladerToSupabase,
  fetchBladersFromSupabase,
  deleteBladerFromSupabase,
  syncPartToSupabase,
  fetchPartsFromSupabase,
  deletePartFromSupabase,
  syncComboToSupabase,
  fetchCombosFromSupabase,
  deleteComboFromSupabase,
  syncTournamentRecordToSupabase,
  fetchHistoryFromSupabase,
  deleteHistoryRecordFromSupabase,
  syncConfigToSupabase,
  fetchConfigFromSupabase,
  syncMatchToSupabase,
  fetchMatchesFromSupabase
} from './lib/supabase';
import { generateTournamentBracket, advanceWinnerInBracket } from './utils/bracketGenerator';
import { soundManager } from './utils/audio';
import { syncComboPiecesToCatalog, createRegisteredCombosFromBlader } from './utils/comboUtils';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('tournament_format');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Core Tournament State with localStorage & Supabase
  const [config, setConfig] = useState<TournamentConfig>(() => {
    try {
      const saved = localStorage.getItem('bbx_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.season?.includes('Xtreme Series') || parsed.name?.includes('Xtreme Series')) {
          parsed.season = 'Temporada Oficial';
          parsed.name = 'Torneo Oficial Beyblade X';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CONFIG;
  });

  const isMockBlader = (b: Blader) => {
    if (!b || !b.id) return false;
    return (
      b.id.startsWith('blader-jaxon') ||
      b.id.startsWith('blader-bird') ||
      b.id.startsWith('blader-multi') ||
      b.id.startsWith('blader-chrome') ||
      b.id.startsWith('blader-meiko') ||
      b.id.startsWith('blader-king') ||
      b.id.startsWith('blader-kamen') ||
      b.id.startsWith('blader-shiguru') ||
      b.id.startsWith('blader-burn') ||
      b.id.startsWith('blader-taisho') ||
      b.id.startsWith('blader-zonamos') ||
      b.id.startsWith('blader-yuni') ||
      b.id.startsWith('blader-kadovar') ||
      b.id.startsWith('blader-cho-pan') ||
      b.id.startsWith('blader-hina') ||
      b.id.startsWith('blader-pack')
    );
  };

  const isMockPart = (p: BeybladePart) => {
    if (!p || !p.name) return false;
    const defaultMockDescriptions = [
      'Hoja agresiva de tres alas',
      'Cuchillas curvadas balanceadas',
      'Diseño circular de dos aspas',
      'Seis crestas defensivas',
      'Capa de metal pesado',
      'Doble aleta de corte bajo',
      'Hoja de giro izquierdo',
      'Geometría asimétrica',
      'Hoja de tres cuchillas descendentes',
      'Cuerpo compacto y concentrado',
      'Cuchillas dentadas',
      'Aspas irregulares de choque pesado',
      'Trinquete de 3 salientes',
      'Trinquete cuadrilátero estable',
      'Trinquete de 8.0mm',
      'Distribución pentagonal',
      'Nueve crestas suaves',
      'Trinquete triangular',
      'Trinquete pentagonal alto',
      'Punta plana con engranajes',
      'Punta cónica semi-plana',
      'Punta esférica de baja fricción',
      'Punta cónica puntiaguda',
      'Variante alta de Needle',
      'Dientes de engranaje extendidos',
      'Punta esférica con borde de apoyo',
      'Centro puntiagudo con anillo plano',
      'Punta mixta Point combinada'
    ];
    return defaultMockDescriptions.some((desc) => p.description && p.description.includes(desc));
  };

  const [bladers, setBladers] = useState<Blader[]>(() => {
    try {
      const saved = localStorage.getItem('bbx_bladers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((b) => !isMockBlader(b));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BLADERS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem('bbx_matches');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MATCHES;
  });

  const [parts, setParts] = useState<BeybladePart[]>(() => {
    try {
      const saved = localStorage.getItem('bbx_parts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: BeybladePart) => !isMockPart(p));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [registeredCombos, setRegisteredCombos] = useState<RegisteredCombo[]>(() => {
    try {
      const saved = localStorage.getItem('bbx_combos');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [tournamentHistory, setTournamentHistory] = useState<TournamentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bbx_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [currentMatch, setCurrentMatch] = useState<Match | null>(matches[0] || null);

  // Modals state
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [winnerModalData, setWinnerModalData] = useState<{
    isOpen: boolean;
    winner: Blader | null;
    match: Match | null;
  }>({
    isOpen: false,
    winner: null,
    match: null
  });
  const [newBattleModalOpen, setNewBattleModalOpen] = useState<boolean>(false);
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bbx_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('bbx_bladers', JSON.stringify(bladers));
    } catch (e) {
      console.error(e);
    }
  }, [bladers]);

  useEffect(() => {
    try {
      localStorage.setItem('bbx_matches', JSON.stringify(matches));
    } catch (e) {
      console.error(e);
    }
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem('bbx_parts', JSON.stringify(parts));
    } catch (e) {
      console.error(e);
    }
  }, [parts]);

  useEffect(() => {
    try {
      localStorage.setItem('bbx_combos', JSON.stringify(registeredCombos));
    } catch (e) {
      console.error(e);
    }
  }, [registeredCombos]);

  useEffect(() => {
    try {
      localStorage.setItem('bbx_history', JSON.stringify(tournamentHistory));
    } catch (e) {
      console.error(e);
    }
  }, [tournamentHistory]);

  // Initial fetch from Supabase on startup
  useEffect(() => {
    let isMounted = true;

    async function loadRemoteData() {
      try {
        const [remoteBladers, remoteCombos, remoteHistory, remoteParts, remoteConfig, remoteMatches] = await Promise.all([
          fetchBladersFromSupabase(),
          fetchCombosFromSupabase(),
          fetchHistoryFromSupabase(),
          fetchPartsFromSupabase(),
          fetchConfigFromSupabase(),
          fetchMatchesFromSupabase()
        ]);

        if (isMounted) {
          if (remoteBladers && remoteBladers.length > 0) {
            const cleanRemoteBladers = remoteBladers.filter((b) => !isMockBlader(b));
            if (cleanRemoteBladers.length > 0) {
              setBladers(cleanRemoteBladers);
            }
          }
          if (remoteCombos && remoteCombos.length > 0) {
            setRegisteredCombos(remoteCombos);
          }
          if (remoteHistory && remoteHistory.length > 0) {
            setTournamentHistory(remoteHistory);
          }
          if (remoteParts && remoteParts.length > 0) {
            const cleanRemoteParts = remoteParts.filter((p) => !isMockPart(p));
            setParts(cleanRemoteParts);
          }
          if (remoteConfig && remoteConfig.leagueName) {
            setConfig((prev) => ({
              ...prev,
              ...remoteConfig
            }));
          }
          if (remoteMatches && remoteMatches.length > 0) {
            setMatches(remoteMatches);
          }
        }
      } catch (err) {
        console.warn('Initial Supabase sync notice:', err);
      }
    }

    loadRemoteData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-populate registeredCombos and parts from all Bladers' decks
  useEffect(() => {
    if (bladers.length > 0) {
      let hasNewCombos = false;
      const existingComboIds = new Set(registeredCombos.map((c) => c.id));
      const newlyCreated: RegisteredCombo[] = [];

      bladers.forEach((b) => {
        if (b.combos && b.combos.length > 0) {
          const bladerCombos = createRegisteredCombosFromBlader(b, registeredCombos);
          bladerCombos.forEach((bc) => {
            if (!existingComboIds.has(bc.id)) {
              existingComboIds.add(bc.id);
              newlyCreated.push(bc);
              hasNewCombos = true;
            }
          });
        }
      });

      if (hasNewCombos && newlyCreated.length > 0) {
        setRegisteredCombos((prev) => [...newlyCreated, ...prev]);
        newlyCreated.forEach((c) => syncComboToSupabase(c));
      }

      // Also ensure parts catalog has all pieces
      const allCombos = bladers.flatMap((b) => b.combos || []);
      if (allCombos.length > 0) {
        syncComboPiecesToCatalog(allCombos, parts, handleAddPart);
      }
    }
  }, [bladers]);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle live score updating in the Battle Console
  const handleUpdateScore = (
    corner: 'A' | 'B',
    pointType: 'xtreme' | 'burst' | 'over' | 'spin' | 'stadium',
    points: number
  ) => {
    if (!currentMatch) return;

    const updatedScoreA = corner === 'A' ? currentMatch.scoreA + points : currentMatch.scoreA;
    const updatedScoreB = corner === 'B' ? currentMatch.scoreB + points : currentMatch.scoreB;

    const scoringBlader = corner === 'A' ? currentMatch.bladerA : currentMatch.bladerB;
    const targetScore = currentMatch.targetScore;

    const pointDescriptions: Record<string, string> = {
      xtreme: `Xtreme Finish (+${points} PTS)`,
      burst: `Burst Finish (+${points} PTS)`,
      over: `Over Finish (+${points} PTS)`,
      spin: `Spin Finish (+${points} PTS)`,
      stadium: `Stadium Out (+${points} PTS)`
    };

    const newEvent = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      bladerCorner: corner,
      bladerName: scoringBlader?.name || `Blader ${corner}`,
      pointType,
      points,
      scoreAAfter: updatedScoreA,
      scoreBAfter: updatedScoreB,
      description: pointDescriptions[pointType] || `Anotación (+${points} PTS)`
    };

    const isSeriesFormat = config.type === 'series';
    const isMatchWon = isSeriesFormat ? true : (updatedScoreA >= targetScore || updatedScoreB >= targetScore);
    const winningBlader = isMatchWon
      ? isSeriesFormat
        ? (corner === 'A' ? currentMatch.bladerA : currentMatch.bladerB)
        : (updatedScoreA >= targetScore ? currentMatch.bladerA : currentMatch.bladerB)
      : null;

    const updatedMatch: Match = {
      ...currentMatch,
      scoreA: updatedScoreA,
      scoreB: updatedScoreB,
      status: isMatchWon ? 'finished' : 'live',
      winnerId: winningBlader?.id || null,
      winnerName: winningBlader?.name,
      events: [...(currentMatch.events || []), newEvent]
    };

    setCurrentMatch(updatedMatch);
    syncMatchToSupabase(updatedMatch);

    // Update matches list and advance winner in bracket tree
    if (isMatchWon && winningBlader) {
      setMatches((prev) => {
        const advanced = advanceWinnerInBracket(prev, currentMatch.id, winningBlader);
        advanced.forEach((m) => {
          if (m.id === currentMatch.id || m.id === currentMatch.nextMatchId) {
            syncMatchToSupabase(m);
          }
        });
        return advanced;
      });
    } else {
      setMatches((prev) => prev.map((m) => (m.id === currentMatch.id ? updatedMatch : m)));
    }

    // Update Blader stats if won
    if (isMatchWon && winningBlader) {
      const losingBlader = corner === 'A' ? currentMatch.bladerB : currentMatch.bladerA;
      setBladers((prev) =>
        prev.map((b) => {
          if (b.id === winningBlader.id) {
            const updatedB = {
              ...b,
              stats: {
                ...b.stats,
                wins: b.stats.wins + 1,
                matchesPlayed: b.stats.matchesPlayed + 1,
                pointsScored:
                  b.stats.pointsScored + (corner === 'A' ? updatedScoreA : updatedScoreB),
                xtremeFinishes:
                  pointType === 'xtreme' ? (b.stats.xtremeFinishes || 0) + 1 : (b.stats.xtremeFinishes || 0),
                burstFinishes:
                  pointType === 'burst' ? (b.stats.burstFinishes || 0) + 1 : (b.stats.burstFinishes || 0),
                overFinishes:
                  pointType === 'over' ? (b.stats.overFinishes || 0) + 1 : (b.stats.overFinishes || 0),
                spinFinishes:
                  pointType === 'spin' ? (b.stats.spinFinishes || 0) + 1 : (b.stats.spinFinishes || 0)
              }
            };
            syncBladerToSupabase(updatedB);
            return updatedB;
          }
          if (losingBlader && b.id === losingBlader.id) {
            const updatedL = {
              ...b,
              stats: {
                ...b.stats,
                losses: (b.stats.losses || 0) + 1,
                matchesPlayed: (b.stats.matchesPlayed || 0) + 1
              }
            };
            syncBladerToSupabase(updatedL);
            return updatedL;
          }
          return b;
        })
      );

      // Open celebration modal
      setWinnerModalData({
        isOpen: true,
        winner: winningBlader,
        match: updatedMatch
      });
    }
  };

  const handleResetMatch = () => {
    if (!currentMatch) return;
    const reset: Match = {
      ...currentMatch,
      scoreA: 0,
      scoreB: 0,
      status: 'live',
      winnerId: null,
      winnerName: undefined,
      events: []
    };
    setCurrentMatch(reset);
    setMatches((prev) => prev.map((m) => (m.id === currentMatch.id ? reset : m)));
  };

  const handleSwapCorners = () => {
    if (!currentMatch) return;
    const swapped: Match = {
      ...currentMatch,
      bladerA: currentMatch.bladerB,
      bladerB: currentMatch.bladerA,
      scoreA: currentMatch.scoreB,
      scoreB: currentMatch.scoreA
    };
    setCurrentMatch(swapped);
  };

  const handleSelectOnDeckMatch = (bladerAId: string, bladerBId: string) => {
    const bA = bladers.find((b) => b.id === bladerAId) || null;
    const bB = bladers.find((b) => b.id === bladerBId) || null;
    const newMatch: Match = {
      id: `match-custom-${Date.now()}`,
      roundNumber: 1,
      roundName: 'Duelo On-Deck',
      matchNumber: matches.length + 1,
      bladerA: bA,
      bladerB: bB,
      scoreA: 0,
      scoreB: 0,
      targetScore: config.victoryConditions.pointsToWin,
      status: 'live',
      winnerId: null,
      cornerA: 'Red',
      cornerB: 'Blue',
      events: []
    };
    setCurrentMatch(newMatch);
    setMatches((prev) => [newMatch, ...prev]);
    setActiveScreen('dashboard');
  };

  const handleRandomizeOnDeck = () => {
    const shuffled = [...bladers].sort(() => 0.5 - Math.random());
    if (shuffled.length >= 2) {
      handleSelectOnDeckMatch(shuffled[0].id, shuffled[1].id);
    }
  };

  const handleStartCustomBattle = (bladerAId: string, bladerBId: string, targetScore: number) => {
    const bA = bladers.find((b) => b.id === bladerAId) || null;
    const bB = bladers.find((b) => b.id === bladerBId) || null;
    const newMatch: Match = {
      id: `match-custom-${Date.now()}`,
      roundNumber: 1,
      roundName: 'Batalla Rápida',
      matchNumber: matches.length + 1,
      bladerA: bA,
      bladerB: bB,
      scoreA: 0,
      scoreB: 0,
      targetScore: targetScore,
      status: 'live',
      winnerId: null,
      cornerA: 'Red',
      cornerB: 'Blue',
      events: []
    };
    setCurrentMatch(newMatch);
    setMatches((prev) => [newMatch, ...prev]);
    setActiveScreen('dashboard');
  };

  const handleQuickStartByName = (nameA: string, nameB: string, targetScore: number) => {
    let bA = bladers.find((b) => b.name.toLowerCase() === nameA.toLowerCase());
    let bB = bladers.find((b) => b.name.toLowerCase() === nameB.toLowerCase());

    const newBladersToAdd: Blader[] = [];

    if (!bA) {
      bA = {
        id: `blader-${Date.now()}-a`,
        name: nameA,
        alias: nameA,
        team: 'Independiente',
        avatarUrl: '',
        verified: true,
        registeredAt: new Date().toISOString(),
        combos: [],
        stats: {
          wins: 0,
          losses: 0,
          pointsScored: 0,
          burstFinishes: 0,
          xtremeFinishes: 0,
          overFinishes: 0,
          spinFinishes: 0,
          matchesPlayed: 0
        }
      };
      newBladersToAdd.push(bA);
      syncBladerToSupabase(bA);
    }

    if (!bB) {
      bB = {
        id: `blader-${Date.now()}-b`,
        name: nameB,
        alias: nameB,
        team: 'Independiente',
        avatarUrl: '',
        verified: true,
        registeredAt: new Date().toISOString(),
        combos: [],
        stats: {
          wins: 0,
          losses: 0,
          pointsScored: 0,
          burstFinishes: 0,
          xtremeFinishes: 0,
          overFinishes: 0,
          spinFinishes: 0,
          matchesPlayed: 0
        }
      };
      newBladersToAdd.push(bB);
      syncBladerToSupabase(bB);
    }

    if (newBladersToAdd.length > 0) {
      setBladers((prev) => [...newBladersToAdd, ...prev]);
    }

    const newMatch: Match = {
      id: `match-quick-${Date.now()}`,
      roundNumber: 1,
      roundName: 'Combate en Vivo',
      matchNumber: matches.length + 1,
      bladerA: bA,
      bladerB: bB,
      scoreA: 0,
      scoreB: 0,
      targetScore: targetScore,
      status: 'live',
      winnerId: null,
      cornerA: 'Red',
      cornerB: 'Blue',
      events: []
    };

    setCurrentMatch(newMatch);
    setMatches((prev) => [newMatch, ...prev]);
    setActiveScreen('dashboard');
  };

  const handleGenerateBracket = () => {
    if (bladers.length < 2) {
      alert('Registra al menos 2 bladers para generar el árbol de eliminación.');
      setActiveScreen('bladers');
      return;
    }

    const generatedMatches = generateTournamentBracket(bladers, config);
    setMatches(generatedMatches);

    // Sync all generated matches to Supabase
    generatedMatches.forEach((m) => syncMatchToSupabase(m));

    if (generatedMatches.length > 0) {
      const firstLive = generatedMatches.find((m) => m.status === 'live') || generatedMatches[0];
      setCurrentMatch(firstLive);
    }
  };

  const handleSelectMatchForConsole = (match: Match) => {
    setCurrentMatch(match);
    setActiveScreen('dashboard');
  };

  const handleSetMatchWinner = (matchId: string, winnerId: string) => {
    const winnerBlader = bladers.find((b) => b.id === winnerId);
    if (!winnerBlader) return;

    setMatches((prev) => {
      const advanced = advanceWinnerInBracket(prev, matchId, winnerBlader);
      advanced.forEach((m) => {
        if (m.id === matchId || m.id === m.nextMatchId) {
          syncMatchToSupabase(m);
        }
      });
      return advanced;
    });

    if (currentMatch && currentMatch.id === matchId) {
      setCurrentMatch((prev) =>
        prev
          ? {
              ...prev,
              status: 'finished',
              winnerId,
              winnerName: winnerBlader.name
            }
          : null
      );
    }
  };

  // Bladers handlers
  const handleAddBlader = (newBlader: Blader) => {
    setBladers((prev) => [newBlader, ...prev]);
    syncBladerToSupabase(newBlader);

    if (newBlader.combos && newBlader.combos.length > 0) {
      const generatedCombos = createRegisteredCombosFromBlader(newBlader, registeredCombos);
      setRegisteredCombos((prev) => {
        const otherCombos = prev.filter((c) => c.bladerId !== newBlader.id);
        return [...generatedCombos, ...otherCombos];
      });
      generatedCombos.forEach((gc) => syncComboToSupabase(gc));
      syncComboPiecesToCatalog(newBlader.combos, parts, handleAddPart);
    }
  };

  const handleUpdateBlader = (updatedBlader: Blader) => {
    setBladers((prev) =>
      prev.map((b) => (b.id === updatedBlader.id ? updatedBlader : b))
    );
    syncBladerToSupabase(updatedBlader);

    if (updatedBlader.combos && updatedBlader.combos.length > 0) {
      const generatedCombos = createRegisteredCombosFromBlader(updatedBlader, registeredCombos);
      setRegisteredCombos((prev) => {
        const otherCombos = prev.filter((c) => c.bladerId !== updatedBlader.id);
        return [...generatedCombos, ...otherCombos];
      });
      generatedCombos.forEach((gc) => syncComboToSupabase(gc));
      syncComboPiecesToCatalog(updatedBlader.combos, parts, handleAddPart);
    }
  };

  const handleToggleVerified = (id: string) => {
    setBladers((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, verified: !b.verified };
          syncBladerToSupabase(updated);
          return updated;
        }
        return b;
      })
    );
  };

  const handleDeleteBlader = (id: string) => {
    setBladers((prev) => prev.filter((b) => b.id !== id));
    deleteBladerFromSupabase(id);
    setRegisteredCombos((prev) => prev.filter((c) => c.bladerId !== id));
  };

  const handleToggleBadge = (bladerId: string, badgeId: string) => {
    setBladers((prev) =>
      prev.map((b) => {
        if (b.id === bladerId) {
          const currentBadges = b.badges || [];
          const updatedBadges = currentBadges.includes(badgeId)
            ? currentBadges.filter((id) => id !== badgeId)
            : [...currentBadges, badgeId];
          const updated = { ...b, badges: updatedBadges };
          syncBladerToSupabase(updated);
          return updated;
        }
        return b;
      })
    );
  };

  // Parts handlers
  const handleAddPart = (newPart: BeybladePart) => {
    setParts((prev) => [newPart, ...prev.filter((p) => p.name.trim().toLowerCase() !== newPart.name.trim().toLowerCase())]);
    syncPartToSupabase(newPart);
  };

  const handleDeletePart = (partName: string) => {
    setParts((prev) => prev.filter((p) => p.name.trim().toLowerCase() !== partName.trim().toLowerCase()));
    deletePartFromSupabase(partName);
  };

  // Combos handlers
  const handleAddCombo = (newCombo: RegisteredCombo) => {
    setRegisteredCombos((prev) => [newCombo, ...prev]);
    syncComboToSupabase(newCombo);
    syncComboPiecesToCatalog([newCombo], parts, handleAddPart);
  };

  const handleDeleteCombo = (id: string) => {
    setRegisteredCombos((prev) => prev.filter((c) => c.id !== id));
    deleteComboFromSupabase(id);
  };

  // History handlers
  const handleAddHistoryRecord = (record: TournamentRecord) => {
    setTournamentHistory((prev) => [record, ...prev]);
    syncTournamentRecordToSupabase(record);
  };

  const handleDeleteHistoryRecord = (id: string) => {
    setTournamentHistory((prev) => prev.filter((h) => h.id !== id));
    deleteHistoryRecordFromSupabase(id);
  };

  // COMPLETE & ROBUST RESET TOURNAMENT HANDLER
  const handleConfirmReset = (mode: 'matches_only' | 'archive_and_reset' | 'factory_reset') => {
    setShowResetModal(false);

    if (mode === 'archive_and_reset') {
      // Archive current tournament results to history
      const sortedByWins = [...bladers].sort((a, b) => b.stats.wins - a.stats.wins);
      const champion = sortedByWins[0]?.name || 'Campeón de Liga';
      const runnerUp = sortedByWins[1]?.name || undefined;
      const totalPoints = bladers.reduce((acc, b) => acc + (b.stats.pointsScored || 0), 0);

      const newRecord: TournamentRecord = {
        id: `tourney-record-${Date.now()}`,
        title: config.name || 'Torneo Beyblade X Cúcuta',
        date: new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        season: config.season,
        type: 'tournament',
        format: config.type,
        winnerName: champion,
        runnerUpName: runnerUp,
        totalMatches: matches.filter((m) => m.status === 'finished').length || matches.length,
        totalBladers: bladers.length,
        totalPoints: totalPoints || 12,
        matchesSummary: matches.map((m) => ({
          bladerA: m.bladerA?.name || 'Blader A',
          bladerB: m.bladerB?.name || 'Blader B',
          scoreA: m.scoreA,
          scoreB: m.scoreB,
          winner: m.winnerName || (m.scoreA > m.scoreB ? m.bladerA?.name || '' : m.bladerB?.name || '')
        }))
      };

      handleAddHistoryRecord(newRecord);

      // Reset match states
      const resetMatches = matches.map((m, idx) => ({
        ...m,
        scoreA: 0,
        scoreB: 0,
        status: (idx === 0 ? 'live' : 'upcoming') as 'live' | 'upcoming',
        winnerId: null,
        winnerName: undefined,
        events: []
      }));

      setMatches(resetMatches);
      setCurrentMatch(resetMatches[0] || null);
      setActiveScreen('history');
      return;
    }

    if (mode === 'matches_only') {
      const resetMatches = matches.map((m, idx) => ({
        ...m,
        scoreA: 0,
        scoreB: 0,
        status: (idx === 0 ? 'live' : 'upcoming') as 'live' | 'upcoming',
        winnerId: null,
        winnerName: undefined,
        events: []
      }));

      setMatches(resetMatches);
      setCurrentMatch(resetMatches[0] || null);
      setActiveScreen('dashboard');
      return;
    }

    if (mode === 'factory_reset') {
      setBladers([]);
      setMatches([]);
      setRegisteredCombos([]);
      setCurrentMatch(null);
      try {
        localStorage.removeItem('bbx_bladers');
        localStorage.removeItem('bbx_matches');
        localStorage.removeItem('bbx_combos');
      } catch (e) {
        console.error(e);
      }
      setActiveScreen('tournament_format');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#0c0c10] text-[#1a1c1e] dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* Tactical Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>

      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          onOpenNewBattle={() => setNewBattleModalOpen(true)}
          onOpenSupportModal={() => setSupportModalOpen(true)}
          onResetTournament={() => setShowResetModal(true)}
          leagueName={config.leagueName}
          season={config.season}
          communityCity={config.communityCity}
          logoUrl={config.logoUrl}
          onUploadLogo={(url) => {
            const updated = { ...config, logoUrl: url };
            setConfig(updated);
            syncConfigToSupabase(updated);
          }}
        />
      </div>

      {/* Top Header */}
      <Header
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        isDark={isDark}
        setIsDark={setIsDark}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenNewBladerModal={() => setActiveScreen('bladers')}
        logoUrl={config.logoUrl}
        leagueName={config.leagueName}
        communityTagline={config.communityTagline}
        communityCity={config.communityCity}
        tournamentName={config.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-20 pb-24 md:pb-12 px-3 sm:px-6 md:px-8 relative z-10">
        {activeScreen === 'dashboard' && (
          <DashboardScreen
            currentMatch={currentMatch}
            config={config}
            allBladers={bladers}
            onUpdateScore={handleUpdateScore}
            onResetMatch={handleResetMatch}
            onSelectOnDeckMatch={handleSelectOnDeckMatch}
            onRandomizeOnDeck={handleRandomizeOnDeck}
            onSwapCorners={handleSwapCorners}
            onQuickStartMatch={handleQuickStartByName}
            onOpenNewBattle={() => setNewBattleModalOpen(true)}
            onNavigateToBladers={() => setActiveScreen('bladers')}
          />
        )}

        {activeScreen === 'tournament_format' && (
          <TournamentFormatScreen
            config={config}
            registeredBladersCount={bladers.length}
            onSaveConfig={(updated) => {
              setConfig(updated);
              syncConfigToSupabase(updated);
            }}
            onStartTournament={() => {
              setActiveScreen('bladers');
            }}
          />
        )}

        {(activeScreen === 'community_config' || activeScreen === 'configuration') && (
          <CommunityConfigScreen
            config={config}
            registeredBladersCount={bladers.length}
            onSaveConfig={(updated) => {
              setConfig(updated);
              syncConfigToSupabase(updated);
            }}
            onNavigateToFormat={() => setActiveScreen('tournament_format')}
            onNavigateToBladers={() => setActiveScreen('bladers')}
          />
        )}

        {activeScreen === 'bladers' && (
          <BladersScreen
            bladers={bladers}
            onAddBlader={handleAddBlader}
            onUpdateBlader={handleUpdateBlader}
            onToggleVerified={handleToggleVerified}
            onDeleteBlader={handleDeleteBlader}
            onToggleBadge={handleToggleBadge}
          />
        )}

        {activeScreen === 'bracket' && (
          <BracketScreen
            bladers={bladers}
            matches={matches}
            onSelectMatchForConsole={handleSelectMatchForConsole}
            onSetMatchWinner={handleSetMatchWinner}
            onGenerateBracket={handleGenerateBracket}
          />
        )}

        {activeScreen === 'equipment' && (
          <EquipmentScreen
            parts={parts}
            bladers={bladers}
            registeredCombos={registeredCombos}
            onAddPart={handleAddPart}
            onDeletePart={handleDeletePart}
            onAddCombo={handleAddCombo}
            onDeleteCombo={handleDeleteCombo}
            onUpdateBlader={handleUpdateBlader}
          />
        )}

        {activeScreen === 'rules' && (
          <RulesScreen
            leagueName={config.leagueName}
            organizerName={config.organizerName}
          />
        )}

        {activeScreen === 'history' && (
          <HistoryScreen
            bladers={bladers}
            history={tournamentHistory}
            onAddHistoryRecord={handleAddHistoryRecord}
            onDeleteHistoryRecord={handleDeleteHistoryRecord}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#111116]/95 border-t border-slate-200 dark:border-white/10 backdrop-blur-xl flex items-center justify-around px-1.5 z-40 shadow-2xl">
        {[
          { id: 'tournament_format', label: 'Formato', icon: 'tune' },
          { id: 'dashboard', label: 'Consola', icon: 'sports_kabaddi' },
          { id: 'bracket', label: 'Bracket', icon: 'account_tree' },
          { id: 'bladers', label: 'Bladers', icon: 'groups' },
          { id: 'community_config', label: 'Comunidad', icon: 'domain' },
          { id: 'history', label: 'Historial', icon: 'emoji_events' }
        ].map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                setActiveScreen(item.id as ActiveScreen);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all min-h-[48px] ${
                isActive
                  ? 'text-[#0284c7] dark:text-[#04A8FC] bg-sky-50 dark:bg-[#04A8FC]/15 font-black scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] mb-0.5">
                {item.icon}
              </span>
              <span className="font-label-caps text-[9px] uppercase tracking-wider leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Reset Tournament Modal */}
      <ResetTournamentModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirmReset={handleConfirmReset}
        bladers={bladers}
        matches={matches}
        config={config}
      />

      {/* Winner Celebration Modal */}
      {winnerModalData.isOpen && winnerModalData.winner && winnerModalData.match && (
        <WinnerModal
          winner={winnerModalData.winner}
          match={winnerModalData.match}
          onClose={() => setWinnerModalData({ isOpen: false, winner: null, match: null })}
          onGoToBracket={() => {
            setWinnerModalData({ isOpen: false, winner: null, match: null });
            setActiveScreen('bracket');
          }}
          onNextMatch={() => {
            setWinnerModalData({ isOpen: false, winner: null, match: null });
            handleRandomizeOnDeck();
          }}
        />
      )}

      {/* New Battle Quick Modal */}
      {newBattleModalOpen && (
        <NewBattleModal
          bladers={bladers}
          onClose={() => setNewBattleModalOpen(false)}
          onStartCustomBattle={handleStartCustomBattle}
          onQuickStartByName={handleQuickStartByName}
        />
      )}

      {/* Support & Community Modal */}
      {supportModalOpen && <SupportModal onClose={() => setSupportModalOpen(false)} />}
    </div>
  );
}
