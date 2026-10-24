# Design: Admin Authentication System (Login Sencillo)

## Architecture & Module Boundaries

```
src/
├── utils/
│   └── auth.ts                 # Pure auth helper: credential verification, session storage & retrieval
├── components/
│   ├── screens/
│   │   └── AdminLoginScreen.tsx# Responsive, tactile Beyblade X admin login interface
│   ├── Header.tsx              # Admin session badge & desktop logout button
│   ├── Sidebar.tsx             # Drawer/desktop logout button
│   └── MobileBottomNav.tsx     # (Optional) indicator or drawer link
└── App.tsx                     # Top-level auth gate routing
```

### 1. Data Model & Session Interface
```typescript
export interface AdminSession {
  username: string;
  role: 'admin';
  loggedInAt: string;
  token: string;
}
```

Storage Key: `bbx_admin_session`
Stored as JSON with expiry/timestamp.

### 2. Credential Verification Contract
- Expected Username: `DiegoAdmin`
- Expected Password: `Acuario123`
- Method:
  ```typescript
  export function verifyAdminCredentials(username: string, pass: string): boolean
  ```

### 3. Visual & Interaction Design (`ui-ux-pro-max` + `emil-design-eng`)
- **Card Layout:** Centered elevated card (`bg-white dark:bg-[#12121a]`) with subtle Beyblade blue/gold accent glow (`shadow-2xl shadow-sky-500/10`).
- **Brand Identity:** Prominent Cúcuta Beyblade X badge and logo.
- **Form Controls:**
  - `<label>` tags with `htmlFor` for accessibility.
  - Username input (`autoComplete="username"`, `text-base md:text-sm`).
  - Password input (`autoComplete="current-password"`, `text-base md:text-sm`, toggle eye button).
  - Submit button with high-contrast gradient (`min-h-[50px]`, `active:scale-[0.97] touch-manipulation`).
  - Quick error alert with clear icon and message.
  - Link to open public registration preview if user is a blader.

### 4. Architecture Decision Record (ADR)
- **Context:** Tournaments frequently run at physical venues with spotty or zero Wi-Fi connection. The user requested a simple, reliable admin login ("donde está el gestor pues solo es login sencillo").
- **Decision:** Implement dedicated client-side credential verification with encrypted/tokenized local session storage.
- **Alternatives Considered:**
  1. *Supabase Auth with email/password table:* Requires cloud network connectivity during live local matches and email verification setup.
  2. *Basic HTTP prompt:* Poor UX, no mobile tactile controls, cannot brand.
- **Consequences:** Provides fast, zero-latency login that functions seamlessly both offline at the tournament stadium and online with Supabase sync.
