import { Blader, Match, TournamentConfig } from '../types';

export interface BracketGenerationResult {
  matches: Match[];
  totalRounds: number;
}

export function getRoundName(roundNumber: number, totalRounds: number): string {
  const diff = totalRounds - roundNumber;
  if (diff === 0) return 'Gran Final';
  if (diff === 1) return 'Semifinales';
  if (diff === 2) return 'Cuartos de Final';
  if (diff === 3) return 'Octavos de Final';
  if (diff === 4) return '16avos de Final';
  return `Ronda ${roundNumber}`;
}

// -------------------------------------------------------------
// 1. SINGLE ELIMINATION BRACKET (DIRECT KNOCKOUT)
// -------------------------------------------------------------
export function generateSingleEliminationBracket(
  bladers: Blader[],
  config: TournamentConfig
): Match[] {
  if (bladers.length < 2) return [];

  const participants = [...bladers].sort(() => 0.5 - Math.random());
  const numParticipants = participants.length;

  const totalRounds = Math.max(1, Math.ceil(Math.log2(numParticipants)));
  const bracketSize = Math.pow(2, totalRounds);

  const roundMatchesMap: { [round: number]: Match[] } = {};
  let globalMatchCounter = 1;

  // Step 1: Initialize matches for all rounds (from Round 1 to Final)
  for (let r = 1; r <= totalRounds; r++) {
    const matchesInRound = bracketSize / Math.pow(2, r);
    roundMatchesMap[r] = [];

    const rName = getRoundName(r, totalRounds);

    for (let m = 0; m < matchesInRound; m++) {
      const matchId = `match-r${r}-m${m + 1}`;
      const newMatch: Match = {
        id: matchId,
        roundNumber: r,
        roundName: matchesInRound === 1 ? rName : `${rName} - Duelo ${m + 1}`,
        matchNumber: globalMatchCounter++,
        bladerA: null,
        bladerB: null,
        scoreA: 0,
        scoreB: 0,
        targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
        status: 'upcoming',
        winnerId: null,
        cornerA: 'Red',
        cornerB: 'Blue',
        stage: 'playoff',
        events: []
      };

      roundMatchesMap[r].push(newMatch);
    }
  }

  // Step 2: Link nextMatchId and nextMatchSlot
  for (let r = 1; r < totalRounds; r++) {
    const currentRoundMatches = roundMatchesMap[r];
    const nextRoundMatches = roundMatchesMap[r + 1];

    currentRoundMatches.forEach((match, idx) => {
      const nextMatchIndex = Math.floor(idx / 2);
      const nextMatch = nextRoundMatches[nextMatchIndex];
      if (nextMatch) {
        match.nextMatchId = nextMatch.id;
        match.nextMatchSlot = idx % 2 === 0 ? 'A' : 'B';
      }
    });
  }

  // Step 3: Populate Round 1 with participants
  const round1Matches = roundMatchesMap[1];
  let pIndex = 0;

  for (let m = 0; m < round1Matches.length; m++) {
    const match = round1Matches[m];
    const bA = participants[pIndex++] || null;
    const bB = participants[pIndex++] || null;

    match.bladerA = bA;
    match.bladerB = bB;

    if (bA && !bB) {
      match.status = 'finished';
      match.winnerId = bA.id;
      match.winnerName = bA.name;
      // Advance immediately to next round
      if (match.nextMatchId && match.nextMatchSlot) {
        const nextM = roundMatchesMap[2]?.find((nm) => nm.id === match.nextMatchId);
        if (nextM) {
          if (match.nextMatchSlot === 'A') nextM.bladerA = bA;
          else nextM.bladerB = bA;
        }
      }
    }
  }

  // Flatten all matches in order of rounds
  const allMatches: Match[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    allMatches.push(...roundMatchesMap[r]);
  }

  // Ensure first playable match is marked as live
  const firstPlayable = allMatches.find(m => m.status !== 'finished' && m.bladerA && m.bladerB);
  if (firstPlayable) {
    allMatches.forEach(m => { if (m.status === 'live') m.status = 'upcoming'; });
    firstPlayable.status = 'live';
  }

  return allMatches;
}

