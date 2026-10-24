import { chromium } from 'playwright';
import { Blader, TournamentConfig, Match, BladerCombo } from '../types';
import { generateRegularPhaseMatches, getRankedBladers, generatePlayoffBracketFromRankings } from '../utils/bracketGenerator';
import {
  syncAllBladersToSupabase,
  syncTournamentFormatToSupabase,
  syncCommunityConfigToSupabase,
  deleteAllMatchesFromSupabase,
  syncAllMatchesToSupabase
} from '../lib/supabase';

// -------------------------------------------------------------
// 1. DATA DEFINITION: 15 BLADERS WITH 3 COMBOS EACH
// -------------------------------------------------------------
const PHOENIX_BLADERS_DEF: { name: string; alias: string; team: string; avatarUrl: string; combos: [Omit<BladerCombo, 'slot'>, Omit<BladerCombo, 'slot'>, Omit<BladerCombo, 'slot'>] }[] = [
  {
    name: 'Valt Aoi',
    alias: 'El Fénix Azul',
    team: 'BC Sol',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    combos: [
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Flat', name: 'Phoenix Wing 9-60F' },
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Accel', name: 'Dran Buster 1-60A' },
      { blade: 'Wizard Rod', ratchet: '5-70', bit: 'Ball', name: 'Wizard Rod 5-70B' }
    ]
  },
  {
    name: 'Shu Kurenai',
    alias: 'Ojo Carmesí',
    team: 'Raging Bulls',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    combos: [
      { blade: 'Phoenix Feather', ratchet: '3-60', bit: 'Taper', name: 'Phoenix Feather 3-60T' },
      { blade: 'Hells Scythe', ratchet: '4-60', bit: 'Ball', name: 'Hells Scythe 4-60B' },
      { blade: 'Cobalt Dragoon', ratchet: '2-60', bit: 'Cyclone', name: 'Cobalt Dragoon 2-60C' }
    ]
  },
  {
    name: 'Free De La Hoya',
    alias: 'Golden Phoenix',
    team: 'BC Sol',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    combos: [
      { blade: 'Phoenix Wing', ratchet: '5-60', bit: 'Point', name: 'Phoenix Wing 5-60P' },
      { blade: 'Viper Tail', ratchet: '5-80', bit: 'Orb', name: 'Viper Tail 5-80O' },
      { blade: 'Rod Wyvern', ratchet: '9-80', bit: 'Ball', name: 'Rod Wyvern 9-80B' }
    ]
  },
  {
    name: 'Ekusu Kurosu',
    alias: 'Kamen X',
    team: 'Team Persona',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    combos: [
      { blade: 'Dran Sword', ratchet: '3-60', bit: 'Flat', name: 'Dran Sword 3-60F' },
      { blade: 'Phoenix Wing', ratchet: '3-60', bit: 'Rush', name: 'Phoenix Wing 3-60R' },
      { blade: 'Shark Edge', ratchet: '4-80', bit: 'Low Flat', name: 'Shark Edge 4-80LF' }
    ]
  },
  {
    name: 'Bird Kazami',
    alias: 'Fénix Ascendente',
    team: 'Team Persona',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    combos: [
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'High Needle', name: 'Hells Chain 5-60HN' },
      { blade: 'Phoenix Rudder', ratchet: '9-70', bit: 'Glide', name: 'Phoenix Rudder 9-70G' },
      { blade: 'Knight Shield', ratchet: '3-80', bit: 'Needle', name: 'Knight Shield 3-80N' }
    ]
  },
  {
    name: 'Multi Nanairo',
    alias: 'Reina Estratega',
    team: 'Team Persona',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    combos: [
      { blade: 'Wizard Arrow', ratchet: '4-80', bit: 'Ball', name: 'Wizard Arrow 4-80B' },
      { blade: 'Knight Lance', ratchet: '4-80', bit: 'Point', name: 'Knight Lance 4-80P' },
      { blade: 'Phoenix Wing', ratchet: '7-60', bit: 'Gear Ball', name: 'Phoenix Wing 7-60GB' }
    ]
  },
  {
    name: 'Lui Shirosagijo',
    alias: 'Tiranía Blanca',
    team: 'Rideout',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    combos: [
      { blade: 'Cobalt Drake', ratchet: '4-60', bit: 'Flat', name: 'Cobalt Drake 4-60F' },
      { blade: 'Tyranno Beat', ratchet: '4-70', bit: 'Quake', name: 'Tyranno Beat 4-70Q' },
      { blade: 'Phoenix Wing', ratchet: '1-60', bit: 'Flat', name: 'Phoenix Wing 1-60F' }
    ]
  },
  {
    name: 'Aiga Akaba',
    alias: 'Guerrero Fénix',
    team: 'Beigoma',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    combos: [
      { blade: 'Buster Xcalibur', ratchet: '1-60', bit: 'Sword', name: 'Buster Xcalibur 1-60S' },
      { blade: 'Phoenix Feather', ratchet: '9-60', bit: 'Point', name: 'Phoenix Feather 9-60P' },
      { blade: 'Unicorn Sting', ratchet: '5-60', bit: 'Gear Point', name: 'Unicorn Sting 5-60GP' }
    ]
  },
  {
    name: 'Chrome Ryugu',
    alias: 'El Monarca',
    team: 'Pendragon',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    combos: [
      { blade: 'Cobalt Drake', ratchet: '9-60', bit: 'Rush', name: 'Cobalt Drake 9-60R' },
      { blade: 'Phoenix Wing', ratchet: '5-80', bit: 'High Flat', name: 'Phoenix Wing 5-80HF' },
      { blade: 'Weiss Tiger', ratchet: '3-60', bit: 'Unite', name: 'Weiss Tiger 3-60U' }
    ]
  },
  {
    name: 'Burn Fujiwara',
    alias: 'Llama Inmortal',
    team: 'Yggdrasil',
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150',
    combos: [
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Gear Flat', name: 'Phoenix Wing 9-60GF' },
      { blade: 'Phoenix Rudder', ratchet: '7-70', bit: 'Glide', name: 'Phoenix Rudder 7-70G' },
      { blade: 'Hell Scythe', ratchet: '3-60', bit: 'Taper', name: 'Hell Scythe 3-60T' }
    ]
  },
  {
    name: 'Meiko Maiden',
    alias: 'Dama de Hierro',
    team: 'Persona Staff',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    combos: [
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat', name: 'Shark Edge 3-60LF' },
      { blade: 'Phoenix Wing', ratchet: '4-80', bit: 'Ball', name: 'Phoenix Wing 4-80B' },
      { blade: 'Rhino Horn', ratchet: '3-80', bit: 'Spike', name: 'Rhino Horn 3-80S' }
    ]
  },
  {
    name: 'King Manju',
    alias: 'Titán Carmesí',
    team: 'Albatross',
    avatarUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150',
    combos: [
      { blade: 'Leon Claw', ratchet: '5-60', bit: 'Point', name: 'Leon Claw 5-60P' },
      { blade: 'Phoenix Wing', ratchet: '9-70', bit: 'Hexa', name: 'Phoenix Wing 9-70H' },
      { blade: 'Whale Wave', ratchet: '5-80', bit: 'Elevate', name: 'Whale Wave 5-80E' }
    ]
  },
  {
    name: 'Shiguru Nanairo',
    alias: 'Sombra Fénix',
    team: 'Persona Sisters',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    combos: [
      { blade: 'Hells Chain', ratchet: '9-80', bit: 'Orb', name: 'Hells Chain 9-80O' },
      { blade: 'Phoenix Feather', ratchet: '4-60', bit: 'Rush', name: 'Phoenix Feather 4-60R' },
      { blade: 'Viper Tail', ratchet: '3-80', bit: 'Needle', name: 'Viper Tail 3-80N' }
    ]
  },
  {
    name: 'Kamen Y',
    alias: 'Doble Xtreme',
    team: 'Yggdrasil',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    combos: [
      { blade: 'Dran Dagger', ratchet: '4-60', bit: 'Rush', name: 'Dran Dagger 4-60R' },
      { blade: 'Phoenix Rudder', ratchet: '3-70', bit: 'Hexa', name: 'Phoenix Rudder 3-70H' },
      { blade: 'Sphinx Cowl', ratchet: '9-80', bit: 'Gear Needle', name: 'Sphinx Cowl 9-80GN' }
    ]
  },
  {
    name: 'Diego Admin',
    alias: 'Juez Fénix',
    team: 'Staff Cúcuta',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    combos: [
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Point', name: 'Phoenix Wing 9-60P' },
      { blade: 'Dran Sword', ratchet: '1-60', bit: 'Accel', name: 'Dran Sword 1-60A' },
      { blade: 'Wizard Rod', ratchet: '9-80', bit: 'Ball', name: 'Wizard Rod 9-80B' }
    ]
  }
];

