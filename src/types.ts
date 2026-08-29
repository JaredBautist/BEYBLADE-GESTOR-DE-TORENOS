export type TournamentType = 'league' | 'elimination' | 'series';
export type BattleScale = '1v1' | '2v2' | '3v3' | '4v4';

export interface BeybladePart {
  name: string;
  type: 'Blade' | 'Ratchet' | 'Bit';
  category?: 'Attack' | 'Defense' | 'Stamina' | 'Balance';
  weight?: string;
  description?: string;
  image?: string;
}

export interface BladerCombo {
  slot: 1 | 2 | 3;
  blade: string;
  ratchet: string;
  bit: string;
  name: string;
  imageUrl?: string;
}

export interface Blader {
  id: string;
  name: string;
  alias: string;
  team: string;
  avatarUrl: string;
  verified: boolean;
  registeredAt: string;
  combos: BladerCombo[];
  badges?: string[];
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    pointsScored: number;
    xtremeFinishes: number;
    burstFinishes: number;
    overFinishes: number;
    spinFinishes: number;
  };
}

export interface RegisteredCombo {
  id: string;
  bladerId?: string;
  bladerName: string;
  blade: string;
  ratchet: string;
  bit: string;
  type: 'Attack' | 'Defense' | 'Stamina' | 'Balance';
  weight?: string;
  image?: string;
  notes?: string;
  createdAt: string;
}

export interface TournamentRecord {
  id: string;
  title: string;
  date: string;
  season?: string;
  type: 'tournament' | 'casual';
  format: TournamentType;
  winnerName: string;
  runnerUpName?: string;
  thirdPlaceName?: string;
  totalMatches: number;
  totalBladers: number;
  totalPoints: number;
  winnerAvatar?: string;
  matchesSummary?: {
    bladerA: string;
    bladerB: string;
    scoreA: number;
    scoreB: number;
    winner: string;
  }[];
}

export interface VictoryConditions {
  pointsToWin: number;
  xtremeDashPts: number;
  burstFinishPts: number;
  overFinishPts: number;
  spinFinishPts: number;
  stadiumOutPts: number;
}

export interface CommunityConfig {
  leagueName: string;
  communityTagline?: string;
  communityCity?: string;
  organizerName?: string;
  eventName?: string;
  season?: string;
  logoUrl?: string;
}

export interface TournamentFormatConfig {
  type: TournamentType;
  battleScale: BattleScale;
  victoryConditions: VictoryConditions;
  maxParticipants: number;
  arenaStatus: string;
  isStarted: boolean;
}

export interface TournamentConfig {
  name: string;
  season: string;
  leagueName: string;
  communityTagline?: string;
  communityCity?: string;
  organizerName?: string;
  logoUrl?: string;
  type: TournamentType;
  battleScale: BattleScale;
  victoryConditions: VictoryConditions;
  maxParticipants: number;
  arenaStatus: string;
  isStarted: boolean;
}

export interface MatchEvent {
  id: string;
  timestamp: string;
  bladerCorner: 'A' | 'B';
  bladerName: string;
  pointType: 'xtreme' | 'burst' | 'over' | 'spin' | 'stadium';
  points: number;
  scoreAAfter: number;
  scoreBAfter: number;
  description: string;
}

export interface Match {
  id: string;
  roundNumber: number;
  roundName: string; // e.g. "Quarterfinals", "Semifinals", "Grand Final", "3rd Place"
  matchNumber: number;
  bladerA: Blader | null;
  bladerB: Blader | null;
  scoreA: number;
  scoreB: number;
  targetScore: number;
  status: 'upcoming' | 'live' | 'finished';
  winnerId: string | null;
  winnerName?: string;
  events: MatchEvent[];
  startedAt?: string;
  finishedAt?: string;
  cornerA: string; // 'Red'
  cornerB: string; // 'Blue'
  nextMatchId?: string;
  nextMatchSlot?: 'A' | 'B';
}

export type ActiveScreen = 
  | 'tournament_format'
  | 'dashboard'
  | 'bracket'
  | 'bladers'
  | 'matches'
  | 'community_config'
  | 'configuration'
  | 'equipment'
  | 'history'
  | 'rules';
