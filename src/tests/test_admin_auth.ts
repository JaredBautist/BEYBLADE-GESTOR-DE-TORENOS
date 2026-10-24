import { chromium } from 'playwright';

async function testAdminAuth() {
  console.log('🔒 Iniciando Test E2E de Autenticación de Administrador (DiegoAdmin / Acuario123)...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]:', msg.text());
    }
  });
  page.on('pageerror', (err) => console.error('[BROWSER RUNTIME ERROR]:', err.message));

  try {
    // 1. Clear any existing sessions
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.removeItem('bbx_admin_session');
      sessionStorage.removeItem('bbx_admin_session');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 2. Verify that unauthenticated visit shows Login Screen and blocks dashboard
    console.log('1. Verificando que visita sin sesión muestra pantalla de Login y bloquea el gestor...');
    const loginCard = page.locator('#admin-login-card');
    await loginCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pantalla de Login de Administrador renderizada correctamente');

    const usernameInput = page.locator('#admin-username-input');
    const passwordInput = page.locator('#admin-password-input');
    const submitBtn = page.locator('#btn-admin-login-submit');

    if (!await usernameInput.isVisible() || !await passwordInput.isVisible() || !await submitBtn.isVisible()) {
      throw new Error('❌ Faltan campos esenciales en el formulario de login');
    }

    // Ensure dashboard header is NOT visible
    const logoutBtn = page.locator('#btn-admin-logout');
    if (await logoutBtn.isVisible()) {
      throw new Error('❌ El botón de cerrar sesión o el gestor es visible sin haber iniciado sesión');
    }
    console.log('✅ El gestor está completamente protegido y bloqueado para usuarios no autenticados');

    // 3. Test wrong credentials
    console.log('2. Probando intento con credenciales incorrectas...');
    await usernameInput.fill('DiegoAdmin');
    await passwordInput.fill('PasswordErroneo123');
    await submitBtn.click();
    await page.waitForTimeout(500);

    const errorAlert = page.locator('#admin-login-error-alert');
    await errorAlert.waitFor({ state: 'visible', timeout: 3000 });
    const errorText = await errorAlert.textContent();
    console.log('   Mensaje de error mostrado:', errorText);
    if (!errorText?.includes('incorrectas')) {
      throw new Error('❌ No se mostró el mensaje de error adecuado para credenciales incorrectas');
    }
    console.log('✅ Credenciales inválidas rechazadas correctamente');

    // 4. Test correct credentials (DiegoAdmin / Acuario123)
    console.log('3. Probando inicio de sesión con credenciales válidas (DiegoAdmin / Acuario123)...');
    await usernameInput.fill('DiegoAdmin');
    await passwordInput.fill('Acuario123');
    await submitBtn.click();
    await page.waitForTimeout(600);

    // Dashboard should now be unlocked and visible
    await logoutBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Acceso concedido: El gestor de torneos está desbloqueado');

    // Check admin badge
    const adminBadge = page.locator('#admin-user-badge');
    await adminBadge.waitFor({ state: 'visible', timeout: 5000 });
    const badgeText = await adminBadge.innerText();
    console.log('   Admin badge text:', badgeText);
    if (!badgeText.toUpperCase().includes('DIEGOADMIN')) {
      throw new Error('❌ El badge del administrador no muestra "DiegoAdmin"');
    }
    console.log('✅ Badge de Administrador "DiegoAdmin" visible en la interfaz');

    // 5. Test Session Persistence across page reload
    console.log('4. Probando persistencia de sesión al recargar la página...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    if (!await logoutBtn.isVisible()) {
      throw new Error('❌ La sesión no persistió tras recargar la página');
    }
    console.log('✅ Sesión persistida exitosamente');

    // 6. Test Logout Flow
    console.log('5. Probando botón de Cerrar Sesión...');
    await logoutBtn.click();
    await page.waitForTimeout(500);

    await loginCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Sesión cerrada con éxito: redirigido a la pantalla de login');

    // 7. Verify Public Registration bypass (/#registro must remain public)
    console.log('6. Verificando que el registro público (/#registro) es accesible sin login...');
    await page.goto('http://localhost:3000/#registro');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const publicScreen = page.locator('#public-registration-screen, h1:has-text("Inscripción Oficial")').first();
    await publicScreen.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ La pantalla de Inscripción Pública de Bladers es accesible libremente sin credenciales de admin');

    console.log('\n🎉 ¡TODOS LOS TESTS DE AUTENTICACIÓN DE ADMINISTRADOR PASARON AL 100%! 🔒⚡');
  } finally {
    await browser.close();
  }
}

testAdminAuth().catch((err) => {
  console.error('❌ Error en el test de autenticación:', err);
  process.exit(1);
});
