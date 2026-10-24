# Requirements: Jornadas-Based Classification & Playoffs Top Cut

## Purpose
Align tournament mechanics and configuration with official Beyblade X community regulations: Phase 1 (Fase Regular) is defined by a configured number of **Jornadas** (Rounds / Matchdays, e.g. 8 Jornadas), where qualification to Playoffs (Fase Eliminatoria) is determined by the **Top Cut** of the leaderboard ranking (e.g. Top 8 $\rightarrow$ Cuartos de Final $\rightarrow$ Semifinales $\rightarrow$ Gran Final), completely replacing the obsolete minimum points threshold ("Meta de puntos 17 PTS").

## Scope
1. **Configurable Regular Jornadas:** Organizer selects the number of Jornadas for the regular phase (presets: 4, 6, 8, 10, or custom number, default: 8 Jornadas).
2. **Top Cutoff Selection:** Selection of playoff tier:
   - **Top 8:** Cuartos de Final $\rightarrow$ Semifinales $\rightarrow$ Gran Final (1º vs 8º, 4º vs 5º, 2º vs 7º, 3º vs 6º).
   - **Top 4:** Semifinales $\rightarrow$ Gran Final (1º vs 4º, 2º vs 3º).
   - **Top 2:** Gran Final Directa (1º vs 2º).
3. **Removal of Point Threshold Requirement:** Qualification is determined solely by the standings after completing the scheduled Jornadas (Wins first, then total battle points and finish tiebreaks).
4. **Leaderboard Classification Zones:** Visual cues in standings indicating the top qualified positions ("Zona de Clasificación a Cuartos de Final").
5. **Playoffs Trigger:** When all matches in the configured Jornadas conclude, enable automated/manual transition to the elimination tree seeded by final regular season rankings.

## Numbered Acceptance Criteria (EARS Syntax)

1. **WHILE** viewing the Tournament Format Screen (`TournamentFormatScreen.tsx`), **THE SYSTEM SHALL** display the "Cantidad de Jornadas Regulares (Rondas)" configuration with quick presets (4, 6, 8, 10) and an editable input, and **SHALL NOT** display the obsolete "Meta de puntos (17 PTS)" condition.
2. **WHEN** the tournament bracket is generated for League/Series format, **THE SYSTEM SHALL** schedule matches partitioned into the configured number of Jornadas (`totalJornadas`, default 8).
3. **WHEN** generating playoffs (`generatePlayoffBracketFromRankings`), **THE SYSTEM SHALL** qualify the top $N$ bladers (`playoffCutoffCount`, default 8) directly from the sorted standings without excluding players based on an arbitrary points minimum.
4. **WHEN** the Top 8 cutoff is active and playoffs are triggered, **THE SYSTEM SHALL** generate:
   - 4 Cuartos de Final matches: Seed 1 vs Seed 8, Seed 4 vs Seed 5, Seed 2 vs Seed 7, Seed 3 vs Seed 6.
   - 2 Semifinal matches linked to the winners of Cuartos.
   - 1 Gran Final match linked to the winners of Semifinales.
5. **WHILE** viewing the Standings / Leaderboard table in `BracketScreen.tsx`, **THE SYSTEM SHALL** visually highlight the top $N$ qualifying rows with a golden/cyan badge indicating their qualification to the next round.
6. **WHEN** all scheduled matches across all regular Jornadas are completed, **THE SYSTEM SHALL** prompt the organizer with a prominent action to proceed to Playoffs.
