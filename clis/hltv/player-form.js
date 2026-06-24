import { cli, Strategy } from '@jackwener/opencli/registry';
import { normalizeLimit, readPlayerMatches } from './utils.js';

function round(value, digits = 2) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(digits));
}

function createBucket(category, key, seed) {
  return {
    category,
    key,
    playerId: seed.playerId,
    nickname: seed.details?.nickname ?? null,
    maps: 0,
    kills: 0,
    deaths: 0,
    plusMinusTotal: 0,
    ratingSum: 0,
    ratingCount: 0,
    winMaps: 0,
    lossMaps: 0,
    dates: [],
    bestRating: null,
    worstRating: null,
    filters: seed.details?.filters ?? null,
  };
}

function addMatch(bucket, row) {
  bucket.maps += 1;
  bucket.kills += row.kills ?? 0;
  bucket.deaths += row.deaths ?? 0;
  bucket.plusMinusTotal += row.plusMinus ?? ((row.kills ?? 0) - (row.deaths ?? 0));
  if (Number.isFinite(row.rating)) {
    bucket.ratingSum += row.rating;
    bucket.ratingCount += 1;
    bucket.bestRating = bucket.bestRating === null ? row.rating : Math.max(bucket.bestRating, row.rating);
    bucket.worstRating = bucket.worstRating === null ? row.rating : Math.min(bucket.worstRating, row.rating);
  }
  if (row.details?.result === 'win') bucket.winMaps += 1;
  if (row.details?.result === 'loss') bucket.lossMaps += 1;
  if (row.date) bucket.dates.push(row.date);
}

function finalizeBucket(bucket) {
  const sortedDates = [...bucket.dates].sort();
  return {
    category: bucket.category,
    key: bucket.key,
    playerId: bucket.playerId,
    nickname: bucket.nickname,
    maps: bucket.maps,
    avgRating: bucket.ratingCount ? round(bucket.ratingSum / bucket.ratingCount) : null,
    kdRatio: bucket.deaths > 0 ? round(bucket.kills / bucket.deaths) : null,
    killsPerMap: bucket.maps ? round(bucket.kills / bucket.maps) : null,
    plusMinusTotal: bucket.plusMinusTotal,
    winMaps: bucket.winMaps,
    lossMaps: bucket.lossMaps,
    details: {
      firstDate: sortedDates[0] ?? null,
      lastDate: sortedDates[sortedDates.length - 1] ?? null,
      deathsPerMap: bucket.maps ? round(bucket.deaths / bucket.maps) : null,
      bestRating: bucket.bestRating,
      worstRating: bucket.worstRating,
      filters: bucket.filters,
    },
  };
}

function buildBuckets(rows) {
  const first = rows[0];
  const buckets = [createBucket('summary', 'all', first)];
  const byMap = new Map();
  const byOpponent = new Map();

  for (const row of rows) {
    addMatch(buckets[0], row);

    if (!byMap.has(row.map)) byMap.set(row.map, createBucket('map', row.map, first));
    addMatch(byMap.get(row.map), row);

    if (!byOpponent.has(row.opponent)) byOpponent.set(row.opponent, createBucket('opponent', row.opponent, first));
    addMatch(byOpponent.get(row.opponent), row);
  }

  const sortBuckets = (items) => [...items].sort((a, b) => b.maps - a.maps || String(a.key).localeCompare(String(b.key)));
  return [
    buckets[0],
    ...sortBuckets(byMap.values()),
    ...sortBuckets(byOpponent.values()),
  ].map(finalizeBucket);
}

cli({
  site: 'hltv',
  name: 'player-form',
  description: 'Aggregate recent HLTV player maps into form summaries grouped by summary, map, and opponent',
  access: 'read',
  example: 'opencli hltv player-form --player 19230/m0nesy --limit 30 -f json',
  domain: 'www.hltv.org',
  strategy: Strategy.UI,
  browser: true,
  navigateBefore: false,
  args: [
    { name: 'player', type: 'string', default: '3741/niko', help: 'Player ref: 3741/niko, player URL, or stats matches URL' },
    { name: 'period', type: 'string', default: 'all', help: 'all / lastMonth / last3Months / last6Months / last12Months / YYYY / YYYY-MM-DD:YYYY-MM-DD' },
    { name: 'eventType', type: 'string', default: 'all', help: 'all / majors / bigEvents / mvpEvents / lan / online' },
    { name: 'ranking', type: 'string', default: 'all', help: 'all / top5 / top10 / top20 / top30 / top50' },
    { name: 'map', type: 'string', default: 'all', help: 'all / ancient / anubis / dust2 / inferno / mirage / nuke / overpass / cache / cobblestone / season / train / tuscan / vertigo' },
    { name: 'version', type: 'string', default: 'both', help: 'both / cs2 / csgo' },
    { name: 'offset', type: 'int', default: 0, help: 'Pagination offset; must be a multiple of 100' },
    { name: 'limit', type: 'int', default: 30, help: 'Recent maps to aggregate from the current page (max 100)' },
  ],
  columns: ['category', 'key', 'playerId', 'nickname', 'maps', 'avgRating', 'kdRatio', 'killsPerMap', 'plusMinusTotal', 'winMaps', 'lossMaps', 'details'],
  func: async (page, args) => {
    const limit = normalizeLimit(args.limit, 30, 100);
    const rows = await readPlayerMatches(page, args, limit);
    return buildBuckets(rows);
  },
});
