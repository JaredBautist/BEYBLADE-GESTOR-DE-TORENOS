# Tasks: Jornadas-Based Classification & Playoffs Top Cut

- [ ] 1. Types & Initial Data Updates (`src/types.ts` & `src/data/initialData.ts`)
  - [ ] Add `totalJornadas?: number` to `TournamentFormatConfig` and `TournamentConfig`.
  - [ ] Update `INITIAL_CONFIG`: `totalJornadas: 8`, `playoffCutoffCount: 8`, `playoffCutoffType: 'top_n'`.
  - *Acceptance Check:* `bun x tsc --noEmit` passes with 0 errors.

- [ ] 2. Bracket Generator Logic (`src/utils/bracketGenerator.ts`)
  - [ ] In `generateRegularPhaseMatches`, generate matches up to `config.totalJornadas || 8`.
  - [ ] In `generatePlayoffBracketFromRankings`, remove `minPointsToQualify` filter and qualify the top $N$ ranked bladers directly from standings.
  - [ ] Ensure `getRankedBladers` prioritizes Wins first, then Points Scored, then Finishes.
  - *Acceptance Check:* Unit/E2E test generates exactly configured Jornadas and seeds Top 8 into Cuartos de Final.

- [ ] 3. Tournament Format Screen UI Redesign (`src/components/screens/TournamentFormatScreen.tsx`)
  - [ ] Replace "Meta de Puntos (Condición)" card with "Cantidad de Jornadas Regulares (Rondas)".
  - [ ] Add preset buttons: 4, 6, 8 (Recomendado), 10 Jornadas, and numeric input.
  - [ ] Set Top 8 as the default cutoff option (Cuartos de Final).
  - [ ] Apply changes to both Liga and Serie format sections.
  - *Acceptance Check:* Visual inspection and tests confirm "Meta de Puntos (17 PTS)" is replaced by "Cantidad de Jornadas".

- [ ] 4. Bracket Screen UI Enhancements (`src/components/screens/BracketScreen.tsx`)
  - [ ] Display Top Cut classification zone badges on standings table (Rows 1 to $N$).
  - [ ] Display Jornadas filter selector (`Jornada 1`, `Jornada 2`, ... `Jornada N`).
  - [ ] Update summary banners to reflect Jornadas completed.
  - *Acceptance Check:* Bracket screen clearly shows Top 8 qualifying zone and Jornadas navigation.

- [ ] 5. Playwright E2E Verification Suite (`src/tests/test_jornadas_playoffs.ts`)
  - [ ] Verify Format screen configures 8 Jornadas and Top 8 cutoff.
  - [ ] Verify bracket generator produces matches partitioned across the configured Jornadas.
  - [ ] Simulate completion of regular Jornadas and verify Top 8 advances to Cuartos de Final without any point threshold restriction.
  - [ ] Verify winners of Cuartos advance to Semifinales and then Gran Final.
  - *Acceptance Check:* 100% of test assertions pass.
