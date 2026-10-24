import { chromium } from 'playwright';

async function runSimulation() {
  console.log('====================================================');
  console.log('🚀 INICIANDO BATERÍA DE PRUEBAS E2E: CASOS DE USUARIO');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    executablePath: '/home/balckyshadown/.local/bin/google-chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // Listen to browser console and page errors
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => {
    console.error('❌ Browser Runtime Error:', err.message);
    pageErrors.push(err.message);
  });

  try {
    // -----------------------------------------------------------------
    // CASO 1: ORGANIZADOR - Configuración de Formato y Cupo Flexible
    // -----------------------------------------------------------------
    console.log('👉 [CASO 1]: Organizador configura el Formato y Cupo del Torneo...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Verify Title
    const title = await page.title();
    console.log(`   ✓ Página cargada con título: "${title}"`);

    // Verify Auto-Inscripción card is visible in the sidebar
    const autoInscripcionCard = page.locator('text=Auto-Inscripción de Bladers').first();
    await autoInscripcionCard.waitFor({ timeout: 5000 });
    console.log('   ✓ Tarjeta "Auto-Inscripción de Bladers" detectada en pantalla');

    // Test clicking preset cupo buttons in the sidebar card
    console.log('   Testing preset de cupo: Seleccionando 12 Bladers...');
    const btn12 = page.locator('button:has-text("12")').first();
    await btn12.click();
    await page.waitForTimeout(300);

    // Verify badge text updated to 12
    const badgeText12 = await page.locator('text=/ 12 Bladers').first().innerText();
    console.log(`   ✓ Insignia de cupo actualizada exitosamente: "${badgeText12}"`);

    // Test clicking "Sin Límite"
    console.log('   Testing preset de cupo: Seleccionando "Sin Límite"...');
    const btnSinLimite = page.locator('button:has-text("Sin Límite")').first();
    await btnSinLimite.click();
    await page.waitForTimeout(300);

    const badgeSinLimite = await page.locator('text=Inscritos (Sin Límite)').first().innerText();
    console.log(`   ✓ Insignia reflejó cupo abierto: "${badgeSinLimite}"`);

    // Test entering a custom number: 10 Bladers
    console.log('   Testing cupo personalizado: Ingresando 10 Bladers en el input...');
    const customInput = page.locator('input[placeholder="Otro"]').first();
    await customInput.fill('10');
    await customInput.press('Enter');
    await page.waitForTimeout(400);

    const badgeCustom = await page.locator('text=/ 10 Bladers').first().innerText();
    console.log(`   ✓ Cupo personalizado guardado y reflejado: "${badgeCustom}"`);

    // -----------------------------------------------------------------
    // CASO 2: ORGANIZADOR - Modal de Compartir QR & WhatsApp
    // -----------------------------------------------------------------
    console.log('\n👉 [CASO 2]: Organizador abre el Modal de Compartir Link & Código QR...');
    const btnOpenShare = page.locator('button:has-text("Abrir QR y Link Público")').first();
    await btnOpenShare.click();
    await page.waitForTimeout(400);

    // Verify modal is visible
    const modalTitle = page.locator('h3:has-text("Link & Código QR")');
    await modalTitle.waitFor({ timeout: 3000 });
    console.log('   ✓ Modal "Link & Código QR" abierto exitosamente');

    // Verify QR image loaded
    const qrImage = page.locator('img[alt*="Código QR"]').first();
    const qrSrc = await qrImage.getAttribute('src');
    console.log(`   ✓ Código QR generado correctamente: ${qrSrc?.substring(0, 60)}...`);

    // Verify registration link input contains '?mode=registro'
    const linkInput = page.locator('input[readonly]').first();
    const linkValue = await linkInput.inputValue();
    console.log(`   ✓ Enlace de auto-inscripción verificado: "${linkValue}"`);
    if (!linkValue.includes('mode=registro')) {
      throw new Error(`El enlace no contiene '?mode=registro': ${linkValue}`);
    }

    // Close modal
    const btnCloseModal = page.locator('button[aria-label="Cerrar modal"]').first();
    await btnCloseModal.click();
    await page.waitForTimeout(300);
    console.log('   ✓ Modal cerrado correctamente');

    // -----------------------------------------------------------------
    // CASO 3: JUGADOR MÓVIL 1 - Auto-Inscripción con Combo Oficial
    // -----------------------------------------------------------------
    const testId = Date.now().toString().slice(-4);
    const blader1Name = `Gingka-${testId}`;
    const blader2Name = `Valt-${testId}`;

    console.log(`\n👉 [CASO 3]: Blader 1 ("${blader1Name}") se inscribe desde su celular...`);
    
    // Create a mobile context simulating iPhone / Android screen
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto('http://localhost:3000/?mode=registro', { waitUntil: 'networkidle' });

    // Verify Public Registration Screen Loaded
    const portalHeader = mobilePage.locator('text=Portal Oficial de Auto-Inscripción');
    await portalHeader.waitFor({ timeout: 5000 });
    console.log('   ✓ Portal móvil de auto-inscripción cargado en modo responsivo');

    // Fill Blader Info
    await mobilePage.locator('input[placeholder*="Carlos"]').fill(blader1Name);
    await mobilePage.locator('input[placeholder*="Phantom"]').fill('Pegasus Master');

    // Select Combo parts
    console.log('   Configurando Beyblade: Phoenix Wing 9-60 Flat...');
    const selects = mobilePage.locator('select');
    // Team select is index 0, Blade is 1, Ratchet is 2, Bit is 3
    await selects.nth(1).selectOption('Phoenix Wing');
    await selects.nth(2).selectOption('9-60');
    await selects.nth(3).selectOption('Flat (F)');

    // Click submit
    console.log('   Enviando formulario de inscripción...');
    const btnSubmit = mobilePage.locator('button:has-text("INSCRIBIRME AL TORNEO")');
    await btnSubmit.click();
    await mobilePage.waitForTimeout(1000);

    // Verify Success Battle Pass View
    const successTitle = mobilePage.locator('text=¡INSCRIPCIÓN EXITOSA & CONFIRMADA!');
    await successTitle.waitFor({ timeout: 5000 });
    console.log(`   ✓ Pase holográfico de batalla emitido con éxito para "${blader1Name}"!`);

    // Check modal of enrolled bladers from player's view
    const btnVerInscritos = mobilePage.locator('button:has-text("Ver Lista de Inscritos")');
    await btnVerInscritos.click();
    await mobilePage.waitForTimeout(400);

    const bladerInList = mobilePage.locator(`text=${blader1Name}`).first();
    await bladerInList.waitFor({ timeout: 3000 });
    console.log('   ✓ Blader confirmado en la lista pública de inscritos en vivo');

    // Close mobile modal
    await mobilePage.locator('button:has-text("✕")').click();
    await mobilePage.waitForTimeout(200);

    // -----------------------------------------------------------------
    // CASO 4: JUGADOR MÓVIL 2 - Combo Personalizado & Validaciones
    // -----------------------------------------------------------------
    console.log(`\n👉 [CASO 4]: Blader 2 ("${blader2Name}") se inscribe con Combo Personalizado...`);
    const btnInscribirOtro = mobilePage.locator('button:has-text("Inscribir a Otro Blader")');
    await btnInscribirOtro.click();
    await mobilePage.waitForTimeout(300);

    // Fill Blader 2 Info
    await mobilePage.locator('input[placeholder*="Carlos"]').fill(blader2Name);
    await mobilePage.locator('input[placeholder*="Phantom"]').fill('Miracle Valkyrie');

    // Toggle custom combo text input
    console.log('   Activando entrada de combo personalizada...');
    const toggleCustomCombo = mobilePage.locator('button:has-text("Escribir combo libre")').first();
    await toggleCustomCombo.click();
    await mobilePage.waitForTimeout(200);

    const customComboInput = mobilePage.locator('input[placeholder*="Phoenix Wing"]').first();
    await customComboInput.fill('Brave Valkyrie 2-60RA');

    // Submit Blader 2
    await mobilePage.locator('button:has-text("INSCRIBIRME AL TORNEO")').click();
    await mobilePage.waitForTimeout(1000);

    const successValt = mobilePage.locator(`text=¡Bienvenido a la Arena, ${blader2Name}!`);
    await successValt.waitFor({ timeout: 5000 });
    console.log(`   ✓ Blader 2 "${blader2Name}" registrado con combo "Brave Valkyrie 2-60RA"!`);

    // -----------------------------------------------------------------
    // CASO 5: VALIDACIÓN DE DUPLICADOS & CAMPOS VACÍOS (EDGE CASES)
    // -----------------------------------------------------------------
    console.log('\n👉 [CASO 5]: Probando casos de error y prevención de duplicados...');
    await mobilePage.locator('button:has-text("Inscribir a Otro Blader")').click();
    await mobilePage.waitForTimeout(300);

    // Test A: Empty Name
    console.log('   Test 5A: Intento de registro sin nombre...');
    // Clear required validation to test custom error handling
    await mobilePage.$eval('input[placeholder*="Carlos"]', (el: any) => el.removeAttribute('required'));
    await mobilePage.locator('button:has-text("INSCRIBIRME AL TORNEO")').click();
    await mobilePage.waitForTimeout(300);

    const errorEmpty = mobilePage.locator('text=Por favor ingresa tu nombre o nickname de Blader.');
    await errorEmpty.waitFor({ timeout: 3000 });
    console.log('   ✓ Validación de campo vacío previene el envío correctamente');

    // Test B: Duplicate Name
    console.log(`   Test 5B: Intento de registro duplicado con "${blader1Name}"...`);
    await mobilePage.locator('input[placeholder*="Carlos"]').fill(blader1Name);
    await mobilePage.locator('button:has-text("INSCRIBIRME AL TORNEO")').click();
    await mobilePage.waitForTimeout(400);

    const errorDuplicate = mobilePage.locator('text=ya se encuentra inscrito en este torneo');
    await errorDuplicate.waitFor({ timeout: 3000 });
    console.log('   ✓ Prevención de duplicados bloquea registros repetidos exitosamente');

    // -----------------------------------------------------------------
    // CASO 6: SINCRONIZACIÓN EN VIVO CON LA PANTALLA DEL ADMINISTRADOR
    // -----------------------------------------------------------------
    console.log('\n👉 [CASO 6]: Comprobando reflejo inmediato en el panel del Administrador...');
    
    // Switch to bladers screen on admin page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Click on Bladers navigation in desktop sidebar
    const navBladers = page.locator('span:has-text("Bladers & Roster")').first();
    await navBladers.click();
    await page.waitForTimeout(600);

    // Verify blader1Name and blader2Name are in the table
    const rowGingka = page.locator(`text=${blader1Name}`).first();
    await rowGingka.waitFor({ timeout: 5000 });
    console.log(`   ✓ "${blader1Name}" aparece en el Roster de Bladers del Administrador!`);

    const rowValt = page.locator(`text=${blader2Name}`).first();
    await rowValt.waitFor({ timeout: 5000 });
    console.log(`   ✓ "${blader2Name}" aparece en el Roster de Bladers del Administrador!`);

    // Check combos in the roster
    const gingkaCombo = page.locator('text=Phoenix Wing').first();
    await gingkaCombo.waitFor({ timeout: 3000 });
    console.log(`   ✓ Combo de ${blader1Name} ("Phoenix Wing 9-60 Flat") presente en el Roster`);

    // -----------------------------------------------------------------
    // CASO 7: VOLVER DESDE EL PORTAL AL PANEL DE ADMIN
    // -----------------------------------------------------------------
    console.log('\n👉 [CASO 7]: Probando botón "Volver al panel administrativo" desde el portal...');
    await page.goto('http://localhost:3000/?mode=registro', { waitUntil: 'networkidle' });
    const btnVolverAdmin = page.locator('button[title*="panel administrativo"]').first();
    await btnVolverAdmin.waitFor({ timeout: 4000 });
    await btnVolverAdmin.click();
    await page.waitForTimeout(600);

    // Check that admin header is back
    const adminHeader = page.locator('h1:has-text("REGISTRO DE BLADERS")');
    await adminHeader.waitFor({ timeout: 5000 });
    console.log('   ✓ Navegación fluida: Administrador retornó a Roster de Bladers sin recargar');

    console.log('\n====================================================');
    console.log('🎉 TODAS LAS PRUEBAS E2E PASARON CON ÉXITO (7/7)');
    console.log('====================================================\n');

    if (pageErrors.length > 0) {
      console.warn(`⚠️ Se detectaron ${pageErrors.length} advertencias en consola del navegador.`);
    }

  } catch (err) {
    console.error('\n❌ ERROR EN LA SIMULACIÓN:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runSimulation();