// -------------------------------------------------------------
// 2. REGULAR PHASE (ROUND ROBIN - TODOS CONTRA TODOS)
// -------------------------------------------------------------
export function generateRegularPhaseMatches(
  bladers: Blader[],
  config: TournamentConfig
): Match[] {
  if (bladers.length < 2) return [];

  const participants = [...bladers];
  const n = participants.length;
  const matches: Match[] = [];
  let matchNumber = 1;

  // Standard Round-Robin Algorithm (Todos contra todos)
  const isOdd = n % 2 !== 0;
  const list: (Blader | null)[] = [...participants];
  if (isOdd) list.push(null); // Bye for odd number of players

  const totalRounds = list.length - 1;
  const half = list.length / 2;

  for (let round = 1; round <= totalRounds; round++) {
    for (let i = 0; i < half; i++) {
      const bA = list[i];
      const bB = list[list.length - 1 - i];

      if (bA && bB) {
        const isFirst = matches.length === 0;
        matches.push({
          id: `match-reg-r${round}-m${matches.length + 1}`,
          roundNumber: round,
          roundName: `Fase Regular • Jornada ${round}`,
          matchNumber: matchNumber++,
          bladerA: bA,
          bladerB: bB,
          scoreA: 0,
          scoreB: 0,
          targetScore: config.type === 'series' ? 1 : (config.victoryConditions?.pointsToWin || 5),
          status: isFirst ? 'live' : 'upcoming',
          winnerId: null,
          cornerA: 'Red',
          cornerB: 'Blue',
          stage: 'regular',
          events: []
        });
      }
    }

    // Rotate list preserving the first position
    const first = list[0];
    const rest = list.slice(1);
    const last = rest.pop()!;
    list.splice(0, list.length, first, last, ...rest);
  }

  return matches;
}

// -------------------------------------------------------------
// 3. PLAYOFF BRACKET FROM REGULAR PHASE RANKINGS (TOP CUTOFF)
// -------------------------------------------------------------
export function getRankedBladers(bladers: Blader[]): Blader[] {
  return [...bladers].sort((a, b) => {
    // 1. Points Scored
    const ptsDiff = (b.stats?.pointsScored || 0) - (a.stats?.pointsScored || 0);
    if (ptsDiff !== 0) return ptsDiff;
    // 2. Matches Won
    const winsDiff = (b.stats?.wins || 0) - (a.stats?.wins || 0);
    if (winsDiff !== 0) return winsDiff;
    // 3. Xtreme + Burst finishes
    const finishesA = (a.stats?.xtremeFinishes || 0) * 3 + (a.stats?.burstFinishes || 0) * 2;
    const finishesB = (b.stats?.xtremeFinishes || 0) * 3 + (b.stats?.burstFinishes || 0) * 2;
    return finishesB - finishesA;
  });
}