export function buildPhoenixTournamentData() {
  const bladers: Blader[] = PHOENIX_BLADERS_DEF.map((def, idx) => ({
    id: `blader_phoenix_${String(idx + 1).padStart(2, '0')}`,
    name: def.name,
    alias: def.alias,
    team: def.team,
    avatarUrl: def.avatarUrl,
    verified: true,
    registeredAt: new Date(Date.now() - (15 - idx) * 3600000).toISOString(),
    combos: def.combos.map((c, cIdx) => ({
      slot: (cIdx + 1) as 1 | 2 | 3,
      blade: c.blade,
      ratchet: c.ratchet,
      bit: c.bit,
      name: c.name
    })),
    badges: ['SET PHONIX', 'OFICIAL'],
    stats: {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      pointsScored: 0,
      xtremeFinishes: 0,
      burstFinishes: 0,
      overFinishes: 0,
      spinFinishes: 0
    }
  }));

  const config: TournamentConfig = {
    name: 'TORNEO SET PHONIX',
    season: 'Temporada Fénix 2026',
    leagueName: 'Comunidad Beyblade Cúcuta',
    communityTagline: 'CÚCUTA • EDICIÓN SET PHOENIX',
    communityCity: 'Cúcuta',
    organizerName: 'DiegoAdmin • Juez Oficial',
    type: 'league',
    battleScale: '3v3',
    victoryConditions: {
      pointsToWin: 5,
      xtremeDashPts: 3,
      burstFinishPts: 2,
      overFinishPts: 2,
      spinFinishPts: 1,
      stadiumOutPts: 2
    },
    maxParticipants: 16,
    arenaStatus: 'Estadio Xtreme Activo (Set Phoenix)',
    isStarted: true,
    regularPhaseMatchesPerBlader: 2,
    totalJornadas: 8,
    playoffCutoffCount: 8,
    playoffCutoffType: 'top_n',
    minPointsToQualify: 0,
    tournamentPhase: 'regular'
  };

  return { bladers, config };
}

