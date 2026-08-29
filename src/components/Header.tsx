import React from 'react';
import { ActiveScreen } from '../types';
import { soundManager } from '../utils/audio';
import { CommunityLogo } from './CommunityLogo';

interface HeaderProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenNewBladerModal: () => void;
  onToggleMobileMenu?: () => void;
  onResetTournament?: () => void;
  logoUrl?: string;
  leagueName?: string;
  communityTagline?: string;
  communityCity?: string;
  tournamentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  setActiveScreen,
  isDark,
  setIsDark,
  isMuted,
  setIsMuted,
  onOpenNewBladerModal,
  onToggleMobileMenu,
  onResetTournament,
  logoUrl,
  leagueName = 'Comunidad Beyblade Cúcuta',
  communityTagline = 'CÚCUTA • OFICIAL',
  communityCity = 'Cúcuta',
  tournamentName = 'BEYBLADE X TOURNAMENT'
}) => {
  return (
    <header className="bg-white/95 dark:bg-[#131318]/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-xl fixed top-0 left-0 right-0 md:left-64 z-40 h-16 flex items-center justify-between px-3 sm:px-4 md:px-8 transition-colors duration-200 shadow-sm">
      {/* Left branding / navigation */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-0">
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            id="btn-mobile-hamburger"
            onClick={() => {
              soundManager.playClick();
              onToggleMobileMenu();
            }}
            className="md:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200/80 dark:border-white/5 flex items-center justify-center transition-all flex-shrink-0"
            title="Abrir Menú Principal"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 dark:border-white/10 p-0.5 flex items-center justify-center shadow-sm flex-shrink-0">
            <CommunityLogo size="sm" customImageUrl={logoUrl} communityText={communityCity || leagueName} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-headline font-black text-sm sm:text-base md:text-xl text-slate-900 dark:text-white tracking-tight uppercase leading-none truncate" title={tournamentName}>
              {tournamentName.includes('BEYBLADE') ? tournamentName : `BEYBLADE X • ${tournamentName}`}
            </h1>
            <span className="text-[9px] sm:text-[10px] font-label-caps uppercase tracking-wider text-[#0284c7] dark:text-[#04A8FC] font-black truncate block" title={communityTagline}>
              {communityTagline || 'OFICIAL'}
            </span>
          </div>
        </div>

        {/* Quick Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 font-label-caps text-xs tracking-wider uppercase font-bold">
          <button
            id="nav-link-format"
            onClick={() => {
              soundManager.playClick();
              setActiveScreen('tournament_format');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScreen === 'tournament_format'
                ? 'bg-sky-50 dark:bg-[#04A8FC]/20 text-[#0284c7] dark:text-[#93ccff] font-black border border-sky-200 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Formato
          </button>
          <button
            id="nav-link-bracket"
            onClick={() => {
              soundManager.playClick();
              setActiveScreen('bracket');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScreen === 'bracket'
                ? 'bg-sky-50 dark:bg-[#04A8FC]/20 text-[#0284c7] dark:text-[#93ccff] font-black border border-sky-200 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Bracket
          </button>
          <button
            id="nav-link-bladers"
            onClick={() => {
              soundManager.playClick();
              setActiveScreen('bladers');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScreen === 'bladers'
                ? 'bg-sky-50 dark:bg-[#04A8FC]/20 text-[#0284c7] dark:text-[#93ccff] font-black border border-sky-200 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Bladers
          </button>
          <button
            id="nav-link-rules"
            onClick={() => {
              soundManager.playClick();
              setActiveScreen('rules');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScreen === 'rules'
                ? 'bg-sky-50 dark:bg-[#04A8FC]/20 text-[#0284c7] dark:text-[#93ccff] font-black border border-sky-200 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Reglas
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Register Player Action */}
        <button
          id="btn-register-player-top"
          onClick={() => {
            soundManager.playClick();
            onOpenNewBladerModal();
          }}
          className="hidden sm:flex items-center gap-1.5 bg-[#04A8FC] hover:bg-[#008fe0] text-white px-3.5 py-1.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-black shadow-sm shadow-[#04A8FC]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>Registrar Blader</span>
        </button>

        {/* Audio Toggle */}
        <button
          id="btn-toggle-sound"
          title={isMuted ? 'Activar Sonidos' : 'Silenciar Sonidos'}
          onClick={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundManager.setMuted(next);
            if (!next) soundManager.playClick();
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border border-slate-200/80 dark:border-white/5 ${
            isMuted
              ? 'text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 bg-slate-100 dark:bg-white/5'
              : 'text-[#0284c7] dark:text-[#04A8FC] bg-sky-50 dark:bg-[#04A8FC]/10 hover:bg-sky-100 dark:hover:bg-[#04A8FC]/20'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          id="btn-toggle-theme"
          title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          onClick={() => {
            soundManager.playClick();
            setIsDark(!isDark);
          }}
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200/80 dark:border-white/5 flex items-center justify-center transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Settings button */}
        <button
          id="btn-settings-header"
          title="Configuración de la Comunidad"
          onClick={() => {
            soundManager.playClick();
            setActiveScreen('community_config');
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border border-slate-200/80 dark:border-white/5 ${
            activeScreen === 'community_config' || activeScreen === 'configuration'
              ? 'bg-[#04A8FC] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </button>

        {/* Quick Reset Tournament Button */}
        {onResetTournament && (
          <button
            id="btn-reset-header"
            title="Reiniciar Torneo / Nuevo Torneo"
            onClick={() => {
              soundManager.playClick();
              onResetTournament();
            }}
            className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#DC2626] border border-red-500/20 flex items-center justify-center transition-all shadow-sm active:scale-95 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        )}

        {/* Official Referee / Judge Badge */}
        <div className="relative group pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#006398] to-[#04A8FC] border-2 border-white dark:border-[#131318] flex items-center justify-center text-white shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-base">gavel</span>
          </div>
          <div className="absolute right-0 top-10 hidden group-hover:block bg-slate-900 text-white text-[11px] font-label-caps uppercase px-2.5 py-1 rounded shadow-lg whitespace-nowrap z-50">
            Juez Oficial • {communityCity || 'Oficial'}
          </div>
        </div>
      </div>
    </header>
  );
};
