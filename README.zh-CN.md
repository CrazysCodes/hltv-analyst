# hltv-analyst

面向 HLTV 的 OpenCLI 适配器和 Codex 分析 Skill，用来查询 CS2/CS:GO 的比赛、选手、对位、状态、地图池和队伍数据，并把结构化数据进一步转成中文分析。

这个项目分成两层：

- **OpenCLI 数据层**：位于 `clis/hltv/`，负责从 HLTV 可见页面中提取结构化事实数据。
- **Codex 分析层**：位于 `.agents/skills/hltv-analyst/`，负责基于 CLI 输出生成中文分析，例如对位解读、比赛复盘、软脚/硬脚判断和球探报告。

## 命令能力

当前包含这些 HLTV 命令：

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

给 agent 使用时推荐输出 JSON：

```bash
opencli hltv player-duel --playerA 3741/niko --playerB 21167/donk -f json
```

## 本地安装

安装 OpenCLI adapter：

```bash
mkdir -p ~/.opencli/clis
cp -R clis/hltv ~/.opencli/clis/hltv
```

可选：安装用于 `opencli browser verify` 的站点记忆：

```bash
mkdir -p ~/.opencli/sites
cp -R sites/hltv ~/.opencli/sites/hltv
```

Codex skill 可以作为当前项目的项目级 skill 使用。也可以安装到全局：

```bash
mkdir -p ~/.codex/skills
cp -R .agents/skills/hltv-analyst ~/.codex/skills/hltv-analyst
```

## 验证

静态语法检查：

```bash
node --check clis/hltv/*.js
```

浏览器验证示例：

```bash
opencli browser verify hltv/player-duel
opencli browser verify hltv/match-series
opencli browser verify hltv/team-matches
opencli browser verify hltv/event-matches
opencli browser verify hltv/player-map-pool
opencli browser verify hltv/team-map-pool
opencli browser verify hltv/player-teammate-impact
```

## 分析 Skill 怎么用

`hltv-analyst` skill 的定位是“分析层”，不直接替代 CLI。它会先调用 OpenCLI 获取事实数据，再输出中文解读。

适合这些问题：

- “帮我复盘这场 BO3。”
- “NiKo 和 donk 上次交手谁压谁？”
- “这个选手这场是不是软脚？”
- “给我一份 m0NESY 最近 50 图球探报告。”
- “这个赛事里有没有数据层面的冷门候选？”

基本原则：

- CLI 只输出事实：比分、地图、rating、K-D、ADR、KAST、互杀、地图池等。
- Skill 负责解释：对位优劣、关键图、carry/低迷、软脚/硬脚、样本量 caveat。
- “软脚虾 / 硬脚蟹”这类梗只作为分析标签，必须附证据和置信度，不当成客观事实。

## 实现说明

- HLTV 页面存在 Cloudflare 防护，所以 adapter 使用浏览器会话和可见 DOM，不走裸 HTTP 抓取。
- 主要策略是 `UI_SELECTOR` / visible DOM，优先复用用户在网页上能看到的数据。
- `player-duel` 可以读取 mapstats 页和 performance 页 Kill matrix，输出两名选手的同图数据对比和直接互杀。
- `match-series` 会把 BO1/BO3/BO5 展开成 summary、map、player 三类行。
- `team-map-pool` 与 HLTV 页面保持一致：首屏所有地图有 win rate，当前展开地图有更完整的 wins/losses/pick/ban 等细节。

## GitHub 仓库简介

推荐填写：

> HLTV OpenCLI adapters and a Codex skill for CS2 match, player, duel, form, and map-pool analysis.

## License

MIT