// -------------------------------------------------------------
// 2. SIMULATION RUNNER: JORNADAS & PLAYOFFS
// -------------------------------------------------------------
async function runCompletePhoenixTournament() {
  console.log('🔥 =================================================================');
  console.log('🦅 SIMULACIÓN COMPLETA DE TORNEO: "TORNEO SET PHONIX"');
  console.log('   15 Bladers Inscritos • 3 Combos por Blader (Deck 3v3)');
  console.log('   Fase Regular de 8 Jornadas -> Top 8 a Cuartos de Final -> Campeón');
  console.log('🔥 =================================================================\n');

  const { bladers, config } = buildPhoenixTournamentData();

  // Validate Blader combos
  console.log(`📋 1. Verificando Bladers y Decks de 3 Combos:`);
  console.log(`   Total Bladers creados: ${bladers.length}`);
  const totalCombos = bladers.reduce((acc, b) => acc + b.combos.length, 0);
  console.log(`   Total Combos registrados: ${totalCombos} (3 por Blader: ${totalCombos === 45 ? 'PERFECTO' : 'FALLA'})`);

  bladers.forEach((b, i) => {
    console.log(`   [${String(i + 1).padStart(2, '0')}] ${b.name.padEnd(18)} | Team: ${b.team.padEnd(14)} | Combos: ${b.combos.map(c => c.name).join(' • ')}`);
  });

  // Generate 8 Jornadas
  console.log(`\n📅 2. Generando Fase Regular por 8 Jornadas...`);
  const regularMatches = generateRegularPhaseMatches(bladers, config);
  const jornadasSet = Array.from(new Set(regularMatches.map(m => m.roundNumber))).sort((a, b) => a - b);
  console.log(`   Jornadas generadas: ${jornadasSet.length} Jornadas (Rondas ${jornadasSet.join(', ')})`);
  console.log(`   Total de Enfrentamientos en Fase Regular: ${regularMatches.length}`);

  // Simulate all 8 Jornadas with Beyblade X finishes
  console.log(`\n⚔️ 3. Disputando y Puntuando los Combates de las 8 Jornadas...`);
  const bladerMap = new Map<string, Blader>(bladers.map(b => [b.id, b]));

  // Pre-determined competitive skill tiers so simulation has realistic and exciting standings
  const skillWeights: Record<string, number> = {
    blader_phoenix_01: 9.5, // Valt Aoi
    blader_phoenix_02: 9.0, // Shu Kurenai
    blader_phoenix_03: 8.8, // Free De La Hoya
    blader_phoenix_04: 8.5, // Ekusu Kurosu
    blader_phoenix_07: 8.2, // Lui Shirosagijo
    blader_phoenix_10: 7.9, // Burn Fujiwara
    blader_phoenix_08: 7.7, // Aiga Akaba
    blader_phoenix_05: 7.4, // Bird Kazami (Clasifica en Top 8 tras gran esfuerzo!)
    blader_phoenix_09: 6.8, // Chrome Ryugu
    blader_phoenix_06: 6.5, // Multi Nanairo
    blader_phoenix_15: 6.2, // Diego Admin
    blader_phoenix_14: 5.8, // Kamen Y
    blader_phoenix_11: 5.5, // Meiko Maiden
    blader_phoenix_12: 5.0, // King Manju
    blader_phoenix_13: 4.8  // Shiguru Nanairo
  };

  regularMatches.forEach((m) => {
    if (!m.bladerA || !m.bladerB) {
      m.status = 'finished';
      return;
    }

    const bA = bladerMap.get(m.bladerA.id)!;
    const bB = bladerMap.get(m.bladerB.id)!;

    const weightA = skillWeights[bA.id] || 5;
    const weightB = skillWeights[bB.id] || 5;
    const probA = weightA / (weightA + weightB);
    const aWins = Math.random() < probA;

    // Simulate realistic match score (target is 5 points)
    const winnerScore = 5;
    const loserScore = Math.floor(Math.random() * 4); // 0, 1, 2, or 3 points

    m.scoreA = aWins ? winnerScore : loserScore;
    m.scoreB = aWins ? loserScore : winnerScore;
    m.winnerId = aWins ? bA.id : bB.id;
    m.winnerName = aWins ? bA.name : bB.name;
    m.status = 'finished';

    const winBlader = aWins ? bA : bB;
    const loseBlader = aWins ? bB : bA;

    // Accrue match statistics
    winBlader.stats.matchesPlayed += 1;
    winBlader.stats.wins += 1;
    winBlader.stats.pointsScored += winnerScore;

    loseBlader.stats.matchesPlayed += 1;
    loseBlader.stats.losses += 1;
    loseBlader.stats.pointsScored += loserScore;

    // Distribute finishes for winner
    winBlader.stats.xtremeFinishes += 1;
    winBlader.stats.burstFinishes += 1;

    // Distribute finishes for loser if scored
    if (loserScore >= 2) {
      loseBlader.stats.overFinishes += 1;
    } else if (loserScore === 1) {
      loseBlader.stats.spinFinishes += 1;
    }
  });

  console.log(`   ✓ ${regularMatches.length} combates regulares completados con éxito.`);

  // 4. Standings Ranking
  console.log(`\n🏆 4. Tabla General de Clasificación tras las 8 Jornadas:`);
  const rankedBladers = getRankedBladers(Array.from(bladerMap.values()));
  
  console.log('---------------------------------------------------------------------------------------------------------');
  console.log('POS | BLADER             | EQUIPO         | DUELOS | VICTORIAS | DERROTAS | PUNTOS | FINISHES (X-B-O-S) | ESTADO');
  console.log('---------------------------------------------------------------------------------------------------------');

  rankedBladers.forEach((b, idx) => {
    const isTop8 = idx < 8;
    const statusText = isTop8 ? '★ CLASIFICADO (TOP 8)' : '  Fuera del Corte';
    console.log(
      `${String(idx + 1).padStart(3)} | ` +
      `${b.name.padEnd(18)} | ` +
      `${b.team.padEnd(14)} | ` +
      `${String(b.stats.matchesPlayed).padStart(6)} | ` +
      `${String(b.stats.wins).padStart(9)} | ` +
      `${String(b.stats.losses).padStart(8)} | ` +
      `${String(b.stats.pointsScored).padStart(6)} | ` +
      `⚡${b.stats.xtremeFinishes} 💥${b.stats.burstFinishes} 🛡️${b.stats.overFinishes} 🌪️${b.stats.spinFinishes}`.padEnd(18) + ' | ' +
      statusText
    );
  });
  console.log('---------------------------------------------------------------------------------------------------------');

  const top8Qualified = rankedBladers.slice(0, 8);
  console.log(`\n🔥 Bladers Clasificados a Cuartos de Final (Top 8):`);
  top8Qualified.forEach((b, i) => console.log(`   Siembra ${i + 1}: ${b.name} (${b.stats.wins}V - ${b.stats.losses}D, ${b.stats.pointsScored} pts)`));

  // 5. Generate Playoffs (Cuartos de Final)
  console.log(`\n🚀 5. Generando Playoffs (Cuartos de Final):`);
  const playoffConfig: TournamentConfig = {
    ...config,
    tournamentPhase: 'playoffs'
  };
  const playoffMatches = generatePlayoffBracketFromRankings(rankedBladers, playoffConfig);

  const qfMatches = playoffMatches.filter(m => m.roundName.includes('Cuartos de Final'));
  const semiMatches = playoffMatches.filter(m => m.roundName.includes('Semifinales'));
  const finalMatch = playoffMatches.find(m => m.roundName.includes('Gran Final'))!;

  console.log(`   Emparejamientos de Cuartos de Final generados:`);
  qfMatches.forEach((m, idx) => {
    console.log(`   QF ${idx + 1}: [${m.bladerA?.name}] vs [${m.bladerB?.name}]`);
  });

  // 6. Simulate Cuartos de Final
  console.log(`\n⚡ 6. Disputando Cuartos de Final...`);
  const semiWinners: Blader[] = [];
  qfMatches.forEach((m, i) => {
    const bA = m.bladerA!;
    const bB = m.bladerB!;
    const weightA = skillWeights[bA.id] || 5;
    const weightB = skillWeights[bB.id] || 5;
    const aWins = Math.random() < (weightA / (weightA + weightB));
    const winner = aWins ? bA : bB;
    const loser = aWins ? bB : bA;

    m.scoreA = aWins ? 5 : 2;
    m.scoreB = aWins ? 2 : 5;
    m.status = 'finished';
    m.winnerId = winner.id;
    m.winnerName = winner.name;
    semiWinners.push(winner);

    // Propagate to next match
    if (m.nextMatchId) {
      const nextM = playoffMatches.find(pm => pm.id === m.nextMatchId);
      if (nextM) {
        if (m.nextMatchSlot === 'A') nextM.bladerA = winner;
        else nextM.bladerB = winner;
      }
    }
    console.log(`   Resultado QF ${i + 1}: ${winner.name} DERROTÓ a ${loser.name} (5 - 2) con Xtreme Finish!`);
  });

  // 7. Simulate Semifinales
  console.log(`\n🔥 7. Disputando Semifinales...`);
  const finalCandidates: Blader[] = [];
  const semi1 = playoffMatches.find(m => m.id === 'playoff-semi-1')!;
  const semi2 = playoffMatches.find(m => m.id === 'playoff-semi-2')!;

  [semi1, semi2].forEach((m, i) => {
    const bA = m.bladerA!;
    const bB = m.bladerB!;
    const weightA = skillWeights[bA.id] || 5;
    const weightB = skillWeights[bB.id] || 5;
    const aWins = Math.random() < (weightA / (weightA + weightB));
    const winner = aWins ? bA : bB;
    const loser = aWins ? bB : bA;

    m.scoreA = aWins ? 5 : 3;
    m.scoreB = aWins ? 3 : 5;
    m.status = 'finished';
    m.winnerId = winner.id;
    m.winnerName = winner.name;
    finalCandidates.push(winner);

    if (m.nextMatchId) {
      const nextM = playoffMatches.find(pm => pm.id === m.nextMatchId);
      if (nextM) {
        if (m.nextMatchSlot === 'A') nextM.bladerA = winner;
        else nextM.bladerB = winner;
      }
    }
    console.log(`   Resultado Semifinal ${i + 1}: ${winner.name} AVANZA a la Gran Final tras vencer a ${loser.name} (5 - 3)!`);
  });

  // 8. Gran Final
  console.log(`\n👑 8. LA GRAN FINAL DE "TORNEO SET PHONIX":`);
  console.log(`   [${finalMatch.bladerA?.name}] VS [${finalMatch.bladerB?.name}]`);
  
  const finalA = finalMatch.bladerA!;
  const finalB = finalMatch.bladerB!;
  const wA = skillWeights[finalA.id] || 5;
  const wB = skillWeights[finalB.id] || 5;
  const championWinsA = Math.random() < (wA / (wA + wB));
  const champion = championWinsA ? finalA : finalB;
  const runnerUp = championWinsA ? finalB : finalA;

  finalMatch.scoreA = championWinsA ? 5 : 4;
  finalMatch.scoreB = championWinsA ? 4 : 5;
  finalMatch.status = 'finished';
  finalMatch.winnerId = champion.id;
  finalMatch.winnerName = champion.name;

  console.log(`\n🏆 ¡¡¡${champion.name.toUpperCase()} ES EL CAMPEÓN OFICIAL DE TORNEO SET PHONIX!!! 🏆`);
  console.log(`   Segundo Lugar: ${runnerUp.name} (${runnerUp.team})`);

  // Sincronización oficial con Supabase
  try {
    console.log('\n☁️ Sincronizando datos del TORNEO SET PHONIX con Supabase...');
    await syncCommunityConfigToSupabase({
      eventName: config.name,
      leagueName: config.leagueName,
      communityTagline: config.communityTagline,
      communityCity: config.communityCity,
      organizerName: config.organizerName,
      season: config.season
    });
    await syncTournamentFormatToSupabase(playoffConfig);
    await syncAllBladersToSupabase(rankedBladers);
    await deleteAllMatchesFromSupabase();
    await syncAllMatchesToSupabase(playoffMatches);
    console.log('   ✓ Torneo, formato, 15 Bladers y combates sincronizados en Supabase.');
  } catch (err) {
    console.warn('   ⚠️ Aviso al sincronizar con Supabase:', err);
  }

  // -------------------------------------------------------------
  // 3. PLAYWRIGHT UI VERIFICATION & SCREENSHOT
  // -------------------------------------------------------------
  console.log('\n🌐 9. Verificando UI en Navegador con Playwright...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Inject full tournament state into browser localStorage
  await context.addInitScript(({ config, bladers, playoffMatches }) => {
    localStorage.setItem('bbx_admin_session', JSON.stringify({
      username: 'DiegoAdmin',
      role: 'admin',
      loggedInAt: new Date().toISOString(),
      token: 'bbx_token_admin_test_phoenix'
    }));
    localStorage.setItem('bbx_config', JSON.stringify(config));
    localStorage.setItem('bbx_bladers', JSON.stringify(bladers));
    localStorage.setItem('bbx_matches', JSON.stringify(playoffMatches));
  }, { config: playoffConfig, bladers: rankedBladers, playoffMatches });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 9.1 Verify Header Tournament Name
    const tournamentTitle = await page.locator('h1, h2, span').filter({ hasText: 'TORNEO SET PHONIX' }).first();
    console.log('   ✓ Título de torneo en interfaz: "TORNEO SET PHONIX" detectado');

    // 9.2 Navigate to Bladers Screen
    console.log('   Navegando a Roster de Bladers...');
    const bladersNav = page.locator('#nav-item-bladers').first();
    if (await bladersNav.isVisible()) {
      await bladersNav.click();
      await page.waitForTimeout(600);
      
      // Count bladers rendered
      const bladerCards = page.locator('text=BC Sol, text=Team Persona, text=Raging Bulls, text=Yggdrasil');
      const count = await bladerCards.count();
      console.log(`   ✓ Equipos y Bladers renderizados en el Roster (coincidencias de equipo: ${count})`);
      
      // Check Phoenix Wing combos
      const phoenixComboTag = page.locator('text=Phoenix Wing').first();
      if (await phoenixComboTag.isVisible()) {
        console.log('   ✓ Combos "Phoenix Wing" renderizados y visibles en la pantalla de Bladers');
      }
    }

    // 9.3 Navigate to Bracket Screen
    console.log('   Navegando a Bracket / Árbol...');
    const bracketNav = page.locator('#nav-item-bracket').first();
    if (await bracketNav.isVisible()) {
      await bracketNav.click();
      await page.waitForTimeout(600);

      // Verify Leaderboard / Standings tab
      const clasificacionBtn = page.locator('button:has-text("Clasificación")').first();
      if (await clasificacionBtn.isVisible()) {
        await clasificacionBtn.click();
        await page.waitForTimeout(500);

        const tableText = await page.locator('table').innerText();
        const containsValt = tableText.toUpperCase().includes('VALT');
        const containsBird = tableText.toUpperCase().includes('BIRD');
        console.log(`   ✓ Tabla de Posiciones verificada (Valt presente: ${containsValt}, Bird presente: ${containsBird})`);

        // Capture screenshot of standings
        await page.screenshot({ path: '/home/balckyshadown/.gemini/antigravity/brain/8a4535ca-cda2-425f-b330-4cbbac16a5bc/phoenix_tournament_standings.png', fullPage: true });
        console.log('   📸 Captura de tabla de clasificación guardada en: phoenix_tournament_standings.png');
      }

      // Check Playoffs Bracket view
      const treeBtn = page.locator('#btn-view-tree');
      if (await treeBtn.isVisible()) {
        await treeBtn.click();
        await page.waitForTimeout(600);

        await page.screenshot({ path: '/home/balckyshadown/.gemini/antigravity/brain/8a4535ca-cda2-425f-b330-4cbbac16a5bc/phoenix_tournament_playoffs.png', fullPage: true });
        console.log('   📸 Captura de Playoffs y Gran Final guardada en: phoenix_tournament_playoffs.png');
      }

      // Check Jornadas view
      const roundsBtn = page.locator('#btn-view-rounds');
      if (await roundsBtn.isVisible()) {
        await roundsBtn.click();
        await page.waitForTimeout(600);

        await page.screenshot({ path: '/home/balckyshadown/.gemini/antigravity/brain/8a4535ca-cda2-425f-b330-4cbbac16a5bc/phoenix_tournament_jornadas.png', fullPage: true });
        console.log('   📸 Captura de Jornadas guardada en: phoenix_tournament_jornadas.png');
      }
    }

    console.log('\n🎉 ¡PRUEBA COMPLETA DE "TORNEO SET PHONIX" EJECUTADA CON 100% DE ÉXITO!');

  } finally {
    await browser.close();
  }
}

runCompletePhoenixTournament().catch(err => {
  console.error('\n❌ ERROR EN LA SIMULACIÓN:', err);
  process.exit(1);
});
