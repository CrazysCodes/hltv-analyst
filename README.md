# hltv-analyst

HLTV OpenCLI adapters plus a Codex analysis skill for CS2/CS:GO match, player, duel, form, and map-pool analysis.

This project is split into two layers:

- **OpenCLI adapters** in `clis/hltv/`: structured data extraction from visible HLTV pages.
- **Codex skill** in `.agents/skills/hltv-analyst/`: Chinese analysis workflows built on top of the CLI facts.

## Commands

Current HLTV commands:

```bash
opencli hltv search --query niko
opencli hltv player-summary --player 3741/niko
opencli hltv player-matches --player 3741/niko --limit 30
opencli hltv player-form --player 19230/m0nesy --limit 30
opencli hltv match-map --match https://www.hltv.org/stats/matches/mapstatsid/231594/falcons-vs-natus-vincere
opencli hltv player-duel --playerA 3741/niko --playerB 21167/donk
opencli hltv player-duel --playerA 3741/niko --playerB 21167/donk --mode history
opencli hltv match-series --match https://www.hltv.org/stats/matches/126993/spirit-vs-falcons
opencli hltv team-matches --team 11283/falcons --limit 10
opencli hltv event-matches --event 8301 --limit 10
opencli hltv player-vs-team --player 3741/niko --team 7020/spirit --limit 50
opencli hltv player-map-pool --player 3741/niko --limit 50
opencli hltv team-map-pool --team 11283/falcons
opencli hltv player-teammate-impact --playerA 3741/niko --playerB 19230/m0nesy --limit 50
```

Use JSON when feeding data to an agent:

```bash
opencli hltv player-duel --playerA 3741/niko --playerB 21167/donk -f json
```

## Install Locally

Install the OpenCLI adapters:

```bash
mkdir -p ~/.opencli/clis
cp -R clis/hltv ~/.opencli/clis/hltv
```

Optionally install the site memory used by `opencli browser verify`:

```bash
mkdir -p ~/.opencli/sites
cp -R sites/hltv ~/.opencli/sites/hltv
```

The Codex skill can be used from this repo as a project skill. To install it globally:

```bash
mkdir -p ~/.codex/skills
cp -R .agents/skills/hltv-analyst ~/.codex/skills/hltv-analyst
```

## Verify

Static check:

```bash
node --check clis/hltv/*.js
```

Browser verify examples:

```bash
opencli browser verify hltv/player-duel
opencli browser verify hltv/match-series
opencli browser verify hltv/team-matches
opencli browser verify hltv/event-matches
opencli browser verify hltv/player-map-pool
opencli browser verify hltv/team-map-pool
opencli browser verify hltv/player-teammate-impact
```

## Notes

- Strategy is `UI_SELECTOR` / visible DOM. HLTV pages are protected by Cloudflare, so adapters use browser sessions instead of raw HTTP fetches.
- The CLI layer tries to stay factual: rows, IDs, scores, ratings, kill matrix data, and stable aggregations.
- Subjective interpretations such as “软脚虾 / 硬脚蟹”, carry/backpack narratives, and match-review prose live in the `hltv-analyst` skill.
- `team-map-pool` exposes full details for the currently selected map and win-rate-only rows for the other map-pool tabs, matching what HLTV exposes visibly on first load.

## License

MIT