export function generatePlayoffBracketFromRankings(
  bladers: Blader[],
  config: TournamentConfig
): Match[] {
  const ranked = getRankedBladers(bladers);
  if (ranked.length < 2) return [];

  // Determine target qualified count based on playoffCutoffCount (or total bladers)
  let targetCount = config.playoffCutoffCount || (ranked.length >= 8 ? 8 : ranked.length >= 4 ? 4 : 2);
  if (targetCount > ranked.length) {
    targetCount = ranked.length >= 4 ? 4 : 2;
  }

  // Filter bladers by minPointsToQualify (if defined)
  const minPts = config.minPointsToQualify || 0;
  const eligible = ranked.filter(b => (b.stats?.pointsScored || 0) >= minPts);

  // Top N highest ranked eligible bladers advance to playoffs
  const qualified = eligible.slice(0, targetCount);

  if (qualified.length < 2) return [];

  // If 2 qualified -> Direct Grand Final
  if (qualified.length === 2) {
    return [
      {
        id: 'playoff-grand-final',
        roundNumber: 1,
        roundName: 'Gran Final',
        matchNumber: 1,
        bladerA: qualified[0], // 1st Seed
        bladerB: qualified[1], // 2nd Seed
        scoreA: 0,
        scoreB: 0,
        targetScore: config.victoryConditions?.pointsToWin || 5,
        status: 'live',
        winnerId: null,
        cornerA: 'Red',
        cornerB: 'Blue',
        stage: 'playoff',
        events: []
      }
    ];
  }

  // If 4 qualified -> Semifinals (1st vs 4th, 2nd vs 3rd) & Grand Final
  if (qualified.length <= 4) {
    const semi1: Match = {
      id: 'playoff-semi-1',
      roundNumber: 1,
      roundName: 'Semifinales - Duelo 1',
      matchNumber: 1,
      bladerA: qualified[0], // 1st Seed
      bladerB: qualified[3] || null, // 4th Seed (or null for BYE)
      scoreA: 0,
      scoreB: 0,
      targetScore: config.victoryConditions?.pointsToWin || 5,
      status: 'live',
      winnerId: null,
      cornerA: 'Red',
      cornerB: 'Blue',
      stage: 'playoff',
      nextMatchId: 'playoff-grand-final',
      nextMatchSlot: 'A',
      events: []
    };

    const semi2: Match = {
      id: 'playoff-semi-2',
      roundNumber: 1,
      roundName: 'Semifinales - Duelo 2',
      matchNumber: 2,
      bladerA: qualified[1], // 2nd Seed
      bladerB: qualified[2], // 3rd Seed
      scoreA: 0,
      scoreB: 0,
      targetScore: config.victoryConditions?.pointsToWin || 5,
      status: 'upcoming',
      winnerId: null,
      cornerA: 'Red',
      cornerB: 'Blue',
      stage: 'playoff',
      nextMatchId: 'playoff-grand-final',
      nextMatchSlot: 'B',
      events: []
    };

    const grandFinal: Match = {
      id: 'playoff-grand-final',
      roundNumber: 2,
      roundName: 'Gran Final',
      matchNumber: 3,
      bladerA: null,
      bladerB: null,
      scoreA: 0,
      scoreB: 0,
      targetScore: config.victoryConditions?.pointsToWin || 5,
      status: 'upcoming',
      winnerId: null,
      cornerA: 'Red',
      cornerB: 'Blue',
      stage: 'playoff',
      events: []
    };

    const matches = [semi1, semi2, grandFinal];
    
    // Auto-advance BYEs
    matches.forEach(match => {
      if (match.bladerA && !match.bladerB) {
        match.status = 'finished';
        match.winnerId = match.bladerA.id;
        match.winnerName = match.bladerA.name;
        if (match.nextMatchId && match.nextMatchSlot) {
          const nextM = matches.find(m => m.id === match.nextMatchId);
          if (nextM) {
            if (match.nextMatchSlot === 'A') nextM.bladerA = match.bladerA;
            else nextM.bladerB = match.bladerA;
          }
        }
      }
    });

    return matches;
  }

  // If 8 qualified -> Quarterfinals, Semifinals & Grand Final
  const qf1: Match = {
    id: 'playoff-qf-1',
    roundNumber: 1,
    roundName: 'Cuartos de Final - Duelo 1',
    matchNumber: 1,
    bladerA: qualified[0], // 1st Seed
    bladerB: qualified[7] || null, // 8th Seed
    scoreA: 0,
    scoreB: 0,
    targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
    status: 'live',
    winnerId: null,
    cornerA: 'Red',
    cornerB: 'Blue',
    stage: 'playoff',
    nextMatchId: 'playoff-semi-1',
    nextMatchSlot: 'A',
    events: []
  };

  const qf2: Match = {
    id: 'playoff-qf-2',
    roundNumber: 1,
    roundName: 'Cuartos de Final - Duelo 2',
    matchNumber: 2,
    bladerA: qualified[3], // 4th Seed
    bladerB: qualified[4] || null, // 5th Seed
    scoreA: 0,
    scoreB: 0,
    targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
    status: 'upcoming',
    winnerId: null,
    cornerA: 'Red',
    cornerB: 'Blue',
    stage: 'playoff',
    nextMatchId: 'playoff-semi-1',
    nextMatchSlot: 'B',
    events: []
  };

  const qf3: Match = {
    id: 'playoff-qf-3',
    roundNumber: 1,
    roundName: 'Cuartos de Final - Duelo 3',
    matchNumber: 3,
    bladerA: qualified[1], // 2nd Seed
    bladerB: qualified[6] || null, // 7th Seed
    scoreA: 0,
    scoreB: 0,
    targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
    status: 'upcoming',
    winnerId: null,
    cornerA: 'Red',
    cornerB: 'Blue',
    stage: 'playoff',
    nextMatchId: 'playoff-semi-2',
    nextMatchSlot: 'A',
    events: []
  };

  const qf4: Match = {
    id: 'playoff-qf-4',
    roundNumber: 1,
    roundName: 'Cuartos de Final - Duelo 4',
    matchNumber: 4,
    bladerA: qualified[2], // 3rd Seed
    bladerB: qualified[5] || null, // 6th Seed
    scoreA: 0,
    scoreB: 0,
    targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
    status: 'upcoming',
    winnerId: null,
    cornerA: 'Red',
    cornerB: 'Blue',
    stage: 'playoff',
    nextMatchId: 'playoff-semi-2',
    nextMatchSlot: 'B',
    events: []
  };

  const semi1: Match = {
    id: 'playoff-semi-1',
    roundNumber: 2,
    roundName: 'Semifinales - Duelo 1',
    matchNumber: 5,
    bladerA: null,
    bladerB: null,
    scoreA: 0,
    scoreB: 0,
    targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
    status: 'upcoming',
    winnerId: null,
    cornerA: 'Red',
    cornerB: 'Blue',
    stage: 'playoff',
    nextMatchId: 'playoff-grand-final',
    nextMatchSlot: 'A',
    events: []
  };

  const semi2: Match = {
    id: 'playoff-semi-2',
    roundNumber: 2,
    roundName: 'Semifinales - Duelo 2',
    matchNumber: 6,
    bladerA: null,
    bladerB: null,
    scoreA: 0,
    scoreB: 0,
    targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
    status: 'upcoming',
    winnerId: null,
    cornerA: 'Red',
    cornerB: 'Blue',
    stage: 'playoff',
    nextMatchId: 'playoff-grand-final',
    nextMatchSlot: 'B',
    events: []
  };

  const grandFinal: Match = {
    id: 'playoff-grand-final',
    roundNumber: 3,
    roundName: 'Gran Final',
    matchNumber: 7,
    bladerA: null,
    bladerB: null,
    scoreA: 0,
    scoreB: 0,
    targetScore: config.type === 'series' ? 1 : config.victoryConditions?.pointsToWin || 5,
    status: 'upcoming',
    winnerId: null,
    cornerA: 'Red',
    cornerB: 'Blue',
    stage: 'playoff',
    events: []
  };

  const matches = [qf1, qf2, qf3, qf4, semi1, semi2, grandFinal];

  // Auto-advance BYEs
  matches.forEach(match => {
    if (match.bladerA && !match.bladerB) {
      match.status = 'finished';
      match.winnerId = match.bladerA.id;
      match.winnerName = match.bladerA.name;
      if (match.nextMatchId && match.nextMatchSlot) {
        const nextM = matches.find(m => m.id === match.nextMatchId);
        if (nextM) {
          if (match.nextMatchSlot === 'A') nextM.bladerA = match.bladerA;
          else nextM.bladerB = match.bladerA;
        }
      }
    }
  });

  // Ensure first playable match is marked as live
  const firstPlayable = matches.find(m => m.status !== 'finished' && m.bladerA && m.bladerB);
  if (firstPlayable) {
    // Reset all to upcoming first to ensure only one live match
    matches.forEach(m => { if (m.status === 'live') m.status = 'upcoming'; });
    firstPlayable.status = 'live';
  }

  return matches;
}

