import React, { useRef } from 'react';
import { ActiveScreen } from '../types';
import { CommunityLogo } from './CommunityLogo';
import { soundManager } from '../utils/audio';

interface SidebarProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  onOpenNewBattle: () => void;
  onOpenSupportModal: () => void;
  onResetTournament: () => void;
  onCloseMobile?: () => void;
  leagueName?: string;
  season?: string;
  communityCity?: string;
  logoUrl?: string;
  onUploadLogo?: (url: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  setActiveScreen,
  onOpenNewBattle,
  onOpenSupportModal,
  onResetTournament,
  onCloseMobile,
  leagueName = 'Comunidad Beyblade Cúcuta',
  season = 'Temporada Oficial',
  communityCity = 'Cúcuta',
  logoUrl,
  onUploadLogo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = React.useState(false);

  const processFile = (file: File) => {
    if (file && onUploadLogo) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUploadLogo(result);
          soundManager.playClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const navItems: { id: ActiveScreen; label: string; icon: string; badge?: string }[] = [
    { id: 'tournament_format', label: 'Formato del Torneo', icon: 'tune' },
    { id: 'dashboard', label: 'Battle Console', icon: 'sports_kabaddi' },
    { id: 'bracket', label: 'Bracket / Árbol', icon: 'account_tree' },
    { id: 'bladers', label: 'Bladers & Roster', icon: 'groups' },
    { id: 'equipment', label: 'Equipamiento X', icon: 'settings_input_component' },
    { id: 'rules', label: 'Reglas Oficiales', icon: 'menu_book' },
    { id: 'history', label: 'Historial', icon: 'history' }
  ];

  return (
    <aside className="h-full w-full bg-white dark:bg-[#111116] border-r border-slate-200 dark:border-white/10 backdrop-blur-md shadow-[4px_0_20px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)] flex flex-col pt-6 pb-6 transition-all duration-200 relative overflow-y-auto">
      {/* Mobile Close Button */}
      {onCloseMobile && (
        <button
          onClick={() => {
            soundManager.playClick();
            onCloseMobile();
          }}
          className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          title="Cerrar Menú"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}

      {/* Hidden file input for logo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Brand Header */}
      <div className="px-5 mb-6 flex flex-col items-center text-center">
        <div className="relative group mb-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#006398] via-[#04A8FC] to-[#AC191F] p-0.5 shadow-md shadow-[#04A8FC]/20 cursor-pointer transition-transform duration-150 ${
              isDragging ? 'scale-110 ring-4 ring-[#04A8FC]' : 'hover:scale-105'
            }`}
            title="Haz clic o arrastra tu archivo imagen.png aquí"
          >
            <div className="w-full h-full bg-white dark:bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-1 shadow-inner relative">
              <CommunityLogo size="md" customImageUrl={logoUrl} communityText={communityCity || leagueName} className="w-full h-full object-contain" />
              
              <div
                className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase transition-opacity backdrop-blur-xs ${
                  isDragging ? 'opacity-100 bg-[#04A8FC]/80' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isDragging ? 'file_download' : 'upload_file'}
                </span>
                <span>{isDragging ? 'Soltar Foto' : 'Subir Foto'}</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#04A8FC] text-white text-[9px] font-headline font-black px-1.5 py-0.5 rounded shadow">
            X
          </div>
        </div>

        <h2 className="text-slate-900 dark:text-white font-headline font-black text-lg uppercase tracking-tight">
          {leagueName}
        </h2>
        <p className="text-xs text-[#0284c7] dark:text-[#04A8FC] font-label-caps uppercase tracking-wider font-bold">
          {season}
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                soundManager.playClick();
                setActiveScreen(item.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-50 to-white dark:from-[#04A8FC]/20 dark:to-[#04A8FC]/5 text-[#0284c7] dark:text-white font-black border-l-4 border-[#04A8FC] shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-lg ${
                    isActive ? 'text-[#0284c7] dark:text-[#04A8FC]' : 'text-slate-400 dark:text-gray-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-[#04A8FC] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 pt-4 border-t border-slate-200 dark:border-white/10 space-y-1.5">
        <button
          id="btn-new-battle-sidebar"
          onClick={() => {
            soundManager.playClick();
            onOpenNewBattle();
            onCloseMobile?.();
          }}
          className="w-full bg-[#04A8FC] hover:bg-[#008fe0] text-white py-2.5 px-4 rounded-xl font-label-caps text-xs uppercase tracking-wider font-black shadow-md shadow-[#04A8FC]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Nuevo Duelo</span>
        </button>

        <button
          id="btn-support-sidebar"
          onClick={() => {
            soundManager.playClick();
            onOpenSupportModal();
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all font-bold"
        >
          <span className="material-symbols-outlined text-base">help</span>
          <span>Soporte & Guía</span>
        </button>

        {/* Reiniciar Torneo Button (Highly Visible) */}
        <button
          id="btn-reset-sidebar"
          onClick={() => {
            soundManager.playClick();
            onResetTournament();
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[#DC2626] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all font-black shadow-sm"
        >
          <span className="material-symbols-outlined text-base text-[#DC2626] animate-pulse">restart_alt</span>
          <span>Reiniciar Torneo</span>
        </button>
      </div>
    </aside>
  );
};
