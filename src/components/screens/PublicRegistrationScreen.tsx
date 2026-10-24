import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Blader, BladerCombo, RegisteredCombo, TournamentConfig } from '../../types';
import { soundManager } from '../../utils/audio';
import { compressImage } from '../../utils/imageUtils';
import { BladerAvatar } from '../BladerAvatar';
import { CommunityLogo } from '../CommunityLogo';
import { extractPartsFromComboString } from '../../utils/comboUtils';

interface PublicRegistrationScreenProps {
  config: TournamentConfig;
  bladers: Blader[];
  onAddBlader: (blader: Blader) => void;
  onAddCombo?: (combo: RegisteredCombo) => void;
  onReturnToAdmin?: () => void;
}

const PRESET_AVATARS = [
  { name: 'Jaxon Cross (Ekusu)', url: '/avatars/jackson.png' },
  { name: 'Valt Aoi', url: '/avatars/volt.png' },
  { name: 'Gingka Hagane', url: '/avatars/gingka.png' },
  { name: 'Tyson Granger', url: '/avatars/tyson.png' }
];

const POPULAR_BLADES = [
  'Dran Sword',
  'Phoenix Wing',
  'Wizard Rod',
  'Hells Scythe',
  'Cobalt Dragoon',
  'Dran Dagger',
  'Unicorn Sting',
  'Shark Edge',
  'Viper Tail',
  'Knight Shield',
  'Tyranno Beat',
  'Aero Pegasus'
];

const POPULAR_RATCHETS = ['3-60', '5-60', '9-60', '4-60', '1-60', '3-80', '5-80'];
const POPULAR_BITS = ['Flat (F)', 'Ball (B)', 'Point (P)', 'Taper (T)', 'Gear Flat (GF)', 'Orb (O)', 'Rush (R)', 'Hexa (H)'];

