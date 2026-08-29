export interface OfficialBit {
  name: string;
  code: string;
  category: 'Attack' | 'Defense' | 'Stamina' | 'Balance';
  categoryEs: 'Ataque' | 'Defensa' | 'Resistencia' | 'Equilibrio';
  description: string;
}

export const OFFICIAL_BITS: OfficialBit[] = [
  // --- ATAQUE (ATTACK) ---
  { name: 'Flat', code: 'F', category: 'Attack', categoryEs: 'Ataque', description: 'Punta plana clásica con alta velocidad y tracción agresiva en el X-Line.' },
  { name: 'Level', code: 'L', category: 'Attack', categoryEs: 'Ataque', description: 'Punta con relieve concéntrico para maniobras de choque y aceleración nivelada.' },
  { name: 'Rush', code: 'R', category: 'Attack', categoryEs: 'Ataque', description: 'Punta dentada estrecha diseñada para impactos en ráfaga continuos.' },
  { name: 'Cyclone', code: 'C', category: 'Attack', categoryEs: 'Ataque', description: 'Punta con aspas espirales que generan trayectorias ciclónicas agresivas.' },
  { name: 'Quake', code: 'Q', category: 'Attack', categoryEs: 'Ataque', description: 'Punta biselada asimétrica que provoca rebotes caóticos y ataques aéreos.' },
  { name: 'Low Rush', code: 'LR', category: 'Attack', categoryEs: 'Ataque', description: 'Variante de baja altura de Rush para golpear bajo el centro de gravedad rival.' },
  { name: 'Under Flat', code: 'UF', category: 'Attack', categoryEs: 'Ataque', description: 'Punta extra-baja plana diseñada para barridos y levantamientos desde abajo.' },
  { name: 'Low Flat', code: 'LF', category: 'Attack', categoryEs: 'Ataque', description: 'Punta plana rebajada para penetrar defensas pesadas con X-Dash constante.' },
  { name: 'Vortex', code: 'V', category: 'Attack', categoryEs: 'Ataque', description: 'Punta con ranuras de vórtice que incrementa el agarre durante el contacto.' },
  { name: 'Accel', code: 'A', category: 'Attack', categoryEs: 'Ataque', description: 'Punta de aceleración rápida con excelente respuesta al lanzamiento inclinado.' },
  { name: 'Gear Flat', code: 'GF', category: 'Attack', categoryEs: 'Ataque', description: 'Punta dentada con engranaje extendido para un enganche superrápido al riel X-Dash.' },
  { name: 'Gear Rush', code: 'GR', category: 'Attack', categoryEs: 'Ataque', description: 'Fusión de engranajes de alta velocidad con ráfagas continuas de impacto.' },
  { name: 'Rubber Accel', code: 'RA', category: 'Attack', categoryEs: 'Ataque', description: 'Punta con núcleo de goma para una aceleración explosiva y fricción extrema.' },

  // --- RESISTENCIA (STAMINA) ---
  { name: 'Gear Ball', code: 'GB', category: 'Stamina', categoryEs: 'Resistencia', description: 'Punta esférica con engranaje dentado para contraataques de resistencia activa.' },
  { name: 'Disc Ball', code: 'DB', category: 'Stamina', categoryEs: 'Resistencia', description: 'Esfera rodeada por un disco estabilizador que previene caídas por inclinación.' },
  { name: 'Free Ball', code: 'FB', category: 'Stamina', categoryEs: 'Resistencia', description: 'Esfera de rotación libre que minimiza la fricción con el piso del estadio.' },
  { name: 'Wall Ball', code: 'WB', category: 'Stamina', categoryEs: 'Resistencia', description: 'Punta con barrera perimetral que absorbe impactos contra las paredes del estadio.' },
  { name: 'Glide', code: 'G', category: 'Stamina', categoryEs: 'Resistencia', description: 'Punta de deslizamiento suave con rodamiento de mínima resistencia al giro.' },
  { name: 'Ball', code: 'B', category: 'Stamina', categoryEs: 'Resistencia', description: 'Punta esférica clásica de máxima estabilidad y preservación de energía centrífuga.' },
  { name: 'Orb', code: 'O', category: 'Stamina', categoryEs: 'Resistencia', description: 'Punta semi-esférica que combina permanencia en el centro con recuperación.' },
  { name: 'Low Orb', code: 'LO', category: 'Stamina', categoryEs: 'Resistencia', description: 'Punta esférica compacta rebajada para un giro prolongado y centro de gravedad bajo.' },

  // --- DEFENSA (DEFENSE) ---
  { name: 'Dot', code: 'D', category: 'Defense', categoryEs: 'Defensa', description: 'Punta cónica con relieve punteado para un anclaje firme ante ataques directos.' },
  { name: 'Metal Needle', code: 'MN', category: 'Defense', categoryEs: 'Defensa', description: 'Punta de aguja metálica con alto peso centralizado para absorción de impactos.' },
  { name: 'Spike', code: 'S', category: 'Defense', categoryEs: 'Defensa', description: 'Punta cónica afilada para posicionamiento estricto en el eje central del Beystadium.' },
  { name: 'High Needle', code: 'HN', category: 'Defense', categoryEs: 'Defensa', description: 'Punta de aguja elevada que otorga ventaja de altura sobre atacantes bajos.' },
  { name: 'Under Needle', code: 'UN', category: 'Defense', categoryEs: 'Defensa', description: 'Punta de aguja de perfil bajo para desviar golpes dirigidos al ratchet.' },
  { name: 'Bound Spike', code: 'BS', category: 'Defense', categoryEs: 'Defensa', description: 'Punta con resorte interno amortiguador que disipa la energía de colisión.' },
  { name: 'Gear Needle', code: 'GN', category: 'Defense', categoryEs: 'Defensa', description: 'Aguja defensiva con engranajes para activar defensas reactivas en el riel.' },
  { name: 'Needle', code: 'N', category: 'Defense', categoryEs: 'Defensa', description: 'Punta cónica estándar de defensa sólida y resistencia a ser empujado a bolsillos.' },
  { name: 'Wedge', code: 'W', category: 'Defense', categoryEs: 'Defensa', description: 'Punta en cuña plana diseñada para disipar impactos pesados sin volcar.' },

  // --- EQUILIBRIO (BALANCE) ---
  { name: 'Taper', code: 'T', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta cónica escalonada que combina velocidad orbital con estabilidad central.' },
  { name: 'High Taper', code: 'HT', category: 'Balance', categoryEs: 'Equilibrio', description: 'Variante alta de Taper para atacar desde ángulos descendentes y mantener estabilidad.' },
  { name: 'Unite', code: 'U', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta híbrida que cambia de modo pasivo a agresivo según la inclinación.' },
  { name: 'Gear Point', code: 'GP', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta semi-plana con engranajes para transiciones entre ataque y resistencia.' },
  { name: 'Elevate', code: 'E', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta ancha con faldón que recupera el equilibrio tras impactos críticos.' },
  { name: 'Hexa', code: 'H', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta hexagonal multifacética que alterna entre resistencia y contraataque.' },
  { name: 'Point', code: 'P', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta con una pequeña punta central sobre base ancha para control dual.' },
  { name: 'Trans Point', code: 'TP', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta con mecanismo de cambio dinámico de trayectoria durante el combate.' },
  { name: 'Kick', code: 'K', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta con pestañas que patean el suelo para saltar o redirigir el giro.' },
  { name: 'Trans Kick', code: 'TK', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta oscilante con reacción de resorte para esquivar y contraatacar.' },
  { name: 'Merge', code: 'M', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta combinada de doble material para agarre dinámico y giro prolongado.' },
  { name: 'Zap', code: 'Z', category: 'Balance', categoryEs: 'Equilibrio', description: 'Punta electrificante de respuesta rápida que cambia de ritmo al colisionar.' }
];

/**
 * Normalizes and extracts the category for any Bit name or acronym.
 */
export function getBitCategory(bitRaw: string): 'Attack' | 'Defense' | 'Stamina' | 'Balance' {
  if (!bitRaw) return 'Attack';
  const clean = bitRaw.trim().toLowerCase();

  // Direct match by full name or code
  for (const bit of OFFICIAL_BITS) {
    if (
      clean === bit.name.toLowerCase() ||
      clean === bit.code.toLowerCase() ||
      clean.endsWith(` ${bit.code.toLowerCase()}`) ||
      clean.startsWith(`${bit.name.toLowerCase()} `)
    ) {
      return bit.category;
    }
  }

  // Keywords check for partial strings
  // STAMINA
  if (
    clean.includes('ball') ||
    clean.includes('orb') ||
    clean.includes('glide') ||
    clean.includes('disc ball') ||
    clean.includes('free ball') ||
    clean.includes('wall ball') ||
    clean === 'b' ||
    clean === 'gb' ||
    clean === 'db' ||
    clean === 'fb' ||
    clean === 'wb' ||
    clean === 'g' ||
    clean === 'o' ||
    clean === 'lo'
  ) {
    return 'Stamina';
  }

  // DEFENSE
  if (
    clean.includes('needle') ||
    clean.includes('spike') ||
    clean.includes('wedge') ||
    clean.includes('dot') ||
    clean === 'd' ||
    clean === 'mn' ||
    clean === 's' ||
    clean === 'hn' ||
    clean === 'un' ||
    clean === 'bs' ||
    clean === 'gn' ||
    clean === 'n' ||
    clean === 'w'
  ) {
    return 'Defense';
  }

  // BALANCE
  if (
    clean.includes('point') ||
    clean.includes('taper') ||
    clean.includes('unite') ||
    clean.includes('elevate') ||
    clean.includes('hexa') ||
    clean.includes('kick') ||
    clean.includes('merge') ||
    clean.includes('zap') ||
    clean === 't' ||
    clean === 'ht' ||
    clean === 'u' ||
    clean === 'gp' ||
    clean === 'e' ||
    clean === 'h' ||
    clean === 'p' ||
    clean === 'tp' ||
    clean === 'k' ||
    clean === 'tk' ||
    clean === 'm' ||
    clean === 'z'
  ) {
    return 'Balance';
  }

  // ATTACK (Default for aggressive bits)
  return 'Attack';
}

/**
 * Infer category from Blade name
 */
export function getBladeCategory(bladeRaw: string): 'Attack' | 'Defense' | 'Stamina' | 'Balance' {
  if (!bladeRaw) return 'Attack';
  const clean = bladeRaw.trim().toLowerCase();

  // DEFENSE BLADES
  if (
    clean.includes('shield') ||
    clean.includes('knight') ||
    clean.includes('rhino') ||
    clean.includes('sphinx') ||
    clean.includes('shell') ||
    clean.includes('crest')
  ) {
    return 'Defense';
  }

  // STAMINA BLADES
  if (
    clean.includes('rod') ||
    clean.includes('arrow') ||
    clean.includes('viper') ||
    clean.includes('rudder') ||
    clean.includes('wolf') ||
    clean.includes('kronos')
  ) {
    return 'Stamina';
  }

  // BALANCE BLADES
  if (
    clean.includes('hells') ||
    clean.includes('scythe') ||
    clean.includes('hammer') ||
    clean.includes('chain') ||
    clean.includes('feather') ||
    clean.includes('shinobi') ||
    clean.includes('garuda') ||
    clean.includes('nyx') ||
    clean.includes('unicorn')
  ) {
    return 'Balance';
  }

  // ATTACK BLADES (Dransword, SharkEdge, DranBuster, PhoenixWing, Tyranno, Drake, etc.)
  return 'Attack';
}
