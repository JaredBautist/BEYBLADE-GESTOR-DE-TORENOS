import React, { useState } from 'react';
import { CommunityLogo } from '../CommunityLogo';
import { soundManager } from '../../utils/audio';
import { verifyAdminCredentials, saveAdminSession } from '../../utils/auth';

interface AdminLoginScreenProps {
  onLoginSuccess: (username: string) => void;
  onNavigateToRegistration?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  logoUrl?: string;
  tournamentName?: string;
  leagueName?: string;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegistration,
  isDark = true,
  onToggleTheme,
  logoUrl,
  tournamentName = 'Torneo Oficial Beyblade X',
  leagueName = 'Comunidad Beyblade Cúcuta'
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setErrorMsg(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMsg('Por favor completa tanto el usuario como la contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const isValid = verifyAdminCredentials(trimmedUser, password);
      if (isValid) {
        soundManager.playVictory();
        saveAdminSession(trimmedUser);
        onLoginSuccess(trimmedUser);
      } else {
        soundManager.playPoint('stadium');
        setErrorMsg('Credenciales incorrectas. Verifica el usuario y la contraseña.');
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#f7f9fc] dark:bg-[#0c0c10] text-[#1a1c1e] dark:text-white transition-colors duration-200">
      {/* Background Ambience & Grid */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 dark:bg-[#04A8FC]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500/10 dark:bg-[#DC2626]/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Controls (Theme Toggle) */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onToggleTheme();
            }}
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm hover:border-[#04A8FC] transition-all active:scale-95 touch-manipulation"
            title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span className="material-symbols-outlined text-xl">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      )}

      {/* Main Login Card */}
      <div
        id="admin-login-card"
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#13131c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-sky-950/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-9 space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#006398] via-[#04A8FC] to-[#AC191F] p-0.5 shadow-lg shadow-[#04A8FC]/25">
            <div className="w-full h-full bg-white dark:bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-1 shadow-inner">
              <CommunityLogo
                size="md"
                customImageUrl={logoUrl}
                communityText={leagueName}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-[#0284c7] dark:text-[#04A8FC] border border-sky-500/20 text-[10px] font-label-caps uppercase font-black tracking-widest mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#04A8FC] animate-ping"></span>
              <span>Panel de Control</span>
            </div>
            <h1 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tight text-slate-900 dark:text-white">
              {tournamentName}
            </h1>
            <p className="text-xs font-label-caps uppercase text-slate-500 dark:text-slate-400 mt-1">
              Acceso Exclusivo • Administrador del Torneo
            </p>
          </div>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div
            id="admin-login-error-alert"
            role="alert"
            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200"
          >
            <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
            <span className="flex-1 leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="admin-username-input"
              className="block font-label-caps text-xs uppercase font-bold text-slate-700 dark:text-slate-300"
            >
              Usuario Administrador
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg pointer-events-none">
                person
              </span>
              <input
                id="admin-username-input"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario..."
                className="w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-base md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#04A8FC] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="admin-password-input"
              className="block font-label-caps text-xs uppercase font-bold text-slate-700 dark:text-slate-300"
            >
              Contraseña de Acceso
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg pointer-events-none">
                lock
              </span>
              <input
                id="admin-password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña..."
                className="w-full pl-10 pr-12 py-3 min-h-[46px] rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-base md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#04A8FC] focus:border-transparent transition-all"
              />
              <button
                type="button"
                id="btn-toggle-password-visibility"
                onClick={() => {
                  soundManager.playClick();
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-admin-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 min-h-[50px] rounded-xl bg-gradient-to-r from-[#006398] via-[#04A8FC] to-[#0284c7] hover:from-[#005280] hover:to-[#0396e0] text-white font-headline font-black text-sm uppercase tracking-wider shadow-lg shadow-sky-500/25 active:scale-[0.97] transition-all duration-150 ease-out select-none touch-manipulation flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Verificando Credenciales...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>Entrar al Gestor de Torneo</span>
              </>
            )}
          </button>
        </form>

        {/* Public Registration Shortcut for Bladers */}
        {onNavigateToRegistration && (
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              ¿Eres un Blader y vas a competir?
            </p>
            <button
              id="btn-goto-public-registration-from-login"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onNavigateToRegistration();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-label-caps uppercase font-bold text-[#0284c7] dark:text-[#04A8FC] hover:underline transition-all"
            >
              <span className="material-symbols-outlined text-sm">how_to_reg</span>
              <span>Ir a Inscripción de Jugadores</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-xs font-label-caps uppercase text-slate-400 dark:text-slate-500">
        <p>{leagueName} • Cúcuta, Colombia</p>
      </footer>
    </div>
  );
};