export const PublicRegistrationScreen: React.FC<PublicRegistrationScreenProps> = ({
  config,
  bladers,
  onAddBlader,
  onAddCombo,
  onReturnToAdmin
}) => {
  // Form fields
  const [name, setName] = useState<string>('');
  const [alias, setAlias] = useState<string>('');
  const [team, setTeam] = useState<string>('Independiente');
  const [customTeam, setCustomTeam] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>(PRESET_AVATARS[0].url);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Deck configuration: 1 combo by default (or 3 for 3v3)
  const defaultSlots: 1 | 3 = config.battleScale === '3v3' ? 3 : 1;
  const [comboCount, setComboCount] = useState<1 | 3>(defaultSlots);
  const [combo1Blade, setCombo1Blade] = useState<string>('Dran Sword');
  const [combo1Ratchet, setCombo1Ratchet] = useState<string>('3-60');
  const [combo1Bit, setCombo1Bit] = useState<string>('Flat');
  const [combo1Custom, setCombo1Custom] = useState<string>('');
  const [useCustomCombo1, setUseCustomCombo1] = useState<boolean>(false);

  const [combo2, setCombo2] = useState<string>('Hells Scythe 4-60B');
  const [combo3, setCombo3] = useState<string>('Wizard Rod 5-70DB');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registeredSuccessBlader, setRegisteredSuccessBlader] = useState<Blader | null>(null);
  const [showRosterModal, setShowRosterModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasParticipantLimit = Boolean(config.maxParticipants && config.maxParticipants > 0 && config.maxParticipants < 999);
  const isRegistrationOpen = config.isRegistrationOpen !== false && !config.isStarted;
  const isFull = hasParticipantLimit ? bladers.length >= config.maxParticipants : false;
  const availableSlots = hasParticipantLimit ? Math.max(0, config.maxParticipants - bladers.length) : null;

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 400, 400, 0.85);
      setAvatarUrl(compressed);
      soundManager.playClick();
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Error al procesar la imagen.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Submit Registration
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Por favor ingresa tu nombre o nickname de Blader.');
      return;
    }

    if (!isRegistrationOpen) {
      setErrorMessage('Las inscripciones para este torneo se encuentran temporalmente cerradas.');
      return;
    }

    if (isFull && hasParticipantLimit) {
      setErrorMessage(`El cupo máximo de ${config.maxParticipants} participantes ya ha sido alcanzado.`);
      return;
    }

    // Check duplicate name
    const alreadyRegistered = bladers.some(
      (b) => b.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (alreadyRegistered) {
      setErrorMessage(`El Blader "${cleanName}" ya se encuentra inscrito en este torneo.`);
      return;
    }

    setIsSubmitting(true);
    soundManager.playClick();

    // Build combos list
    const finalCombos: BladerCombo[] = [];

    // Combo 1
    const finalCombo1Str = useCustomCombo1 && combo1Custom.trim()
      ? combo1Custom.trim()
      : `${combo1Blade} ${combo1Ratchet}${combo1Bit.split(' ')[0]}`.trim();

    const parts1 = extractPartsFromComboString(finalCombo1Str);
    finalCombos.push({
      slot: 1,
      blade: parts1.blade || combo1Blade,
      ratchet: parts1.ratchet || combo1Ratchet,
      bit: parts1.bit || combo1Bit,
      name: finalCombo1Str
    });

    // Combo 2 (if 3v3)
    if (comboCount === 3 && combo2.trim()) {
      const parts2 = extractPartsFromComboString(combo2.trim());
      finalCombos.push({
        slot: 2,
        blade: parts2.blade || 'Blade 2',
        ratchet: parts2.ratchet || 'Ratchet 2',
        bit: parts2.bit || 'Bit 2',
        name: combo2.trim()
      });
    }

    // Combo 3 (if 3v3)
    if (comboCount === 3 && combo3.trim()) {
      const parts3 = extractPartsFromComboString(combo3.trim());
      finalCombos.push({
        slot: 3,
        blade: parts3.blade || 'Blade 3',
        ratchet: parts3.ratchet || 'Ratchet 3',
        bit: parts3.bit || 'Bit 3',
        name: combo3.trim()
      });
    }

    const finalTeam = team === 'Otro' ? (customTeam.trim() || 'Independiente') : team;

    const newBlader: Blader = {
      id: `blader-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      alias: alias.trim() || cleanName,
      team: finalTeam,
      avatarUrl: avatarUrl || PRESET_AVATARS[0].url,
      verified: true,
      registeredAt: new Date().toISOString(),
      combos: finalCombos,
      badges: ['badge-official-member'],
      stats: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsScored: 0,
        xtremeFinishes: 0,
        burstFinishes: 0,
        overFinishes: 0,
        spinFinishes: 0
      }
    };

    // Save blader
    onAddBlader(newBlader);

    // Save combo to combo catalog
    if (onAddCombo && finalCombos.length > 0) {
      onAddCombo({
        id: `combo-${Date.now()}-1`,
        bladerId: newBlader.id,
        bladerName: newBlader.name,
        blade: finalCombos[0].blade,
        ratchet: finalCombos[0].ratchet,
        bit: finalCombos[0].bit,
        type: 'Attack',
        createdAt: new Date().toISOString()
      });
    }

    setIsSubmitting(false);
    setRegisteredSuccessBlader(newBlader);
    soundManager.playVictory();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleResetForAnother = () => {
    soundManager.playClick();
    setName('');
    setAlias('');
    setTeam('Independiente');
    setCustomTeam('');
    setRegisteredSuccessBlader(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-[#04A8FC] selection:text-white pb-12">
      {/* Top Bar with Admin Return option */}
      <header className="px-4 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <CommunityLogo logoUrl={config.logoUrl} size="sm" />
          <div className="leading-tight">
            <h2 className="font-headline font-black text-xs sm:text-sm uppercase tracking-wider text-white">
              {config.leagueName}
            </h2>
            <span className="text-[10px] font-label-caps uppercase text-[#04A8FC] font-black tracking-widest block">
              Portal Oficial de Auto-Inscripción
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowRosterModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-headline font-bold uppercase flex items-center gap-1.5 transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            <span className="hidden sm:inline">Inscritos ({bladers.length})</span>
            <span className="sm:hidden font-mono">({bladers.length})</span>
          </button>

          {onReturnToAdmin && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onReturnToAdmin();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-headline font-bold flex items-center gap-1"
              title="Volver al panel administrativo"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Tournament Hero Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#181a24] to-[#12131a] border-2 border-[#04A8FC]/40 shadow-2xl relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full bg-[#04A8FC]/20 text-[#04A8FC] font-black border border-[#04A8FC]/30">
              {config.season || 'Temporada Oficial'} • {config.communityCity || 'Cúcuta'}
            </span>

            <span
              className={`text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full font-black flex items-center gap-1 ${
                isRegistrationOpen
                  ? isFull
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRegistrationOpen && !isFull ? 'bg-emerald-400 animate-pulse' : 'bg-current'
                }`}
              ></span>
              <span>
                {isRegistrationOpen
                  ? isFull
                    ? 'Cupos Agotados'
                    : 'Inscripciones Abiertas'
                  : 'Inscripciones Cerradas'}
              </span>
            </span>
          </div>

          <div>
            <h1 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-none">
              {config.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Organizado por <span className="text-white font-bold">{config.organizerName || 'Comunidad Oficial'}</span> en{' '}
              <span className="text-amber-400 font-bold">{config.arenaStatus}</span>
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-label-caps uppercase text-slate-400 block">Formato</span>
              <span className="font-headline font-black text-xs sm:text-sm uppercase text-[#04A8FC] block truncate">
                {config.type === 'league' ? 'Liga' : config.type === 'series' ? 'Serie 1v1' : 'Eliminatoria'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-label-caps uppercase text-slate-400 block">Duelos</span>
              <span className="font-headline font-black text-xs sm:text-sm uppercase text-white block">
                {config.battleScale || '1v1'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] font-label-caps uppercase text-slate-400 block">Cupos</span>
              <span className={`font-headline font-black text-xs sm:text-sm uppercase block ${hasParticipantLimit && availableSlots !== null && availableSlots <= 2 ? 'text-amber-400 font-black' : 'text-emerald-400'}`}>
                {hasParticipantLimit ? `${availableSlots} de ${config.maxParticipants}` : 'Abierto (Sin Límite)'}
              </span>
            </div>
          </div>
        </div>

        {/* VIEW A: SUCCESS REGISTRATION BATTLE PASS */}
        {registeredSuccessBlader ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#151622] border-2 border-emerald-500/50 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black mx-auto shadow-lg shadow-emerald-500/30">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>

            <div>
              <span className="text-[10px] font-label-caps font-black uppercase tracking-widest text-emerald-400 block mb-1">
                ¡INSCRIPCIÓN EXITOSA & CONFIRMADA!
              </span>
              <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase text-white tracking-tight">
                ¡Bienvenido a la Arena, {registeredSuccessBlader.name}!
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Tu registro ha sido sincronizado en tiempo real con la mesa de jueces de la Comunidad.
              </p>
            </div>

            {/* Official Blader Pass Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#10121a] border-2 border-[#04A8FC]/40 text-left space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#04A8FC]/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[9px] font-label-caps uppercase tracking-widest font-black text-[#04A8FC]">
                  PASE OFICIAL DE BLADER • BEYBLADE X
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <BladerAvatar blader={registeredSuccessBlader} size="lg" cornerColor="gold" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-white truncate">
                    {registeredSuccessBlader.name}
                  </h3>
                  <p className="text-xs font-label-caps uppercase text-amber-400 font-bold">
                    {registeredSuccessBlader.alias && registeredSuccessBlader.alias !== registeredSuccessBlader.name
                      ? `"${registeredSuccessBlader.alias}" • `
                      : ''}
                    {registeredSuccessBlader.team || 'Independiente'}
                  </p>
                </div>
              </div>

              {/* Combo Details */}
              {registeredSuccessBlader.combos && registeredSuccessBlader.combos.length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <span className="text-[9px] font-label-caps uppercase font-bold text-slate-400 block">
                    Deck / Beyblade Registrado:
                  </span>
                  {registeredSuccessBlader.combos.map((c) => (
                    <div key={c.slot} className="flex items-center justify-between text-xs">
                      <span className="font-headline font-bold text-white uppercase truncate">
                        Slot {c.slot}: {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#04A8FC] font-black uppercase">
                        OFICIAL
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRosterModal(true)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-white/20 hover:border-[#04A8FC] text-white font-headline font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-base">groups</span>
                <span>Ver Lista de Inscritos ({bladers.length})</span>
              </button>

              <button
                type="button"
                onClick={handleResetForAnother}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#04A8FC] hover:bg-[#008fe0] text-white font-headline font-black text-xs uppercase shadow-lg shadow-[#04A8FC]/30 flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Inscribir a Otro Blader</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW B: REGISTRATION FORM */
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-7 rounded-3xl bg-[#14151e] border border-white/10 shadow-xl space-y-6"
          >
            {/* Step 1: Blader Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <span className="w-6 h-6 rounded-lg bg-[#04A8FC] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="font-headline font-black text-sm uppercase text-white tracking-wide">
                  Identidad del Blader
                </h3>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Nombre Completo o Nickname de Batalla <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos 'Kamen' Ruiz"
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-black/40 text-white placeholder-slate-500 font-headline text-sm focus:outline-none focus:border-[#04A8FC] focus:ring-1 focus:ring-[#04A8FC] transition-all"
                />
              </div>

              {/* Alias & Team in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Apodo / Alias (Opcional)
                  </label>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ej: Phantom X"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white placeholder-slate-500 font-headline text-xs focus:outline-none focus:border-[#04A8FC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Equipo / Team
                  </label>
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white font-headline text-xs focus:outline-none focus:border-[#04A8FC]"
                  >
                    <option value="Independiente">Independiente (Sin Equipo)</option>
                    <option value="Comunidad Cúcuta">Comunidad Cúcuta</option>
                    <option value="Team Xtreme">Team Xtreme</option>
                    <option value="Team Valkyrie">Team Valkyrie</option>
                    <option value="Otro">Otro Equipo...</option>
                  </select>
                </div>
              </div>

              {team === 'Otro' && (
                <div>
                  <input
                    type="text"
                    value={customTeam}
                    onChange={(e) => setCustomTeam(e.target.value)}
                    placeholder="Escribe el nombre de tu equipo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white placeholder-slate-500 font-headline text-xs focus:outline-none focus:border-[#04A8FC]"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Avatar Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <span className="w-6 h-6 rounded-lg bg-[#04A8FC] text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="font-headline font-black text-sm uppercase text-white tracking-wide">
                  Avatar o Foto de Perfil
                </h3>
              </div>

              {/* Avatar Preview & Upload */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/30 border border-white/5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#04A8FC] shadow-md flex-shrink-0 bg-black flex items-center justify-center">
                  <img
                    src={avatarUrl}
                    alt="Avatar seleccionado"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs text-slate-300 font-headline font-bold uppercase">
                    Selecciona un Avatar o Sube tu Foto
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-headline font-bold uppercase cursor-pointer transition-all active:scale-[0.97]">
                    <span className="material-symbols-outlined text-sm">upload</span>
                    <span>{isCompressing ? 'Procesando...' : 'Subir desde Celular'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isCompressing}
                    />
                  </label>
                </div>
              </div>

              {/* Preset Avatars */}
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.name}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setAvatarUrl(av.url);
                    }}
                    className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                      avatarUrl === av.url
                        ? 'border-[#04A8FC] bg-[#04A8FC]/20 scale-105 shadow-md shadow-[#04A8FC]/30'
                        : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-10 h-10 rounded-xl object-cover bg-black"
                    />
                    <span className="text-[9px] font-label-caps uppercase truncate w-full text-center text-slate-300">
                      {av.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Deck / Beyblade Combos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#04A8FC] text-white text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-headline font-black text-sm uppercase text-white tracking-wide">
                    Deck / Beyblade X
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setComboCount(1);
                    }}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-headline font-bold uppercase transition-all ${
                      comboCount === 1 ? 'bg-[#04A8FC] text-white' : 'text-slate-400'
                    }`}
                  >
                    1 Combo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setComboCount(3);
                    }}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-headline font-bold uppercase transition-all ${
                      comboCount === 3 ? 'bg-[#04A8FC] text-white' : 'text-slate-400'
                    }`}
                  >
                    Deck 3on3
                  </button>
                </div>
              </div>

              {/* Combo 1 Selector */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-headline font-bold uppercase text-[#04A8FC]">
                    Beyblade Principal (Slot 1)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setUseCustomCombo1(!useCustomCombo1);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline font-label-caps uppercase"
                  >
                    {useCustomCombo1 ? 'Usar Selector Rápido' : 'Escribir combo libre'}
                  </button>
                </div>

                {useCustomCombo1 ? (
                  <div>
                    <input
                      type="text"
                      value={combo1Custom}
                      onChange={(e) => setCombo1Custom(e.target.value)}
                      placeholder="Ej: Phoenix Wing 9-60Point"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white font-headline text-xs focus:outline-none focus:border-[#04A8FC]"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Blade */}
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase text-slate-400 mb-1">
                        Blade
                      </label>
                      <select
                        value={combo1Blade}
                        onChange={(e) => setCombo1Blade(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-white/15 bg-black/60 text-white text-xs font-headline focus:outline-none"
                      >
                        {POPULAR_BLADES.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ratchet */}
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase text-slate-400 mb-1">
                        Ratchet
                      </label>
                      <select
                        value={combo1Ratchet}
                        onChange={(e) => setCombo1Ratchet(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-white/15 bg-black/60 text-white text-xs font-headline focus:outline-none"
                      >
                        {POPULAR_RATCHETS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bit */}
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase text-slate-400 mb-1">
                        Bit
                      </label>
                      <select
                        value={combo1Bit}
                        onChange={(e) => setCombo1Bit(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-white/15 bg-black/60 text-white text-xs font-headline focus:outline-none"
                      >
                        {POPULAR_BITS.map((bt) => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Combo 2 & 3 if 3v3 selected */}
              {comboCount === 3 && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-headline font-bold uppercase text-slate-300 mb-1">
                      Segundo Beyblade (Slot 2)
                    </label>
                    <input
                      type="text"
                      value={combo2}
                      onChange={(e) => setCombo2(e.target.value)}
                      placeholder="Ej: Hells Scythe 4-60B"
                      className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-black/40 text-white font-headline text-xs focus:outline-none focus:border-[#04A8FC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-headline font-bold uppercase text-slate-300 mb-1">
                      Tercer Beyblade (Slot 3)
                    </label>
                    <input
                      type="text"
                      value={combo3}
                      onChange={(e) => setCombo3(e.target.value)}
                      placeholder="Ej: Wizard Rod 5-70DB"
                      className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-black/40 text-white font-headline text-xs focus:outline-none focus:border-[#04A8FC]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-headline font-bold uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isRegistrationOpen || isFull}
              className="w-full py-4 px-6 rounded-2xl bg-[#04A8FC] hover:bg-[#008fe0] disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline font-black text-sm uppercase tracking-wider shadow-xl shadow-[#04A8FC]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-xl">sports_martial_arts</span>
              <span>
                {isSubmitting
                  ? 'Guardando Inscripción...'
                  : isFull
                  ? 'Cupos Agotados'
                  : !isRegistrationOpen
                  ? 'Inscripciones Cerradas'
                  : '¡Inscribirme al Torneo! 🚀'}
              </span>
            </button>
          </form>
        )}
      </main>

      {/* Roster / Registered Players Modal */}
      {showRosterModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowRosterModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14151e] border border-white/10 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#04A8FC]">groups</span>
                <h3 className="font-headline font-black text-lg uppercase text-white">
                  Bladers Inscritos ({bladers.length}{hasParticipantLimit ? ` / ${config.maxParticipants}` : ''})
                </h3>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {bladers.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 text-center">
                  Aún no hay Bladers inscritos. ¡Sé el primero en registrarte!
                </p>
              ) : (
                bladers.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[10px] text-slate-500 font-bold w-4">
                        #{idx + 1}
                      </span>
                      <BladerAvatar blader={b} size="sm" cornerColor="blue" />
                      <div className="min-w-0">
                        <p className="font-headline font-bold uppercase text-white truncate">
                          {b.name}
                        </p>
                        <p className="text-[10px] font-label-caps uppercase text-slate-400 truncate">
                          {b.team || 'Independiente'} {b.combos?.[0]?.name ? `• ${b.combos[0].name}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-label-caps uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      Confirmado ✓
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowRosterModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase"
            >
              Cerrar Lista
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-slate-500 text-xs py-4">
        <p className="font-label-caps uppercase font-bold">
          {config.leagueName} • Desarrollado para la Comunidad Beyblade X Cúcuta
        </p>
      </footer>
    </div>
  );
};
