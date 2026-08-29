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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#111116] border-r border-slate-200 dark:border-white/10 backdrop-blur-md shadow-[4px_0_20px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-50 flex flex-col pt-6 pb-6 transition-all duration-200">
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
              
              {/* Change photo overlay button on hover */}
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
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => {
                soundManager.playClick();
                setActiveScreen(item.id);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#04A8FC] text-white font-black shadow-md shadow-[#04A8FC]/25 translate-x-1'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:translate-x-1 font-bold'
              }`}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="bg-[#AC191F] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom links */}
      <div className="px-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-1">
        {/* Config Comunidad (SaaS Community Settings) */}
        <button
          id="btn-community-config-sidebar"
          onClick={() => {
            soundManager.playClick();
            setActiveScreen('community_config');
          }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all ${
            activeScreen === 'community_config'
              ? 'bg-[#04A8FC] text-white font-black shadow-md shadow-[#04A8FC]/25'
              : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-bold'
          }`}
        >
          <span className="material-symbols-outlined text-base">domain</span>
          <span>Config. Comunidad</span>
        </button>

        <button
          id="btn-support-sidebar"
          onClick={() => {
            soundManager.playClick();
            onOpenSupportModal();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all font-bold"
        >
          <span className="material-symbols-outlined text-base">help</span>
          <span>Soporte & Guía</span>
        </button>

        <button
          id="btn-reset-sidebar"
          onClick={() => {
            soundManager.playClick();
            onResetTournament();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-[#DC2626] hover:bg-red-50 dark:hover:bg-[#AC191F]/10 rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all font-black"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
          <span>Reiniciar Torneo</span>
        </button>
      </div>
    </aside>
  );
};
