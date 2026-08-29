import React, { useState } from 'react';
import { BeybladePart, Blader, RegisteredCombo } from '../../types';
import { soundManager } from '../../utils/audio';
import { compressImage } from '../../utils/imageUtils';
import { BladerAvatar } from '../BladerAvatar';

interface EquipmentScreenProps {
  parts: BeybladePart[];
  bladers: Blader[];
  registeredCombos: RegisteredCombo[];
  onAddPart: (part: BeybladePart) => void;
  onDeletePart: (name: string) => void;
  onAddCombo: (combo: RegisteredCombo) => void;
  onDeleteCombo: (id: string) => void;
  onUpdateBlader?: (blader: Blader) => void;
}

export const EquipmentScreen: React.FC<EquipmentScreenProps> = ({
  parts,
  bladers,
  registeredCombos,
  onAddPart,
  onDeletePart,
  onAddCombo,
  onDeleteCombo,
  onUpdateBlader
}) => {
  const [activeTab, setActiveTab] = useState<'combos' | 'parts'>('combos');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Blade' | 'Ratchet' | 'Bit'>('All');
  const [comboFilterType, setComboFilterType] = useState<string>('All');
  const [comboFilterBlader, setComboFilterBlader] = useState<string>('All');

  // Lightbox modal for zooming combo photos
  const [previewImageModal, setPreviewImageModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const handleComboPhotoUpload = async (combo: RegisteredCombo, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      soundManager.playScore();
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      const updatedCombo: RegisteredCombo = {
        ...combo,
        image: compressedDataUrl
      };
      onAddCombo(updatedCombo);

      // If attached to a blader, update blader's combo imageUrl
      if (combo.bladerId && onUpdateBlader) {
        const blader = bladers.find((b) => b.id === combo.bladerId);
        if (blader && blader.combos) {
          const updatedBladerCombos = blader.combos.map((bc) => {
            if (
              bc.blade.toLowerCase() === combo.blade.toLowerCase() ||
              combo.id.endsWith(`slot-${bc.slot}`)
            ) {
              return { ...bc, imageUrl: compressedDataUrl };
            }
            return bc;
          });
          onUpdateBlader({
            ...blader,
            combos: updatedBladerCombos
          });
        }
      }
    } catch (err) {
      console.error('Error uploading combo photo:', err);
    }
  };

  const filteredParts = parts.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.type === selectedCategory;
  });

  const filteredCombos = registeredCombos.filter((c) => {
    const matchesType = comboFilterType === 'All' || c.type === comboFilterType;
    const matchesBlader =
      comboFilterBlader === 'All' ||
      c.bladerId === comboFilterBlader ||
      c.bladerName.toLowerCase() === comboFilterBlader.toLowerCase();
    return matchesType && matchesBlader;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="font-headline font-black text-3xl md:text-5xl text-slate-900 dark:text-white uppercase tracking-tight mb-1">
            EQUIPAMIENTO & COMBOS
          </h1>
          <p className="font-body-text text-base text-slate-600 dark:text-slate-400">
            Armero oficial de piezas y galería de combos de los Bladers del torneo.
          </p>
        </div>

        {/* Live Auto Status */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-label-caps uppercase font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Trazabilidad & Carga Automática Activa</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('combos');
          }}
          className={`px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'combos'
              ? 'bg-[#04A8FC] text-white shadow-md shadow-[#04A8FC]/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-base">military_tech</span>
          <span>Combos Registrados ({registeredCombos.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('parts');
          }}
          className={`px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'parts'
              ? 'bg-[#04A8FC] text-white shadow-md shadow-[#04A8FC]/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-base">category</span>
          <span>Catálogo de Piezas ({parts.length})</span>
        </button>
      </div>

      {/* TAB 1: COMBOS ARMORY */}
      {activeTab === 'combos' && (
        <div className="space-y-6">
          {/* Registered Combos Header & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline font-black text-xl uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#04A8FC]">military_tech</span>
              <span>Padrón de Combos Registrados ({filteredCombos.length})</span>
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={comboFilterType}
                onChange={(e) => setComboFilterType(e.target.value)}
                className="bg-white dark:bg-[#15151c] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline font-bold uppercase text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#04A8FC]"
              >
                <option value="All">Todos los Tipos</option>
                <option value="Attack">Ataque</option>
                <option value="Defense">Defensa</option>
                <option value="Stamina">Resistencia</option>
                <option value="Balance">Equilibrio</option>
              </select>

              <select
                value={comboFilterBlader}
                onChange={(e) => setComboFilterBlader(e.target.value)}
                className="bg-white dark:bg-[#15151c] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-headline font-bold uppercase text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#04A8FC]"
              >
                <option value="All">Todos los Bladers</option>
                {bladers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredCombos.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center space-y-4 bg-white dark:bg-[#15151c]">
              <div className="w-14 h-14 rounded-2xl bg-[#04A8FC]/10 text-[#04A8FC] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">sports_martial_arts</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                  No Hay Combos Registrados
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Los combos se cargan automáticamente desde el registro de Bladers al inscribir sus Decks de combate.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCombos.map((combo) => {
                const ownerBlader = bladers.find(
                  (b) => b.id === combo.bladerId || b.name.toLowerCase() === combo.bladerName.toLowerCase()
                );

                return (
                  <div
                    key={combo.id}
                    className="p-5 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#15151c] hover:border-[#04A8FC] transition-all space-y-3.5 relative group shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Action & Archetype Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-label-caps font-black px-2.5 py-0.5 rounded-full uppercase ${
                            combo.type === 'Attack'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : combo.type === 'Defense'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : combo.type === 'Stamina'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {combo.type}
                        </span>
                        <div className="flex items-center gap-2">
                          {combo.weight && (
                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                              {combo.weight}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              onDeleteCombo(combo.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded transition-opacity"
                            title="Eliminar combo"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Combo Photo / Gallery Banner */}
                      {combo.image ? (
                        <div className="space-y-1.5">
                          <div
                            onClick={() => {
                              soundManager.playClick();
                              setPreviewImageModal({
                                isOpen: true,
                                url: combo.image!,
                                title: `${combo.blade} ${combo.ratchet}${combo.bit} • ${combo.bladerName}`
                              });
                            }}
                            className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900/10 dark:bg-black/40 border border-slate-200 dark:border-white/10 cursor-pointer group/photo shadow-inner"
                          >
                            <img
                              src={combo.image}
                              alt={`${combo.blade} ${combo.ratchet}${combo.bit}`}
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-headline font-black uppercase gap-1.5 backdrop-blur-xs">
                              <span className="material-symbols-outlined text-base">zoom_in</span>
                              <span>Ver Foto Ampliada</span>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/75 text-white text-[9px] font-label-caps uppercase font-bold backdrop-blur-sm shadow">
                              📸 Foto Oficial
                            </div>
                          </div>
                          <div className="flex items-center justify-end">
                            <input
                              type="file"
                              id={`combo-photo-change-${combo.id}`}
                              accept="image/*"
                              onChange={(e) => handleComboPhotoUpload(combo, e)}
                              className="hidden"
                            />
                            <label
                              htmlFor={`combo-photo-change-${combo.id}`}
                              className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-label-caps uppercase font-bold text-slate-500 hover:text-[#04A8FC] transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">add_a_photo</span>
                              <span>Cambiar Foto</span>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/70 dark:from-white/5 dark:to-white/10 border border-slate-200/50 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2">
                          <span className="material-symbols-outlined text-2xl text-slate-400">cyclone</span>
                          <span className="font-label-caps text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                            Sin Foto Registrada
                          </span>
                          <input
                            type="file"
                            id={`combo-photo-upload-${combo.id}`}
                            accept="image/*"
                            onChange={(e) => handleComboPhotoUpload(combo, e)}
                            className="hidden"
                          />
                          <label
                            htmlFor={`combo-photo-upload-${combo.id}`}
                            className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-[#04A8FC] hover:text-white text-[#04A8FC] text-xs font-headline font-bold uppercase transition-all shadow-xs border border-[#04A8FC]/30"
                          >
                            <span className="material-symbols-outlined text-sm">add_a_photo</span>
                            <span>Subir Foto del Combo</span>
                          </label>
                        </div>
                      )}

                      {/* Combo Title & Blader Owner */}
                      <div className="space-y-1.5">
                        <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                          {combo.blade} {combo.ratchet}{combo.bit}
                        </h4>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                          <BladerAvatar
                            blader={
                              ownerBlader || {
                                id: 'custom',
                                name: combo.bladerName,
                                alias: '',
                                team: 'Comunidad Cúcuta',
                                avatarUrl: '',
                                verified: false,
                                combos: [],
                                stats: {
                                  matchesPlayed: 0,
                                  wins: 0,
                                  losses: 0,
                                  pointsScored: 0,
                                  xtremeFinishes: 0,
                                  burstFinishes: 0,
                                  overFinishes: 0,
                                  spinFinishes: 0
                                },
                                registeredAt: ''
                              }
                            }
                            size="sm"
                          />
                          <div className="min-w-0">
                            <span className="text-[9px] font-label-caps uppercase text-slate-400 font-bold block">
                              Blader Propietario
                            </span>
                            <span className="font-headline font-bold text-xs uppercase text-slate-700 dark:text-slate-200 truncate block">
                              {combo.bladerName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Parts Breakdown */}
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-center">
                        <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-white/5">
                          <span className="text-[9px] font-label-caps uppercase text-slate-400 block font-bold">Blade</span>
                          <span className="font-headline font-bold text-xs uppercase text-slate-800 dark:text-white truncate block">
                            {combo.blade}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-white/5">
                          <span className="text-[9px] font-label-caps uppercase text-slate-400 block font-bold">Ratchet</span>
                          <span className="font-headline font-bold text-xs uppercase text-slate-800 dark:text-white truncate block">
                            {combo.ratchet}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-white/5">
                          <span className="text-[9px] font-label-caps uppercase text-slate-400 block font-bold">Bit</span>
                          <span className="font-headline font-bold text-xs uppercase text-slate-800 dark:text-white truncate block">
                            {combo.bit}
                          </span>
                        </div>
                      </div>

                      {combo.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-white/5 line-clamp-2">
                          "{combo.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PARTS CATALOG */}
      {activeTab === 'parts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              {(['All', 'Blade', 'Ratchet', 'Bit'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#04A8FC] text-white shadow-sm font-black'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'Todas' : `${cat}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Parts Grid */}
          {filteredParts.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center space-y-4 bg-white dark:bg-[#15151c]">
              <div className="w-14 h-14 rounded-2xl bg-[#04A8FC]/10 text-[#04A8FC] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                  Catálogo de Piezas Vacío
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  El catálogo se alimenta automáticamente con las piezas de los combos que registren los Bladers del torneo.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParts.map((part) => {
                const bladerCombos = bladers.flatMap((b) => b.combos || []);
                const partNameLower = part.name.trim().toLowerCase();
                const usageCount =
                  registeredCombos.filter(
                    (c) =>
                      c.blade?.trim().toLowerCase() === partNameLower ||
                      c.ratchet?.trim().toLowerCase() === partNameLower ||
                      c.bit?.trim().toLowerCase() === partNameLower
                  ).length +
                  bladerCombos.filter(
                    (c) =>
                      c.blade?.trim().toLowerCase() === partNameLower ||
                      c.ratchet?.trim().toLowerCase() === partNameLower ||
                      c.bit?.trim().toLowerCase() === partNameLower ||
                      (c.name && c.name.toLowerCase().includes(partNameLower))
                  ).length;

                return (
                  <div
                    key={part.name}
                    className="p-4 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#15151c] hover:border-[#04A8FC] transition-all space-y-2.5 relative group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-label-caps font-black px-2 py-0.5 rounded-lg uppercase ${
                          part.type === 'Blade'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : part.type === 'Ratchet'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {part.type} {part.category ? `• ${part.category}` : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        {usageCount > 0 && (
                          <span className="text-[9px] font-label-caps uppercase font-black px-2 py-0.5 rounded-full bg-[#04A8FC]/10 text-[#04A8FC] border border-[#04A8FC]/20">
                            En {usageCount} combo{usageCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {part.weight && (
                          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                            {part.weight}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            onDeletePart(part.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded transition-opacity"
                          title="Eliminar pieza"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>

                  <div className="flex items-center gap-3">
                    {part.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 flex-shrink-0 border border-slate-200 dark:border-white/10">
                        <img src={part.image} alt={part.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <span className="material-symbols-outlined text-xl">
                          {part.type === 'Blade' ? 'shield' : part.type === 'Ratchet' ? 'settings' : 'toys'}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-headline font-bold text-base uppercase text-slate-900 dark:text-white truncate">
                        {part.name}
                      </h4>
                    </div>
                  </div>

                  {part.description && (
                    <p className="text-xs text-slate-600 dark:text-gray-400 font-body-text leading-relaxed line-clamp-2">
                      {part.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {previewImageModal.isOpen && (
        <div
          onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white dark:bg-[#15151c] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-label-caps uppercase text-[#04A8FC] font-black block">
                  Galería de Combos Oficiales • Comunidad Cúcuta
                </span>
                <h4 className="font-headline font-black text-lg uppercase text-slate-900 dark:text-white">
                  {previewImageModal.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-black/20 flex items-center justify-center">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="w-full h-full max-h-[70vh] object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
