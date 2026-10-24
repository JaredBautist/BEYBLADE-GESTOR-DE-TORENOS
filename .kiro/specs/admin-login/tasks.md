# Tasks: Admin Authentication System (Login Sencillo)

- [ ] 1. Auth Domain & Helper (`src/utils/auth.ts`)
  - [ ] Implement `verifyAdminCredentials(username, password)`.
  - [ ] Implement `getStoredAdminSession()`, `saveAdminSession(username)`, and `clearAdminSession()`.
  - [ ] Export types and test unit functions.
  - *Acceptance Check:* Valid credentials return true; invalid credentials return false; session is preserved in localStorage.

- [ ] 2. Admin Login Screen Component (`src/components/screens/AdminLoginScreen.tsx`)
  - [ ] Build centered card with Cúcuta Beyblade X logo, title "Panel de Control • Administrador".
  - [ ] Form with accessible labels, username and password inputs (`text-base md:text-sm`).
  - [ ] Show/hide password toggle button.
  - [ ] Error alert banner when credentials fail.
  - [ ] Quick shortcut button "Ir al Registro de Bladers" for players who land on the login page by accident.
  - [ ] Tactile submit button with `active:scale-[0.97]` and `touch-manipulation`.
  - *Acceptance Check:* Form renders cleanly, supports mobile 390px, handles validation states.

- [ ] 3. Top-Level Integration in `src/App.tsx`
  - [ ] Initialize `isAdminAuthenticated` state from `getStoredAdminSession()`.
  - [ ] If `!isAdminAuthenticated` and `activeScreen !== 'public_registration'`, render `<AdminLoginScreen>`.
  - [ ] Provide `handleAdminLogin(username, password)` and `handleAdminLogout()`.
  - *Acceptance Check:* Entering `DiegoAdmin` / `Acuario123` unlocks the tournament dashboard; reloading page stays authenticated.

- [ ] 4. Logout Controls in Header, Sidebar, and Mobile Drawer
  - [ ] Add Admin Badge and "Cerrar Sesión" button in `Header.tsx`.
  - [ ] Add "Cerrar Sesión de Administrador" button in `Sidebar.tsx`.
  - *Acceptance Check:* Clicking logout resets auth state and displays `AdminLoginScreen`.

- [ ] 5. Playwright E2E Verification Suite (`src/tests/test_admin_auth.ts`)
  - [ ] Test unauthenticated visit renders login screen and blocks gestor.
  - [ ] Test wrong credentials displays error message.
  - [ ] Test correct credentials (`DiegoAdmin` / `Acuario123`) unlocks tournament dashboard.
  - [ ] Test logout button returns to login screen.
  - [ ] Test `/#registro` remains accessible directly without admin login.
  - *Acceptance Check:* 100% of test assertions pass.
