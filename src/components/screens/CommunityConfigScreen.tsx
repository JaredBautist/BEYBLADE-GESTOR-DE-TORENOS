import React, { useState, useRef, useEffect } from 'react';
import { TournamentConfig } from '../../types';
import { soundManager } from '../../utils/audio';
import { CommunityLogo } from '../CommunityLogo';
import { syncCommunityConfigToSupabase } from '../../lib/supabase';

interface CommunityConfigScreenProps {
  config: TournamentConfig;
  registeredBladersCount: number;
  onSaveConfig: (updated: TournamentConfig) => void;
  onNavigateToFormat?: () => void;
  onNavigateToBladers?: () => void;
}

interface CommunityPreset {
  id: string;
  name: string;
  badge: string;
  leagueName: string;
  communityTagline: string;
  communityCity: string;
  organizerName: string;
  tournamentName: string;
  arenaStatus: string;
}

const COMMUNITY_PRESETS: CommunityPreset[] = [
  {
    id: 'cucuta',
    name: 'Cúcuta (Oficial)',
    badge: '🇨🇴 Cúcuta',
    leagueName: 'Comunidad Beyblade Cúcuta',
    communityTagline: 'CÚCUTA • OFICIAL',
    communityCity: 'Cúcuta',
    organizerName: 'Juez Oficial • Cúcuta',
    tournamentName: 'Torneo Oficial Beyblade X Cúcuta',
    arenaStatus: 'Coliseo Cúcuta Center'
  },
  {
    id: 'bogota',
    name: 'Bogotá League',
    badge: '🇨🇴 Bogotá',
    leagueName: 'Comunidad Beyblade Bogotá',
    communityTagline: 'BOGOTÁ • OFICIAL',
    communityCity: 'Bogotá',
    organizerName: 'Juez Oficial • Bogotá',
    tournamentName: 'Copa Beyblade X Bogotá',
    arenaStatus: 'Arena Capital Bogotá'
  },
  {
    id: 'medellin',
    name: 'Medellín Pro',
    badge: '🇨🇴 Medellín',
    leagueName: 'Liga Beyblade Medellín',
    communityTagline: 'MEDELLÍN • CIRCUITO PRO',
    communityCity: 'Medellín',
    organizerName: 'Juez Oficial • Medellín',
    tournamentName: 'Circuito Pro Beyblade Medellín',
    arenaStatus: 'Xtreme Stadium A'
  },
  {
    id: 'mexico',
    name: 'México X Club',
    badge: '🇲🇽 México',
    leagueName: 'Comunidad Beyblade México',
    communityTagline: 'MÉXICO • OFICIAL',
    communityCity: 'Ciudad de México',
    organizerName: 'Juez Oficial • México',
    tournamentName: 'Torneo Nacional Beyblade X México',
    arenaStatus: 'Arena Pro World Stage'
  },
  {
    id: 'chile',
    name: 'Chile Circuit',
    badge: '🇨🇱 Chile',
    leagueName: 'Club Beyblade Chile',
    communityTagline: 'CHILE • OFICIAL',
    communityCity: 'Santiago',
    organizerName: 'Juez Oficial • Chile',
    tournamentName: 'Grand Prix Beyblade X Chile',
    arenaStatus: 'Xtreme Stadium A'
  },
  {
    id: 'global',
    name: 'Global / Internacional',
    badge: '🌎 Global',
    leagueName: 'World Beyblade X League',
    communityTagline: 'GLOBAL • OFFICIAL LEAGUE',
    communityCity: 'Internacional',
    organizerName: 'Official Head Referee',
    tournamentName: 'World Beyblade X Championship',
    arenaStatus: 'Arena Pro World Stage'
  }
];

