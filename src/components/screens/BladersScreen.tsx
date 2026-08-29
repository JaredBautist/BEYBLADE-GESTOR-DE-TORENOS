import React, { useState } from 'react';
import { Blader, BladerCombo } from '../../types';
import { soundManager } from '../../utils/audio';
import { compressImage } from '../../utils/imageUtils';
import { BladerAvatar } from '../BladerAvatar';
import { OFFICIAL_BADGES } from '../../data/badges';
import { syncBladerToSupabase, syncAllBladersToSupabase } from '../../lib/supabase';
import { extractPartsFromComboString } from '../../utils/comboUtils';

interface BladersScreenProps {
  bladers: Blader[];
  onAddBlader: (blader: Blader) => void;
  onUpdateBlader?: (blader: Blader) => void;
  onToggleVerified: (id: string) => void;
  onDeleteBlader: (id: string) => void;
  onToggleBadge?: (bladerId: string, badgeId: string) => void;
  onLoadOfficialRoster?: (roster: Blader[]) => void;
}

// Avatares de protagonistas de Beyblade precargados para selección rápida
const PRESET_AVATARS = [
  { name: 'Jaxon Cross (Ekusu) - Beyblade X', url: '/avatars/jackson.png' },
  { name: 'Valt Aoi - Beyblade Burst', url: '/avatars/volt.png' },
  { name: 'Gingka Hagane - Metal Fight', url: '/avatars/gingka.png' },
  { name: 'Tyson Granger (Takao) - G-Revolution', url: '/avatars/tyson.png' }
];

