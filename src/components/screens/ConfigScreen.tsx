import React, { useState, useRef, useEffect } from 'react';
import { TournamentConfig, TournamentType, BattleScale } from '../../types';
import { soundManager } from '../../utils/audio';
import { CommunityLogo } from '../CommunityLogo';

interface ConfigScreenProps {
  config: TournamentConfig;
  registeredBladersCount: number;
  onSaveConfig: (updated: TournamentConfig) => void;
  onStartTournament: () => void;
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

export const ConfigScreen: React.FC<ConfigScreenProps> = ({
  config,
  registeredBladersCount,
  onSaveConfig,
  onStartTournament
}) => {
  const [formData, setFormData] = useState<TournamentConfig>({ ...config });
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  const triggerSave = (updated: TournamentConfig, msg = 'Configuración actualizada y sincronizada') => {
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
  };

  const handleResetLogo = () => {
    soundManager.playClick();
    const updated = { ...formData, logoUrl: undefined };
    triggerSave(updated, 'Logo oficial restablecido');
  };

  const handleTypeChange = (type: TournamentType) => {
    soundManager.playClick();
    const updated: TournamentConfig = {
      ...formData,
      type,
      ...(type === 'series' ? { battleScale: '1v1' } : {})
    };
    triggerSave(updated);
  };

  const handleScaleChange = (scale: BattleScale) => {
    soundManager.playClick();
    const updated = { ...formData, battleScale: scale };
    triggerSave(updated);
  };

  const handlePointsChange = (field: keyof TournamentConfig['victoryConditions'], value: number) => {
    const updated = {
      ...formData,
      victoryConditions: {
        ...formData.victoryConditions,
        [field]: Math.max(1, value)
      }
    };
    triggerSave(updated);
  };

  const handleStart = () => {
    soundManager.playClick();
    setIsSaved(true);
    onStartTournament();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#bec7d3]/30 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight mb-2">
            CONFIGURACIÓN DEL TORNEO
          </h1>
          <p className="font-body-text text-base md:text-lg text-gray-600 dark:text-gray-400">
            Personaliza el nombre de tu comunidad, branding oficial, ciudad y reglas de torneo en la base de datos.
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
          
          {/* SECTION 1: IDENTIDAD DE LA COMUNIDAD */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group shadow-sm border border-[#bec7d3]/40 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
              <h3 className="font-headline font-bold text-xl text-[#04A8FC] flex items-center gap-2">
                <span className="material-symbols-outlined">domain</span>
                <span>Identidad y Personalización de la Comunidad</span>
              </h3>
              <span className="text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full bg-[#04A8FC]/10 text-[#04A8FC] font-black border border-[#04A8FC]/20">
                Multi-Comunidad
              </span>
            </div>

            {/* Quick Community Presets */}
            <div>
              <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider font-bold">
                ⚡ Plantillas Rápidas de Comunidad (1-Clic):
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
                  Nombre de la Comunidad / Liga:
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
                  Insignia Superior (Header Badge):
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
                  Ciudad / Región / Sede:
                </label>
                <input
                  type="text"
                  value={formData.communityCity || ''}
                  onChange={(e) => {
                    const updated = { ...formData, communityCity: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Ciudad guardada')}
                  placeholder="Ej. Cúcuta, Colombia"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>

              {/* Head Judge / Organizer Name */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  Juez / Organizador Principal:
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
                  Nombre del Evento / Torneo Actual:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const updated = { ...formData, name: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Nombre del evento guardado')}
                  placeholder="Ej. Torneo Oficial Beyblade X"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>

              {/* Season */}
              <div className="space-y-1.5">
                <label className="block font-label-caps text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  Temporada / Ciclo:
                </label>
                <input
                  type="text"
                  value={formData.season}
                  onChange={(e) => {
                    const updated = { ...formData, season: e.target.value };
                    setFormData(updated);
                  }}
                  onBlur={() => triggerSave(formData, 'Temporada guardada')}
                  placeholder="Ej. Temporada Oficial 2026"
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] focus:outline-none"
                />
              </div>
            </div>

            {/* Logo de la Comunidad */}
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

          {/* SECTION 2: CORE FORMAT & RULES */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group shadow-sm border border-[#bec7d3]/40 dark:border-white/10 space-y-6">
            <h3 className="font-headline font-bold text-xl text-[#04A8FC] border-b border-[#bec7d3]/30 dark:border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">tune</span>
              <span>Reglas de Combate y Formato</span>
            </h3>

            {/* System Architecture */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider font-bold">
                FORMATO DEL TORNEO
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* League Format Option */}
                <label
                  onClick={() => handleTypeChange('league')}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    formData.type === 'league'
                      ? 'border-[#04A8FC] bg-[#04A8FC]/10 shadow-sm shadow-[#04A8FC]/10'
                      : 'border-[#bec7d3]/50 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-[#04A8FC] mt-0.5 flex-shrink-0 flex items-center justify-center">
                    {formData.type === 'league' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#04A8FC] shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white mb-1">
                      Liga / Round Robin
                    </div>
                    <div className="font-label-caps text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Acumulación de puntos por jornadas. Ideal para ranking estacional.
                    </div>
                  </div>
                </label>

                {/* Elimination Bracket Option */}
                <label
                  onClick={() => handleTypeChange('elimination')}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    formData.type === 'elimination'
                      ? 'border-[#04A8FC] bg-[#04A8FC]/10 shadow-sm shadow-[#04A8FC]/10'
                      : 'border-[#bec7d3]/50 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-[#04A8FC] mt-0.5 flex-shrink-0 flex items-center justify-center">
                    {formData.type === 'elimination' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#04A8FC] shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white mb-1">
                      Eliminación Directa
                    </div>
                    <div className="font-label-caps text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Árbol de eliminatorias directas (Bracket) hasta la Gran Final.
                    </div>
                  </div>
                </label>

                {/* Series Format Option (Anime Style) */}
                <label
                  onClick={() => handleTypeChange('series')}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    formData.type === 'series'
                      ? 'border-[#FF5500] bg-[#FF5500]/10 shadow-sm shadow-[#FF5500]/10 ring-1 ring-[#FF5500]/30'
                      : 'border-[#bec7d3]/50 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-[#FF5500] mt-0.5 flex-shrink-0 flex items-center justify-center">
                    {formData.type === 'series' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="font-headline font-bold text-base text-[#1a1c1e] dark:text-white">
                        Formato Serie
                      </div>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30">
                        Anime
                      </span>
                    </div>
                    <div className="font-label-caps text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      1 solo combo por Blader. 1 ronda decisiva: cualquier finish gana la batalla inmediatamente. Puntos acumulados.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Battle Scale */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider font-bold">
                ESCALA DE BATALLA
              </label>
              <div className="flex flex-wrap gap-3">
                {(['1v1', '2v2', '3v3', '4v4'] as BattleScale[]).map((scale) => {
                  const label = scale === '1v1' ? '1 vs 1' : scale === '2v2' ? '2 vs 2' : scale === '3v3' ? '3 vs 3' : '4 vs 4';
                  const isSelected = formData.battleScale === scale;
                  return (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => handleScaleChange(scale)}
                      className={`px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-all ${
                        isSelected
                          ? 'bg-[#04A8FC]/15 border-2 border-[#04A8FC] text-[#04A8FC] shadow-sm shadow-[#04A8FC]/20'
                          : 'border border-[#bec7d3]/50 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Victory Conditions */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider font-bold">
                CONDICIONES DE VICTORIA (PUNTUACIÓN)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Points to Win / Series 1-Round Rule */}
                {formData.type === 'series' ? (
                  <div className="bg-[#FF5500]/10 border-2 border-[#FF5500]/40 rounded-xl p-3 text-center flex flex-col justify-center shadow-sm">
                    <div className="font-label-caps text-[11px] text-[#FF5500] uppercase font-black mb-1">
                      CONDICIÓN SERIE
                    </div>
                    <div className="font-headline font-black text-2xl text-[#FF5500] p-0.5 uppercase leading-none">
                      1 RONDA
                    </div>
                    <div className="text-[10px] font-label-caps text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                      Cualquier Finish Gana
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                    <div className="font-label-caps text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                      Puntos para Ganar
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.victoryConditions.pointsToWin}
                      onChange={(e) => handlePointsChange('pointsToWin', parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent border-b-2 border-[#04A8FC] text-center text-[#04A8FC] font-headline font-black text-2xl focus:outline-none p-1"
                    />
                  </div>
                )}

                {/* Xtreme Dash Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    Xtreme Finish
                  </div>
                  <div className="font-headline font-black text-2xl text-[#1a1c1e] dark:text-white p-1">
                    {formData.victoryConditions.xtremeDashPts} PTS
                  </div>
                </div>

                {/* Burst Finish Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    Burst Finish
                  </div>
                  <div className="font-headline font-black text-2xl text-[#AC191F] p-1">
                    {formData.victoryConditions.burstFinishPts} PTS
                  </div>
                </div>

                {/* Over Finish Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    Over Finish
                  </div>
                  <div className="font-headline font-black text-2xl text-[#22c55e] p-1">
                    {formData.victoryConditions.overFinishPts} PTS
                  </div>
                </div>

                {/* Spin Finish Pts */}
                <div className="bg-black/5 dark:bg-white/5 border border-[#bec7d3]/40 dark:border-white/10 rounded-xl p-3 text-center">
                  <div className="font-label-caps text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">
                    Spin Finish
                  </div>
                  <div className="font-headline font-black text-2xl text-[#04A8FC] p-1">
                    {formData.victoryConditions.spinFinishPts} PT
                  </div>
                </div>
              </div>
            </div>

            {/* Stadium Selection */}
            <div>
              <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-bold">
                ESTADIO / SEDE HABITUAL
              </label>
              <input
                type="text"
                value={formData.arenaStatus}
                onChange={(e) => {
                  const updated = { ...formData, arenaStatus: e.target.value };
                  setFormData(updated);
                }}
                onBlur={() => triggerSave(formData, 'Estadio guardado')}
                placeholder="Ej. Coliseo Cúcuta Center, Xtreme Stadium A..."
                className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 font-label-caps text-xs uppercase text-[#1a1c1e] dark:text-white focus:border-[#04A8FC] focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 3: SUPABASE DATABASE & STORAGE ARCHITECTURE */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group shadow-sm border border-[#bec7d3]/40 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
              <h3 className="font-headline font-bold text-lg text-[#04A8FC] flex items-center gap-2">
                <span className="material-symbols-outlined">database</span>
                <span>Base de Datos Supabase & Manejo de Imágenes</span>
              </h3>
              <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                Sincronización Activa
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">¿Cómo se guardan las imágenes?</strong><br />
                Las fotos de perfil de Bladers, logotipos de comunidad y piezas de Beyblade se almacenan directamente en las columnas de tipo <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200">TEXT</code> (<code className="text-[#04A8FC]">avatar_url</code>, <code className="text-[#04A8FC]">logo_url</code>, <code className="text-[#04A8FC]">image</code>).
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-slate-800 dark:text-slate-200">Al subir archivo local (.png / .jpg):</strong> El software lo convierte a formato binario optimizado (Data URI Base64) y lo guarda directamente en la fila de Supabase sin necesidad de configurar buckets complejos.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Al ingresar URL externa o Supabase Storage:</strong> Se almacena el enlace directo a la imagen.</li>
              </ul>

              <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-xs uppercase text-[#04A8FC] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    <span>Script SQL para Supabase (Tabla `community_config` + Tablas)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sql = `-- SCRIPT SUPABASE CONFIGURACIÓN DE COMUNIDAD
CREATE TABLE IF NOT EXISTS community_config (
  id TEXT PRIMARY KEY DEFAULT 'main_config',
  league_name TEXT NOT NULL,
  community_tagline TEXT,
  community_city TEXT,
  organizer_name TEXT,
  tournament_name TEXT,
  season TEXT,
  logo_url TEXT,
  type TEXT DEFAULT 'elimination',
  battle_scale TEXT DEFAULT '3v3',
  victory_conditions JSONB,
  max_participants INTEGER DEFAULT 32,
  arena_status TEXT DEFAULT 'Xtreme Stadium A',
  is_started BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_config DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE community_config TO anon, authenticated, service_role;`;
                      navigator.clipboard.writeText(sql);
                      soundManager.playClick();
                      triggerSave(formData, '¡SQL copiado al portapapeles!');
                    }}
                    className="px-2.5 py-1 bg-[#04A8FC] hover:bg-[#0096e6] text-white text-[11px] font-headline font-bold rounded-lg transition-all"
                  >
                    Copiar SQL
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Si creaste tu base de datos anteriormente, solo debes ejecutar el comando de la tabla <code className="text-[#04A8FC]">community_config</code> en tu SQL Editor de Supabase para habilitar la persistencia de configuración multi-comunidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats & Initialize Protocol (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Readiness Check Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-[#bec7d3]/40 dark:border-white/10 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-[#1a1c1e] dark:text-white mb-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-2">
              Estado de la Comunidad
            </h3>
            <ul className="space-y-4 font-label-caps text-xs uppercase">
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Comunidad Activa</span>
                <span className="font-headline font-bold text-xs text-[#04A8FC] text-right truncate max-w-[150px]">
                  {formData.leagueName}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Sede / Ciudad</span>
                <span className="font-headline font-bold text-xs text-slate-800 dark:text-slate-200">
                  {formData.communityCity || 'No especificada'}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Bladers Registrados</span>
                <span className="font-headline font-bold text-base text-[#04A8FC]">
                  {registeredBladersCount} / {formData.maxParticipants}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Formato Actual</span>
                <span className="font-headline font-bold text-xs text-[#22c55e]">
                  {formData.type === 'elimination'
                    ? 'Bracket Eliminación'
                    : formData.type === 'series'
                    ? 'Formato Serie (Anime)'
                    : 'Liga Puntos'}
                </span>
              </li>
            </ul>
          </div>

          {/* Action Area: Initialize Protocol */}
          <div className="glass-panel p-6 rounded-2xl border border-[#04A8FC]/30 flex flex-col items-center text-center relative overflow-hidden shadow-md bg-gradient-to-b from-white/90 to-[#04A8FC]/5 dark:from-[#131318]/90 dark:to-[#04A8FC]/10">
            <div className="absolute inset-0 bg-gradient-to-t from-[#04A8FC]/10 to-transparent pointer-events-none"></div>

            <span className="material-symbols-outlined text-5xl text-[#04A8FC] mb-3 animate-pulse">
              rocket_launch
            </span>

            <h4 className="font-headline font-black text-xl text-[#1a1c1e] dark:text-white mb-2 uppercase">
              Iniciar Torneo
            </h4>

            <p className="font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-6">
              Confirmar configuración oficial y generar bracket de partidas para {formData.leagueName}.
            </p>

            <button
              id="btn-start-tournament-protocol"
              onClick={handleStart}
              className="w-full bg-[#04A8FC] hover:bg-[#0096e6] text-white font-headline font-black text-base py-4 px-6 rounded-xl uppercase tracking-wider border-b-4 border-[#004b74] hover:shadow-lg hover:shadow-[#04A8FC]/30 active:translate-y-1 active:border-b-0 transition-all duration-150 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>Comenzar Torneo</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </span>
              <div className="absolute inset-0 -translate-x-full bg-white/30 group-hover:animate-shimmer skew-x-12"></div>
            </button>

            {isSaved && (
              <p className="mt-3 text-xs font-label-caps text-[#22c55e] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check</span>
                <span>¡Protocolo inicializado con éxito!</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

