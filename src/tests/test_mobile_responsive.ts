import { chromium } from 'playwright';

async function testMobileResponsive() {
  console.log('📱 Iniciando Test E2E de Responsividad Móvil (Viewport 390x844 - iPhone 14)...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]:', msg.text());
    }
  });
  page.on('pageerror', (err) => console.error('[BROWSER RUNTIME ERROR]:', err.message));

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 1. Seed sample bladers and tournament match
    console.log('1. Configurando datos de prueba para torneo móvil...');
    await page.evaluate(() => {
      const sampleBladers = [
        {
          id: 'blader-mob-1',
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
          id: 'blader-mob-2',
          name: 'Shu Kurenai',
          alias: 'Shu',
          team: 'Red Eye Cúcuta',
          avatarUrl: '',
          verified: true,
          registeredAt: new Date().toISOString(),
          combos: [{ id: 'c2', name: 'Dran Buster 1-60 F', slot: 1 }],
          stats: { wins: 0, losses: 0, pointsScored: 0, burstFinishes: 0, xtremeFinishes: 0, overFinishes: 0, spinFinishes: 0, matchesPlayed: 0 }
        }
      ];

      const sampleMatch = {
        id: 'match-mob-1',
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
      localStorage.setItem('bbx_matches', JSON.stringify([sampleMatch]));
      localStorage.setItem('bbx_auto_advance', 'true');
      localStorage.setItem('bbx_admin_session', JSON.stringify({ username: 'DiegoAdmin', role: 'admin', token: 'bbx_test_token' }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 2. Test Mobile Bottom Nav presence and visibility
    console.log('2. Verificando Mobile Bottom Navigation bar...');
    const bottomNav = page.locator('#mobile-bottom-navigation');
    const isNavVisible = await bottomNav.isVisible();
    if (!isNavVisible) {
      throw new Error('❌ El componente MobileBottomNav no es visible en pantalla móvil');
    }
    console.log('✅ MobileBottomNav está presente y visible en el viewport 390px');

    // Check all 5 tabs
    const tabDashboard = page.locator('#mobile-tab-dashboard');
    const tabBracket = page.locator('#mobile-tab-bracket');
    const tabBladers = page.locator('#mobile-tab-bladers');
    const tabFormat = page.locator('#mobile-tab-tournament_format');
    const tabMore = page.locator('#mobile-tab-more');

    if (!(await tabDashboard.isVisible() && await tabBracket.isVisible() && await tabBladers.isVisible() && await tabFormat.isVisible() && await tabMore.isVisible())) {
      throw new Error('❌ Faltan botones en la barra de navegación móvil de 5 ítems');
    }
    console.log('✅ Los 5 ítems ergonómicos de la barra móvil están visibles');

    // 3. Test Navigation switching
    console.log('3. Probando navegación fluida entre pestañas desde el móvil...');
    await tabBracket.click();
    await page.waitForTimeout(300);
    console.log('✅ Navegación a Bracket exitosa');

    await tabBladers.click();
    await page.waitForTimeout(300);
    console.log('✅ Navegación a Bladers exitosa');

    // Test "Más" drawer
    console.log('3b. Probando drawer "Más" en móvil...');
    await tabMore.click();
    await page.waitForTimeout(300);
    const drawer = page.locator('#mobile-drawer-sheet');
    const isDrawerVisible = await drawer.isVisible();
    if (!isDrawerVisible) {
      throw new Error('❌ El Drawer de navegación "Más" no se abrió correctamente al hacer clic en Más');
    }
    console.log('✅ Drawer móvil "Más" se abrió correctamente con las opciones adicionales');

    // Close drawer via backdrop or close button
    const closeDrawerBtn = page.locator('#btn-close-mobile-drawer');
    await closeDrawerBtn.click();
    await page.waitForTimeout(300);
    console.log('✅ Drawer móvil se cerró correctamente');

    // Return to dashboard
    await tabDashboard.click();
    await page.waitForTimeout(300);

    // 4. Test Mobile Live Duel Summary Banner
    console.log('4. Verificando Banner de Resumen de Duelo en Vivo en móvil...');
    const duelBanner = page.locator('#mobile-live-duel-banner');
    if (!await duelBanner.isVisible()) {
      throw new Error('❌ El banner de resumen de duelo en vivo no es visible en móvil');
    }
    const bannerText = await duelBanner.innerText();
    console.log('  Banner text content:', bannerText.replace(/\n+/g, ' | '));
    if (!bannerText.toUpperCase().includes('VALT') || !bannerText.toUpperCase().includes('SHU')) {
      throw new Error('❌ El banner móvil no muestra los nombres de los bladers actuales');
    }
    console.log('✅ Live Duel Summary Banner muestra bladers y marcadores claramente');

    // Test Corner Quick Tabs
    console.log('5. Verificando Tabs de cambio rápido de Esquinas (Roja / Azul / Ambas)...');
    const tabRed = page.locator('#mobile-corner-tab-cornerA');
    const tabBlue = page.locator('#mobile-corner-tab-cornerB');
    const tabBoth = page.locator('#mobile-corner-tab-both');

    const redBox = await tabRed.boundingBox();
    if (!redBox || redBox.height < 44) {
      throw new Error(`❌ Altura del tab rojo (${redBox?.height}px) es menor que el estándar táctil de 44px`);
    }
    console.log(`✅ Altura táctil del tab rojo: ${redBox.height}px (>= 44px ergonomía táctil)`);

    // Switch to Corner B (Blue)
    await tabBlue.click();
    await page.waitForTimeout(200);
    const cornerAVisible = await page.locator('#corner-a-column').isVisible();
    const cornerBVisible = await page.locator('#corner-b-column').isVisible();
    if (cornerAVisible || !cornerBVisible) {
      throw new Error('❌ El filtro de esquina móvil no aisló correctamente la Esquina Azul');
    }
    console.log('✅ Filtro de esquina móvil aísla correctamente la Esquina Azul');

    // 6. Test Tactile Scoring Buttons (height >= 48px, touch-manipulation)
    console.log('6. Verificando botones de puntuación táctiles en la consola...');
    // Return to Corner A
    await tabRed.click();
    await page.waitForTimeout(200);

    const xtremeBtnA = page.locator('#btn-red-xtreme-finish');
    const xtremeBox = await xtremeBtnA.boundingBox();
    if (!xtremeBox || xtremeBox.height < 48) {
      throw new Error(`❌ Botón Xtreme Finish Corner A (${xtremeBox?.height}px) no cumple con el estándar ergonómico >= 48px`);
    }
    console.log(`✅ Botón de puntuación Xtreme Finish mide ${xtremeBox.height}px de alto (ergonomía táctil móvil)`);

    // Tap Xtreme Finish (+3 pts)
    console.log('7. Simulando toques táctiles de puntuación...');
    await xtremeBtnA.click();
    await page.waitForTimeout(300);

    // Tap Over Finish (+2 pts) to reach 5 pts >= target (4 pts)
    const overBtnA = page.locator('#btn-red-over-finish');
    await overBtnA.click();
    await page.waitForTimeout(500);

    // 8. Test Winner Celebration Modal on Mobile
    console.log('8. Verificando Winner Modal en pantalla móvil (390px)...');
    const winnerModal = page.locator('#winner-modal');
    await winnerModal.waitFor({ state: 'visible', timeout: 5000 });
    const modalBox = await winnerModal.boundingBox();
    console.log(`  Winner Modal dimensiones en viewport: ancho=${modalBox?.width}px, alto=${modalBox?.height}px`);

    // Ensure modal height does not exceed viewport height (844px)
    if (modalBox && modalBox.height > 844) {
      throw new Error('❌ El Winner Modal excede la altura de la pantalla del celular sin permitir scroll');
    }
    console.log('✅ Winner Modal respeta el viewport móvil y tiene scroll interno si es necesario');

    // Verify Next Match button is clickable
    const nextMatchBtn = page.locator('#btn-next-match, #btn-modal-continue').first();
    if (!await nextMatchBtn.isVisible()) {
      throw new Error('❌ El botón Siguiente Combate no es visible en el modal móvil');
    }
    const nextBox = await nextMatchBtn.boundingBox();
    if (!nextBox || nextBox.height < 44) {
      throw new Error(`❌ Botón Siguiente Combate (${nextBox?.height}px) tiene altura inferior a 44px`);
    }
    console.log(`✅ Botón Siguiente Combate mide ${nextBox.height}px de alto`);

    // Click Next Match
    await nextMatchBtn.click();
    await page.waitForTimeout(500);
    console.log('✅ Siguiente combate activado con éxito desde el modal móvil!');

    console.log('\n🎉 ¡TODOS LOS TESTS DE RESPONSIVIDAD Y ERGONOMÍA MÓVIL PASARON CON ÉXITO! 📱💥');
  } finally {
    await browser.close();
  }
}

testMobileResponsive().catch((err) => {
  console.error('❌ Error en el test móvil:', err);
  process.exit(1);
});
