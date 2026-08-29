import React from 'react';

interface RulesScreenProps {
  leagueName?: string;
  organizerName?: string;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({
  leagueName = 'Comunidad Beyblade Cúcuta',
  organizerName = 'Juez Oficial'
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#bec7d3]/30 dark:border-white/10 pb-4">
        <h1 className="font-headline font-black text-3xl md:text-5xl text-[#1a1c1e] dark:text-white uppercase tracking-tight mb-2">
          REGLAMENTO OFICIAL BEYBLADE X
        </h1>
        <p className="font-body-text text-base text-gray-600 dark:text-gray-400">
          Reglas de torneo estándar avaladas por la Federación de Beyblade X y {leagueName}.
        </p>
      </div>

      {/* Point Scoring System Cards */}
      <div className="space-y-4">
        <h3 className="font-headline font-black text-xl uppercase text-[#04A8FC]">
          Sistema de Puntuación Oficial
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Xtreme Finish */}
          <div className="glass-panel p-5 rounded-2xl border-t-4 border-t-[#AC191F] border-x border-b border-[#bec7d3]/40 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-headline font-black text-3xl text-[#AC191F]">3 PTS</span>
              <span className="material-symbols-outlined text-2xl text-[#AC191F]">bolt</span>
            </div>
            <h4 className="font-headline font-black text-base uppercase text-[#1a1c1e] dark:text-white">
              XTREME FINISH
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-body-text leading-relaxed">
              Ocurre cuando el Beyblade oponente es expulsado violentamente a través de la zona central Xtreme hacia la zona de anotación principal.
            </p>
          </div>

          {/* Burst Finish */}
          <div className="glass-panel p-5 rounded-2xl border-t-4 border-t-[#FFA500] border-x border-b border-[#bec7d3]/40 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-headline font-black text-3xl text-[#FFA500]">2 PTS</span>
              <span className="material-symbols-outlined text-2xl text-[#FFA500]">explosion</span>
            </div>
            <h4 className="font-headline font-black text-base uppercase text-[#1a1c1e] dark:text-white">
              BURST FINISH
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-body-text leading-relaxed">
              Ocurre cuando el Beyblade del oponente se desensambla por completo durante el impacto (separación de Blade, Ratchet o Bit).
            </p>
          </div>

          {/* Over Finish */}
          <div className="glass-panel p-5 rounded-2xl border-t-4 border-t-[#39FF14] border-x border-b border-[#bec7d3]/40 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-headline font-black text-3xl text-[#22c55e]">2 PTS</span>
              <span className="material-symbols-outlined text-2xl text-[#22c55e]">exit_to_app</span>
            </div>
            <h4 className="font-headline font-black text-base uppercase text-[#1a1c1e] dark:text-white">
              OVER FINISH
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-body-text leading-relaxed">
              Ocurre cuando el Beyblade rival cae en cualquiera de las dos troneras laterales Over Zone del estadio Xtreme.
            </p>
          </div>

          {/* Spin Finish */}
          <div className="glass-panel p-5 rounded-2xl border-t-4 border-t-[#04A8FC] border-x border-b border-[#bec7d3]/40 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-headline font-black text-3xl text-[#04A8FC]">1 PT</span>
              <span className="material-symbols-outlined text-2xl text-[#04A8FC]">sync</span>
            </div>
            <h4 className="font-headline font-black text-base uppercase text-[#1a1c1e] dark:text-white">
              SPIN FINISH
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-body-text leading-relaxed">
              Ocurre cuando tu Beyblade continúa girando después de que el Beyblade rival se detiene por completo en el área de combate.
            </p>
          </div>
        </div>
      </div>

      {/* 3on3 Deck Battle Rules */}
      <div className="glass-panel p-6 rounded-2xl border border-[#bec7d3]/40 dark:border-white/10 space-y-4">
        <h3 className="font-headline font-black text-xl uppercase text-[#1a1c1e] dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#04A8FC]">format_list_numbered</span>
          <span>Formato de Combate 3on3 Deck</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400 font-body-text leading-relaxed">
          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl">
            <h5 className="font-headline font-bold text-sm uppercase text-[#1a1c1e] dark:text-white mb-1">
              1. Sin Repetición de Piezas
            </h5>
            <p>
              El Deck debe componerse de 3 Beyblades totalmente diferentes. Ninguna parte (Blade, Ratchet ni Bit) puede repetirse en los 3 slots.
            </p>
          </div>

          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl">
            <h5 className="font-headline font-bold text-sm uppercase text-[#1a1c1e] dark:text-white mb-1">
              2. Orden de Lanzamiento
            </h5>
            <p>
              Los Bladers eligen el orden de sus 3 beys en secreto (Slot 1, 2 y 3) antes de que inicie la partida. No se permite cambiar el orden durante el duelo.
            </p>
          </div>

          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl">
            <h5 className="font-headline font-bold text-sm uppercase text-[#1a1c1e] dark:text-white mb-1">
              3. Meta de Victoria
            </h5>
            <p>
              El primer Blader en acumular 4 o 5 puntos (según la configuración de la mesa) gana la partida y avanza en el bracket.
            </p>
          </div>
        </div>
      </div>

      {/* Formato Serie (Estilo Anime / 1 Ronda) Rules */}
      <div className="glass-panel p-6 rounded-2xl border-2 border-[#FF5500]/40 bg-gradient-to-r from-[#FF5500]/5 via-transparent to-transparent dark:border-[#FF5500]/30 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-black text-xl uppercase text-[#FF5500] flex items-center gap-2">
            <span className="material-symbols-outlined">tv</span>
            <span>Formato Serie (Estilo Anime / 1 Ronda)</span>
          </h3>
          <span className="text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-black border border-[#FF5500]/30">
            Regla Serie de TV
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400 font-body-text leading-relaxed">
          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-[#FF5500]/20">
            <h5 className="font-headline font-bold text-sm uppercase text-[#1a1c1e] dark:text-white mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#FF5500]">shield</span>
              <span>1. Un Solo Combo</span>
            </h5>
            <p>
              Cada Blader utiliza un único Beyblade insignia durante el enfrentamiento, recreando la fidelidad de las batallas de la serie de televisión.
            </p>
          </div>

          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-[#FF5500]/20">
            <h5 className="font-headline font-bold text-sm uppercase text-[#1a1c1e] dark:text-white mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#FF5500]">flash_on</span>
              <span>2. Una Sola Ronda Decisiva</span>
            </h5>
            <p>
              Duelo a muerte súbita: el primer Blader en asestar cualquier Finish (Xtreme, Burst, Over, Spin o expulsar al rival) gana el combate de inmediato.
            </p>
          </div>

          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-[#FF5500]/20">
            <h5 className="font-headline font-bold text-sm uppercase text-[#1a1c1e] dark:text-white mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#FF5500]">leaderboard</span>
              <span>3. Puntuación Acumulada</span>
            </h5>
            <p>
              Los puntos del tipo de finalización conseguida se suman al récord individual del Blader para el ranking general y clasificación acumulada.
            </p>
          </div>
        </div>
      </div>

      {/* Launch protocol & Penalties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-[#bec7d3]/40 dark:border-white/10 space-y-3">
          <h4 className="font-headline font-bold text-lg uppercase text-[#1a1c1e] dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">campaign</span>
            <span>Protocolo de Lanzamiento</span>
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4 font-body-text">
            <li>Llamado oficial: <strong>"3, 2, 1... GO SHOOT!"</strong></li>
            <li>El lanzamiento debe ocurrir exactamente al grito de <em>"SHOOT"</em>.</li>
            <li>El lanzador debe situarse por encima del borde del estadio sin tocar las paredes.</li>
            <li>Cualquier lanzamiento prematuro (mis-launch) otorga 1 advertencia; la segunda otorga 1 punto al rival.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[#bec7d3]/40 dark:border-white/10 space-y-3">
          <h4 className="font-headline font-bold text-lg uppercase text-[#1a1c1e] dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04A8FC]">speed</span>
            <span>Mecánica Xtreme Line (X-Dash)</span>
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4 font-body-text">
            <li>El engranaje del Bit se acopla a la cremallera del estadio para disparar el Beyblade a alta velocidad.</li>
            <li>Si un Beyblade salta fuera del estadio sin que haya mediado contacto directo por parte del oponente, se declara Stadium Out (+2 PTS para el rival).</li>
            <li>En caso de impacto simultáneo y detención al mismo tiempo, el juez declarará empate y se repetirá la ronda.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
