/**
 * Admin Authentication Utilities
 * Handles credential verification, session management, and persistence
 * for the Beyblade X Tournament Manager.
 */

export interface AdminSession {
  username: string;
  role: 'admin';
  loggedInAt: string;
  token: string;
}

const STORAGE_KEY = 'bbx_admin_session';

// Configured credentials for tournament administrator
const VALID_ADMIN_USER = 'DiegoAdmin';
const VALID_ADMIN_PASS = 'Acuario123';

/**
 * Validates admin credentials against configured credentials.
 */
export function verifyAdminCredentials(username: string, pass: string): boolean {
  if (!username || !pass) return false;
  return username.trim() === VALID_ADMIN_USER && pass === VALID_ADMIN_PASS;
}

/**
 * Retrieves the currently active admin session from browser storage.
 */
export function getStoredAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (session && session.username && session.role === 'admin' && session.token) {
      return session;
    }
  } catch (e) {
    console.error('Error reading admin session from storage:', e);
  }
  return null;
}

/**
 * Saves a new authenticated admin session to browser storage.
 */
export function saveAdminSession(username: string = VALID_ADMIN_USER): AdminSession {
  const session: AdminSession = {
    username,
    role: 'admin',
    loggedInAt: new Date().toISOString(),
    token: `bbx_adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Error saving admin session to storage:', e);
    }
  }
  return session;
}

/**
 * Clears the active admin session from browser storage (Logout).
 */
export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing admin session from storage:', e);
    }
  }
}
