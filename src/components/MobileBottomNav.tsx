import React from 'react';
import { ActiveScreen } from '../types';
import { soundManager } from '../utils/audio';

interface MobileBottomNavProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  onOpenMoreMenu: () => void;
  isLiveMatchActive?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeScreen,
  setActiveScreen,
  onOpenMoreMenu,
  isLiveMatchActive = false
}) => {
  const navItems: {
    id: ActiveScreen;
    label: string;
    icon: string;
    hasIndicator?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Consola',
      icon: 'sports_kabaddi',
      hasIndicator: isLiveMatchActive
    },
    {
      id: 'bracket',
      label: 'Bracket',
      icon: 'account_tree'
    },
    {
      id: 'bladers',
      label: 'Bladers',
      icon: 'groups'
    },
    {
      id: 'tournament_format',
      label: 'Formato',
      icon: 'tune'
    }
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Navegación principal móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111116]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-all duration-200"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)'
      }}
    >
      <div className="grid grid-cols-5 items-center px-1 pt-1.5 pb-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveScreen(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 ease-out active:scale-[0.92] select-none touch-manipulation min-h-[52px] ${
                isActive
                  ? 'text-[#0284c7] dark:text-[#04A8FC]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Active Background Glow Pill */}
              {isActive && (
                <span className="absolute inset-x-1.5 inset-y-1 bg-sky-500/10 dark:bg-[#04A8FC]/15 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              {/* Icon Container with live dot */}
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[24px] transition-transform duration-150 ${
                    isActive ? 'scale-110 font-bold' : ''
                  }`}
                >
                  {item.icon}
                </span>

                {/* Live Match Pulsing Indicator Badge */}
                {item.hasIndicator && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39FF14] border border-black/30"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`font-label-caps text-[10px] tracking-wider uppercase mt-0.5 leading-tight transition-all ${
                  isActive ? 'font-black tracking-tight scale-105' : 'font-bold'
                }`}
              >
                {item.label}
              </span>

              {/* Tiny bottom active bar */}
              {isActive && (
                <span className="w-4 h-0.5 bg-[#0284c7] dark:bg-[#04A8FC] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More Options Tab (triggers sidebar menu) */}
        <button
          id="mobile-tab-more"
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenMoreMenu();
          }}
          className="relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-150 ease-out active:scale-[0.92] select-none touch-manipulation min-h-[52px]"
          title="Ver más opciones"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </div>
          <span className="font-label-caps text-[10px] tracking-wider uppercase mt-0.5 leading-tight font-bold">
            Más
          </span>
        </button>
      </div>
    </nav>
  );
};
