# Design: Jornadas-Based Classification & Playoffs Top Cut

## Architecture & Data Flow

```
TournamentConfig
 ├── totalJornadas: number (Default: 8)
 ├── playoffCutoffCount: 8 | 4 | 2 (Default: 8)
 └── playoffCutoffType: 'top_n'

Phase 1: Fase Regular (Jornadas 1..N)
 ├── Matches grouped & scheduled into N Jornadas
 └── Standings table sorted by: Wins (primary) -> Points Scored -> Finishes

Phase 2: Corte a Playoffs
 ├── Top 8 ranked bladers advance unconditionally (no min-points filter)
 └── Elimination Bracket:
      ├── Cuartos de Final: (1 vs 8), (4 vs 5), (2 vs 7), (3 vs 6)
      ├── Semifinales: Winners of QF
      └── Gran Final: Winners of SF
```

## Schema Changes (`src/types.ts`)
```typescript
export interface TournamentFormatConfig {
  ...
  totalJornadas?: number; // Total regular phase rounds/jornadas (default: 8)
  playoffCutoffCount?: 8 | 4 | 2; // Top 8 Cuartos, Top 4 Semis, Top 2 Final
}
```

## Bracket Generator Updates (`src/utils/bracketGenerator.ts`)
1. **`generateRegularPhaseMatches`**:
   - Accepts `config.totalJornadas` (default 8).
   - Rotates pairings so that exactly `totalJornadas` are scheduled with balanced matchups for each blader.
2. **`generatePlayoffBracketFromRankings`**:
   - Removes `minPointsToQualify` exclusion.
   - Slices top `targetCount` directly from `ranked`.
   - Produces standard seed brackets (1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6).

## UI/UX Improvements (`ui-ux-pro-max` + `emil-design-eng`)
1. **`TournamentFormatScreen.tsx`**:
   - Replace "Meta de Puntos (Condición)" input with **"Cantidad de Jornadas Regulares (Rondas)"**.
   - Preset chips: `4 Jornadas`, `6 Jornadas`, `8 Jornadas (Estándar)`, `10 Jornadas`, plus numeric stepper input.
   - Highlight Top 8 as the default and recommended Cutoff tier.
2. **`BracketScreen.tsx`**:
   - Standings table includes visual classification marker: green/gold left border and pill badge `"ZONA CLASIFICACIÓN (TOP 8)"` for rows 1 to 8.
   - Jornada filter buttons (`Todas`, `Jornada 1`, `Jornada 2`... `Jornada 8`).
   - Callout banner showing regular phase status: `"Jornada X de 8 • X% completado"`.

## ADR: Rounds-Based Classification vs Point Threshold
- **Context:** Previous prototype used an arbitrary point threshold (e.g. 17 pts). In tournament formats, matches are scheduled in rounds/jornadas where every participant has equal opportunity, and rank is determined relative to the competitors.
- **Decision:** Switch to rounds/jornadas configuration and strict Top Cut without point threshold.
- **Consequences:** Eliminates edge-case scenarios where fewer than 8 bladers reach an arbitrary score, guaranteeing a clean, competitive 8-player playoff bracket.
