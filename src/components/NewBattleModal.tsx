import React, { useState } from 'react';
import { Blader } from '../types';
import { soundManager } from '../utils/audio';

interface NewBattleModalProps {
  bladers: Blader[];
  onClose: () => void;
  onStartCustomBattle: (bladerAId: string, bladerBId: string, targetScore: number) => void;
  onQuickStartByName?: (nameA: string, nameB: string, targetScore: number) => void;
}

export const NewBattleModal: React.FC<NewBattleModalProps> = ({
  bladers,
  onClose,
  onStartCustomBattle,
  onQuickStartByName
}) => {
  const [bladerAId, setBladerAId] = useState<string>(bladers[0]?.id || '');
  const [bladerBId, setBladerBId] = useState<string>(bladers[1]?.id || '');
  const [customNameA, setCustomNameA] = useState<string>('');
  const [customNameB, setCustomNameB] = useState<string>('');
  const [targetScore, setTargetScore] = useState<number>(5);

  const hasRegisteredBladers = bladers.length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasRegisteredBladers) {
      if (!bladerAId || !bladerBId || bladerAId === bladerBId) {
        alert('Por favor selecciona dos bladers diferentes.');
        return;
      }
      soundManager.playClick();
      onStartCustomBattle(bladerAId, bladerBId, targetScore);
    } else {
      const finalA = customNameA.trim() || 'Blader Rojo';
      const finalB = customNameB.trim() || 'Blader Azul';
      soundManager.playClick();
      if (onQuickStartByName) {
        onQuickStartByName(finalA, finalB, targetScore);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#15151c] border border-[#bec7d3]/40 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04A8FC] text-2xl">sports_kabaddi</span>
            <h3 className="font-headline font-black text-xl uppercase text-[#1a1c1e] dark:text-white">
              Iniciar Nueva Batalla
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blader A */}
            <div className="p-4 rounded-xl border border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20">
              <label className="block text-xs font-label-caps uppercase font-bold text-[#AC191F] mb-2">
                Esquina Roja
              </label>
              {hasRegisteredBladers ? (
                <select
                  value={bladerAId}
                  onChange={(e) => setBladerAId(e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-xs font-headline font-bold text-[#1a1c1e] dark:text-white uppercase"
                >
                  {bladers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.team})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customNameA}
                  onChange={(e) => setCustomNameA(e.target.value)}
                  placeholder="Nombre Blader Rojo"
                  className="w-full bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-xs font-headline font-bold text-[#1a1c1e] dark:text-white uppercase placeholder:text-gray-400"
                />
              )}
            </div>

            {/* Blader B */}
            <div className="p-4 rounded-xl border border-blue-300 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
              <label className="block text-xs font-label-caps uppercase font-bold text-[#04A8FC] mb-2">
                Esquina Azul
              </label>
              {hasRegisteredBladers ? (
                <select
                  value={bladerBId}
                  onChange={(e) => setBladerBId(e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-xs font-headline font-bold text-[#1a1c1e] dark:text-white uppercase"
                >
                  {bladers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.team})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customNameB}
                  onChange={(e) => setCustomNameB(e.target.value)}
                  placeholder="Nombre Blader Azul"
                  className="w-full bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-xs font-headline font-bold text-[#1a1c1e] dark:text-white uppercase placeholder:text-gray-400"
                />
              )}
            </div>
          </div>

          {/* Target Score */}
          <div>
            <label className="block text-xs font-label-caps uppercase font-bold text-gray-500 mb-1">
              Puntos para Ganar
            </label>
            <div className="flex gap-3">
              {[3, 4, 5, 7].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setTargetScore(pts)}
                  className={`flex-1 py-2 rounded-xl font-headline font-bold text-sm transition-all ${
                    targetScore === pts
                      ? 'bg-[#04A8FC] text-white shadow-sm'
                      : 'border border-gray-300 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pts} Puntos
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#bec7d3]/30 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-label-caps text-xs uppercase text-gray-500 hover:text-black dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-6 py-2.5 font-headline font-bold text-xs uppercase rounded-xl shadow-md shadow-[#04A8FC]/20"
            >
              Iniciar en Battle Console
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
