import { Blader, BeybladePart, TournamentConfig, Match } from '../types';
import { OFFICIAL_BEYBLADE_X_CATALOG } from './officialParts';

// Piezas y Bladers iniciales limpios (0 datos mocks)
export const INITIAL_BEYBLADE_PARTS: BeybladePart[] = [];

// Bladers Roster inicial limpio (sin datos mocks)
export const INITIAL_BLADERS: Blader[] = [];

export const INITIAL_CONFIG: TournamentConfig = {
  name: 'Torneo Oficial Beyblade X',
  season: 'Temporada Oficial',
  leagueName: 'Comunidad Beyblade Cúcuta',
  communityTagline: 'CÚCUTA • OFICIAL',
  communityCity: 'Cúcuta',
  organizerName: 'Juez Oficial • Cúcuta',
  type: 'elimination',
  battleScale: '1v1',
  victoryConditions: {
    pointsToWin: 5,
    xtremeDashPts: 3,
    burstFinishPts: 2,
    overFinishPts: 2,
    spinFinishPts: 1,
    stadiumOutPts: 2
  },
  maxParticipants: 32,
  arenaStatus: 'Xtreme Stadium A',
  isStarted: false,
  regularPhaseMatchesPerBlader: 2,
  playoffCutoffType: 'top_n',
  playoffCutoffCount: 4,
  minPointsToQualify: 4,
  tournamentPhase: 'regular'
};

// Zero mock matches - clean tournament state
export const INITIAL_MATCHES: Match[] = [];