export const BladersScreen: React.FC<BladersScreenProps> = ({
  bladers,
  onAddBlader,
  onUpdateBlader,
  onToggleVerified,
  onDeleteBlader,
  onToggleBadge,
  onLoadOfficialRoster
}) => {
  const [name, setName] = useState<string>('');
  const [alias, setAlias] = useState<string>('');
  const [team, setTeam] = useState<string>('');
  const [customAvatar, setCustomAvatar] = useState<string>('');
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [selectedBlader, setSelectedBlader] = useState<Blader | null>(bladers[0] || null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // Selected initial badges
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>(['badge-official-member']);

  // Dynamic Deck Mode: 1 (1v1 / single combo), 2 (2 combos), or 3 (3on3 standard)
  const [comboSlotsCount, setComboSlotsCount] = useState<1 | 2 | 3>(1);

  // Combos state for new blader (independent slots)
  const [combo1, setCombo1] = useState<string>('Dransword 3-60F');
  const [combo1Image, setCombo1Image] = useState<string>('');
  const [combo2, setCombo2] = useState<string>('');
  const [combo2Image, setCombo2Image] = useState<string>('');
  const [combo3, setCombo3] = useState<string>('');
  const [combo3Image, setCombo3Image] = useState<string>('');

  // Edit Blader Modal State
  const [editingBlader, setEditingBlader] = useState<Blader | null>(null);
  const [editSlotsCount, setEditSlotsCount] = useState<1 | 2 | 3>(1);
  const [editName, setEditName] = useState<string>('');
  const [editAlias, setEditAlias] = useState<string>('');
  const [editTeam, setEditTeam] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('');
  const [editCombo1, setEditCombo1] = useState<string>('');
  const [editCombo1Image, setEditCombo1Image] = useState<string>('');
  const [editCombo2, setEditCombo2] = useState<string>('');
  const [editCombo2Image, setEditCombo2Image] = useState<string>('');
  const [editCombo3, setEditCombo3] = useState<string>('');
  const [editCombo3Image, setEditCombo3Image] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Lightbox modal for zooming combo / avatar photos
  const [previewImageModal, setPreviewImageModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const showToast = (message: string, isError = false) => {
    setSyncFeedback({ message, isError });
    setTimeout(() => {
      setSyncFeedback(null);
    }, 4000);
  };

  const handleSyncAll = async () => {
    if (bladers.length === 0) {
      showToast('No hay bladers registrados para sincronizar.', true);
      return;
    }
    setIsSyncing(true);
    soundManager.playClick();
    const res = await syncAllBladersToSupabase(bladers);
    setIsSyncing(false);
    if (res.success) {
      soundManager.playVictory();
      showToast(`✅ ${res.count} Blader(s) sincronizados con la Base de Datos`);
    } else {
      soundManager.playScore();
      showToast(`⚠️ Error al sincronizar: ${res.error}`, true);
    }
  };

  const handleClear = () => {
    setName('');
    setAlias('');
    setTeam('');
    setCustomAvatar('');
    setAvatarUrlInput('');
    setSelectedBadgeIds(['badge-official-member']);
    setComboSlotsCount(1);
    setCombo1('Dransword 3-60F');
    setCombo1Image('');
    setCombo2('');
    setCombo2Image('');
    setCombo3('');
    setCombo3Image('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // Compress and optimize image to keep database fast and light
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      if (isEditMode) {
        setEditAvatar(compressedDataUrl);
      } else {
        setCustomAvatar(compressedDataUrl);
      }
    } catch (err) {
      console.error('Error processing image:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleComboFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 1 | 2 | 3,
    isEditMode = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      if (isEditMode) {
        if (slot === 1) setEditCombo1Image(compressedDataUrl);
        if (slot === 2) setEditCombo2Image(compressedDataUrl);
        if (slot === 3) setEditCombo3Image(compressedDataUrl);
      } else {
        if (slot === 1) setCombo1Image(compressedDataUrl);
        if (slot === 2) setCombo2Image(compressedDataUrl);
        if (slot === 3) setCombo3Image(compressedDataUrl);
      }
    } catch (err) {
      console.error('Error processing combo photo:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const toggleInitialBadge = (badgeId: string) => {
    soundManager.playClick();
    setSelectedBadgeIds((prev) =>
      prev.includes(badgeId) ? prev.filter((id) => id !== badgeId) : [...prev, badgeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundManager.playScore();

    // Collect ONLY the combos that were configured / filled
    const rawCombos = [
      { text: combo1, slot: 1, image: combo1Image },
      { text: comboSlotsCount >= 2 ? combo2 : '', slot: 2, image: comboSlotsCount >= 2 ? combo2Image : '' },
      { text: comboSlotsCount >= 3 ? combo3 : '', slot: 3, image: comboSlotsCount >= 3 ? combo3Image : '' }
    ];

    const combos: BladerCombo[] = rawCombos
      .filter((c) => c.text.trim() !== '')
      .map((c, index) => {
        const trimmed = c.text.trim();
        const { blade, ratchet, bit } = extractPartsFromComboString(trimmed);
        return {
          slot: (index + 1) as 1 | 2 | 3,
          blade: blade || 'Dransword',
          ratchet: ratchet || '',
          bit: bit || '',
          name: trimmed,
          imageUrl: c.image || undefined
        };
      });

    const newBlader: Blader = {
      id: `blader-${Date.now()}`,
      name: name.trim(),
      alias: alias.trim() || name.trim(),
      team: team.trim() || 'Solo',
      avatarUrl: customAvatar || avatarUrlInput.trim() || '',
      verified: true,
      registeredAt: new Date().toISOString().split('T')[0],
      combos,
      badges: selectedBadgeIds,
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

    onAddBlader(newBlader);
    setSelectedBlader(newBlader);
    handleClear();
  };

  // Open edit modal for selected blader
  const handleOpenEdit = (blader: Blader) => {
    setEditingBlader(blader);
    setEditName(blader.name);
    setEditAlias(blader.alias || blader.name);
    setEditTeam(blader.team || 'Solo');
    setEditAvatar(blader.avatarUrl || '');

    const existingCount = blader.combos?.length || 1;
    const initialSlots = (Math.max(1, Math.min(3, existingCount))) as 1 | 2 | 3;
    setEditSlotsCount(initialSlots);

    setEditCombo1(
      blader.combos?.[0]?.name ||
      (blader.combos?.[0] ? `${blader.combos[0].blade} ${blader.combos[0].ratchet}${blader.combos[0].bit}`.trim() : '')
    );
    setEditCombo1Image(blader.combos?.[0]?.imageUrl || '');

    setEditCombo2(
      blader.combos?.[1]?.name ||
      (blader.combos?.[1] ? `${blader.combos[1].blade} ${blader.combos[1].ratchet}${blader.combos[1].bit}`.trim() : '')
    );
    setEditCombo2Image(blader.combos?.[1]?.imageUrl || '');

    setEditCombo3(
      blader.combos?.[2]?.name ||
      (blader.combos?.[2] ? `${blader.combos[2].blade} ${blader.combos[2].ratchet}${blader.combos[2].bit}`.trim() : '')
    );
    setEditCombo3Image(blader.combos?.[2]?.imageUrl || '');
  };

  // Save changes to existing blader and sync to database
  const handleSaveEdit = () => {
    if (!editingBlader || !editName.trim()) return;

    // Collect only the active & non-empty combos
    const rawEditCombos = [
      { text: editCombo1, slot: 1, image: editCombo1Image },
      { text: editSlotsCount >= 2 ? editCombo2 : '', slot: 2, image: editSlotsCount >= 2 ? editCombo2Image : '' },
      { text: editSlotsCount >= 3 ? editCombo3 : '', slot: 3, image: editSlotsCount >= 3 ? editCombo3Image : '' }
    ];

    const updatedCombos: BladerCombo[] = rawEditCombos
      .filter((c) => c.text.trim() !== '')
      .map((c, index) => {
        const trimmed = c.text.trim();
        const { blade, ratchet, bit } = extractPartsFromComboString(trimmed);
        return {
          slot: (index + 1) as 1 | 2 | 3,
          blade: blade || 'Dransword',
          ratchet: ratchet || '',
          bit: bit || '',
          name: trimmed,
          imageUrl: c.image || undefined
        };
      });

    const updated: Blader = {
      ...editingBlader,
      name: editName.trim(),
      alias: editAlias.trim() || editName.trim(),
      team: editTeam.trim() || 'Solo',
      avatarUrl: editAvatar.trim(),
      combos: updatedCombos
    };

    if (onUpdateBlader) {
      onUpdateBlader(updated);
    }
    setSelectedBlader(updated);
    setEditingBlader(null);
    soundManager.playScore();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#bec7d3]/30 dark:border-white/10 pb-4">
        <div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight mb-1">
            REGISTRO DE BLADERS & PADRÓN
          </h1>
          <p className="font-body-text text-sm md:text-base text-gray-600 dark:text-gray-400">
            Padrón oficial de participantes, fotos de perfil, insignias de honor y Decks de combate.
          </p>
        </div>

        {/* Live Auto-sync Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-label-caps uppercase font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sincronización Automática Activa</span>
        </div>
      </div>

      {/* Main Grid: Form (Col 7) + Active Roster & Badges (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden bg-white dark:bg-[#15151c]">
            <h3 className="font-headline font-black text-xl text-[#04A8FC] uppercase mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">person_add</span>
              <span>Inscribir Nuevo Blader</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Team Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase font-bold">
                    Nombre Oficial del Blader *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Dylan Bautista, Kamen X..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-[#1a1c1e] dark:text-white font-headline text-sm focus:outline-none focus:ring-2 focus:ring-[#04A8FC] shadow-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase font-bold">
                    Equipo / Team (Opcional)
                  </label>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    placeholder="Ej. Team Cúcuta X, Persona, Solo..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-[#1a1c1e] dark:text-white font-headline text-sm focus:outline-none focus:ring-2 focus:ring-[#04A8FC] shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Avatar / Photo Upload & Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <label className="block font-label-caps text-xs text-gray-600 dark:text-gray-300 uppercase font-bold flex items-center justify-between">
                  <span>Foto del Blader (Se guarda en Base de Datos)</span>
                  {customAvatar && (
                    <button
                      type="button"
                      onClick={() => setCustomAvatar('')}
                      className="text-red-500 hover:text-red-600 text-[11px] font-bold uppercase"
                    >
                      Quitar Foto
                    </button>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-white/10 border-2 border-[#04A8FC]/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                    {customAvatar || avatarUrlInput ? (
                      <img
                        src={customAvatar || avatarUrlInput}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-3xl">account_circle</span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        id="blader-avatar-upload"
                        onChange={(e) => handleFileUpload(e, false)}
                        accept="image/*"
                        className="hidden"
                      />
                      <label
                        htmlFor="blader-avatar-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#04A8FC] hover:bg-[#008fe0] text-white rounded-xl font-headline font-bold text-xs uppercase cursor-pointer transition-all shadow-sm active:scale-95"
                      >
                        <span className="material-symbols-outlined text-base">photo_camera</span>
                        <span>{isCompressing ? 'Procesando...' : 'Subir Foto / Archivo'}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-xl font-headline font-bold text-xs uppercase transition-all"
                      >
                        <span className="material-symbols-outlined text-sm align-middle mr-1">link</span>
                        {showUrlInput ? 'Ocultar URL' : 'Pegar Link / URL'}
                      </button>
                    </div>

                    {showUrlInput && (
                      <input
                        type="url"
                        value={avatarUrlInput}
                        onChange={(e) => {
                          setAvatarUrlInput(e.target.value);
                          if (e.target.value) setCustomAvatar('');
                        }}
                        placeholder="https://ejemplo.com/foto-blader.jpg"
                        className="w-full bg-white dark:bg-[#1a1a24] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#04A8FC]"
                      />
                    )}
                  </div>
                </div>

                {/* Preset Avatars Bar */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                  <span className="text-[11px] font-label-caps uppercase text-slate-500 dark:text-slate-400 font-bold block mb-1.5">
                    O elige un Avatar Rápido:
                  </span>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCustomAvatar(preset.url);
                          setAvatarUrlInput('');
                          soundManager.playClick();
                        }}
                        className={`w-11 h-11 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 ${
                          customAvatar === preset.url ? 'border-[#04A8FC] ring-2 ring-[#04A8FC] scale-105 shadow-md shadow-[#04A8FC]/30' : 'border-slate-300 dark:border-white/20 opacity-80 hover:opacity-100 hover:border-slate-400'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insignias Asignables */}
              <div>
                <label className="block font-label-caps text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase font-bold">
                  Insignias Iniciales de Honor
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {OFFICIAL_BADGES.slice(0, 6).map((badge) => {
                    const isSelected = selectedBadgeIds.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => toggleInitialBadge(badge.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? `${badge.bgColor} ${badge.borderColor} ring-1 ring-[#04A8FC]`
                            : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg ${badge.color}`}>
                          {badge.icon}
                        </span>
                        <div className="min-w-0">
                          <span className="font-headline font-bold text-[11px] uppercase block text-slate-900 dark:text-white truncate">
                            {badge.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deck / Combos Configuration */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-label-caps text-xs text-gray-700 dark:text-gray-300 uppercase font-bold">
                      Deck de Combate (Combos del Blader)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      No es obligatorio registrar 3 combos. Selecciona 1, 2 o 3 según el formato del torneo.
                    </p>
                  </div>

                  {/* Mode Selector Buttons */}
                  <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setComboSlotsCount(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-headline font-bold uppercase transition-all ${
                        comboSlotsCount === 1
                          ? 'bg-[#04A8FC] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      1 Combo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setComboSlotsCount(2);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-headline font-bold uppercase transition-all ${
                        comboSlotsCount === 2
                          ? 'bg-[#04A8FC] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      2 Combos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setComboSlotsCount(3);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-headline font-bold uppercase transition-all ${
                        comboSlotsCount === 3
                          ? 'bg-[#04A8FC] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      3 Combos (3on3)
                    </button>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${comboSlotsCount === 1 ? 'sm:grid-cols-1' : comboSlotsCount === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3.5`}>
                  {/* Slot 1 */}
                  <div className="p-3 bg-slate-50 dark:bg-[#1a1a24] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-label-caps uppercase text-[#04A8FC] font-black">
                        Combo Slot #1
                      </label>
                      <span className="text-[9px] font-mono text-slate-400">Principal</span>
                    </div>
                    <input
                      type="text"
                      value={combo1}
                      onChange={(e) => setCombo1(e.target.value)}
                      placeholder="Ej. Dransword 3-60F"
                      className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#04A8FC] shadow-sm"
                    />

                    {/* Photo Uploader Slot 1 */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <input
                        type="file"
                        id="combo-1-upload"
                        accept="image/*"
                        onChange={(e) => handleComboFileUpload(e, 1, false)}
                        className="hidden"
                      />
                      {combo1Image ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={combo1Image}
                            alt="Combo Slot 1"
                            onClick={() => setPreviewImageModal({ isOpen: true, url: combo1Image, title: `Foto Combo Slot #1 (${combo1 || 'Dransword'})` })}
                            className="w-9 h-9 rounded-lg object-cover border border-[#04A8FC] cursor-pointer shadow-sm hover:scale-105 transition-transform"
                            title="Clic para ver foto"
                          />
                          <button
                            type="button"
                            onClick={() => setCombo1Image('')}
                            className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase"
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="combo-1-upload"
                          className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 hover:bg-[#04A8FC]/10 hover:text-[#04A8FC] text-slate-500 dark:text-slate-400 text-[10px] font-label-caps uppercase font-bold border border-slate-200 dark:border-white/10 transition-colors shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-xs">add_a_photo</span>
                          <span>Foto Combo</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Slot 2 */}
                  {comboSlotsCount >= 2 && (
                    <div className="p-3 bg-slate-50 dark:bg-[#1a1a24] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-label-caps uppercase text-[#04A8FC] font-black">
                          Combo Slot #2
                        </label>
                        <span className="text-[9px] font-mono text-slate-400">Secundario</span>
                      </div>
                      <input
                        type="text"
                        value={combo2}
                        onChange={(e) => setCombo2(e.target.value)}
                        placeholder="Ej. Hellscythe 4-60T"
                        className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#04A8FC] shadow-sm"
                      />

                      {/* Photo Uploader Slot 2 */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <input
                          type="file"
                          id="combo-2-upload"
                          accept="image/*"
                          onChange={(e) => handleComboFileUpload(e, 2, false)}
                          className="hidden"
                        />
                        {combo2Image ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={combo2Image}
                              alt="Combo Slot 2"
                              onClick={() => setPreviewImageModal({ isOpen: true, url: combo2Image, title: `Foto Combo Slot #2 (${combo2 || 'Hellscythe'})` })}
                              className="w-9 h-9 rounded-lg object-cover border border-[#04A8FC] cursor-pointer shadow-sm hover:scale-105 transition-transform"
                              title="Clic para ver foto"
                            />
                            <button
                              type="button"
                              onClick={() => setCombo2Image('')}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase"
                            >
                              Quitar
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="combo-2-upload"
                            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 hover:bg-[#04A8FC]/10 hover:text-[#04A8FC] text-slate-500 dark:text-slate-400 text-[10px] font-label-caps uppercase font-bold border border-slate-200 dark:border-white/10 transition-colors shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-xs">add_a_photo</span>
                            <span>Foto Combo</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Slot 3 */}
                  {comboSlotsCount >= 3 && (
                    <div className="p-3 bg-slate-50 dark:bg-[#1a1a24] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-label-caps uppercase text-[#04A8FC] font-black">
                          Combo Slot #3
                        </label>
                        <span className="text-[9px] font-mono text-slate-400">Deck 3on3</span>
                      </div>
                      <input
                        type="text"
                        value={combo3}
                        onChange={(e) => setCombo3(e.target.value)}
                        placeholder="Ej. Wizardarrow 4-80B"
                        className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#04A8FC] shadow-sm"
                      />

                      {/* Photo Uploader Slot 3 */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <input
                          type="file"
                          id="combo-3-upload"
                          accept="image/*"
                          onChange={(e) => handleComboFileUpload(e, 3, false)}
                          className="hidden"
                        />
                        {combo3Image ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={combo3Image}
                              alt="Combo Slot 3"
                              onClick={() => setPreviewImageModal({ isOpen: true, url: combo3Image, title: `Foto Combo Slot #3 (${combo3 || 'Wizardarrow'})` })}
                              className="w-9 h-9 rounded-lg object-cover border border-[#04A8FC] cursor-pointer shadow-sm hover:scale-105 transition-transform"
                              title="Clic para ver foto"
                            />
                            <button
                              type="button"
                              onClick={() => setCombo3Image('')}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase"
                            >
                              Quitar
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="combo-3-upload"
                            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 hover:bg-[#04A8FC]/10 hover:text-[#04A8FC] text-slate-500 dark:text-slate-400 text-[10px] font-label-caps uppercase font-bold border border-slate-200 dark:border-white/10 transition-colors shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-xs">add_a_photo</span>
                            <span>Foto Combo</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl text-xs font-label-caps uppercase text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-6 py-2.5 rounded-xl font-headline font-black text-xs uppercase shadow-md shadow-[#04A8FC]/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Registrar Blader
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Roster Summary & Blader Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Blader Detail & Badges */}
          {selectedBlader && (
            <div className="glass-panel p-6 rounded-3xl border border-[#04A8FC]/40 bg-white dark:bg-[#15151c] shadow-lg shadow-[#04A8FC]/10 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <BladerAvatar blader={selectedBlader} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                        {selectedBlader.name}
                      </h4>
                      {selectedBlader.verified && (
                        <span className="material-symbols-outlined text-[#04A8FC] text-base" title="Blader Verificado">
                          verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-label-caps uppercase text-slate-500 font-bold">
                      {selectedBlader.team} • {selectedBlader.stats.wins}W / {selectedBlader.stats.losses}L
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedBlader)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#04A8FC]/10 text-[#04A8FC] hover:bg-[#04A8FC]/20 text-xs font-headline font-bold uppercase transition-all"
                    title="Editar datos y foto del blader"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => onToggleVerified(selectedBlader.id)}
                    className="text-xs font-headline font-bold text-slate-500 hover:text-[#04A8FC] uppercase"
                  >
                    {selectedBlader.verified ? 'Verificado' : 'Verificar'}
                  </button>
                </div>
              </div>

              {/* Insignias del Blader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-headline font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Insignias de Honor ({selectedBlader.badges?.length || 0})
                  </h5>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {OFFICIAL_BADGES.map((b) => {
                    const hasBadge = selectedBlader.badges?.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => onToggleBadge && onToggleBadge(selectedBlader.id, b.id)}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          hasBadge
                            ? `${b.bgColor} ${b.borderColor} opacity-100`
                            : 'border-dashed border-slate-200 dark:border-white/10 opacity-40 hover:opacity-80'
                        }`}
                        title={b.description}
                      >
                        <span className={`material-symbols-outlined text-base ${b.color}`}>
                          {b.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="font-headline font-bold text-[10px] uppercase block text-slate-900 dark:text-white truncate">
                            {b.name}
                          </span>
                        </div>
                        {hasBadge && (
                          <span className="material-symbols-outlined text-xs text-emerald-500">check</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Combos del Blader */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h5 className="font-headline font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    {selectedBlader.combos && selectedBlader.combos.length === 1
                      ? 'Deck Individual (1 Beyblade)'
                      : selectedBlader.combos && selectedBlader.combos.length === 2
                      ? 'Deck de Combate (2 Beyblades)'
                      : selectedBlader.combos && selectedBlader.combos.length === 3
                      ? 'Deck 3on3 Configurado (3 Beyblades)'
                      : `Deck de Combate (${selectedBlader.combos?.length || 0} Beyblades)`}
                  </h5>
                  <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded bg-[#04A8FC]/10 text-[#04A8FC] font-bold">
                    {selectedBlader.combos?.length === 1 ? '1 Combo' : `${selectedBlader.combos?.length || 0} Combos`}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedBlader.combos && selectedBlader.combos.length > 0 ? (
                    selectedBlader.combos.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3 transition-all hover:border-[#04A8FC]/40"
                      >
                        {/* Combo Photo / Icon */}
                        <div
                          onClick={() => {
                            if (c.imageUrl) {
                              soundManager.playClick();
                              setPreviewImageModal({
                                isOpen: true,
                                url: c.imageUrl,
                                title: `Combo #${c.slot}: ${c.name || `${c.blade} ${c.ratchet}${c.bit}`} (${selectedBlader.name})`
                              });
                            }
                          }}
                          className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border ${
                            c.imageUrl
                              ? 'border-[#04A8FC]/50 cursor-pointer shadow-sm hover:scale-105 transition-transform'
                              : 'border-slate-200 dark:border-white/10 bg-slate-200/60 dark:bg-white/10 text-slate-400'
                          }`}
                          title={c.imageUrl ? 'Clic para ver foto ampliada' : 'Sin foto de combo'}
                        >
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.blade} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-xl">cyclone</span>
                          )}
                        </div>

                        {/* Combo Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-[#04A8FC]/10 text-[#04A8FC] font-label-caps text-[9px] font-black uppercase">
                              Slot #{c.slot}
                            </span>
                            <span className="font-headline font-bold uppercase text-xs text-slate-900 dark:text-white truncate">
                              {c.name || `${c.blade} ${c.ratchet}${c.bit}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            <span>B: {c.blade}</span>
                            {c.ratchet && <span>• R: {c.ratchet}</span>}
                            {c.bit && <span>• Bit: {c.bit}</span>}
                          </div>
                        </div>

                        {c.imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setPreviewImageModal({
                                isOpen: true,
                                url: c.imageUrl!,
                                title: `Combo #${c.slot}: ${c.name || `${c.blade} ${c.ratchet}${c.bit}`} (${selectedBlader.name})`
                              });
                            }}
                            className="p-1.5 rounded-lg bg-[#04A8FC]/10 text-[#04A8FC] hover:bg-[#04A8FC]/20 transition-colors"
                            title="Ver foto"
                          >
                            <span className="material-symbols-outlined text-sm">zoom_in</span>
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 text-center italic bg-slate-50 dark:bg-white/5 rounded-xl">
                      Sin combos registrados en el deck
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Roster List */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#15151c]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="font-headline font-black text-base uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#04A8FC]">groups</span>
                <span>Padrón de Bladers ({bladers.length})</span>
              </h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-label-caps uppercase font-bold border border-emerald-500/20">
                <span className="material-symbols-outlined text-xs">cloud_done</span>
                <span>Auto-Guardado BD</span>
              </div>
            </div>

            {syncFeedback && (
              <div
                className={`mb-3 p-2.5 rounded-xl text-xs font-label-caps uppercase flex items-center gap-2 ${
                  syncFeedback.isError
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {syncFeedback.isError ? 'error' : 'cloud_done'}
                </span>
                <span>{syncFeedback.message}</span>
              </div>
            )}

            {bladers.length === 0 ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-[#04A8FC]/10 text-[#04A8FC] flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-3xl">person_add</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white">
                    Padrón Vacío
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    No hay bladers registrados todavía. Utiliza el formulario de la izquierda para inscribir a los jugadores de la comunidad con sus nombres, fotos y combos reales.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {bladers.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedBlader(b);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedBlader?.id === b.id
                        ? 'border-[#04A8FC] bg-[#04A8FC]/10 shadow-sm'
                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-[#04A8FC]/40'
                    }`}
                  >
                    <BladerAvatar blader={b} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-headline font-bold text-sm uppercase text-slate-900 dark:text-white truncate">
                          {b.name}
                        </h4>
                        {b.verified && (
                          <span className="material-symbols-outlined text-[#04A8FC] text-sm" title="Combo Verificado">
                            verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-label-caps text-slate-500 truncate uppercase">
                          {b.team} • {b.combos?.length || 0} Combos
                        </p>
                        {/* Mini combo photo thumbnails if any */}
                        {b.combos && b.combos.some((c) => !!c.imageUrl) && (
                          <div className="flex items-center -space-x-1">
                            {b.combos.filter((c) => !!c.imageUrl).map((c, ci) => (
                              <img
                                key={ci}
                                src={c.imageUrl}
                                alt={c.blade}
                                className="w-4 h-4 rounded-full object-cover border border-white dark:border-[#15151c] shadow-2xs"
                                title={`Combo #${c.slot}: ${c.name || c.blade}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-headline font-bold text-xs text-[#04A8FC] block">
                          {b.stats.wins}W - {b.stats.losses}L
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(b);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-[#04A8FC]"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          onDeleteBlader(b.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-500"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Blader Modal */}
      {editingBlader && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15151c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#04A8FC]">edit</span>
                <span>Editar Perfil & Foto: {editingBlader.name}</span>
              </h3>
              <button
                onClick={() => setEditingBlader(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Avatar Section */}
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-2">
                <label className="block font-label-caps text-xs text-gray-600 dark:text-gray-300 uppercase font-bold">
                  Foto de Perfil
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 overflow-hidden flex-shrink-0 border-2 border-[#04A8FC]/40">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Edit Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-2xl">account_circle</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      id="edit-avatar-upload"
                      onChange={(e) => handleFileUpload(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-avatar-upload"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#04A8FC] text-white rounded-lg font-headline font-bold text-xs uppercase cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      <span>Subir Nueva Foto</span>
                    </label>
                    {editAvatar && (
                      <button
                        type="button"
                        onClick={() => setEditAvatar('')}
                        className="block text-[11px] text-red-500 font-bold uppercase"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="pt-2">
                  <span className="text-[10px] font-label-caps uppercase text-slate-400 font-bold block mb-1">
                    O cambiar por Avatar:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEditAvatar(preset.url);
                          soundManager.playClick();
                        }}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 ${
                          editAvatar === preset.url ? 'border-[#04A8FC] ring-2 ring-[#04A8FC] scale-105 shadow-sm shadow-[#04A8FC]/30' : 'border-slate-300 dark:border-white/20 opacity-80 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name and Team */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-caps text-xs text-gray-500 uppercase font-bold mb-1">
                    Nombre Oficial
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-headline uppercase"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-xs text-gray-500 uppercase font-bold mb-1">
                    Equipo / Team
                  </label>
                  <input
                    type="text"
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-headline uppercase"
                  />
                </div>
              </div>

              {/* Deck Combos Edit */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <label className="block font-label-caps text-xs text-gray-500 uppercase font-bold">
                    Deck de Combate (Combos)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setEditSlotsCount(1)}
                      className={`px-2 py-0.5 rounded text-[10px] font-headline font-bold uppercase transition-all ${
                        editSlotsCount === 1 ? 'bg-[#04A8FC] text-white' : 'text-slate-500'
                      }`}
                    >
                      1 Combo
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSlotsCount(2)}
                      className={`px-2 py-0.5 rounded text-[10px] font-headline font-bold uppercase transition-all ${
                        editSlotsCount === 2 ? 'bg-[#04A8FC] text-white' : 'text-slate-500'
                      }`}
                    >
                      2 Combos
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSlotsCount(3)}
                      className={`px-2 py-0.5 rounded text-[10px] font-headline font-bold uppercase transition-all ${
                        editSlotsCount === 3 ? 'bg-[#04A8FC] text-white' : 'text-slate-500'
                      }`}
                    >
                      3 Combos
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Slot 1 Edit */}
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-label-caps text-[#04A8FC] uppercase font-black">Slot #1</span>
                      <span className="text-[9px] font-mono text-slate-400">Principal</span>
                    </div>
                    <input
                      type="text"
                      value={editCombo1}
                      onChange={(e) => setEditCombo1(e.target.value)}
                      placeholder="Slot 1 (Ej. Dransword 3-60F)"
                      className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline uppercase"
                    />
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <input
                        type="file"
                        id="edit-combo-1-upload"
                        accept="image/*"
                        onChange={(e) => handleComboFileUpload(e, 1, true)}
                        className="hidden"
                      />
                      {editCombo1Image ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={editCombo1Image}
                            alt="Edit Combo Slot 1"
                            onClick={() => setPreviewImageModal({ isOpen: true, url: editCombo1Image, title: `Foto Combo Slot #1 (${editCombo1 || 'Dransword'})` })}
                            className="w-9 h-9 rounded-lg object-cover border border-[#04A8FC] cursor-pointer shadow-sm hover:scale-105 transition-transform"
                            title="Clic para ver foto"
                          />
                          <button
                            type="button"
                            onClick={() => setEditCombo1Image('')}
                            className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase"
                          >
                            Quitar Foto
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="edit-combo-1-upload"
                          className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 hover:bg-[#04A8FC]/10 hover:text-[#04A8FC] text-slate-500 dark:text-slate-400 text-[10px] font-label-caps uppercase font-bold border border-slate-200 dark:border-white/10 transition-colors shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-xs">add_a_photo</span>
                          <span>Subir Foto Combo</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Slot 2 Edit */}
                  {editSlotsCount >= 2 && (
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-label-caps text-[#04A8FC] uppercase font-black">Slot #2</span>
                        <span className="text-[9px] font-mono text-slate-400">Secundario</span>
                      </div>
                      <input
                        type="text"
                        value={editCombo2}
                        onChange={(e) => setEditCombo2(e.target.value)}
                        placeholder="Slot 2 (Ej. Hellscythe 4-60T)"
                        className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline uppercase"
                      />
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <input
                          type="file"
                          id="edit-combo-2-upload"
                          accept="image/*"
                          onChange={(e) => handleComboFileUpload(e, 2, true)}
                          className="hidden"
                        />
                        {editCombo2Image ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={editCombo2Image}
                              alt="Edit Combo Slot 2"
                              onClick={() => setPreviewImageModal({ isOpen: true, url: editCombo2Image, title: `Foto Combo Slot #2 (${editCombo2 || 'Hellscythe'})` })}
                              className="w-9 h-9 rounded-lg object-cover border border-[#04A8FC] cursor-pointer shadow-sm hover:scale-105 transition-transform"
                              title="Clic para ver foto"
                            />
                            <button
                              type="button"
                              onClick={() => setEditCombo2Image('')}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase"
                            >
                              Quitar Foto
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="edit-combo-2-upload"
                            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 hover:bg-[#04A8FC]/10 hover:text-[#04A8FC] text-slate-500 dark:text-slate-400 text-[10px] font-label-caps uppercase font-bold border border-slate-200 dark:border-white/10 transition-colors shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-xs">add_a_photo</span>
                            <span>Subir Foto Combo</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Slot 3 Edit */}
                  {editSlotsCount >= 3 && (
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-label-caps text-[#04A8FC] uppercase font-black">Slot #3</span>
                        <span className="text-[9px] font-mono text-slate-400">Deck 3on3</span>
                      </div>
                      <input
                        type="text"
                        value={editCombo3}
                        onChange={(e) => setEditCombo3(e.target.value)}
                        placeholder="Slot 3 (Ej. Wizardarrow 4-80B)"
                        className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline uppercase"
                      />
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <input
                          type="file"
                          id="edit-combo-3-upload"
                          accept="image/*"
                          onChange={(e) => handleComboFileUpload(e, 3, true)}
                          className="hidden"
                        />
                        {editCombo3Image ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={editCombo3Image}
                              alt="Edit Combo Slot 3"
                              onClick={() => setPreviewImageModal({ isOpen: true, url: editCombo3Image, title: `Foto Combo Slot #3 (${editCombo3 || 'Wizardarrow'})` })}
                              className="w-9 h-9 rounded-lg object-cover border border-[#04A8FC] cursor-pointer shadow-sm hover:scale-105 transition-transform"
                              title="Clic para ver foto"
                            />
                            <button
                              type="button"
                              onClick={() => setEditCombo3Image('')}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase"
                            >
                              Quitar Foto
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="edit-combo-3-upload"
                            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 hover:bg-[#04A8FC]/10 hover:text-[#04A8FC] text-slate-500 dark:text-slate-400 text-[10px] font-label-caps uppercase font-bold border border-slate-200 dark:border-white/10 transition-colors shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-xs">add_a_photo</span>
                            <span>Subir Foto Combo</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingBlader(null)}
                className="px-4 py-2 rounded-xl text-xs font-label-caps uppercase text-slate-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-5 py-2 rounded-xl font-headline font-black text-xs uppercase shadow-md transition-all"
              >
                Guardar y Sincronizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for zooming combo/avatar photos */}
      {previewImageModal.isOpen && (
        <div
          onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#15151c] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 text-center"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h4 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white truncate">
                {previewImageModal.title}
              </h4>
              <button
                onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <button
              onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
              className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-5 py-2 rounded-xl text-xs font-headline font-black uppercase"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
