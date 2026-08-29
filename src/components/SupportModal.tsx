import React from 'react';
import { CommunityLogo } from './CommunityLogo';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#15151c] border border-[#bec7d3]/40 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-left">
        <div className="flex justify-between items-center border-b border-[#bec7d3]/30 dark:border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-[#111116] p-1 border border-black/10 flex items-center justify-center">
              <CommunityLogo size="sm" />
            </div>
            <div>
              <h3 className="font-headline font-black text-lg uppercase text-[#1a1c1e] dark:text-white">
                Comunidad Beyblade Cúcuta
              </h3>
              <p className="font-label-caps text-[10px] text-[#04A8FC] uppercase font-bold">
                Gestor Oficial de Torneos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white text-lg">
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs font-body-text text-gray-600 dark:text-gray-400 leading-relaxed">
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl space-y-1">
            <h4 className="font-headline font-bold text-sm text-[#1a1c1e] dark:text-white uppercase">
              ⚡ ¿Cómo usar la Consola de Batalla?
            </h4>
            <p>
              Haz clic en los botones de puntuación táctica (<strong>Xtreme Finish +3</strong>, <strong>Burst Finish +2</strong>, <strong>Over Finish +2</strong>, <strong>Spin Finish +1</strong>) para sumar puntos al Blader en tiempo real. Cuando un Blader alcance el puntaje objetivo (ej. 5 PTS), se activará la celebración y se registrará en el bracket.
            </p>
          </div>

          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl space-y-1">
            <h4 className="font-headline font-bold text-sm text-[#1a1c1e] dark:text-white uppercase">
              👥 Registro de Bladers & Decks
            </h4>
            <p>
              Ve a la sección <strong>Bladers & Roster</strong> para registrar nuevos jugadores con sus combos de combate (1 combo para 1v1, 2 combos o Deck 3on3 oficial según el formato de tu torneo).
            </p>
          </div>

          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl space-y-1">
            <h4 className="font-headline font-bold text-sm text-[#1a1c1e] dark:text-white uppercase">
              🏆 Árbol de Torneo & Exportación
            </h4>
            <p>
              En la pantalla <strong>Bracket</strong> tienes la vista completa de la eliminación directa. Puedes hacer zoom, copiar el link en vivo para compartir con los asistentes o imprimir la tabla.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#bec7d3]/30 dark:border-white/10">
          <button
            onClick={onClose}
            className="bg-[#04A8FC] hover:bg-[#008fe0] text-white px-6 py-2 rounded-xl text-xs font-headline font-bold uppercase"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
