# Requirements: Admin Authentication System (Login Sencillo)

## Purpose
Provide a secure, accessible, and user-friendly authentication barrier for the tournament manager ("gestor"), restricting administrative tools (Battle Console, Brackets, Roster modifications, Tournament configuration, Resets) exclusively to authorized tournament administrators (User: `DiegoAdmin`), while keeping the public blader registration screen (`/#registro`) open and accessible without login.

## Scope
- Implementation of a dedicated `AdminLoginScreen` component with Beyblade X tactical aesthetic.
- Validation of admin credentials (`DiegoAdmin` / `Acuario123`).
- Client session persistence using browser storage (`bbx_admin_auth`), with auto-reconnect on page reload.
- Logout capability in Header, Sidebar, and Mobile Drawer.
- Seamless coexistence with the public self-registration flow (`/#registro`), ensuring bladers can register without being blocked by admin auth.

## Explicit Exclusions
- Multi-user RBAC database registration system (future iteration when community scales).
- OAuth2/social logins (excluded per user specification: "solo es login sencillo por el momento").

## Numbered Acceptance Criteria (EARS Syntax)

1. **WHEN** an unauthenticated user accesses the root application (`/`) without public registration hash/query parameters, **THE SYSTEM SHALL** render the `AdminLoginScreen` and block access to the tournament management dashboard.
2. **WHEN** the user inputs username `DiegoAdmin` and password `Acuario123` and submits the form, **THE SYSTEM SHALL** authenticate the session, persist authentication state in browser storage, play success audio feedback, and render the tournament manager dashboard.
3. **WHEN** an unauthenticated user submits incorrect credentials, **THE SYSTEM SHALL** display an error alert ("Credenciales inválidas. Verifica tu usuario o contraseña."), play error audio feedback, and keep the user on the login screen.
4. **WHILE** the administrator is authenticated, **THE SYSTEM SHALL** display an admin badge in the top Header and a "Cerrar Sesión" (Logout) button in Header, Sidebar, and Mobile Drawer.
5. **WHEN** the authenticated administrator clicks "Cerrar Sesión", **THE SYSTEM SHALL** clear the stored session state and immediately return to the `AdminLoginScreen`.
6. **WHEN** any user navigates to public registration via URL (`/#registro`, `?registro=true`), **THE SYSTEM SHALL** render `PublicRegistrationScreen` without requiring admin credentials.
7. **WHEN** viewing the `AdminLoginScreen` on mobile screens (360px–430px), **THE SYSTEM SHALL** maintain touch targets of at least 44x44px, prevent auto-zoom (`text-base`), and provide toggleable password visibility.
