import { BeybladePart, Blader, BladerCombo, RegisteredCombo } from '../types';

/**
 * Robust parser for Beyblade X combo strings like:
 * - "Dransword 3-60F"
 * - "Phoenix Wing 9-60 GF"
 * - "Wizard Rod 5-70 Ball"
 * - "Shark Edge 4-80LF"
 * - "Hellscythe 4-60 T"
 */
export function extractPartsFromComboString(rawCombo: string): {
  blade: string;
  ratchet: string;
  bit: string;
} {
  const trimmed = rawCombo.trim();
  if (!trimmed) return { blade: '', ratchet: '', bit: '' };

  // Match ratchet pattern e.g. "3-60F", "3-60 F", "9-60GF", "5-70 B", "1-60 Flat"
  const ratchetMatch = trimmed.match(/\b(\d+-\d+)\s*([A-Za-z0-9]+)?/);
  if (ratchetMatch) {
    const fullMatch = ratchetMatch[0];
    const ratchet = ratchetMatch[1];
    const attachedBit = ratchetMatch[2] || '';
    const matchIndex = trimmed.indexOf(fullMatch);
    const blade = trimmed.substring(0, matchIndex).trim() || 'Dransword';
    const rest = trimmed.substring(matchIndex + fullMatch.length).trim();
    const bit = (attachedBit + (rest ? ` ${rest}` : '')).trim();

    return { blade, ratchet, bit };
  }

  // Fallback splitting by spaces
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { blade: parts[0], ratchet: '', bit: '' };
  }
  if (parts.length === 2) {
    return { blade: parts[0], ratchet: parts[1], bit: '' };
  }
  return {
    blade: parts[0] || 'Dransword',
    ratchet: parts[1] || '',
    bit: parts.slice(2).join(' ') || ''
  };
}

/**
 * Deduplicates and syncs pieces (Blade, Ratchet, Bit) from combos into the Parts Catalog.
 * Prevents duplicates (case-insensitive check).
 */
export function syncComboPiecesToCatalog(
  comboItems: (BladerCombo | RegisteredCombo | string)[],
  currentParts: BeybladePart[],
  onAddPart: (part: BeybladePart) => void
): BeybladePart[] {
  const existingNamesLower = new Set(
    currentParts.map((p) => p.name.trim().toLowerCase())
  );
  const newPartsAdded: BeybladePart[] = [];

  for (const item of comboItems) {
    let blade = '';
    let ratchet = '';
    let bit = '';

    if (typeof item === 'string') {
      const parsed = extractPartsFromComboString(item);
      blade = parsed.blade;
      ratchet = parsed.ratchet;
      bit = parsed.bit;
    } else {
      blade = item.blade?.trim() || '';
      ratchet = item.ratchet?.trim() || '';
      bit = item.bit?.trim() || '';
      if (!blade && !ratchet && !bit && 'name' in item && item.name) {
        const parsed = extractPartsFromComboString(item.name);
        blade = parsed.blade;
        ratchet = parsed.ratchet;
        bit = parsed.bit;
      }
    }

    if (blade && !existingNamesLower.has(blade.toLowerCase())) {
      existingNamesLower.add(blade.toLowerCase());
      const p: BeybladePart = {
        name: blade,
        type: 'Blade',
        category: 'Attack',
        description: `Blade registrada automáticamente de los combos del torneo.`
      };
      newPartsAdded.push(p);
      onAddPart(p);
    }

    if (ratchet && !existingNamesLower.has(ratchet.toLowerCase())) {
      existingNamesLower.add(ratchet.toLowerCase());
      const p: BeybladePart = {
        name: ratchet,
        type: 'Ratchet',
        category: 'Balance',
        description: `Ratchet registrado automáticamente en el torneo.`
      };
      newPartsAdded.push(p);
      onAddPart(p);
    }

    if (bit && !existingNamesLower.has(bit.toLowerCase())) {
      existingNamesLower.add(bit.toLowerCase());
      const p: BeybladePart = {
        name: bit,
        type: 'Bit',
        category: 'Attack',
        description: `Bit registrado automáticamente en el torneo.`
      };
      newPartsAdded.push(p);
      onAddPart(p);
    }
  }

  return newPartsAdded;
}

/**
 * Automatically creates/syncs RegisteredCombo entries for each combo in a blader's deck.
 */
export function createRegisteredCombosFromBlader(
  blader: Blader,
  existingCombos: RegisteredCombo[] = []
): RegisteredCombo[] {
  if (!blader.combos || blader.combos.length === 0) return [];

  return blader.combos.map((c, index) => {
    let blade = c.blade?.trim() || '';
    let ratchet = c.ratchet?.trim() || '';
    let bit = c.bit?.trim() || '';
    if (!blade && !ratchet && !bit && c.name) {
      const parsed = extractPartsFromComboString(c.name);
      blade = parsed.blade;
      ratchet = parsed.ratchet;
      bit = parsed.bit;
    }

    const slotNum = c.slot || index + 1;
    const comboId = `combo-${blader.id}-slot-${slotNum}`;

    // Preserve any existing photo/weight/notes if already uploaded
    const existing = existingCombos.find(
      (ec) =>
        ec.id === comboId ||
        (ec.bladerId === blader.id &&
          ec.blade.toLowerCase() === blade.toLowerCase() &&
          ec.ratchet.toLowerCase() === ratchet.toLowerCase() &&
          ec.bit.toLowerCase() === bit.toLowerCase())
    );

    // Infer archetype from bit / blade
    let inferredType: 'Attack' | 'Defense' | 'Stamina' | 'Balance' = existing?.type || 'Attack';
    const comboStr = `${blade} ${bit}`.toLowerCase();
    if (!existing?.type) {
      if (
        comboStr.includes('ball') ||
        comboStr.includes('orb') ||
        comboStr.includes('disc ball') ||
        comboStr.includes('rod') ||
        comboStr.includes('arrow')
      ) {
        inferredType = 'Stamina';
      } else if (
        comboStr.includes('needle') ||
        comboStr.includes('shield') ||
        comboStr.includes('hex') ||
        comboStr.includes('chain') ||
        comboStr.includes('knight')
      ) {
        inferredType = 'Defense';
      } else if (
        comboStr.includes('point') ||
        comboStr.includes('taper') ||
        comboStr.includes('unite') ||
        comboStr.includes('scythe') ||
        comboStr.includes('viper')
      ) {
        inferredType = 'Balance';
      }
    }

    return {
      id: comboId,
      bladerId: blader.id,
      bladerName: blader.name,
      blade: blade || 'Dransword',
      ratchet: ratchet || '3-60',
      bit: bit || 'F',
      type: inferredType,
      image: existing?.image,
      weight: existing?.weight,
      notes: existing?.notes || `Combo Deck Slot #${slotNum} de ${blader.name} (${blader.team || 'Comunidad Cúcuta'})`,
      createdAt: existing?.createdAt || new Date().toISOString()
    };
  });
}
