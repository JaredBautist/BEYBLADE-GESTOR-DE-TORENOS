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

export function generateTournamentBracket(
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
        targetScore: config.victoryConditions?.pointsToWin || 5,
        status: 'upcoming',
        winnerId: null,
        cornerA: 'Red',
        cornerB: 'Blue',
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

    // If only one blader in match (BYE / pase directo)
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
    } else if (bA && bB) {
      // First match with two bladers can be live
      if (m === 0) {
        match.status = 'live';
      }
    }
  }

  // Flatten all matches in order of rounds
  const allMatches: Match[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    allMatches.push(...roundMatchesMap[r]);
  }

  return allMatches;
}

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
