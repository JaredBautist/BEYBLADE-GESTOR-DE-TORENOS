import { createClient } from '@supabase/supabase-js';
import { Blader, RegisteredCombo, TournamentRecord, Match, BeybladePart, TournamentConfig } from '../types';

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://xpvecyvaoldgqkgflczn.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZyFWfj60_V9NHPksxfvwcw_k1fYWTBg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const SUPABASE_SQL_SETUP = `-- Script SQL para crear las tablas en tu base de datos Supabase: 'beybladetorneo'
-- Copia y pega esto en el 'SQL Editor' de tu panel de Supabase:

CREATE TABLE IF NOT EXISTS bladers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  team TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  combos JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{"matchesPlayed":0,"wins":0,"losses":0,"pointsScored":0,"xtremeFinishes":0,"burstFinishes":0,"overFinishes":0,"spinFinishes":0}'::jsonb,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
  name TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT,
  weight TEXT,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  blader_id TEXT,
  blader_name TEXT NOT NULL,
  blade TEXT NOT NULL,
  ratchet TEXT NOT NULL,
  bit TEXT NOT NULL,
  type TEXT NOT NULL,
  weight TEXT,
  image TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_history (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  season TEXT,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  winner_name TEXT NOT NULL,
  runner_up_name TEXT,
  third_place_name TEXT,
  total_matches INTEGER DEFAULT 0,
  total_bladers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  winner_avatar TEXT,
  matches_summary JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  round_number INTEGER,
  round_name TEXT,
  match_number INTEGER,
  blader_a JSONB,
  blader_b JSONB,
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  target_score INTEGER DEFAULT 4,
  status TEXT DEFAULT 'upcoming',
  winner_id TEXT,
  winner_name TEXT,
  corner_a TEXT DEFAULT 'Red',
  corner_b TEXT DEFAULT 'Blue',
  events JSONB DEFAULT '[]'::jsonb,
  is_casual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_config (
  id TEXT PRIMARY KEY DEFAULT 'main_community',
  league_name TEXT NOT NULL,
  community_tagline TEXT,
  community_city TEXT,
  organizer_name TEXT,
  event_name TEXT,
  season TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_config (
  id TEXT PRIMARY KEY DEFAULT 'main_tournament',
  type TEXT DEFAULT 'elimination',
  battle_scale TEXT DEFAULT '3v3',
  victory_conditions JSONB,
  max_participants INTEGER DEFAULT 32,
  arena_status TEXT DEFAULT 'Xtreme Stadium A',
  is_started BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar lectura/escritura pública (Row Level Security deshabilitado o políticas públicas)
ALTER TABLE bladers DISABLE ROW LEVEL SECURITY;
ALTER TABLE parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE combos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_config DISABLE ROW LEVEL SECURITY;
`;

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from('bladers').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet
        return {
          success: true,
          message: 'Conectado a Supabase (Tablas pendientes de inicializar con el script SQL)'
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Conectado exitosamente a Supabase (beybladetorneo)' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error al conectar con Supabase' };
  }
}

// -------------------------------------------------------------
// BLADERS API
// -------------------------------------------------------------
export async function syncBladerToSupabase(blader: Blader): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: blader.id,
      name: blader.name,
      alias: blader.alias || blader.name,
      team: blader.team || 'Solo',
      avatar_url: blader.avatarUrl || null,
      verified: !!blader.verified,
      combos: blader.combos || [],
      badges: blader.badges || [],
      stats: blader.stats || {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsScored: 0,
        xtremeFinishes: 0,
        burstFinishes: 0,
        overFinishes: 0,
        spinFinishes: 0
      },
      registered_at: blader.registeredAt ? (blader.registeredAt.includes('T') ? blader.registeredAt : new Date(blader.registeredAt).toISOString()) : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('bladers').upsert(payload);
    if (error) {
      console.error('Supabase sync blader error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase sync blader warning:', e);
    return { success: false, error: e?.message || 'Error desconocido al guardar en Supabase' };
  }
}

export async function syncAllBladersToSupabase(bladers: Blader[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (!bladers || bladers.length === 0) return { success: true, count: 0 };
  try {
    const payloads = bladers.map((blader) => ({
      id: blader.id,
      name: blader.name,
      alias: blader.alias || blader.name,
      team: blader.team || 'Solo',
      avatar_url: blader.avatarUrl || null,
      verified: !!blader.verified,
      combos: blader.combos || [],
      badges: blader.badges || [],
      stats: blader.stats || {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsScored: 0,
        xtremeFinishes: 0,
        burstFinishes: 0,
        overFinishes: 0,
        spinFinishes: 0
      },
      registered_at: blader.registeredAt ? (blader.registeredAt.includes('T') ? blader.registeredAt : new Date(blader.registeredAt).toISOString()) : new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('bladers').upsert(payloads);
    if (error) {
      console.error('Supabase sync all bladers error:', error);
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: payloads.length };
  } catch (e: any) {
    console.warn('Supabase sync all bladers warning:', e);
    return { success: false, count: 0, error: e?.message || 'Error de conexión' };
  }
}

export async function fetchBladersFromSupabase(): Promise<Blader[] | null> {
  try {
    const { data, error } = await supabase.from('bladers').select('*').order('name', { ascending: true });
    if (error || !data) {
      if (error) console.error('Supabase fetch bladers error:', error);
      return null;
    }
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      alias: row.alias || row.name,
      team: row.team || 'Solo',
      avatarUrl: row.avatar_url || '',
      verified: !!row.verified,
      combos: row.combos || [],
      badges: row.badges || [],
      stats: row.stats || {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsScored: 0,
        xtremeFinishes: 0,
        burstFinishes: 0,
        overFinishes: 0,
        spinFinishes: 0
      },
      registeredAt: row.registered_at || new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Supabase fetch bladers error:', e);
    return null;
  }
}

export async function deleteBladerFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('bladers').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete blader error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase delete blader warning:', e);
    return { success: false, error: e?.message };
  }
}

export async function deleteAllBladersFromSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('bladers').delete().neq('id', '___force_delete_all_bladers___');
    if (error) {
      console.error('Supabase deleteAllBladers error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase deleteAllBladers warning:', e);
    return { success: false, error: e?.message };
  }
}

// -------------------------------------------------------------
// BEYBLADE X PARTS API
// -------------------------------------------------------------
export async function syncPartToSupabase(part: BeybladePart) {
  try {
    await supabase.from('parts').upsert({
      name: part.name,
      type: part.type,
      category: part.category || null,
      weight: part.weight || null,
      description: part.description || null,
      image: part.image || null,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase sync part warning:', e);
  }
}

export async function fetchPartsFromSupabase(): Promise<BeybladePart[] | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((row: any) => ({
      name: row.name,
      type: row.type,
      category: row.category || undefined,
      weight: row.weight || undefined,
      description: row.description || undefined,
      image: row.image || undefined
    }));
  } catch (e) {
    console.warn('Supabase fetch parts error:', e);
    return null;
  }
}

export async function deletePartFromSupabase(name: string) {
  try {
    await supabase.from('parts').delete().eq('name', name);
  } catch (e) {
    console.warn('Supabase delete part warning:', e);
  }
}

// -------------------------------------------------------------
// COMBOS API
// -------------------------------------------------------------
export async function syncComboToSupabase(combo: RegisteredCombo) {
  try {
    await supabase.from('combos').upsert({
      id: combo.id,
      blader_id: combo.bladerId || null,
      blader_name: combo.bladerName,
      blade: combo.blade,
      ratchet: combo.ratchet,
      bit: combo.bit,
      type: combo.type,
      weight: combo.weight || null,
      image: combo.image || null,
      notes: combo.notes || null,
      created_at: combo.createdAt || new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase sync combo warning:', e);
  }
}

export async function fetchCombosFromSupabase(): Promise<RegisteredCombo[] | null> {
  try {
    const { data, error } = await supabase
      .from('combos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      bladerId: row.blader_id,
      bladerName: row.blader_name,
      blade: row.blade,
      ratchet: row.ratchet,
      bit: row.bit,
      type: row.type,
      weight: row.weight,
      image: row.image || undefined,
      notes: row.notes,
      createdAt: row.created_at
    }));
  } catch (e) {
    console.warn('Supabase fetch combos error:', e);
    return null;
  }
}

export async function deleteComboFromSupabase(id: string) {
  try {
    await supabase.from('combos').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete combo warning:', e);
  }
}

export async function deleteAllCombosFromSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('combos').delete().neq('id', '___force_delete_all_combos___');
    if (error) {
      console.error('Supabase deleteAllCombos error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase deleteAllCombos warning:', e);
    return { success: false, error: e?.message };
  }
}

// -------------------------------------------------------------
// TOURNAMENT & CASUAL HISTORY API
// -------------------------------------------------------------
export async function syncTournamentRecordToSupabase(record: TournamentRecord) {
  try {
    await supabase.from('tournament_history').upsert({
      id: record.id,
      title: record.title,
      date: record.date,
      season: record.season,
      type: record.type,
      format: record.format,
      winner_name: record.winnerName,
      runner_up_name: record.runnerUpName || null,
      third_place_name: record.thirdPlaceName || null,
      total_matches: record.totalMatches,
      total_bladers: record.totalBladers,
      total_points: record.totalPoints,
      winner_avatar: record.winnerAvatar || null,
      participants_snapshot: record.participantsSnapshot || [],
      registered_combos: record.registeredCombos || [],
      matches_summary: record.matchesSummary || [],
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase sync history warning:', e);
  }
}

export async function fetchHistoryFromSupabase(): Promise<TournamentRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('tournament_history')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      season: row.season,
      type: row.type,
      format: row.format,
      winnerName: row.winner_name,
      runnerUpName: row.runner_up_name,
      thirdPlaceName: row.third_place_name,
      totalMatches: row.total_matches || 0,
      totalBladers: row.total_bladers || 0,
      totalPoints: row.total_points || 0,
      winnerAvatar: row.winner_avatar,
      participantsSnapshot: row.participants_snapshot || [],
      registeredCombos: row.registered_combos || [],
      matchesSummary: row.matches_summary || []
    }));
  } catch (e) {
    console.warn('Supabase fetch history error:', e);
    return null;
  }
}

export async function deleteHistoryRecordFromSupabase(id: string) {
  try {
    await supabase.from('tournament_history').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete history warning:', e);
  }
}

// -------------------------------------------------------------
// COMMUNITY CONFIG API
// -------------------------------------------------------------
export async function syncCommunityConfigToSupabase(config: {
  leagueName: string;
  communityTagline?: string;
  communityCity?: string;
  organizerName?: string;
  eventName?: string;
  season?: string;
  logoUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('community_config').upsert({
      id: 'main_community',
      league_name: config.leagueName || 'Comunidad Beyblade Cúcuta',
      community_tagline: config.communityTagline || 'CÚCUTA • OFICIAL',
      community_city: config.communityCity || 'Cúcuta',
      organizer_name: config.organizerName || 'Juez Oficial',
      event_name: config.eventName || 'Torneo Oficial Beyblade X',
      season: config.season || 'Temporada Oficial',
      logo_url: config.logoUrl || null,
      updated_at: new Date().toISOString()
    });
    if (error) {
      console.error('Supabase sync community config error:', error);
      alert('Error guardando configuración en la base de datos: ' + error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase sync community config warning:', e);
    alert('Excepción guardando configuración: ' + e?.message);
    return { success: false, error: e?.message };
  }
}

export async function fetchCommunityConfigFromSupabase(): Promise<{
  leagueName?: string;
  communityTagline?: string;
  communityCity?: string;
  organizerName?: string;
  eventName?: string;
  season?: string;
  logoUrl?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('community_config')
      .select('*')
      .eq('id', 'main_community')
      .single();
    if (error || !data) return null;
    return {
      leagueName: data.league_name,
      communityTagline: data.community_tagline,
      communityCity: data.community_city,
      organizerName: data.organizer_name,
      eventName: data.event_name || data.tournament_name,
      season: data.season,
      logoUrl: data.logo_url || undefined
    };
  } catch (e) {
    console.warn('Supabase fetch community config error:', e);
    return null;
  }
}

// -------------------------------------------------------------
// TOURNAMENT FORMAT & RULES API
// -------------------------------------------------------------
export async function syncTournamentFormatToSupabase(format: {
  type: any;
  battleScale: any;
  victoryConditions: any;
  maxParticipants: number;
  arenaStatus: string;
  isStarted?: boolean;
  regularPhaseMatchesPerBlader?: number;
  playoffCutoffType?: 'top_n' | 'min_points';
  playoffCutoffCount?: 8 | 4 | 2;
  minPointsToQualify?: number;
  tournamentPhase?: 'regular' | 'playoffs' | 'single_elimination';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('tournament_config').upsert({
      id: 'main_tournament',
      type: format.type,
      battle_scale: format.battleScale,
      victory_conditions: format.victoryConditions,
      max_participants: format.maxParticipants,
      arena_status: format.arenaStatus,
      is_started: !!format.isStarted,
      regular_phase_matches_per_blader: format.regularPhaseMatchesPerBlader ?? 2,
      playoff_cutoff_type: format.playoffCutoffType ?? 'top_n',
      playoff_cutoff_count: format.playoffCutoffCount ?? 4,
      min_points_to_qualify: format.minPointsToQualify ?? 4,
      tournament_phase: format.tournamentPhase ?? 'regular',
      updated_at: new Date().toISOString()
    });
    if (error) {
      console.error('Supabase sync tournament format error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase sync tournament format warning:', e);
    return { success: false, error: e?.message };
  }
}

export async function fetchTournamentFormatFromSupabase(): Promise<{
  type?: any;
  battleScale?: any;
  victoryConditions?: any;
  maxParticipants?: number;
  arenaStatus?: string;
  isStarted?: boolean;
  regularPhaseMatchesPerBlader?: number;
  playoffCutoffType?: 'top_n' | 'min_points';
  playoffCutoffCount?: 8 | 4 | 2;
  minPointsToQualify?: number;
  tournamentPhase?: 'regular' | 'playoffs' | 'single_elimination';
} | null> {
  try {
    const { data, error } = await supabase
      .from('tournament_config')
      .select('*')
      .eq('id', 'main_tournament')
      .single();
    if (error || !data) return null;
    return {
      type: data.type,
      battleScale: data.battle_scale,
      victoryConditions: data.victory_conditions,
      maxParticipants: data.max_participants,
      arenaStatus: data.arena_status,
      isStarted: data.is_started,
      regularPhaseMatchesPerBlader: data.regular_phase_matches_per_blader ?? 2,
      playoffCutoffType: data.playoff_cutoff_type ?? 'top_n',
      playoffCutoffCount: data.playoff_cutoff_count ?? 4,
      minPointsToQualify: data.min_points_to_qualify ?? 4,
      tournamentPhase: data.tournament_phase ?? 'regular'
    };
  } catch (e) {
    console.warn('Supabase fetch tournament format error:', e);
    return null;
  }
}

// -------------------------------------------------------------
// COMBINED CONFIG API (Backwards Compatibility)
// -------------------------------------------------------------
export async function syncConfigToSupabase(config: TournamentConfig) {
  try {
    await Promise.allSettled([
      syncCommunityConfigToSupabase({
        leagueName: config.leagueName,
        communityTagline: config.communityTagline,
        communityCity: config.communityCity,
        organizerName: config.organizerName,
        eventName: config.name,
        season: config.season,
        logoUrl: config.logoUrl
      }),
      syncTournamentFormatToSupabase({
        type: config.type,
        battleScale: config.battleScale,
        victoryConditions: config.victoryConditions,
        maxParticipants: config.maxParticipants,
        arenaStatus: config.arenaStatus,
        isStarted: config.isStarted
      })
    ]);
  } catch (e) {
    console.warn('Supabase sync config warning:', e);
  }
}

export async function fetchConfigFromSupabase(): Promise<Partial<TournamentConfig> | null> {
  try {
    const [communityData, formatData] = await Promise.all([
      fetchCommunityConfigFromSupabase(),
      fetchTournamentFormatFromSupabase()
    ]);

    if (!communityData && !formatData) {
      // Fallback check on older table row if present
      const { data } = await supabase
        .from('community_config')
        .select('*')
        .eq('id', 'main_config')
        .single();
      if (!data) return null;
      return {
        name: data.tournament_name || data.name,
        season: data.season,
        leagueName: data.league_name,
        communityTagline: data.community_tagline,
        communityCity: data.community_city,
        organizerName: data.organizer_name,
        logoUrl: data.logo_url || undefined,
        type: data.type,
        battleScale: data.battle_scale,
        victoryConditions: data.victory_conditions,
        maxParticipants: data.max_participants,
        arenaStatus: data.arena_status,
        isStarted: data.is_started
      };
    }

    const resultObj = {
      leagueName: communityData?.leagueName,
      communityTagline: communityData?.communityTagline,
      communityCity: communityData?.communityCity,
      organizerName: communityData?.organizerName,
      name: communityData?.eventName,
      season: communityData?.season,
      logoUrl: communityData?.logoUrl,
      type: formatData?.type,
      battleScale: formatData?.battleScale,
      victoryConditions: formatData?.victoryConditions,
      maxParticipants: formatData?.maxParticipants,
      arenaStatus: formatData?.arenaStatus,
      isStarted: formatData?.isStarted
    };

    // Remove undefined fields so they don't overwrite defaults when spreading
    return Object.fromEntries(
      Object.entries(resultObj).filter(([_, v]) => v !== undefined)
    );
  } catch (e) {
    console.warn('Supabase fetch config error:', e);
    return null;
  }
}

// -------------------------------------------------------------
// MATCHES API
// -------------------------------------------------------------
export async function syncMatchToSupabase(match: Match): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('matches').upsert({
      id: match.id,
      round_number: match.roundNumber,
      round_name: match.roundName,
      match_number: match.matchNumber,
      blader_a: match.bladerA,
      blader_b: match.bladerB,
      score_a: match.scoreA,
      score_b: match.scoreB,
      target_score: match.targetScore,
      status: match.status,
      winner_id: match.winnerId,
      winner_name: match.winnerName,
      corner_a: match.cornerA,
      corner_b: match.cornerB,
      events: match.events || []
    });
    if (error) {
      console.error('Supabase sync match error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase sync match warning:', e);
    return { success: false, error: e?.message };
  }
}

export async function fetchMatchesFromSupabase(): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_number', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      roundNumber: row.round_number || 1,
      roundName: row.round_name || `Ronda ${row.round_number || 1}`,
      matchNumber: row.match_number || 1,
      bladerA: row.blader_a,
      bladerB: row.blader_b,
      scoreA: row.score_a || 0,
      scoreB: row.score_b || 0,
      targetScore: row.target_score || 5,
      status: (row.status as 'upcoming' | 'live' | 'finished') || 'upcoming',
      winnerId: row.winner_id || null,
      winnerName: row.winner_name,
      cornerA: row.corner_a || 'Red',
      cornerB: row.corner_b || 'Blue',
      events: row.events || []
    }));
  } catch (e) {
    console.warn('Supabase fetch matches error:', e);
    return [];
  }
}

export async function deleteMatchFromSupabase(id: string) {
  try {
    await supabase.from('matches').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete match warning:', e);
  }
}

export async function deleteAllMatchesFromSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('matches').delete().neq('id', '___force_delete_all_matches___');
    if (error) {
      console.error('Supabase deleteAllMatches error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.warn('Supabase deleteAllMatches warning:', e);
    return { success: false, error: e?.message };
  }
}

// -------------------------------------------------------------
// REALTIME MULTI-DEVICE CONCURRENCY SUBSCRIPTIONS
// -------------------------------------------------------------
export function subscribeToDatabaseChanges(callbacks: {
  onBladersChange?: () => void;
  onMatchesChange?: () => void;
  onCombosChange?: () => void;
  onPartsChange?: () => void;
  onHistoryChange?: () => void;
  onConfigChange?: () => void;
}) {
  const channel = supabase
    .channel('public_realtime_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bladers' },
      () => {
        callbacks.onBladersChange?.();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'matches' },
      () => {
        callbacks.onMatchesChange?.();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'combos' },
      () => {
        callbacks.onCombosChange?.();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'parts' },
      () => {
        callbacks.onPartsChange?.();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tournament_history' },
      () => {
        callbacks.onHistoryChange?.();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tournament_config' },
      () => {
        callbacks.onConfigChange?.();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'community_config' },
      () => {
        callbacks.onConfigChange?.();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}


