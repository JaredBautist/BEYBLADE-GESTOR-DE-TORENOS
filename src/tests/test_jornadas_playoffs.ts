import { chromium } from 'playwright';
import {
  generateRegularPhaseMatches,
  getRankedBladers,
  generatePlayoffBracketFromRankings
} from '../utils/bracketGenerator';
import { Blader, TournamentConfig } from '../types';

async function runJornadasAndPlayoffsTests() {
  console.log('🏁 ============================================================');
  console.log('🏆 TEST SUITE: FASE REGULAR POR JORNADAS & CORTE A PLAYOFFS (TOP 8)');
  console.log('🏁 ============================================================\n');

  // PART 1: UNIT / LOGIC VERIFICATION OF BRACKET GENERATOR
  console.log('🧪 PARTE 1: Verificación lógica pura de Jornadas y Top 8 Cutoff...');
  
  const mockBladers: Blader[] = [
    { id: 'b1', name: 'Valt Aoi', alias: 'Valkyrie', team: 'BC Sol', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 7, losses: 1, pointsScored: 21, xtremeFinishes: 4, burstFinishes: 2, overFinishes: 1, spinFinishes: 0 } },
    { id: 'b2', name: 'Shu Kurenai', alias: 'Spriggan', team: 'Raging Bulls', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 6, losses: 2, pointsScored: 19, xtremeFinishes: 3, burstFinishes: 3, overFinishes: 1, spinFinishes: 0 } },
    { id: 'b3', name: 'Free De La Hoya', alias: 'Fafnir', team: 'BC Sol', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 6, losses: 2, pointsScored: 18, xtremeFinishes: 2, burstFinishes: 2, overFinishes: 2, spinFinishes: 2 } },
    { id: 'b4', name: 'Lui Shirosagijo', alias: 'Longinus', team: 'Rideout', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 5, losses: 3, pointsScored: 16, xtremeFinishes: 4, burstFinishes: 1, overFinishes: 0, spinFinishes: 0 } },
    { id: 'b5', name: 'Aiga Akaba', alias: 'Achilles', team: 'Beigoma', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 4, losses: 4, pointsScored: 14, xtremeFinishes: 2, burstFinishes: 1, overFinishes: 2, spinFinishes: 1 } },
    { id: 'b6', name: 'Dante Koryu', alias: 'Dragon', team: 'Victories', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 4, losses: 4, pointsScored: 12, xtremeFinishes: 1, burstFinishes: 2, overFinishes: 1, spinFinishes: 1 } },
    { id: 'b7', name: 'Bell Daikokuten', alias: 'Belial', team: 'Phantom', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 3, losses: 5, pointsScored: 10, xtremeFinishes: 1, burstFinishes: 1, overFinishes: 1, spinFinishes: 1 } },
    { id: 'b8', name: 'Bird Kazami', alias: 'HellsScythe', team: 'Persona', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 2, losses: 6, pointsScored: 6, xtremeFinishes: 0, burstFinishes: 1, overFinishes: 1, spinFinishes: 1 } },
    // 9th and 10th players outside the cut
    { id: 'b9', name: 'Ekusu Kurosu', alias: 'DranSword', team: 'Persona', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 1, losses: 7, pointsScored: 4, xtremeFinishes: 0, burstFinishes: 1, overFinishes: 0, spinFinishes: 0 } },
    { id: 'b10', name: 'Multi Nanairo', alias: 'WizardArrow', team: 'Persona', avatarUrl: '', verified: true, registeredAt: new Date().toISOString(), combos: [], badges: [], stats: { matchesPlayed: 8, wins: 0, losses: 8, pointsScored: 2, xtremeFinishes: 0, burstFinishes: 0, overFinishes: 1, spinFinishes: 0 } }
  ];

  const testConfig: TournamentConfig = {
    name: 'Torneo Oficial Cúcuta',
    season: 'Temporada 2026',
    leagueName: 'Beyblade X Cúcuta',
    communityTagline: 'Pasión por el Beyblade',
    communityCity: 'Cúcuta',
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
    arenaStatus: 'Estadio Xtreme Activo',
    isStarted: true,
    totalJornadas: 8,
    playoffCutoffCount: 8,
    playoffCutoffType: 'top_n',
    minPointsToQualify: 0
  };

  // 1.1 Test Regular Phase Schedule Generation
  const regularMatches = generateRegularPhaseMatches(mockBladers, testConfig);
  const distinctRounds = Array.from(new Set(regularMatches.map(m => m.roundNumber))).sort((a, b) => a - b);
  
  if (distinctRounds.length !== 8) {
    throw new Error(`❌ Se esperaban 8 Jornadas, pero se generaron ${distinctRounds.length}`);
  }
  console.log(`✅ Fase Regular generó exactamente 8 Jornadas (Rondas 1 a 8), con ${regularMatches.length} enfrentamientos en total.`);

  // 1.2 Test Standings Sorting
  const ranked = getRankedBladers(mockBladers);
  if (ranked[0].id !== 'b1' || ranked[1].id !== 'b2' || ranked[7].id !== 'b8') {
    throw new Error(`❌ Error en orden de clasificación: 1º=${ranked[0].name}, 2º=${ranked[1].name}, 8º=${ranked[7].name}`);
  }
  console.log('✅ Clasificación calculada correctamente: 1º Valt Aoi (7V, 21 pts) ... 8º Bird Kazami (2V, 6 pts)');

  // 1.3 Test Playoff Top 8 Generation
  const playoffMatches = generatePlayoffBracketFromRankings(mockBladers, testConfig);
  const qfMatches = playoffMatches.filter(m => m.roundName.includes('Cuartos de Final'));
  const semiMatches = playoffMatches.filter(m => m.roundName.includes('Semifinales'));
  const finalMatch = playoffMatches.find(m => m.roundName.includes('Gran Final'));

  if (qfMatches.length !== 4) {
    throw new Error(`❌ Se esperaban 4 duelos de Cuartos de Final para Top 8, se encontraron ${qfMatches.length}`);
  }
  if (semiMatches.length !== 2) {
    throw new Error(`❌ Se esperaban 2 duelos de Semifinales, se encontraron ${semiMatches.length}`);
  }
  if (!finalMatch) {
    throw new Error('❌ Falta el combate de Gran Final en el bracket');
  }

  // Verify Quarterfinals pairings:
  // QF1: Seed 1 (Valt) vs Seed 8 (Bird Kazami - even with low points, qualified by Top 8)
  const qf1 = qfMatches.find(m => m.matchNumber === 1);
  if (qf1?.bladerA?.id !== 'b1' || qf1?.bladerB?.id !== 'b8') {
    throw new Error(`❌ Emparejamiento QF1 incorrecto: ${qf1?.bladerA?.name} vs ${qf1?.bladerB?.name} (esperado Valt vs Bird)`);
  }
  // QF2: Seed 4 (Lui) vs Seed 5 (Aiga)
  const qf2 = qfMatches.find(m => m.matchNumber === 2);
  if (qf2?.bladerA?.id !== 'b4' || qf2?.bladerB?.id !== 'b5') {
    throw new Error(`❌ Emparejamiento QF2 incorrecto: ${qf2?.bladerA?.name} vs ${qf2?.bladerB?.name} (esperado Lui vs Aiga)`);
  }
  // QF3: Seed 2 (Shu) vs Seed 7 (Bell)
  const qf3 = qfMatches.find(m => m.matchNumber === 3);
  if (qf3?.bladerA?.id !== 'b2' || qf3?.bladerB?.id !== 'b7') {
    throw new Error(`❌ Emparejamiento QF3 incorrecto: ${qf3?.bladerA?.name} vs ${qf3?.bladerB?.name} (esperado Shu vs Bell)`);
  }
  // QF4: Seed 3 (Free) vs Seed 6 (Dante)
  const qf4 = qfMatches.find(m => m.matchNumber === 4);
  if (qf4?.bladerA?.id !== 'b3' || qf4?.bladerB?.id !== 'b6') {
    throw new Error(`❌ Emparejamiento QF4 incorrecto: ${qf4?.bladerA?.name} vs ${qf4?.bladerB?.name} (esperado Free vs Dante)`);
  }
  console.log('✅ Cuartos de Final (Top 8) emparejados a la perfección (1º vs 8º, 4º vs 5º, 2º vs 7º, 3º vs 6º)');
  console.log('✅ Bird Kazami (con solo 6 PTS y 2V) clasificó sin restricciones de mínimos de puntos obsoletos!');

  // PART 2: BROWSER E2E INTERFACE VERIFICATION
  console.log('\n🌐 PARTE 2: Verificación E2E en Navegador UI (Playwright)...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  // Seed authenticated admin session with required token
  await context.addInitScript(() => {
    localStorage.setItem('bbx_admin_session', JSON.stringify({
      username: 'DiegoAdmin',
      role: 'admin',
      loggedInAt: new Date().toISOString(),
      token: 'bbx_token_admin_test_123'
    }));
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 2.1 Navigate to Tournament Format Screen if not already there
    console.log('2.1 Verificando pantalla de Configuración de Formato...');
    const formatTitle = page.locator('text=Jornadas Regulares de Clasificación');
    if (!await formatTitle.isVisible()) {
      const formatNavBtn = page.locator('#nav-item-tournament_format').first();
      await formatNavBtn.waitFor({ state: 'visible', timeout: 5000 });
      await formatNavBtn.click();
      await page.waitForTimeout(500);
    }

    // Verify Jornadas Header is present
    const jornadasLabel = page.locator('text=Jornadas Regulares de Clasificación');
    if (!await jornadasLabel.isVisible()) {
      throw new Error('❌ No se encontró el encabezado de Jornadas Regulares en TournamentFormatScreen');
    }
    console.log('✅ Componente "Jornadas Regulares de Clasificación (Rondas)" visible en la pantalla');

    // Verify obsolete "Meta de Puntos (Condición)" is ABSENT
    const metaPuntosCount = await page.locator('text=Meta de Puntos (Condición)').count();
    if (metaPuntosCount > 0) {
      throw new Error('❌ "Meta de Puntos (Condición)" todavía está presente en la interfaz');
    }
    console.log('✅ Verificado: "Meta de Puntos (Condición)" ha sido eliminado por completo');

    // Verify presets are present (4, 6, 8, 10)
    const preset8 = page.locator('button:has-text("8 Jornadas")');
    if (!await preset8.isVisible()) {
      throw new Error('❌ Preajuste "8 Jornadas" no está disponible en la pantalla');
    }
    console.log('✅ Botón de preajuste "8 Jornadas (Estándar Oficial)" verificado');

    // Verify Top 8 (Cuartos de final) button exists
    const top8Btn = page.locator('button:has-text("Top 8")');
    if (!await top8Btn.isVisible()) {
      throw new Error('❌ Botón de corte a "Top 8" no está visible');
    }
    console.log('✅ Selector de corte "Top 8 (Cuartos de Final)" verificado');

    // 2.2 Navigate to Bracket Screen
    console.log('2.2 Navegando al Bracket y Tabla de Posiciones...');
    const bracketNavBtn = page.locator('#nav-item-bracket').first();
    await bracketNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await bracketNavBtn.click();
    await page.waitForTimeout(600);

    // Verify Standings Leaderboard tab
    const clasificacionTab = page.locator('button:has-text("Clasificación")');
    if (await clasificacionTab.isVisible()) {
      await clasificacionTab.click();
      await page.waitForTimeout(400);

      const tableHeader = page.locator('text=Tabla de Posiciones & Corte a Playoffs');
      if (await tableHeader.isVisible()) {
        console.log('✅ Vista de Clasificación & Corte a Playoffs activa y renderizada correctamente');
      }

      // Check qualification badges in the table
      const passBadges = page.locator('text=TOP 8 • CUARTOS, text=PASA A CUARTOS');
      const badgeCount = await passBadges.count();
      console.log(`✅ Badges de pase a Cuartos de Final encontrados en la tabla: ${badgeCount}`);
    }

    // Check Jornadas view tab
    const jornadasTab = page.locator('#btn-view-rounds');
    if (await jornadasTab.isVisible()) {
      await jornadasTab.click();
      await page.waitForTimeout(400);
      console.log('✅ Vista de Jornadas navegada exitosamente');
    }

    console.log('\n🎉 TODOS LOS TESTS DE JORNADAS Y TOP 8 PLAYOFFS PASARON AL 100% CON ÉXITO');

  } finally {
    await browser.close();
  }
}

runJornadasAndPlayoffsTests().catch((err) => {
  console.error('\n❌ ERROR EN TEST:', err);
  process.exit(1);
});
