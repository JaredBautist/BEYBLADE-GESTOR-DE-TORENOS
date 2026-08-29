export interface BladerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  category: 'champion' | 'finish' | 'style' | 'community';
}

export const OFFICIAL_BADGES: BladerBadge[] = [
  {
    id: 'badge-champion',
    name: 'Campeón Supremo',
    description: 'Ha conquistado el primer lugar en un torneo oficial de la Comunidad.',
    icon: 'military_tech',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/40',
    category: 'champion'
  },
  {
    id: 'badge-finalist',
    name: 'Subcampeón de Liga',
    description: 'Llegó a la Gran Final y disputó el título máximo.',
    icon: 'emoji_events',
    color: 'text-slate-300',
    bgColor: 'bg-slate-400/15',
    borderColor: 'border-slate-400/40',
    category: 'champion'
  },
  {
    id: 'badge-xtreme-king',
    name: 'Rey del Xtreme Dash',
    description: 'Especialista en remates Xtreme (+3 Pts) usando el X-Celerator Rail.',
    icon: 'bolt',
    color: 'text-[#04A8FC]',
    bgColor: 'bg-[#04A8FC]/15',
    borderColor: 'border-[#04A8FC]/40',
    category: 'finish'
  },
  {
    id: 'badge-burst-master',
    name: 'Burst Master',
    description: 'Experto en desarmar el ratchet y bit rival con impacto contundente (+2 Pts).',
    icon: 'explosion',
    color: 'text-[#DC2626]',
    bgColor: 'bg-[#DC2626]/15',
    borderColor: 'border-[#DC2626]/40',
    category: 'finish'
  },
  {
    id: 'badge-over-hunter',
    name: 'Over Finish Hunter',
    description: 'Especialista en expulsar al oponente a la Over Zone (+2 Pts).',
    icon: 'cyclone',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/40',
    category: 'finish'
  },
  {
    id: 'badge-spin-king',
    name: 'Muralla Centrífuga',
    description: 'Dominio absoluto de la estamina y estabilidad de giro (+1 Pt).',
    icon: 'motion_photos_on',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/40',
    category: 'style'
  },
  {
    id: 'badge-shutout',
    name: 'Victoria Perfecta',
    description: 'Ganó un enfrentamiento oficial 4-0 sin recibir ningún punto en contra.',
    icon: 'verified',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/40',
    category: 'finish'
  },
  {
    id: 'badge-deck-builder',
    name: 'Deck Maestro 3on3',
    description: 'Tiene registrados 3 combos oficiales legales optimizados para torneo.',
    icon: 'style',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/40',
    category: 'style'
  },
  {
    id: 'badge-veteran',
    name: 'Veterano de Cúcuta',
    description: 'Blader activo con más de 10 combates registrados en la plataforma.',
    icon: 'shield_moon',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/15',
    borderColor: 'border-yellow-500/40',
    category: 'community'
  },
  {
    id: 'badge-official-member',
    name: 'Blader Oficial Cúcuta',
    description: 'Miembro verificado y registrado en el padrón de la liga local.',
    icon: 'id_card',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/40',
    category: 'community'
  }
];
