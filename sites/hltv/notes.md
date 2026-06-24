## 2026-06-20 by Codex
Expanded HLTV data-layer commands and added a project-level analysis skill:
- Added `hltv/match-series`, which expands match URLs, stats series URLs, or mapstats URLs into summary/map/player rows. OpenCLI row-shape checks require `matchStatsId` at top level, so high-cardinality stats stay in flat `details`.
- Added `hltv/event-matches` from `/stats/matches?event=:eventId`; the visible stats matches table is map-level and links directly to mapstats pages.
- Added `hltv/player-map-pool`, `hltv/player-vs-team`, and `hltv/player-teammate-impact` as derived commands over the existing player matches table.
- Added `hltv/team-matches` from the ordinary `/team/:teamId/:slug` profile page. Fresh browser sessions can stall on `/stats/teams/matches/:teamId/:slug`, while the profile page's `tr.team-row` recent results are stable and visible.
- Added `hltv/team-map-pool` from `/stats/teams/maps/:teamId/:slug`, warmed up through the team profile first. The top map-pool links expose every map's win rate; only the selected map's `.two-grid` exposes full record/pick/ban/round metrics in v1.
- Extended `hltv/player-duel --mode history`; exact `--match` and default `lastEncounter` behavior remain unchanged.
- Added project skill `.agents/skills/hltv-analyst/` for Chinese analysis workflows over the CLI facts: duel interpretation, match review, pressure-check/soft-leg labels, scouting, rivalry, and upset candidates.
- Verify fixtures were written and re-run for: `match-series`, `team-matches`, `event-matches`, `player-map-pool`, `player-vs-team`, `team-map-pool`, and `player-teammate-impact`.

## 2026-06-19 by Codex
Implemented first-pass HLTV adapters:
- `hltv/search` parses the four visible result tables: Player, Team, Event, Article.
- `hltv/player-summary` parses `.playerProfile` and summary stats, and exposes the Complete statistics URL.
- `hltv/player-matches` parses `.stats-player-matches .stats-matches-table`; filtering is URL-param based and pagination uses `offset=100`.
- HLTV pages inspected are Pattern C: Cloudflare cookie observed, no real-data JSON XHR or hydration state. Use `Strategy.UI` with browser session DOM parsing.
- OpenCLI row shape allows at most 12 top-level keys, so wide summary/match context is stored in shallow `roles` / `details` objects.

## 2026-06-19 by Codex
Enhanced HLTV adapters:
- `hltv/player-form` reuses the player matches page and aggregates recent map rows into `summary`, `map`, and `opponent` groups. It does not visit individual match pages.
- `hltv/match-map` parses `/stats/matches/mapstatsid/:id/:slug`. The page has one visible `table.stats-table.totalstats` per team, with player links under `/stats/players/:playerId/:slug`.
- Map metadata is visible in `.match-info-box`: event, datetime, map, team names, and scores. Player stat rows expose traditional visible columns via `.st-opkd`, `.st-mks`, `.st-kast`, `.st-clutches`, `.st-kills`, `.st-assists`, `.st-deaths`, `.st-adr`, `.st-roundSwing`, and `.st-rating`.
- Hidden eco-adjusted columns are present but intentionally ignored in v1.

## 2026-06-19 by Codex
Added `hltv/player-duel` planning/implementation notes:
- The safest duel unit is a shared `mapstatsid`: compare two players from the same mapstats page, then optionally aggregate those map rows.
- Ordinary `/matches/:matchId/:slug` pages expose visible `STATS` links for each map and a `Detailed stats` link for the series page.
- `/stats/matches/:seriesStatsId/:slug` pages expose the same mapstats links in the map tabs, so BO3/BO5 expansion can use DOM links rather than guessing IDs.
- Direct player-vs-player kills are visible on `/stats/matches/performance/mapstatsid/:id/:slug` in the first Kill matrix table. A cell like `7:6` at row `m0NESY`, column `w0nderful` means m0NESY killed w0nderful 7 times and w0nderful killed m0NESY 6 times.
- Same-team player comparisons have no direct kill matrix matchup; keep map stat comparison and set direct kill fields to `null`.

## 2026-06-19 by Codex
Changed `hltv/player-duel` default broad behavior:
- Default mode is now `lastEncounter`: use playerA recent maps as the ordered candidate source, prefilter with playerB recent `matchStatsId`s, then open only the first shared mapstats page.
- Once the first shared mapstats page is found, resolve its stats series URL and expand the full BO1/BO3/BO5 into all played maps.
- Old two-list intersection behavior is still available explicitly with `--mode intersection`.
- `opencli browser verify` is kept on an exact stats series URL because wrapper verification is brittle for the longer default candidate scan; the default `lastEncounter` output is stored separately in fixtures.
