import { chromium } from 'playwright';

async function testAutoAdvance() {
  console.log('🚀 Iniciando Test E2E de Auto-Avance en Battle Console...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]:', msg.text());
    }
  });
  page.on('pageerror', (err) => console.error('[BROWSER RUNTIME ERROR]:', err.message));

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 1. Seed 3 registered bladers and a live Round 1 match
    console.log('1. Configurando Bladers y Combate de Ronda 1 en vivo...');
    await page.evaluate(() => {
      const sampleBladers = [
        {
          id: 'blader-cucuta-1',
          name: 'Valt Aoi',
          alias: 'Valt',
          team: 'Beys Cúcuta',
          avatarUrl: '',
          verified: true,
          registeredAt: new Date().toISOString(),
          combos: [{ id: 'c1', name: 'Phoenix Wing 9-60 GF', slot: 1 }],
          stats: { wins: 0, losses: 0, pointsScored: 0, burstFinishes: 0, xtremeFinishes: 0, overFinishes: 0, spinFinishes: 0, matchesPlayed: 0 }
        },
        {
          id: 'blader-cucuta-2',
          name: 'Shu Kurenai',
          alias: 'Shu',
          team: 'Red Eye Cúcuta',
          avatarUrl: '',
          verified: true,
          registeredAt: new Date().toISOString(),
          combos: [{ id: 'c2', name: 'Dran Buster 1-60 F', slot: 1 }],
          stats: { wins: 0, losses: 0, pointsScored: 0, burstFinishes: 0, xtremeFinishes: 0, overFinishes: 0, spinFinishes: 0, matchesPlayed: 0 }
        },
        {
          id: 'blader-cucuta-3',
          name: 'Free De La Hoya',
          alias: 'Free',
          team: 'Fafnir Squad',
          avatarUrl: '',
          verified: true,
          registeredAt: new Date().toISOString(),
          combos: [{ id: 'c3', name: 'Wizard Rod 5-70 B', slot: 1 }],
          stats: { wins: 0, losses: 0, pointsScored: 0, burstFinishes: 0, xtremeFinishes: 0, overFinishes: 0, spinFinishes: 0, matchesPlayed: 0 }
        }
      ];

      const initialMatch = {
        id: 'match-round-1',
        roundNumber: 1,
        roundName: 'Ronda 1 • Duelo 1',
        matchNumber: 1,
        bladerA: sampleBladers[0],
        bladerB: sampleBladers[1],
        scoreA: 0,
        scoreB: 0,
        targetScore: 4,
        status: 'live',
        winnerId: null,
        cornerA: 'Red',
        cornerB: 'Blue',
        events: []
      };

      localStorage.setItem('bbx_bladers', JSON.stringify(sampleBladers));
      localStorage.setItem('bbx_matches', JSON.stringify([initialMatch]));
      localStorage.setItem('bbx_auto_advance', 'true');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 2. Navigate to Battle Console via sidebar
    console.log('2. Navegando a Battle Console...');
    const navConsole = page.locator('button:has-text("Battle Console"), nav button:has-text("Battle Console")').first();
    await navConsole.click();
    await page.waitForTimeout(600);

    // 3. Verify Auto-Avance toggle is present and ON
    const toggleBtn = page.locator('#btn-toggle-auto-advance, #btn-toggle-auto-advance-standby').first();
    await toggleBtn.waitFor({ state: 'visible', timeout: 5000 });
    const toggleText = await toggleBtn.textContent();
    console.log('3. Estado de Auto-Avance detectado:', toggleText?.trim());
    if (!toggleText?.includes('ON')) {
      throw new Error(`Auto-Avance debería estar en ON, pero tiene: ${toggleText}`);
    }

    // 4. Verify live match is on console
    console.log('4. Verificando combate en consola...');
    const redXtreme = page.locator('#btn-red-xtreme-finish');
    const redBurst = page.locator('#btn-red-burst-finish');
    await redXtreme.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✓ Consola de batalla activa y lista para puntuar: Valt Aoi vs Shu Kurenai');

    // 5. Score points: Xtreme (+3) + Burst (+2) = 5 PTS -> Match Won!
    console.log('5. Anotando puntos para ganar la batalla...');
    await redXtreme.click();
    console.log('   ✓ Red: Xtreme Finish registrado (+3 PTS)');
    await page.waitForFunction(() => {
      const el = document.querySelector('#score-display-a');
      return el && el.textContent?.trim() === '3';
    }, { timeout: 4000 });

    await redBurst.click();
    console.log('   ✓ Red: Burst Finish registrado (+2 PTS) -> Total 5 PTS (Victoria alcanzada)');

    // 6. Verify Auto-Advance indicator is visible with countdown in WinnerModal
    console.log('6. Verificando modal de victoria y cuenta regresiva de Auto-Avance...');
    const autoAdvanceBanner = page.locator('#winner-modal-auto-advance-banner');
    await autoAdvanceBanner.waitFor({ state: 'visible', timeout: 5000 });
    const bannerText = await autoAdvanceBanner.textContent();
    console.log('   ✓ Modal de victoria abierto con banner de Auto-Avance:', bannerText?.replace(/\s+/g, ' ').trim().slice(0, 70));

    // 7. Wait for auto-advance timer to finish and modal to close
    console.log('7. Esperando cuenta regresiva de Auto-Avance (3s) para transición automática...');
    await autoAdvanceBanner.waitFor({ state: 'hidden', timeout: 6000 });
    console.log('   ✓ Auto-Avance completado: Modal cerrado automáticamente');

    // 8. Verify the new match is automatically loaded on the Battle Console!
    console.log('8. Verificando que el nuevo combate está activo en la consola...');
    await page.waitForTimeout(500);

    // Verify scoreboard has reset to live 0 - 0 match
    await redXtreme.waitFor({ state: 'visible', timeout: 5000 });
    const isButtonActive = await redXtreme.isEnabled();
    console.log(`   ✓ Consola lista para la siguiente batalla (Botones activos): ${isButtonActive ? 'SÍ' : 'NO'}`);
    if (!isButtonActive) {
      throw new Error('Los botones de puntuación deberían estar listos para la nueva batalla');
    }

    const currentScore = await page.locator('#score-display-a').textContent();
    console.log(`   ✓ Marcador de esquina roja reiniciado: ${currentScore?.trim()} PTS`);
    if (currentScore?.trim() !== '0') {
      throw new Error(`El marcador debió reiniciarse a 0, pero tiene: ${currentScore}`);
    }

    console.log('\n🎉 ¡TEST E2E DE AUTO-AVANCE COMPLETADO EXITOSAMENTE CON 100% DE VERIFICACIÓN!');
  } catch (err) {
    console.error('❌ Error en el test:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testAutoAdvance();