export const CommunityConfigScreen: React.FC<CommunityConfigScreenProps> = ({
  config,
  registeredBladersCount,
  onSaveConfig,
  onNavigateToFormat,
  onNavigateToBladers
}) => {
  const [formData, setFormData] = useState<TournamentConfig>({ ...config });
  const [saveFeedback, setSaveFeedback] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  const triggerSave = (updated: TournamentConfig, msg = 'Configuración de comunidad guardada y sincronizada') => {
    setFormData(updated);
    onSaveConfig(updated);
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(''), 3000);
  };

  const handleApplyPreset = (preset: CommunityPreset) => {
    soundManager.playClick();
    const updated: TournamentConfig = {
      ...formData,
      leagueName: preset.leagueName,
      communityTagline: preset.communityTagline,
      communityCity: preset.communityCity,
      organizerName: preset.organizerName,
      name: preset.tournamentName,
      arenaStatus: preset.arenaStatus
    };
    triggerSave(updated, `Plantilla "${preset.name}" aplicada con éxito`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/webp', 0.8);
            const updated = { ...formData, logoUrl: compressedUrl };
            triggerSave(updated, 'Logo oficial actualizado y sincronizado en Supabase');
            soundManager.playClick();
          } else {
            throw new Error('No 2d context');
          }
        } catch (err) {
          console.warn('Compresión falló, usando original', err);
          const updated = { ...formData, logoUrl: rawDataUrl };
          triggerSave(updated, 'Logo oficial actualizado (sin compresión)');
          soundManager.playClick();
        }
      };
      
      img.onerror = () => {
        console.warn('Error al cargar imagen para compresión, usando original');
        const updated = { ...formData, logoUrl: rawDataUrl };
        triggerSave(updated, 'Logo oficial actualizado (sin compresión)');
        soundManager.playClick();
      };

      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    
    // Clear the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleResetLogo = () => {
    soundManager.playClick();
    const updated = { ...formData, logoUrl: undefined };
    triggerSave(updated, 'Logo oficial restablecido');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#bec7d3]/30 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight mb-2">
            CONFIGURACIÓN DE LA COMUNIDAD
          </h1>
          <p className="font-body-text text-base md:text-lg text-gray-600 dark:text-gray-400">
            Personaliza el nombre de tu comunidad, branding oficial, ciudad, organizador y logo en la base de datos Supabase.
          </p>
        </div>
        {saveFeedback && (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 rounded-xl text-xs font-label-caps uppercase font-black flex items-center gap-2 animate-fade-in shadow-sm">
            <span className="material-symbols-outlined text-base">cloud_done</span>
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Settings Panel (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION: IDENTIDAD DE LA COMUNIDAD (Exact Match Image 1) */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group shadow-sm border border-[#bec7d3]/40 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
              <h3 className="font-headline font-bold text-xl text-[#04A8FC] flex items-center gap-2">
                <span className="material-symbols-outlined">domain</span>
                <span>Identidad y Personalización de la Comunidad</span>
              </h3>
              <span className="text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full bg-[#04A8FC]/10 text-[#04A8FC] font-black border border-[#04A8FC]/20">
                MULTI-COMUNIDAD
              </span>
            </div>

            {/* Quick Community Presets */}
            <div>
              <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider font-bold">
                ⚡ PLANTILLAS RÁPIDAS DE COMUNIDAD (1-CLIC):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMUNITY_PRESETS.map((preset) => {
                  const isCurrent = formData.leagueName === preset.leagueName;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-3 py-2 rounded-xl text-xs font-headline font-bold text-left transition-all flex items-center justify-between border ${
                        isCurrent
                          ? 'bg-[#04A8FC] text-white border-[#04A8FC] shadow-md shadow-[#04A8FC]/25 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{preset.badge}</span>
                      {isCurrent && (
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Community Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* League / Community Name */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  NOMBRE DE LA COMUNIDAD / LIGA:
                </label>
                <input
                  type="text"
                  value={formData.leagueName}
                  onChange={(e) => {
                    const updated = { ...formData, leagueName: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Nombre de comunidad guardado')}
                  placeholder="Ej. Comunidad Beyblade Cúcuta"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>

              {/* Tagline / Header Badge */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  INSIGNIA SUPERIOR (HEADER BADGE):
                </label>
                <input
                  type="text"
                  value={formData.communityTagline || ''}
                  onChange={(e) => {
                    const updated = { ...formData, communityTagline: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Insignia superior guardada')}
                  placeholder="Ej. CÚCUTA • OFICIAL"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none uppercase font-headline"
                />
              </div>

              {/* City / Country */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  CIUDAD / REGIÓN / SEDE:
                </label>
                <input
                  type="text"
                  value={formData.communityCity || ''}
                  onChange={(e) => {
                    const updated = { ...formData, communityCity: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Ciudad guardada')}
                  placeholder="Ej. Cúcuta"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>

              {/* Head Judge / Organizer Name */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  JUEZ / ORGANIZADOR PRINCIPAL:
                </label>
                <input
                  type="text"
                  value={formData.organizerName || ''}
                  onChange={(e) => {
                    const updated = { ...formData, organizerName: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Organizador guardado')}
                  placeholder="Ej. Juez Oficial • Cúcuta"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>

              {/* Tournament Name */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  NOMBRE DEL EVENTO / TORNEO ACTUAL:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const updated = { ...formData, name: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Nombre del evento guardado')}
                  placeholder="Ej. Torneo Oficial Beyblade X Cúcuta"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>

              {/* Season */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  TEMPORADA / CICLO:
                </label>
                <input
                  type="text"
                  value={formData.season}
                  onChange={(e) => {
                    const updated = { ...formData, season: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Temporada guardada')}
                  placeholder="Ej. Temporada Oficial"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>
            </div>

            {/* Foto / Logo Oficial de la Comunidad */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const result = event.target?.result as string;
                    if (result) {
                      const updated = { ...formData, logoUrl: result };
                      triggerSave(updated, 'Logo oficial actualizado y sincronizado');
                      soundManager.playClick();
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
            >
              <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider font-bold">
                FOTO / LOGO OFICIAL DE LA COMUNIDAD
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl bg-white border border-slate-300 dark:border-white/20 p-1 flex items-center justify-center shadow-md flex-shrink-0 cursor-pointer hover:border-[#04A8FC] transition-colors"
                  title="Haz clic o arrastra tu archivo imagen.png aquí"
                >
                  <CommunityLogo size="md" customImageUrl={formData.logoUrl} communityText={formData.communityCity || formData.leagueName} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Sube tu logotipo oficial personalizado para que se refleje en la barra lateral, cabecera superior y certificados de la comunidad.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 bg-[#04A8FC] hover:bg-[#0096e6] text-white font-headline font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      <span>Subir Imagen / Logo</span>
                    </button>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="px-3 py-2 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-headline font-bold text-xs uppercase rounded-xl flex items-center gap-1 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                        <span>Restablecer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  triggerSave(formData, '¡Identidad guardada en la base de datos Supabase!');
                }}
                className="px-5 py-2.5 bg-[#04A8FC] hover:bg-[#0096e6] text-white font-headline font-black text-xs uppercase rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Guardar Cambios de Comunidad</span>
              </button>
            </div>
          </div>

          {/* Supabase Schema Helper */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group shadow-sm border border-[#bec7d3]/40 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
              <h3 className="font-headline font-bold text-lg text-[#04A8FC] flex items-center gap-2">
                <span className="material-symbols-outlined">database</span>
                <span>Base de Datos Supabase (Tabla `community_config`)</span>
              </h3>
              <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                Sincronización Automática
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <p>
                La configuración de identidad de la comunidad se guarda en la tabla independiente <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-mono">community_config</code>, totalmente separada del formato de torneo.
              </p>
              <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-xs uppercase text-[#04A8FC] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    <span>Script SQL de Comunidad</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sql = `CREATE TABLE IF NOT EXISTS community_config (
  id TEXT PRIMARY KEY DEFAULT 'main_community',
  league_name TEXT NOT NULL,
  community_tagline TEXT,
  community_city TEXT,
  organizer_name TEXT,
  event_name TEXT,
  season TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_config DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE community_config TO anon, authenticated, service_role;`;
                      navigator.clipboard.writeText(sql);
                      soundManager.playClick();
                      triggerSave(formData, '¡SQL de comunidad copiado al portapapeles!');
                    }}
                    className="px-2.5 py-1 bg-[#04A8FC] hover:bg-[#0096e6] text-white text-[11px] font-headline font-bold rounded-lg transition-all"
                  >
                    Copiar SQL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Estado de la Comunidad (Exact Match Image 3) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#bec7d3]/40 dark:border-white/10 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-[#1a1c1e] dark:text-white mb-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-2">
              Estado de la comunidad
            </h3>
            <ul className="space-y-4 font-label-caps text-xs uppercase">
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">COMUNIDAD ACTIVA</span>
                <span className="font-headline font-bold text-xs text-[#04A8FC] text-right truncate max-w-[170px]" title={formData.leagueName}>
                  {formData.leagueName}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">SEDE / CIUDAD</span>
                <span className="font-headline font-black text-xs text-slate-800 dark:text-slate-200">
                  {formData.communityCity || 'CÚCUTA'}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">BLADERS REGISTRADOS</span>
                <span className="font-headline font-black text-base text-[#04A8FC]">
                  {registeredBladersCount} / {formData.maxParticipants}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">FORMATO ACTUAL</span>
                <span className="font-headline font-black text-xs text-[#22c55e]">
                  {formData.type === 'elimination'
                    ? 'BRACKET ELIMINACIÓN'
                    : formData.type === 'series'
                    ? 'FORMATO SERIE (ANIME)'
                    : 'LIGA PUNTOS'}
                </span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
              {onNavigateToFormat && (
                <button
                  type="button"
                  onClick={onNavigateToFormat}
                  className="w-full py-2 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-headline font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#04A8FC]">tune</span>
                    <span>Ir a Formato del Torneo</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              )}

              {onNavigateToBladers && (
                <button
                  type="button"
                  onClick={onNavigateToBladers}
                  className="w-full py-2 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-headline font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#04A8FC]">groups</span>
                    <span>Ver Padrón de Bladers</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
