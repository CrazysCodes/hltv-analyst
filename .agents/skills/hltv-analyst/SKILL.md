---
name: hltv-analyst
description: Use when analyzing HLTV CS2/CS:GO data with OpenCLI: player duels, BO1/BO3/BO5 match reviews, pressure-game soft-leg/hard-crab judgments, player scouting, map pools, rivalry history, team/event form, upset candidates, carry/backpack narratives, or Chinese esports analysis based on hltv CLI outputs.
---

# HLTV Analyst

Use this skill to turn `opencli hltv` fact rows into Chinese analysis. Keep the boundary clean:

- CLI provides structured facts.
- You provide interpretation, uncertainty, and readable narrative.
- Never present memes such as “软脚虾” as objective truth without evidence and caveats.

## Quick Commands

Use JSON for analysis inputs:

```bash
opencli hltv player-duel --playerA 3741/niko --playerB 21167/donk -f json
opencli hltv player-duel --playerA 3741/niko --playerB 21167/donk --mode history --limit 10 -f json
opencli hltv match-series --match <match-or-series-url> -f json
opencli hltv player-form --player 3741/niko --limit 30 -f json
opencli hltv player-map-pool --player 3741/niko --limit 100 -f json
opencli hltv team-map-pool --team 6667/falcons --limit 100 -f json
opencli hltv player-vs-team --player 3741/niko --team 7020/spirit --limit 100 -f json
opencli hltv event-matches --event 8301 --limit 100 -f json
```

If names are ambiguous, resolve them with:

```bash
opencli hltv search --query <name> -f json
```

## Player Alias Resolution

When users mention Chinese nicknames, memes, partial names, or non-HLTV aliases, resolve the player before analysis:

1. Check the local alias seed below.
2. If no exact alias matches, search the most likely romanized nickname with `opencli hltv search --query <name> -f json`.
3. If several players match, prefer active tier-one context from the user’s team/event clue; otherwise ask a short clarification.
4. State the resolved `id/slug` once before analysis when the alias is non-obvious.

Alias seed:

| Alias | Resolve to |
| --- | --- |
| 荆芥 | `24177/kyousuke` |
| 载物 | `11893/zywoo` |
| 森破 | `7998/s1mple` |
| 尼公子, niko | `3741/niko` |
| 太子, mo, m0, m0nesy | `19230/m0nesy` |
| donk | `21167/donk` |
| 大表哥, karrigan | `429/karrigan` |

## Workflows

### Player Duel

For “A 和 B 上次交手谁压谁”:

1. Run `player-duel --playerA A --playerB B -f json`.
2. Read `summary` first, then map rows.
3. Compare ratingDiff, killDiff, directKillDiff, and key-map swings.
4. Explain direct kill data only when non-null; same-team or old pages may lack matrix data.

### Match Review

For “复盘这场 BO3/BO5”:

1. Run `match-series --match URL -f json`.
2. Use summary rows for series score and team-level average rating.
3. Use map rows for map-by-map control.
4. Use player rows to identify carry, low-impact players, decider performers, and swing maps.
5. Keep the report concise: result, map story, top performers, weak links, turning point.

### Pressure Check

For “是不是软脚/硬脚/压力局表现”:

1. Run `match-series --match URL -f json`.
2. Run `player-form --player PLAYER --limit 30 -f json` as baseline.
3. Compare the player’s series rating, K-D, ADR/KAST, and final played map against baseline.
4. Default verdicts:
   - `hardCrab`: clearly above baseline, strong final/decider map, high responsibility output.
   - `normal`: close to baseline or mixed evidence.
   - `softShrimp`: clearly below baseline, poor final/decider map, low impact in a star role.
5. Always include evidence, confidence, and caveat. Do not claim the match was an elimination game unless the user supplied that context or the data clearly proves it.

### Scout Report

For “球探报告/最近状态/地图池/对强队表现”:

1. Run `player-form --limit 30` or `--limit 50`.
2. Run `player-map-pool --limit 100`.
3. Optionally run `player-vs-team` for a named opponent.
4. Report strengths, weak maps, volatility, recent trend, and useful caveats about sample size.

### Rivalry History

For “长期交手/宿敌关系”:

1. Run `player-duel --mode history --limit 10 -f json`.
2. Summarize series/maps covered, aggregate rating/kills/direct kills, and recent trend.
3. Call out sample-size limits if scanPages/limit is small.

### Upset Candidates

For “赛事里有没有冷门/爆冷”:

1. Run `event-matches --event EVENT --limit 100 -f json`.
2. Optionally inspect teams with `team-matches` or `team-map-pool`.
3. Without odds/ranking snapshots, phrase as “数据层面的冷门候选”, not definitive betting upset.

## Output Style

- Prefer Chinese.
- Lead with the answer, then evidence.
- Use small tables when comparing maps or players.
- Mention command limitations when relevant: sample size, missing kill matrix, unknown bracket/elimination context, or HLTV DOM availability.
- Keep jokes lightweight; evidence comes first.