// -------------------------------------------------------------
// 4. MAIN TOURNAMENT GENERATOR ROUTER
// -------------------------------------------------------------
export function generateTournamentBracket(
  bladers: Blader[],
  config: TournamentConfig
): Match[] {
  if (bladers.length < 2) return [];

  // Single Elimination format ALWAYS creates direct knockout bracket
  if (config.type === 'elimination') {
    return generateSingleEliminationBracket(bladers, config);
  }

  // League & Series format (2-phase: Regular Phase by Points -> Playoffs Cutoff)
  // Series is identical to League but each match is 1 batalla decisiva (targetScore=1)

  // League format (2-phase: Regular Phase by Points -> Playoffs Cutoff)
  if (config.tournamentPhase === 'playoffs') {
    return generatePlayoffBracketFromRankings(bladers, config);
  }

  // If 2 bladers in League, direct match
  if (bladers.length === 2) {
    return [
      {
        id: 'match-final-direct',
        roundNumber: 1,
        roundName: 'Gran Final',
        matchNumber: 1,
        bladerA: bladers[0],
        bladerB: bladers[1],
        scoreA: 0,
        scoreB: 0,
        targetScore: config.victoryConditions?.pointsToWin || 5,
        status: 'live',
        winnerId: null,
        cornerA: 'Red',
        cornerB: 'Blue',
        stage: 'playoff',
        events: []
      }
    ];
  }

  // Regular Phase matches for League
  return generateRegularPhaseMatches(bladers, config);
}

// -------------------------------------------------------------
// 5. ADVANCE WINNER IN BRACKET
// -------------------------------------------------------------
export function advanceWinnerInBracket(
  matches: Match[],
  finishedMatchId: string,
  winningBlader: Blader,
  finalScoreA?: number,
  finalScoreB?: number
): Match[] {
  const currentMatch = matches.find((m) => m.id === finishedMatchId);
  if (!currentMatch) return matches;

  return matches.map((m) => {
    // 1. Update the finished match
    if (m.id === finishedMatchId) {
      return {
        ...m,
        scoreA: typeof finalScoreA === 'number' ? finalScoreA : m.scoreA,
        scoreB: typeof finalScoreB === 'number' ? finalScoreB : m.scoreB,
        status: 'finished',
        winnerId: winningBlader.id,
        winnerName: winningBlader.name
      };
    }

    // 2. Check if this match is the recipient of the winner
    if (currentMatch.nextMatchId && m.id === currentMatch.nextMatchId) {
      const updated = { ...m };
      if (currentMatch.nextMatchSlot === 'A') {
        updated.bladerA = winningBlader;
      } else {
        updated.bladerB = winningBlader;
      }
      return updated;
    }

    return m;
  });
}

