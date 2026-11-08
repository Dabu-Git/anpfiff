/* Anpfiff – deine Lieblingsteams live verfolgen.
 * Daten: öffentliche ESPN-Sport-API (kein Schlüssel nötig). */
(() => {
'use strict';

const API = 'https://site.api.espn.com/apis/site/v2/sports';
const API2 = 'https://site.api.espn.com/apis/v2/sports';

const SPORTS = {
  soccer:     { name: 'Fußball',           icon: '⚽' },
  basketball: { name: 'Basketball',        icon: '🏀' },
  football:   { name: 'American Football', icon: '🏈' },
  hockey:     { name: 'Eishockey',         icon: '🏒' },
  baseball:   { name: 'Baseball',          icon: '⚾' },
  regional:   { name: 'Regional',          icon: '🏔️' },
};

const LEAGUES = [
  { key: 'soccer/ger.1', name: 'Bundesliga', flag: '🇩🇪' },
  { key: 'soccer/ger.2', name: '2. Bundesliga', flag: '🇩🇪' },
  { key: 'soccer/eng.1', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { key: 'soccer/esp.1', name: 'LaLiga', flag: '🇪🇸' },
  { key: 'soccer/ita.1', name: 'Serie A', flag: '🇮🇹' },
  { key: 'soccer/fra.1', name: 'Ligue 1', flag: '🇫🇷' },
  { key: 'soccer/ned.1', name: 'Eredivisie', flag: '🇳🇱' },
  { key: 'soccer/por.1', name: 'Primeira Liga', flag: '🇵🇹' },
  { key: 'soccer/aut.1', name: 'Österr. Bundesliga', flag: '🇦🇹' },
  { key: 'soccer/uefa.champions', name: 'Champions League', flag: '🇪🇺', noSearch: true },
  { key: 'soccer/uefa.europa', name: 'Europa League', flag: '🇪🇺', noSearch: true },
  { key: 'basketball/nba', name: 'NBA', flag: '🇺🇸' },
  { key: 'football/nfl', name: 'NFL', flag: '🇺🇸' },
  { key: 'hockey/nhl', name: 'NHL', flag: '🇺🇸' },
  { key: 'baseball/mlb', name: 'MLB', flag: '🇺🇸' },
];
const leagueByKey = Object.fromEntries(LEAGUES.map(l => [l.key, l]));
const sportOf = key => key.split('/')[0];

/* ---------- Regionale Ligen (Vorarlberg & Ostschweiz) ----------
 * Für diese Ligen gibt es keine offene Datenschnittstelle: ÖFB und football.ch sperren
 * automatische Zugriffe. Die App führt Ligen und Teams deshalb mit direkten Links zu
 * Tabelle und Spielplan, die im Browser geöffnet werden. */
const SW = 'https://www.soccerway.com';
const gsearch = q => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
const VFV = ['Vorarlberger Fußballverband', 'https://www.vfv.at/'];
const SFV = ['Schweizerischer Fussballverband', 'https://www.football.ch/'];
const REGIONAL_LEAGUES = [
  { key: 'regional/rlw', name: 'Regionalliga West', region: 'Vorarlberg & Tirol', flag: '🇦🇹', tier: 3,
    source: { type: 'wiki', page: () => `Österreichische Fußballmeisterschaft ${seasonStr()}`, heading: () => /^===\s*Regionalliga West\s*===/m },
    links: [['Tabelle & Spiele', `${SW}/austria/regionalliga-west/standings/`], ['Spielberichte (VOL.AT)', 'https://www.vol.at/themen/regionalliga']] },
  { key: 'regional/elite', name: 'Eliteliga Vorarlberg', region: 'Vorarlberg', flag: '🇦🇹', tier: 4,
    source: { type: 'wiki', page: () => 'Eliteliga Vorarlberg', heading: () => new RegExp(`^==+\\s*Tabelle\\s*${seasonStr().replace('/', '\\/')}\\s*==+`, 'm') },
    links: [['Tabelle & Spiele', `${SW}/austria/regionalliga-west-vorarlberg/standings/`]] },
  { key: 'regional/vbgl', name: 'Vorarlbergliga', region: 'Vorarlberg', flag: '🇦🇹', tier: 5,
    links: [['Tabelle (Ligaportal)', 'https://www.ligaportal.at/vbg/vorarlbergliga/tabelle'], ['Tabelle & Spiele (Soccerway)', `${SW}/austria/vorarlberg/standings/`]] },
  { key: 'regional/ll', name: 'Landesliga', region: 'Vorarlberg', flag: '🇦🇹', tier: 6, links: [['Tabelle (Ligaportal)', 'https://www.ligaportal.at/vbg/landesliga/tabelle']],
    source: { type: 'wiki', page: () => 'Landesliga (Vorarlberg)', heading: () => new RegExp(`^==+\\s*Tabelle\\s*${seasonStr().replace('/', '\\/')}\\s*==+`, 'm') } },
  { key: 'regional/1lk', name: '1. Landesklasse', region: 'Vorarlberg', flag: '🇦🇹', tier: 7, links: [['Tabelle & Ergebnisse (Ligaportal)', 'https://www.ligaportal.at/vbg/1-landesklasse']] },
  { key: 'regional/2lk', name: '2. Landesklasse', region: 'Vorarlberg', flag: '🇦🇹', tier: 8, links: [['Tabelle & Ergebnisse (Ligaportal)', 'https://www.ligaportal.at/vbg/2-landesklasse']] },
  { key: 'regional/3lk', name: '3. Landesklasse', region: 'Vorarlberg', flag: '🇦🇹', tier: 9, links: [] },
  { key: 'regional/4lk', name: '4. Landesklasse', region: 'Vorarlberg', flag: '🇦🇹', tier: 10, links: [] },
  { key: 'regional/5lko', name: '5. Landesklasse Oberland', region: 'Vorarlberg', flag: '🇦🇹', tier: 11, links: [] },
  { key: 'regional/5lku', name: '5. Landesklasse Unterland', region: 'Vorarlberg', flag: '🇦🇹', tier: 11, links: [] },
  { key: 'regional/ch2lr', name: '2. Liga regional', region: 'Ostschweiz (OFV) · Gruppe 1', flag: '🇨🇭', tier: 6,
    links: [['Spiele & Resultate (OFV)', 'https://matchcenter.ofv.swiss/']], source: { type: 'json', url: 'data/ch2lr.json' } },
];
const regionalByKey = Object.fromEntries(REGIONAL_LEAGUES.map(l => [l.key, l]));

// Saison im Format 2026/27 (Wechsel im Juli)
function seasonStr(d = new Date()) {
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
}
// Vereinsname auf den Kern reduzieren, damit "FC Dornbirn 1913" und "FC Dornbirn" zusammenpassen
function teamCore(name) {
  return norm(name).replace(/\b(fc|sc|sv|vfb|scr|sk|svg|fk|usv|asv|tsv|bw|spg|sg|wsg|us|ac|cs|sk)\b/g, ' ')
    .replace(/\b\d+\b/g, ' ').replace(/[^a-z]+/g, ' ').trim();
}
function sameTeam(a, b) {
  const x = teamCore(a), y = teamCore(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [s1, l1] = x.length <= y.length ? [x, y] : [y, x];
  return s1.length >= 4 && (` ${l1} `).includes(` ${s1} `);
}
function parseWikiRow(raw) {
  let t = raw.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/<ref[^>]*\/>/g, '').replace(/<ref[\s\S]*?<\/ref>/g, '').replace(/'''?/g, '');
  const p = {};
  for (const m of t.matchAll(/\|\s*([A-Za-zÄÖÜäöü]+)\s*=\s*([^|]*)/g)) p[m[1]] = m[2].trim();
  if (!p.Verein) return null;
  const n = k => parseInt(p[k], 10) || 0;
  const w = n('S'), d = n('U'), l = n('N');
  return { rank: n('Rang'), team: p.Verein.replace(/\s*\((N|A|M|P|T)\)\s*$/, '').trim(), p: w + d + l, w, d, l,
    gf: n('ET'), ga: n('GT'), pts: 3 * w + d - n('Abzug'),
    note: /^ccffcc|^90ee90|^aaffaa/i.test(p.Farbe || '') ? 'up' : /^ffcccc|^ffaaaa/i.test(p.Farbe || '') ? 'down' : '' };
}
// Von dir eingefügte Tabellen (kopiert aus Ligaportal, ÖFB, VOL.AT …) – nur auf diesem Gerät gespeichert
const manualKey = key => `fk.rtable.${key}`;
function manualTable(l) {
  const t = store.get(manualKey(l.key), null);
  if (!t?.rows?.length || t.season !== seasonStr()) return null;
  return { rows: t.rows, season: t.season, updated: t.savedAt, manual: true,
    source: { label: 'von dir eingefügt', url: (l.links[0] || regionalLeagueLinks(l)[0])[1] } };
}
function parsePastedTable(text) {
  const flat = String(text).replace(/\r/g, '').replace(/−/g, '-').replace(/[\t ]+/g, ' ');
  const re = /(?:^|\s)(\d{1,2})[.)]?\s+([^\d\s][^\n]*?)\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,3})\s*:\s*(\d{1,3})\s+(?:[+-]?\d{1,3}\s+)?(-?\d{1,3})(?=\s|$)/g;
  const tryParse = src => {
    const rows = [];
    for (const m of src.matchAll(re)) {
      const [, rank, team, P, W, D, L, gf, ga, pts] = m;
      const r = { rank: +rank, team: team.replace(/\s+/g, ' ').trim(), p: +P, w: +W, d: +D, l: +L, gf: +gf, ga: +ga, pts: +pts };
      if (r.w + r.d + r.l !== r.p || r.pts > 3 * r.p + 3 || r.team.length < 2) continue;
      if (!rows.some(x => x.rank === r.rank && x.team === r.team)) rows.push(r);
    }
    return rows;
  };
  let rows = tryParse(flat);                       // eine Zeile pro Team
  if (rows.length < 4) rows = tryParse(flat.replace(/\n+/g, ' '));   // jede Zelle in eigener Zeile
  return rows.sort((a, b) => a.rank - b.rank);
}
function pasteFormHtml(l, open = true) {
  const link = (l.links[0] || regionalLeagueLinks(l)[0]);
  return `<details class="card paste-card" ${open ? 'open' : ''}><summary><b>Tabelle einfügen</b><span class="dim">nur auf diesem Gerät gespeichert</span></summary>
    <ol class="paste-steps"><li>Öffne die Tabelle: ${extLink(link, 'inline-link')}</li><li>Markiere die ganze Tabelle und kopiere sie.</li><li>Füge sie hier ein – Anpfiff erkennt die Zeilen automatisch.</li></ol>
    <form class="paste-form" data-league="${l.key}">
      <textarea id="pasteText-${l.key.split('/')[1]}" rows="6" placeholder="z. B.&#10;1  SC Fussach  11  8  2  1  28:8  +20  26&#10;2  FC Koblach  11  7  1  3  25:14  +11  22"></textarea>
      <div class="cf-row"><button class="btn" type="submit">Tabelle übernehmen</button><span class="paste-msg dim" role="status"></span></div>
    </form></details>`;
}
async function loadRegionalTable(l) {
  const auto = await loadAutoTable(l);
  return auto || (l ? manualTable(l) : null);
}
async function loadAutoTable(l) {
  const src = l?.source;
  if (!src) return null;
  try {
    if (src.type === 'json') {
      const d = await get(src.url, 300000);
      return d?.rows?.length ? { rows: d.rows, title: d.title, season: d.season, updated: d.updated, source: d.source } : null;
    }
    const page = src.page();
    const url = `https://de.wikipedia.org/w/api.php?action=parse&format=json&origin=*&redirects=1&prop=wikitext|revid&page=${encodeURIComponent(page)}`;
    const d = await get(url, 600000);
    const text = d?.parse?.wikitext?.['*'];
    if (!text) return null;
    const m = text.match(src.heading());
    if (!m) return null;
    const rest = text.slice(m.index + m[0].length);
    const end = rest.search(/\n==/);
    const seg = end >= 0 ? rest.slice(0, end) : rest;
    const rows = [...seg.matchAll(/\{\{Fußballtabelle\/Zeile([^}]*)\}\}/g)].map(x => parseWikiRow(x[1])).filter(Boolean)
      .sort((a, b) => a.rank - b.rank);
    if (rows.length < 4) return null;
    return { rows, season: seasonStr(), source: { label: 'Wikipedia (CC BY-SA 4.0)', url: `https://de.wikipedia.org/wiki/${encodeURIComponent(d.parse.title.replace(/ /g, '_'))}` } };
  } catch { return null; }
}
const findRow = (table, name) => table?.rows?.find(r => sameTeam(r.team, name)) || null;
function regionalTableHtml(table, leagueKey) {
  const favs = favorites.filter(f => f.league === leagueKey);
  const lk = leagueKey.split('/')[1];
  const rows = table.rows.map(r => {
    const fav = favs.find(f => sameTeam(f.name, r.team));
    const known = fav || [...REGIONAL_TEAMS].find(t => t.league === leagueKey && sameTeam(t.name, r.team));
    const note = r.note === 'up' ? 'style="--note:#22c55e" title="Aufstiegsplatz"' : r.note === 'down' ? 'style="--note:#ef4444" title="Abstiegsplatz"' : '';
    const diff = r.gf - r.ga;
    return `<tr class="${fav ? 'me' : ''} ${known ? 'clickable' : ''}" ${known ? `data-href="#/rteam/${lk}/${esc(known.id)}"` : ''}>
      <td class="rank l" ${note}>${r.rank}</td>
      <td class="l"><div class="tm"><span class="mini-badge">${esc(initials(r.team))}</span>${esc(r.team)}${fav ? ' <span class="fav-mark">★</span>' : ''}</div></td>
      <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}:${r.ga}</td><td>${diff > 0 ? '+' : ''}${diff}</td><td class="pts">${r.pts}</td></tr>`;
  }).join('');
  const upd = table.updated ? ` · Stand ${new Date(table.updated).toLocaleString('de-DE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}` : '';
  return `<div class="card section"><div class="table-wrap"><table class="standings"><thead><tr><th class="l">#</th><th class="l">Team</th>
    <th>Sp</th><th>S</th><th>U</th><th>N</th><th>Tore</th><th>Diff</th><th>Pkt</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="table-source">${table.manual
      ? `Von dir eingefügt${upd} · <button class="link-btn" data-action="clear-table" data-league="${leagueKey}">Entfernen</button>`
      : `Quelle: <a href="${esc(table.source?.url || '#')}" target="_blank" rel="noopener">${esc(table.source?.label || '')}</a>${upd}`}</div></div>`;
}
const isRegional = key => String(key || '').startsWith('regional/');
const leagueName = key => leagueByKey[key]?.name || regionalByKey[key]?.name || key;
const leagueFlag = key => leagueByKey[key]?.flag || regionalByKey[key]?.flag || '';
function regionalLeagueLinks(l) {
  const swiss = l.flag === '🇨🇭';
  return [...l.links,
    ['Aktuelle Tabelle (Google)', gsearch(`${l.name} ${swiss ? 'OFV Ostschweiz' : 'Vorarlberg'} Tabelle`)],
    swiss ? SFV : VFV];
}
const rteam = (league, id, name, short, links = []) => ({ league, id, name, short, regional: true, links });
const REGIONAL_TEAMS = [
  rteam('regional/ch2lr', 'fc-au-berneck-05', 'FC Au-Berneck 05', 'Au-Berneck', [['Spiele & Tabelle', `${SW}/team/au-berneck/rBeniS7r/`]]),
  rteam('regional/rlw', 'fc-dornbirn', 'FC Dornbirn 1913', 'Dornbirn'),
  rteam('regional/rlw', 'fc-lustenau', 'FC Lustenau 07', 'Lustenau'),
  rteam('regional/rlw', 'vfb-hohenems', 'VfB Hohenems', 'Hohenems'),
  rteam('regional/rlw', 'sc-roethis', 'SC Röthis', 'Röthis'),
  rteam('regional/rlw', 'fc-lauterach', 'FC Lauterach', 'Lauterach'),
  rteam('regional/rlw', 'fc-wolfurt', 'FC Wolfurt', 'Wolfurt'),
  rteam('regional/rlw', 'sv-lochau', 'SV Lochau', 'Lochau'),
  rteam('regional/rlw', 'altach-juniors', 'SCR Altach Juniors', 'Altach Juniors'),
];
function regionalTeamLinks(t) {
  const l = regionalByKey[t.league];
  return [...(t.links || []),
    ['Spielplan & Ergebnisse (Google)', gsearch(`${t.name} Spielplan Ergebnisse`)],
    ...(l ? regionalLeagueLinks(l).map(([n, u]) => [`${l.name}: ${n}`, u]) : [])];
}
function initials(name) {
  const words = String(name).replace(/\b(FC|SC|SV|VfB|SCR|FK|SK|USV|ASV|TSV|BW|SPG|SG)\b/g, ' ')
    .split(/[\s\-\/.]+/).filter(w => w && !/^\d+$/.test(w));
  if (!words.length) return String(name).slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
const extLink = ([label, url], cls = 'ext-link') =>
  `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<svg viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg></a>`;

const POPULAR = [
  ['soccer/ger.1', '132'], ['soccer/ger.1', '124'], ['soccer/esp.1', '86'], ['soccer/esp.1', '83'],
  ['soccer/eng.1', '364'], ['soccer/eng.1', '382'], ['basketball/nba', '13'], ['basketball/nba', '2'],
  ['football/nfl', '12'], ['hockey/nhl', '1'],
];

/* ---------- Storage ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let favorites = store.get('fk.favorites', []);
const favKey = (league, id) => `${league}:${id}`;
const isFav = (league, id) => favorites.some(f => favKey(f.league, f.id) === favKey(league, id));
function toggleFav(team) {
  if (isFav(team.league, team.id)) {
    favorites = favorites.filter(f => favKey(f.league, f.id) !== favKey(team.league, team.id));
    toast(`${team.name} entfernt`);
  } else {
    const f = { league: team.league, id: String(team.id), name: team.name, abbr: team.abbr, logo: team.logo, color: team.color };
    if (team.regional) Object.assign(f, { regional: true, short: team.short, links: team.links || [], custom: !!team.custom });
    favorites.push(f);
    toast(`⭐ ${team.name} hinzugefügt`);
  }
  store.set('fk.favorites', favorites);
}

// Favoriten übertragen (iPhone: die App auf dem Home-Bildschirm hat einen eigenen Speicher)
function favCode() {
  const slim = favorites.map(f => ({ l: f.league, i: f.id, n: f.name, a: f.abbr, o: f.logo, c: f.color,
    ...(f.regional ? { r: 1, s: f.short, k: f.links || [], u: f.custom ? 1 : 0 } : {}) }));
  return 'ANPFIFF1:' + btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
}
function importFavCode(code) {
  const m = String(code).trim().match(/ANPFIFF1:([A-Za-z0-9+/=]+)/);
  if (!m) return -1;
  let arr;
  try { arr = JSON.parse(decodeURIComponent(escape(atob(m[1])))); } catch { return -1; }
  let n = 0;
  for (const x of Array.isArray(arr) ? arr : []) {
    if (!x?.l || !x?.i || isFav(x.l, x.i)) continue;
    const f = { league: String(x.l), id: String(x.i), name: String(x.n || ''), abbr: x.a, logo: x.o, color: x.c };
    if (x.r) Object.assign(f, { regional: true, short: x.s, links: Array.isArray(x.k) ? x.k : [], custom: !!x.u });
    favorites.push(f); n++;
  }
  store.set('fk.favorites', favorites);
  return n;
}
function transferHtml(open = false) {
  return `<details class="card paste-card transfer" ${open ? 'open' : ''}><summary><b>Favoriten übertragen</b><span class="dim">z. B. von Safari in die App auf dem Home-Bildschirm</span></summary>
    <p class="muted transfer-note">Auf dem iPhone hat die App auf dem Home-Bildschirm einen eigenen Speicher. Kopiere den Code dort, wo deine Favoriten sind, und füge ihn in der anderen App ein.</p>
    ${favorites.length ? `<div class="cf-row"><button class="btn ghost" data-action="copy-favs" type="button">Code kopieren</button></div>` : ''}
    <form class="import-form cf-row"><input id="favCodeInput" placeholder="Code einfügen (ANPFIFF1:…)" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn" type="submit">Übernehmen</button></form>
    <span class="paste-msg dim" id="favMsg" role="status"></span></details>`;
}

/* ---------- Fetch with cache ---------- */
const cache = new Map();
function get(url, ttl = 30000) {
  const c = cache.get(url);
  if (c && Date.now() - c.t < ttl) return c.p;
  const p = fetch(url).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); }).then(t => JSON.parse(germanize(t)));
  cache.set(url, { t: Date.now(), p });
  p.catch(() => cache.delete(url));
  return p;
}
const safe = p => p.catch(() => null);

// Deutsche Vereins- und Städtenamen statt der englischen ESPN-Bezeichnungen
const DE_NAMES = [
  ['Bayern Munich', 'Bayern München'], ['1. FC Cologne', '1. FC Köln'], ['FC Cologne', '1. FC Köln'], ['Cologne', 'Köln'],
  ['Borussia Monchengladbach', 'Borussia Mönchengladbach'], ["M'gladbach", 'Gladbach'], ['Monchengladbach', 'Mönchengladbach'],
  ['Hamburg SV', 'Hamburger SV'], ['Nurnberg', 'Nürnberg'], ['Dusseldorf', 'Düsseldorf'], ['Furth', 'Fürth'],
  ['Saarbrucken', 'Saarbrücken'], ['Osnabruck', 'Osnabrück'], ['Munster', 'Münster'], ['Preussen', 'Preußen'],
  ['Internazionale', 'Inter Mailand'], ['Inter Milan', 'Inter Mailand'], ['AC Milan', 'AC Mailand'], ['Rapid Vienna', 'Rapid Wien'], ['Austria Vienna', 'Austria Wien'],
  ['Munich', 'München'],
];
function germanize(text) {
  for (const [en, de] of DE_NAMES) if (text.includes(en)) text = text.split(en).join(de);
  return text;
}

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const logoOf = t => t?.logo || t?.logos?.[0]?.href || '';
const img = (src, cls = '', alt = '') => src
  ? `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.style.visibility='hidden'">`
  : `<span class="${cls}"></span>`;
const hex = c => c ? `#${String(c).replace('#', '')}` : '#5b8cff';
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 17.3l-6.2 3.6 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7z"/></svg>';
const ARROW = '<svg class="match-arrow" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6-1.4-1.4 4.6-4.6-4.6-4.6z"/></svg>';
const BACK = '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6 1.4-1.4-4.6-4.6 4.6-4.6z"/></svg>';

function starBtn(team) {
  const on = isFav(team.league, team.id);
  return `<button class="star-btn ${on ? 'on' : ''}" data-fav='${esc(JSON.stringify(team))}' title="${on ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}">${STAR}</button>`;
}

const dayKey = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
function relDay(date) {
  const d = new Date(date), now = new Date();
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Morgen';
  if (diff === -1) return 'Gestern';
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}
function shortDay(date) {
  const r = relDay(date);
  if (['Heute', 'Morgen', 'Gestern'].includes(r)) return r;
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}
const timeOf = date => new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const fullDate = date => new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ---------- Event normalization ---------- */
const STATUS_DE = {
  STATUS_HALFTIME: 'Halbzeit', STATUS_FULL_TIME: 'Ende', STATUS_FINAL: 'Ende', STATUS_FINAL_AET: 'Ende n. V.',
  STATUS_FINAL_PEN: 'Ende n. E.', STATUS_FINAL_OT: 'Ende n. V.', STATUS_POSTPONED: 'Verschoben',
  STATUS_CANCELED: 'Abgesagt', STATUS_SUSPENDED: 'Unterbrochen', STATUS_DELAYED: 'Verzögert',
  STATUS_END_PERIOD: 'Pause', STATUS_OVERTIME: 'Verlängerung', STATUS_SHOOTOUT: 'Elfmeterschießen',
};
function statusText(e) {
  if (STATUS_DE[e.statusName] && e.state !== 'pre') return STATUS_DE[e.statusName];
  if (STATUS_DE[e.statusName] && ['STATUS_POSTPONED', 'STATUS_CANCELED'].includes(e.statusName)) return STATUS_DE[e.statusName];
  if (e.state === 'in') {
    if (sportOf(e.league) === 'soccer') return e.clock || e.detail;
    const sp = sportOf(e.league);
    const unit = sp === 'hockey' ? 'Drittel' : sp === 'baseball' ? '' : 'Viertel';
    let d = (e.detail || '').replace('Halftime', 'Halbzeit').replace('End of', 'Ende').replace('Top', 'Oben').replace('Bot', 'Unten').replace('Mid', 'Mitte').replace(/\bOT\b/, 'Verl.');
    const m = d.match(/^([\d:.]+) - (\d)(?:st|nd|rd|th)$/);
    if (m) return sp === 'hockey' ? `${m[2]}. Drittel · ${m[1]}` : `Q${m[2]} · ${m[1]}`;
    return d.replace(/(\d+)(?:st|nd|rd|th)\b/g, `$1.${unit ? ' ' + unit : ''}`);
  }
  if (e.state === 'post') return 'Ende';
  return timeOf(e.date);
}

function scoreVal(s) {
  if (s == null) return null;
  if (typeof s === 'object') return s.displayValue ?? s.value ?? null;
  return s;
}

function normTeam(x) {
  return {
    id: String(x.team?.id ?? x.id), name: x.team?.displayName || x.team?.name || '?',
    short: x.team?.shortDisplayName || x.team?.displayName || '?', abbr: x.team?.abbreviation,
    logo: logoOf(x.team), color: x.team?.color, score: scoreVal(x.score), homeAway: x.homeAway,
    winner: x.winner, record: x.records?.[0]?.summary || x.record?.[0]?.displayValue,
    linescores: x.linescores,
  };
}

function normEvent(ev, league) {
  const c = ev.competitions?.[0] || {};
  const st = c.status || ev.status || {};
  const t = st.type || {};
  const teams = (c.competitors || []).map(normTeam);
  const home = teams.find(x => x.homeAway === 'home') || teams[0];
  const away = teams.find(x => x.homeAway === 'away') || teams[1];
  const goals = (c.details || []).filter(d => d.scoringPlay).map(d => ({
    min: d.clock?.displayValue || '', teamId: String(d.team?.id),
    player: d.athletesInvolved?.[0]?.shortName || d.athletesInvolved?.[0]?.displayName || 'Tor',
    og: !!d.ownGoal, pen: !!d.penaltyKick,
  }));
  return {
    id: String(ev.id), league, date: ev.date, state: t.state, completed: !!t.completed, detail: t.shortDetail || t.detail,
    statusName: t.name, clock: st.displayClock, period: st.period, home, away, goals,
    venue: c.venue?.fullName, note: c.notes?.[0]?.headline,
  };
}

function resultFor(e, teamId) {
  if (!e.completed || e.home?.score == null || e.away?.score == null) return null;
  const me = e.home.id === String(teamId) ? e.home : e.away;
  const op = me === e.home ? e.away : e.home;
  const a = parseFloat(me.score), b = parseFloat(op.score);
  if (a > b) return 'W';
  if (a < b) return 'L';
  if (me.winner) return 'W';
  if (op.winner) return 'L';
  return 'D';
}
const RES_DE = { W: 'S', D: 'U', L: 'N' };

/* ---------- Data loaders ---------- */
async function loadTeamSchedule(league, id) {
  const base = `${API}/${league}/teams/${id}/schedule`;
  const reqs = [get(base, 60000)];
  if (sportOf(league) === 'soccer') reqs.push(safe(get(`${base}?fixture=true`, 60000)));
  else reqs.push(safe(get(`${base}?seasontype=3`, 60000)));
  const [a, b] = await Promise.all(reqs);
  const map = new Map();
  for (const ev of [...(a?.events || []), ...(b?.events || [])]) map.set(String(ev.id), normEvent(ev, league));
  const events = [...map.values()].sort((x, y) => new Date(x.date) - new Date(y.date));
  return { team: a?.team, events };
}

async function loadScoreboard(league, date) {
  const url = `${API}/${league}/scoreboard${date ? `?dates=${date}` : ''}`;
  const d = await get(url, 20000);
  return (d.events || []).map(ev => normEvent(ev, league));
}

async function loadSummary(league, eventId, ttl = 20000) {
  return get(`${API}/${league}/summary?event=${eventId}`, ttl);
}

function goalsFromSummary(sum) {
  return (sum?.keyEvents || []).filter(k => k.scoringPlay).map(k => {
    const type = k.type?.type || '';
    return {
      min: k.clock?.displayValue || '', teamId: String(k.team?.id),
      player: k.participants?.[0]?.athlete?.displayName || 'Tor',
      assist: k.participants?.[1]?.athlete?.displayName,
      og: type.includes('own-goal'), pen: type.includes('penalty'),
    };
  });
}

async function loadAllTeams() {
  const cached = store.get('fk.teams', null);
  if (cached && cached.v === 3 && Date.now() - cached.t < 864e5 * 3) return cached.teams;
  // Die /teams-Endpunkte erlauben kein CORS – die Tabellen enthalten aber alle Teams.
  const lists = await Promise.all(LEAGUES.filter(l => !l.noSearch).map(async l => {
    const d = await safe(get(`${API2}/${l.key}/standings`, 864e5));
    const seen = new Set();
    return collectGroups(d).flatMap(g => g.entries).map(e => e.team).filter(t => t && !seen.has(t.id) && seen.add(t.id)).map(t => ({
      league: l.key, id: String(t.id), name: t.displayName, short: t.shortDisplayName, abbr: t.abbreviation,
      logo: logoOf(t), color: t.color, location: t.location,
    }));
  }));
  const teams = lists.flat();
  if (teams.length) store.set('fk.teams', { v: 3, t: Date.now(), teams });
  return teams;
}

/* ---------- Components ---------- */
function goalLines(goals, teamId) {
  const mine = goals.filter(g => g.teamId === teamId);
  const byPlayer = new Map();
  for (const g of mine) {
    const k = g.player;
    if (!byPlayer.has(k)) byPlayer.set(k, []);
    byPlayer.get(k).push(g.min + (g.pen ? ' (E)' : '') + (g.og ? ' (ET)' : ''));
  }
  return [...byPlayer].map(([p, m]) => `<span>${esc(p)} ${esc(m.join(', '))}</span>`).join('');
}

function matchRow(e, opts = {}) {
  const live = e.state === 'in';
  const pre = e.state === 'pre';
  const favIds = opts.favIds || new Set();
  const hw = e.completed && resultFor(e, e.home.id);
  const side = (t, cls) => {
    const fav = favIds.has(favKey(e.league, t.id));
    const loser = e.completed && ((cls === 'home' && hw === 'L') || (cls === 'away' && hw === 'W'));
    const inner = cls === 'home'
      ? `<span class="nm">${esc(t.short)}</span>${img(t.logo)}`
      : `${img(t.logo)}<span class="nm">${esc(t.short)}</span>`;
    return `<div class="match-side ${cls} ${fav ? 'fav' : ''} ${loser ? 'loser' : ''}">${inner}</div>`;
  };
  const score = pre
    ? `<div class="match-score pre">${['STATUS_POSTPONED', 'STATUS_CANCELED'].includes(e.statusName) ? statusText(e) : timeOf(e.date)}</div>`
    : `<div class="match-score ${live ? 'live' : ''}">${esc(e.home.score ?? '-')} : ${esc(e.away.score ?? '-')}</div>`;
  const when = live
    ? `<div class="match-when"><span class="live-pill">Live</span> <b style="margin-top:4px">${esc(statusText(e))}</b></div>`
    : `<div class="match-when"><b>${relDay(e.date)}</b>${pre ? (opts.leagueTag ? esc(leagueByKey[e.league]?.name || '') : '') : esc(statusText(e))}</div>`;
  const goals = e.goals?.length
    ? `<div class="match-goals"><div class="gh">${goalLines(e.goals, e.home.id)}</div><div class="gmid"></div><div>${goalLines(e.goals, e.away.id)}</div></div>`
    : '';
  const [sport, lg] = e.league.split('/');
  return `<a class="match" href="#/game/${sport}/${lg}/${e.id}">${when}${side(e.home, 'home')}${score}${side(e.away, 'away')}${ARROW}${goals}</a>`;
}

function formDots(events, teamId, n = 5) {
  const res = events.filter(e => e.completed).map(e => resultFor(e, teamId)).filter(Boolean).slice(-n);
  if (!res.length) return '<span class="dim">Noch keine Spiele</span>';
  return `<div class="form">${res.map(r => `<i class="${r}" title="${{ W: 'Sieg', D: 'Unentschieden', L: 'Niederlage' }[r]}">${RES_DE[r]}</i>`).join('')}</div>`;
}

function skeleton(kind) {
  if (kind === 'home') return `<div class="page-head"><div><div class="skel" style="width:260px;height:36px"></div></div></div>
    <div class="team-grid">${'<div class="skel" style="height:230px"></div>'.repeat(3)}</div>`;
  return '<div class="spinner"></div>';
}

/* ---------- Views ---------- */
let currentView = null;
let renderToken = 0;

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
}

async function viewHome(_, { silent } = {}) {
  const app = $('#app');
  if (!favorites.length) return renderOnboarding();
  if (!silent) app.innerHTML = skeleton('home');
  const token = renderToken;

  const favIds = new Set(favorites.map(f => favKey(f.league, f.id)));
  const espnFavs = favorites.filter(f => !isRegional(f.league));
  const regionalFavs = favorites.filter(f => isRegional(f.league));
  const leagues = [...new Set(espnFavs.map(f => f.league))];
  const [schedules, boards, tables] = await Promise.all([
    Promise.all(espnFavs.map(f => safe(loadTeamSchedule(f.league, f.id)))),
    Promise.all(leagues.map(l => safe(loadScoreboard(l)))),
    Promise.all(leagues.map(l => safe(get(`${API2}/${l}/standings`, 300000)))),
  ]);
  const tableByLeague = Object.fromEntries(leagues.map((l, i) => [l, tables[i]]));
  const rLeagues = [...new Set(regionalFavs.map(f => f.league))];
  const rTables = await Promise.all(rLeagues.map(l => loadRegionalTable(regionalByKey[l])));
  const rTableByLeague = Object.fromEntries(rLeagues.map((l, i) => [l, rTables[i]]));
  if (token !== renderToken) return;

  // Live-Daten aus Scoreboards haben Vorrang
  const boardById = new Map();
  boards.flat().filter(Boolean).forEach(e => boardById.set(e.id, e));
  const merge = e => boardById.get(e.id) || e;

  const allEvents = new Map();
  const cards = espnFavs.map((f, i) => {
    const events = (schedules[i]?.events || []).map(merge);
    const st = schedules[i]?.team;
    if (st?.color && !f.color) { f.color = st.color; store.set('fk.favorites', favorites); }
    events.forEach(e => allEvents.set(e.id, e));
    const live = events.find(e => e.state === 'in');
    const last = [...events].reverse().find(e => e.completed);
    const next = events.find(e => e.state === 'pre');
    return { f, events, live, last, next };
  });
  // Live-Spiele von Favoriten auch aus Scoreboards
  boardById.forEach(e => {
    if (favIds.has(favKey(e.league, e.home.id)) || favIds.has(favKey(e.league, e.away.id))) allEvents.set(e.id, e);
  });

  const all = [...allEvents.values()];
  const liveGames = all.filter(e => e.state === 'in');
  const results = all.filter(e => e.completed).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  const upcoming = all.filter(e => e.state === 'pre').sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 8);

  // Torschützen für Fußball-Ergebnisse nachladen
  await Promise.all(results.filter(e => sportOf(e.league) === 'soccer' && !e.goals?.length).map(async e => {
    const s = await safe(loadSummary(e.league, e.id, 300000));
    if (s) e.goals = goalsFromSummary(s).map(g => ({ ...g, player: shortName(g.player) }));
  }));
  if (token !== renderToken) return;

  setLiveDot(liveGames.length > 0);
  currentView.refresh = liveGames.length ? 30000 : 120000;

  const opp = (e, id) => (e.home.id === String(id) ? e.away : e.home);
  const vs = (e, id) => (e.home.id === String(id) ? 'vs' : '@');
  const teamCard = ({ f, events, live, last, next }) => {
    const sport = sportOf(f.league);
    const [s, lg] = f.league.split('/');
    let lines = '';
    if (live) {
      const o = opp(live, f.id);
      const me = live.home.id === f.id ? live.home : live.away;
      lines += `<div class="tc-line is-live"><span class="lbl"><span class="live-pill">Live</span></span>
        <div class="opp"><span class="vs">${vs(live, f.id)}</span>${img(o.logo)}<span>${esc(o.short)}</span></div>
        <span class="val" style="color:var(--live)">${esc(me.score)} : ${esc(o.score)}</span></div>`;
    }
    if (last) {
      const o = opp(last, f.id);
      const me = last.home.id === f.id ? last.home : last.away;
      const r = resultFor(last, f.id);
      lines += `<div class="tc-line"><span class="lbl">Zuletzt</span>
        <div class="opp"><span class="vs">${vs(last, f.id)}</span>${img(o.logo)}<span>${esc(o.short)}</span></div>
        <span class="val">${esc(me.score)} : ${esc(o.score)}</span>${r ? `<span class="res-badge ${r}">${RES_DE[r]}</span>` : ''}</div>`;
    }
    if (next) {
      const o = opp(next, f.id);
      lines += `<div class="tc-line"><span class="lbl">Nächstes</span>
        <div class="opp"><span class="vs">${vs(next, f.id)}</span>${img(o.logo)}<span>${esc(o.short)}</span></div>
        <span class="val dim" style="font-weight:600;font-size:12.5px">${shortDay(next.date)} ${timeOf(next.date)}</span></div>`;
    }
    if (!lines) lines = '<div class="tc-line"><span class="dim">Keine Spieldaten verfügbar</span></div>';
    const lgInfo = leagueByKey[f.league];
    const pos = findStandingEntry(tableByLeague[f.league], f.id);
    const rankTxt = pos ? `Platz ${pos.entry._pos}` : 'Tabelle';
    return `<div class="card team-card" style="--team:${hex(f.color)}" data-href="#/team/${s}/${lg}/${f.id}">
      <div class="tc-head">${img(f.logo, 'tc-logo')}
        <div><div class="tc-name">${esc(f.name)}</div><div class="tc-league">${SPORTS[sport].icon} ${esc(lgInfo?.name || f.league)}</div></div>
        ${starBtn({ ...f })}</div>
      <div class="tc-body">${lines}</div>
      <div class="tc-foot">${formDots(events, f.id)}<a class="table-link" href="#/league/${s}/${lg}/${f.id}">${TABLE_ICON}${rankTxt}</a></div>
    </div>`;
  };
  const regionalCard = f => regionalCardHtml(f, rTableByLeague[f.league]);

  const liveCard = e => {
    const [s, lg] = e.league.split('/');
    const row = t => `<div class="lc-row">${img(t.logo)}<span class="nm">${esc(t.short)}</span><span class="sc">${esc(t.score ?? 0)}</span></div>`;
    const g = e.goals?.length ? `<div class="lc-goals">⚽ ${e.goals.map(x => `${esc(x.player)} ${esc(x.min)}`).join(' · ')}</div>` : '';
    return `<div class="card live-card" data-href="#/game/${s}/${lg}/${e.id}">
      <div class="lc-top"><span class="live-pill">Live</span><span class="league-tag">${esc(leagueByKey[e.league]?.name || '')} · ${esc(statusText(e))}</span></div>
      ${row(e.home)}${row(e.away)}${g}</div>`;
  };

  app.innerHTML = `
    <div class="page-head">
      <div><h1>${greeting()} 👋</h1>
      <p>${favorites.length} Lieblingsteam${favorites.length === 1 ? '' : 's'}${liveGames.length ? ` · <b style="color:var(--live)">${liveGames.length} live</b>` : ''}</p></div>
      <span class="updated">Aktualisiert ${timeOf(new Date())}${liveGames.length ? ' · alle 30 s' : ''}</span>
    </div>
    ${liveGames.length ? `<section class="section"><div class="section-head"><h2>🔴 Jetzt live</h2></div>
      <div class="live-strip">${liveGames.map(liveCard).join('')}</div></section>` : ''}
    <section class="section">
      <div class="section-head"><h2>Meine Teams <span class="count">${favorites.length}</span></h2>
        <button class="link-btn" data-action="open-search">+ Team hinzufügen</button></div>
      <div class="team-grid">${cards.map(teamCard).join('')}${regionalFavs.map(regionalCard).join('')}</div>
    </section>
    <div class="cols">
      <section class="section"><div class="section-head"><h2>Letzte Ergebnisse</h2></div>
        <div class="card list-card">${results.length ? results.map(e => matchRow(e, { favIds })).join('') : '<div class="empty-inline">Noch keine Ergebnisse</div>'}</div></section>
      <section class="section"><div class="section-head"><h2>Nächste Spiele</h2></div>
        <div class="card list-card">${upcoming.length ? upcoming.map(e => matchRow(e, { favIds, leagueTag: true })).join('') : '<div class="empty-inline">Keine anstehenden Spiele</div>'}</div></section>
    </div>
    ${transferHtml()}`;
}

function shortName(n) {
  const parts = String(n).split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : n;
}

async function renderOnboarding() {
  const app = $('#app');
  currentView.refresh = 0;
  app.innerHTML = `<div class="card empty">
    <div class="emoji">🏟️</div>
    <h2>Willkommen bei Anpfiff</h2>
    <p>Füge deine Lieblingsteams hinzu und verfolge Live-Spiele, Ergebnisse, Torschützen und Statistiken an einem Ort.</p>
    <button class="btn" data-action="open-search">${STAR.replace('<svg', '<svg width="16" height="16"')} Teams auswählen</button>
    <div class="popular" id="popular"><div class="spinner" style="margin:10px auto"></div></div>
  </div>
  <div style="margin-top:16px">${transferHtml(false)}</div>`;
  const teams = await loadAllTeams();
  const pop = POPULAR.map(([l, id]) => teams.find(t => t.league === l && t.id === id)).filter(Boolean);
  const el = $('#popular');
  if (!el) return;
  el.innerHTML = `<div style="width:100%;font-size:13px;color:var(--text-3);font-weight:600;margin-bottom:4px">BELIEBTE TEAMS</div>` +
    [...pop, REGIONAL_TEAMS[0]].map(t => `<button class="pop-chip ${isFav(t.league, t.id) ? 'on' : ''}" data-fav='${esc(JSON.stringify(t))}'>${t.regional ? `<span class="mini-badge">${esc(initials(t.name))}</span>` : img(t.logo)}${esc(t.short || t.name)}</button>`).join('') +
    `<div style="width:100%;margin-top:18px"><button class="btn" data-action="go-home" id="goHome" ${favorites.length ? '' : 'hidden'}>Los geht's →</button></div>`;
}

/* ---------- Spieltag ---------- */
let liveState = { offset: 0, filter: 'fav' };

async function viewLive(_, { silent } = {}) {
  const app = $('#app');
  const token = renderToken;
  const date = new Date(); date.setDate(date.getDate() + liveState.offset);
  const favLeagues = [...new Set(favorites.map(f => f.league).filter(l => leagueByKey[l]))];
  let leagues;
  if (liveState.filter === 'fav') leagues = favLeagues.length ? favLeagues : LEAGUES.map(l => l.key);
  else if (liveState.filter === 'all') leagues = LEAGUES.map(l => l.key);
  else leagues = LEAGUES.filter(l => sportOf(l.key) === liveState.filter).map(l => l.key);

  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push(`<button class="day ${i === liveState.offset ? 'on' : ''}" data-day="${i}">
      <small>${i === 0 ? 'Heute' : d.toLocaleDateString('de-DE', { weekday: 'short' })}</small><b>${d.getDate()}</b></button>`);
  }
  const usedSports = [...new Set(LEAGUES.map(l => sportOf(l.key)))];
  const chips = [['fav', '⭐ Meine Ligen'], ['all', 'Alle'], ...usedSports.map(s => [s, `${SPORTS[s].icon} ${SPORTS[s].name}`])]
    .map(([k, n]) => `<button class="chip ${liveState.filter === k ? 'on' : ''}" data-filter="${k}">${n}</button>`).join('');

  const head = `<div class="page-head"><div><h1>Spieltag</h1><p>${fullDate(date)}</p></div>
    <span class="updated" id="liveUpdated"></span></div>
    <div class="toolbar"><div class="daypicker">${days.join('')}</div><div class="chips">${chips}</div></div>`;
  if (!silent) app.innerHTML = head + '<div class="spinner"></div>';

  const boards = await Promise.all(leagues.map(l => safe(loadScoreboard(l, dayKey(date)))));
  if (token !== renderToken) return;
  const favIds = new Set(favorites.map(f => favKey(f.league, f.id)));
  const blocks = leagues.map((l, i) => {
    let evs = (boards[i] || []).filter(e => {
      // nur Spiele, die tatsächlich an diesem Tag stattfinden
      return dayKey(new Date(e.date)) === dayKey(date) || e.state === 'in';
    });
    if (!evs.length) return '';
    const order = { in: 0, pre: 1, post: 2 };
    evs.sort((a, b) => {
      const fa = favIds.has(favKey(a.league, a.home.id)) || favIds.has(favKey(a.league, a.away.id));
      const fb = favIds.has(favKey(b.league, b.home.id)) || favIds.has(favKey(b.league, b.away.id));
      return (order[a.state] - order[b.state]) || (fb - fa) || (new Date(a.date) - new Date(b.date));
    });
    const lg = leagueByKey[l];
    const liveN = evs.filter(e => e.state === 'in').length;
    return { live: liveN, html: `<div class="card league-block"><div class="lb-head">${lg.flag} ${esc(lg.name)}
      <span class="dim">${SPORTS[sportOf(l)].icon} ${evs.length} Spiel${evs.length === 1 ? '' : 'e'}</span>
      ${liveN ? `<span class="live-pill" style="margin-left:auto">${liveN} live</span>` : ''}</div>
      <div style="padding:0 6px 6px">${evs.map(e => matchRow(e, { favIds })).join('')}</div></div>` };
  }).filter(Boolean).sort((a, b) => b.live - a.live);

  const anyLive = blocks.some(b => b.live);
  if (liveState.offset === 0) setLiveDot(anyLive);
  currentView.refresh = anyLive ? 30000 : 120000;
  app.innerHTML = head + (blocks.length ? blocks.map(b => b.html).join('')
    : `<div class="card empty"><div class="emoji">📅</div><h2>Keine Spiele</h2><p>An diesem Tag finden in den gewählten Ligen keine Spiele statt.</p></div>`);
  const u = $('#liveUpdated');
  if (u) u.textContent = `Aktualisiert ${timeOf(new Date())}${anyLive ? ' · alle 30 s' : ''}`;
}

/* ---------- Team ---------- */
const teamTabs = {};

async function viewTeam([sport, lg, id], { silent } = {}) {
  const league = `${sport}/${lg}`;
  const app = $('#app');
  if (!silent) app.innerHTML = skeleton();
  const token = renderToken;

  const [sched, standings] = await Promise.all([
    safe(loadTeamSchedule(league, id)),
    safe(get(`${API2}/${league}/standings`, 300000)),
  ]);
  if (token !== renderToken) return;
  if (!sched) {
    app.innerHTML = `<button class="back" data-action="back">${BACK} Zurück</button><div class="err">Teamdaten konnten nicht geladen werden. Bitte später erneut versuchen.</div>`;
    return;
  }
  const t = sched.team || {};
  const team = { league, id: String(id), name: t.displayName || t.name, abbr: t.abbreviation, logo: logoOf(t), color: t.color };
  // Board-Merge für Live-Spiele
  const board = await safe(loadScoreboard(league));
  const boardById = new Map((board || []).map(e => [e.id, e]));
  const events = (sched?.events || []).map(e => boardById.get(e.id) || e);
  const done = events.filter(e => e.completed);
  const live = events.filter(e => e.state === 'in');
  const upcoming = events.filter(e => e.state === 'pre');
  const isSoccer = sport === 'soccer';

  // Torschützen aus den letzten Spielen
  const recent = done.slice(-6);
  let scorerMap = new Map();
  if (isSoccer) {
    const sums = await Promise.all(recent.map(e => safe(loadSummary(league, e.id, 600000))));
    sums.forEach((s, i) => {
      if (!s) return;
      const goals = goalsFromSummary(s);
      if (!recent[i].goals?.length) recent[i].goals = goals.map(g => ({ ...g, player: shortName(g.player) }));
      goals.filter(g => g.teamId === String(id) && !g.og).forEach(g => scorerMap.set(g.player, (scorerMap.get(g.player) || 0) + 1));
    });
  }
  if (token !== renderToken) return;
  currentView.refresh = live.length ? 30000 : 0;

  // Stats
  const st = computeStats(done, String(id));
  const entry = findStandingEntry(standings, id);
  const statOf = name => entry?.entry?.stats?.find(s => s.name === name || s.type === name);
  const rank = statOf('rank')?.displayValue || entry?.entry?.note?.rank || (entry ? entry.entry._pos : null);
  const record = t.recordSummary;

  const favIds = new Set(favorites.map(f => favKey(f.league, f.id)));
  const lgName = leagueByKey[league]?.name || league;
  const tab = teamTabs[league + id] || 'games';
  const tabs = [['games', 'Spiele'], ['stats', 'Statistik'], ['table', 'Tabelle']];
  const unitWord = isSoccer ? 'Tore' : 'Punkte';

  const kpis = isSoccer
    ? [['Platz', rank ? `${rank}.` : '–'], ['Punkte', statOf('points')?.displayValue ?? st.w * 3 + st.d], ['Bilanz', `${st.w}-${st.d}-${st.l}`], ['Tore', `${st.pf}:${st.pa}`], ['Ø Tore', st.n ? (st.pf / st.n).toFixed(1) : '–']]
    : [['Bilanz', record || `${st.w}-${st.l}`], ['Platz', rank ? `${rank}.` : '–'], ['Ø Punkte', st.n ? (st.pf / st.n).toFixed(1) : '–'], ['Ø Gegner', st.n ? (st.pa / st.n).toFixed(1) : '–'], ['Siegquote', st.n ? `${Math.round(st.w / st.n * 100)} %` : '–']];

  const gamesPanel = `
    ${live.length ? `<section class="section"><div class="section-head"><h2>🔴 Live</h2></div><div class="card list-card">${live.map(e => matchRow(e, { favIds })).join('')}</div></section>` : ''}
    <div class="cols">
      <section class="section"><div class="section-head"><h2>Ergebnisse</h2><span class="count">${done.length}</span></div>
        <div class="card list-card">${done.length ? [...done].reverse().map(e => matchRow(e, { favIds })).join('') : '<div class="empty-inline">Noch keine Ergebnisse in dieser Saison</div>'}</div></section>
      <section class="section"><div class="section-head"><h2>Spielplan</h2><span class="count">${upcoming.length}</span></div>
        <div class="card list-card">${upcoming.length ? upcoming.slice(0, 15).map(e => matchRow(e, { favIds })).join('') : '<div class="empty-inline">Keine anstehenden Spiele</div>'}</div></section>
    </div>`;

  const statsPanel = `<div class="stat-grid">
    <div class="card stat-card"><h3>Saisonbilanz</h3>${donut(st, isSoccer)}</div>
    <div class="card stat-card"><h3>${unitWord} pro Spiel (letzte ${Math.min(done.length, 12)})</h3>${barChart(done.slice(-12), String(id))}</div>
    <div class="card stat-card"><h3>Heim & Auswärts</h3>
      <div class="split-row"><span></span><span class="h">Heim</span><span class="h">Auswärts</span></div>
      <div class="split-row"><span>Siege</span><b>${st.home.w}</b><b>${st.away.w}</b></div>
      ${isSoccer ? `<div class="split-row"><span>Unentschieden</span><b>${st.home.d}</b><b>${st.away.d}</b></div>` : ''}
      <div class="split-row"><span>Niederlagen</span><b>${st.home.l}</b><b>${st.away.l}</b></div>
      <div class="split-row"><span>${unitWord}</span><b>${st.home.pf}:${st.home.pa}</b><b>${st.away.pf}:${st.away.pa}</b></div>
    </div>
    <div class="card stat-card"><h3>Highlights</h3><div class="info-list">
      <div><span>Höchster Sieg</span><b>${st.best ? `${st.best.s} vs ${esc(st.best.o)}` : '–'}</b></div>
      <div><span>Höchste Niederlage</span><b>${st.worst ? `${st.worst.s} vs ${esc(st.worst.o)}` : '–'}</b></div>
      <div><span>Aktuelle Serie</span><b>${st.streak || '–'}</b></div>
      ${isSoccer ? `<div><span>Zu-null-Spiele</span><b>${st.cleanSheets}</b></div>` : `<div><span>Punktedifferenz</span><b>${st.pf - st.pa > 0 ? '+' : ''}${st.pf - st.pa}</b></div>`}
    </div></div>
    ${isSoccer ? `<div class="card stat-card"><h3>Torschützen (letzte ${recent.length} Spiele)</h3>${scorerList(scorerMap)}</div>` : ''}
  </div>`;

  const tablePanel = standingsTable(standings, league, id);

  app.innerHTML = `
    <button class="back" data-action="back">${BACK} Zurück</button>
    <div class="hero" style="--team:${hex(team.color)}">
      <div class="hero-inner">
        ${img(team.logo, 'hero-logo')}
        <div><h1>${esc(team.name)}</h1>
          <div class="sub"><a class="sub-link" href="#/league/${sport}/${lg}/${id}">${SPORTS[sport].icon} ${esc(lgName)} ›</a>${rank ? ` · Platz ${esc(rank)}${entry?.group?.name && !isSoccer ? ` in der ${esc(entry.group.name)}` : ''}` : ''} ${formDots(events, id)}</div></div>
        <div class="hero-actions">${starBtn(team)}</div>
      </div>
      <div class="hero-kpis">${kpis.map(([k, v]) => `<div class="kpi"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`).join('')}</div>
    </div>
    <div class="tabs" data-tabgroup="${esc(league + id)}">${tabs.map(([k, n]) => `<button class="tab ${tab === k ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
    <div class="tab-panel ${tab === 'games' ? 'on' : ''}" data-panel="games">${gamesPanel}</div>
    <div class="tab-panel ${tab === 'stats' ? 'on' : ''}" data-panel="stats">${statsPanel}</div>
    <div class="tab-panel ${tab === 'table' ? 'on' : ''}" data-panel="table">${tablePanel}</div>`;

  // Favoriten-Daten aktuell halten (Logo/Farbe)
  const f = favorites.find(x => favKey(x.league, x.id) === favKey(league, id));
  if (f && team.name) { Object.assign(f, { name: team.name, logo: team.logo || f.logo, color: team.color || f.color }); store.set('fk.favorites', favorites); }
}

function computeStats(done, id) {
  const s = { n: 0, w: 0, d: 0, l: 0, pf: 0, pa: 0, cleanSheets: 0, home: { w: 0, d: 0, l: 0, pf: 0, pa: 0 }, away: { w: 0, d: 0, l: 0, pf: 0, pa: 0 }, best: null, worst: null, streak: '' };
  let bestDiff = 0, worstDiff = 0;
  const seq = [];
  for (const e of done) {
    const r = resultFor(e, id); if (!r) continue;
    const isHome = e.home.id === id;
    const me = isHome ? e.home : e.away, op = isHome ? e.away : e.home;
    const a = parseFloat(me.score) || 0, b = parseFloat(op.score) || 0;
    s.n++; s.pf += a; s.pa += b;
    if (b === 0) s.cleanSheets++;
    const side = isHome ? s.home : s.away;
    side.pf += a; side.pa += b;
    if (r === 'W') { s.w++; side.w++; } else if (r === 'L') { s.l++; side.l++; } else { s.d++; side.d++; }
    const diff = a - b;
    if (diff > bestDiff) { bestDiff = diff; s.best = { s: `${a}:${b}`, o: op.short }; }
    if (diff < worstDiff) { worstDiff = diff; s.worst = { s: `${a}:${b}`, o: op.short }; }
    seq.push(r);
  }
  if (seq.length) {
    const last = seq[seq.length - 1]; let n = 0;
    for (let i = seq.length - 1; i >= 0 && seq[i] === last; i--) n++;
    s.streak = `${n} ${{ W: n === 1 ? 'Sieg' : 'Siege', D: n === 1 ? 'Remis' : 'Remis', L: n === 1 ? 'Niederlage' : 'Niederlagen' }[last]} in Folge`;
  }
  return s;
}

function donut(st, showDraw) {
  const parts = [['Siege', st.w, 'var(--win)'], ...(showDraw ? [['Unentschieden', st.d, 'var(--draw)']] : []), ['Niederlagen', st.l, 'var(--loss)']];
  const total = parts.reduce((a, p) => a + p[1], 0);
  if (!total) return '<div class="empty-inline">Noch keine Spiele</div>';
  const R = 52, C = 2 * Math.PI * R;
  let off = 0;
  const arcs = parts.map(([, v, c]) => {
    const len = v / total * C;
    const a = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${c}" stroke-width="16" stroke-dasharray="${Math.max(len - 2, 0)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)" stroke-linecap="butt"/>`;
    off += len; return a;
  }).join('');
  return `<div class="donut-wrap"><svg width="140" height="140" viewBox="0 0 140 140">
      <circle r="${R}" cx="70" cy="70" fill="none" stroke="var(--card-2)" stroke-width="16"/>${arcs}
      <text x="70" y="68" text-anchor="middle" font-size="26" font-weight="800" fill="var(--text)">${st.n}</text>
      <text x="70" y="88" text-anchor="middle" font-size="11" fill="var(--text-2)">Spiele</text></svg>
    <div class="legend">${parts.map(([n, v, c]) => `<div><i style="background:${c}"></i>${n}<b>${v}</b></div>`).join('')}
      <div style="color:var(--text-2);font-size:13px">Siegquote<b>${Math.round(st.w / total * 100)} %</b></div></div></div>`;
}

function barChart(games, id) {
  if (!games.length) return '<div class="empty-inline">Noch keine Spiele</div>';
  const vals = games.map(e => {
    const me = e.home.id === id ? e.home : e.away, op = me === e.home ? e.away : e.home;
    return { a: parseFloat(me.score) || 0, b: parseFloat(op.score) || 0, o: op.abbr || op.short, r: resultFor(e, id) };
  });
  const max = Math.max(1, ...vals.flatMap(v => [v.a, v.b]));
  const W = 320, H = 150, pad = 18, bw = (W - pad) / vals.length;
  const bars = vals.map((v, i) => {
    const x = pad + i * bw, h1 = v.a / max * (H - 30), h2 = v.b / max * (H - 30), w = Math.max(3, bw / 2 - 3);
    const col = v.r === 'W' ? 'var(--win)' : v.r === 'L' ? 'var(--loss)' : 'var(--draw)';
    return `<g><title>${esc(v.o)}: ${v.a}:${v.b}</title>
      <rect x="${x + 1}" y="${H - 16 - h1}" width="${w}" height="${Math.max(h1, 1.5)}" rx="2" fill="${col}"/>
      <rect x="${x + 1 + w + 2}" y="${H - 16 - h2}" width="${w}" height="${Math.max(h2, 1.5)}" rx="2" fill="var(--text-3)" opacity=".45"/>
      <text x="${x + bw / 2}" y="${H - 3}" text-anchor="middle">${esc((v.o || '').slice(0, 3))}</text></g>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}">
    <line x1="${pad}" x2="${W}" y1="${H - 16}" y2="${H - 16}" stroke="var(--line-2)"/>
    <text x="0" y="${H - 16 - (H - 30)}" >${max}</text><text x="0" y="${H - 16}">0</text>${bars}</svg>
    <div class="legend" style="grid-auto-flow:column;justify-content:start;gap:18px;margin-top:10px;font-size:12.5px">
      <div><i style="background:var(--win)"></i>Erzielt</div><div><i style="background:var(--text-3);opacity:.45"></i>Kassiert</div></div>`;
}

function scorerList(map) {
  const arr = [...map].sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!arr.length) return '<div class="empty-inline">Keine Torschützen gefunden</div>';
  const max = arr[0][1];
  return arr.map(([n, g], i) => `<div class="scorer-row"><span class="rk">${i + 1}</span><span class="nm">${esc(n)}</span>
    <span class="bar"><i style="width:${g / max * 100}%"></i></span><b>${g}</b></div>`).join('');
}

/* ---------- Standings ---------- */
function collectGroups(node, out = [], name) {
  if (!node) return out;
  if (node.standings?.entries?.length) out.push({ name: node.name || name, entries: node.standings.entries });
  (node.children || []).forEach(c => collectGroups(c, out, c.name));
  return out;
}
function sortEntries(entries) {
  const v = (e, n) => e.stats?.find(s => s.name === n)?.value;
  return [...entries].sort((a, b) => {
    const ra = v(a, 'rank'), rb = v(b, 'rank');
    if (ra != null && rb != null && ra !== rb) return ra - rb;
    const sa = v(a, 'playoffSeed'), sb = v(b, 'playoffSeed');
    if (sa != null && sb != null && sa !== sb) return sa - sb;
    return (v(b, 'winPercent') || 0) - (v(a, 'winPercent') || 0) || (v(b, 'points') || 0) - (v(a, 'points') || 0);
  });
}
function findStandingEntry(data, id) {
  for (const g of collectGroups(data)) {
    const sorted = sortEntries(g.entries);
    const i = sorted.findIndex(e => String(e.team?.id) === String(id));
    if (i >= 0) { sorted[i]._pos = i + 1; return { group: g, entry: sorted[i] }; }
  }
  return null;
}
function standingsTable(data, league, id) {
  const groups = collectGroups(data);
  if (!groups.length) return '<div class="card empty-inline">Keine Tabelle verfügbar</div>';
  const sport = sportOf(league);
  const cols = sport === 'soccer'
    ? [['gamesPlayed', 'Sp'], ['wins', 'S'], ['ties', 'U'], ['losses', 'N'], ['_goals', 'Tore'], ['pointDifferential', 'Diff'], ['points', 'Pkt']]
    : sport === 'hockey'
      ? [['gamesPlayed', 'Sp'], ['wins', 'S'], ['losses', 'N'], ['otLosses', 'OTN'], ['pointDifferential', 'Diff'], ['points', 'Pkt']]
      : [['wins', 'S'], ['losses', 'N'], ['winPercent', 'Quote'], ['gamesBehind', 'GB'], ['streak', 'Serie']];
  // Gruppe mit dem Team zuerst
  groups.sort((a, b) => (b.entries.some(e => String(e.team?.id) === String(id)) - a.entries.some(e => String(e.team?.id) === String(id))));
  const [sp, lg] = league.split('/');
  return groups.map(g => {
    const rows = sortEntries(g.entries).map((e, i) => {
      const s = n => e.stats?.find(x => x.name === n);
      const cells = cols.map(([n]) => {
        if (n === '_goals') return `<td>${s('pointsFor')?.displayValue ?? '-'}:${s('pointsAgainst')?.displayValue ?? '-'}</td>`;
        return `<td class="${n === 'points' ? 'pts' : ''}">${esc(s(n)?.displayValue ?? '-')}</td>`;
      }).join('');
      const me = String(e.team?.id) === String(id);
      const fav = !me && isFav(league, e.team?.id);
      const note = e.note?.color ? `style="--note:${esc(e.note.color)}" title="${esc(e.note.description || '')}"` : '';
      return `<tr class="${me ? 'me' : ''} ${fav ? 'fav' : ''} clickable" data-href="#/team/${sp}/${lg}/${e.team?.id}">
        <td class="rank l" ${note}>${i + 1}</td>
        <td class="l"><div class="tm">${img(logoOf(e.team))}${esc(e.team?.shortDisplayName || e.team?.displayName)}${fav ? ' <span class="fav-mark">★</span>' : ''}</div></td>${cells}</tr>`;
    }).join('');
    const legend = [...new Map(g.entries.filter(e => e.note?.color).map(e => [e.note.color, e.note.description])).entries()];
    return `<div class="card section">${groups.length > 1 ? `<div class="group-title">${esc(g.name || '')}</div>` : ''}
      <div class="table-wrap"><table class="standings"><thead><tr><th class="l">#</th><th class="l">Team</th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody></table></div>
      ${legend.length ? `<div style="display:flex;gap:16px;flex-wrap:wrap;padding:12px 14px;font-size:12px;color:var(--text-2)">${legend.map(([c, d]) => `<span style="display:flex;align-items:center;gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:${esc(c)}"></i>${esc(d)}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');
}

/* ---------- Tabellen ---------- */
const TABLE_ICON = '<svg viewBox="0 0 24 24"><path d="M3 4h18v16H3V4zm2 2v3h14V6H5zm0 5v3h6v-3H5zm8 0v3h6v-3h-6zm-8 5v2h6v-2H5zm8 0v2h6v-2h-6z"/></svg>';

async function viewTables() {
  currentView.refresh = 0;
  const favLeagues = new Set(favorites.map(f => f.league));
  const tile = l => {
    const [s, lg] = l.key.split('/');
    return `<a class="card league-tile" href="#/league/${s}/${lg}"><span class="lt-flag">${l.flag}</span>
      <div class="lt-txt"><div class="lt-name">${esc(l.name)}</div><div class="lt-sub">${SPORTS[s].icon} ${SPORTS[s].name}${favLeagues.has(l.key) ? ' · <span class="fav-mark">★</span>' : ''}</div></div>${ARROW}</a>`;
  };
  const rtile = l => `<a class="card league-tile" href="#/regional/${l.key.split('/')[1]}"><span class="lt-flag">${l.flag}</span>
      <div class="lt-txt"><div class="lt-name">${esc(l.name)}</div><div class="lt-sub">${esc(l.region)} · ${l.tier}. Liga-Stufe${favLeagues.has(l.key) ? ' · <span class="fav-mark">★</span>' : ''}</div></div>${ARROW}</a>`;
  const mine = [...LEAGUES.filter(l => favLeagues.has(l.key)).map(tile), ...REGIONAL_LEAGUES.filter(l => favLeagues.has(l.key)).map(rtile)];
  const block = (title, html) => html.length ? `<section class="section"><div class="section-head"><h2>${title}</h2></div><div class="league-grid">${html.join('')}</div></section>` : '';
  $('#app').innerHTML = `<div class="page-head"><div><h1>Tabellen</h1><p>Wähle eine Liga, um die aktuelle Tabelle zu sehen.</p></div></div>
    ${block('Meine Ligen', mine)}
    ${block('⚽ Fußball', LEAGUES.filter(l => sportOf(l.key) === 'soccer').map(tile))}
    ${block('🏔️ Vorarlberg & Ostschweiz', REGIONAL_LEAGUES.map(rtile))}
    ${block('🇺🇸 US-Sport', LEAGUES.filter(l => sportOf(l.key) !== 'soccer').map(tile))}`;
}

async function viewLeague([sport, lg, teamId], { silent } = {}) {
  const league = `${sport}/${lg}`;
  const info = leagueByKey[league];
  const app = $('#app');
  if (!silent) app.innerHTML = skeleton();
  const token = renderToken;
  const [standings, board] = await Promise.all([
    safe(get(`${API2}/${league}/standings`, 300000)),
    safe(loadScoreboard(league)),
  ]);
  if (token !== renderToken) return;
  const favIds = new Set(favorites.map(f => favKey(f.league, f.id)));
  const live = (board || []).filter(e => e.state === 'in');
  currentView.refresh = live.length ? 30000 : 0;
  const order = { in: 0, pre: 1, post: 2 };
  const games = (board || []).slice().sort((a, b) => (order[a.state] - order[b.state]) || (new Date(a.date) - new Date(b.date)));
  const rawSeason = standings?.seasons?.[0]?.displayName || standings?.children?.[0]?.standings?.seasonDisplayName || '';
  const sm = String(rawSeason).match(/(\d{4})(?:-(\d{2,4}))?/);
  const season = sm ? `Saison ${sm[1]}${sm[2] ? '/' + sm[2].slice(-2) : ''}` : '';
  app.innerHTML = `<button class="back" data-action="back">${BACK} Zurück</button>
    <div class="page-head"><div><h1>${info?.flag || ''} ${esc(info?.name || standings?.name || league)}</h1>
      <p>${SPORTS[sport]?.icon || ''} ${SPORTS[sport]?.name || ''}${season ? ` · ${esc(season)}` : ''}</p></div>
      ${live.length ? `<span class="live-pill">${live.length} live</span>` : ''}</div>
    <div class="tabs" data-tabgroup="L${esc(league)}">
      <button class="tab on" data-tab="ltable">Tabelle</button><button class="tab" data-tab="lgames">Spiele</button></div>
    <div class="tab-panel on" data-panel="ltable">${standingsTable(standings, league, teamId)}</div>
    <div class="tab-panel" data-panel="lgames">${games.length
      ? `<div class="card list-card">${games.map(e => matchRow(e, { favIds })).join('')}</div>`
      : '<div class="card empty-inline">Aktuell keine Spiele in dieser Liga.</div>'}</div>`;
  if (teamId && !silent) $('tr.me')?.scrollIntoView({ block: 'center' });
}

function regionalCardHtml(f, table) {
  const l = regionalByKey[f.league];
  const [, lk] = f.league.split('/');
  const links = regionalTeamLinks(f);
  const tableLink = l ? regionalLeagueLinks(l)[0] : null;
  const row = findRow(table, f.name);
  if (row) {
    const above = table.rows.find(r => r.rank === row.rank - 1);
    return `<div class="card team-card regional" style="--team:${l?.flag === '🇨🇭' ? '#e3342f' : '#19b874'}" data-href="#/rteam/${lk}/${esc(f.id)}">
    <div class="tc-head"><span class="tc-badge">${esc(initials(f.name))}</span>
      <div><div class="tc-name">${esc(f.name)}</div><div class="tc-league">${leagueFlag(f.league)} ${esc(l?.name || '')} · ${esc(l?.region || '')}</div></div>
      ${starBtn(f)}</div>
    <div class="tc-body">
      <div class="tc-line"><span class="lbl">Tabelle</span><div class="opp"><span>Platz ${row.rank} von ${table.rows.length}</span></div><span class="val">${row.pts} Pkt</span></div>
      <div class="tc-line"><span class="lbl">Bilanz</span><div class="opp"><span>${row.w} S · ${row.d} U · ${row.l} N</span></div><span class="val">${row.gf}:${row.ga}</span></div>
      ${above ? `<div class="tc-line"><span class="lbl">Davor</span><div class="opp"><span>${esc(above.team)}</span></div><span class="val dim">${above.pts - row.pts > 0 ? '+' : ''}${above.pts - row.pts} Pkt</span></div>` : ''}
    </div>
    <div class="tc-foot"><span class="dim">${row.p} Spiele</span><a class="table-link" href="#/regional/${lk}">${TABLE_ICON}Platz ${row.rank}</a></div>
  </div>`;
  }
  return `<div class="card team-card regional" style="--team:${l?.flag === '🇨🇭' ? '#e3342f' : '#19b874'}" data-href="#/rteam/${lk}/${esc(f.id)}">
    <div class="tc-head"><span class="tc-badge">${esc(initials(f.name))}</span>
      <div><div class="tc-name">${esc(f.name)}</div><div class="tc-league">${leagueFlag(f.league)} ${esc(l?.name || '')} · ${esc(l?.region || '')}</div></div>
      ${starBtn(f)}</div>
    <div class="tc-body">
      ${tableLink ? extLink(['Tabelle öffnen', tableLink[1]], 'tc-line tc-ext') : ''}
      ${extLink(['Spielplan & Ergebnisse', links[0][1]], 'tc-line tc-ext')}
    </div>
    <div class="tc-foot"><span class="dim">Externe Daten</span><a class="table-link" href="#/regional/${lk}">${TABLE_ICON}Liga</a></div>
  </div>`;
}

async function viewRegionalLeague([lk], { silent } = {}) {
  currentView.refresh = 0;
  const l = regionalByKey[`regional/${lk}`];
  if (!l) { location.hash = '#/tables'; return; }
  const teams = [...REGIONAL_TEAMS, ...favorites.filter(f => f.custom)].filter(t => t.league === l.key);
  const token = renderToken;
  if (!silent && l.source) $('#app').innerHTML = skeleton();
  const table = await loadRegionalTable(l);
  if (token !== renderToken) return;
  $('#app').innerHTML = `<button class="back" data-action="back">${BACK} Zurück</button>
    <div class="page-head"><div><h1>${l.flag} ${esc(l.name)}</h1><p>${esc(l.region)} · ${l.tier}. Liga-Stufe · Saison ${esc(table?.season || seasonStr())}</p></div></div>
    ${table ? `<section class="section"><div class="section-head"><h2>Tabelle</h2><span class="count">${table.rows.length} Teams</span></div>${regionalTableHtml(table, l.key)}${table.manual ? pasteFormHtml(l, false).replace('<b>Tabelle einfügen</b>', '<b>Neuere Tabelle einfügen</b>') : ''}</section>
      <section class="section"><div class="section-head"><h2>Spiele & mehr</h2></div><div class="card info-card"><div class="ext-links">${regionalLeagueLinks(l).map(x => extLink(x, 'ext-link big')).join('')}</div></div></section>`
    : `<section class="section"><div class="section-head"><h2>Tabelle</h2></div>
      <p class="muted lead-note">Für diese Liga gibt es keine frei zugängliche Datenquelle – ÖFB und Ergebnisportale sperren automatische Abrufe. Kopiere die Tabelle einfach einmal aus deinem Browser hierher, dann siehst du sie direkt in der App (sobald Wikipedia eine Tabelle für ${esc(seasonStr())} führt, erscheint sie automatisch).</p>
      ${pasteFormHtml(l, true)}</section>
      <section class="section"><div class="section-head"><h2>Spiele & mehr</h2></div><div class="card info-card"><div class="ext-links">${regionalLeagueLinks(l).map(x => extLink(x, 'ext-link big')).join('')}</div></div></section>`}
    <section class="section"><div class="section-head"><h2>Teams</h2></div>
      ${teams.length ? `<div class="card list-card">${teams.map(t => `<div class="rt-row" data-href="#/rteam/${lk}/${esc(t.id)}"><span class="mini-badge lg">${esc(initials(t.name))}</span><span class="nm">${esc(t.name)}</span>${starBtn(t)}</div>`).join('')}</div>` : ''}
      <div class="card" style="margin-top:14px;padding:18px">${customTeamForm('', l.key)}</div>
    </section>`;
}

async function viewRegionalTeam([lk, id], { silent } = {}) {
  currentView.refresh = 0;
  const key = `regional/${lk}`;
  const l = regionalByKey[key];
  const t = favorites.find(f => f.league === key && f.id === id) || REGIONAL_TEAMS.find(x => x.league === key && x.id === id);
  if (!t || !l) { location.hash = '#/'; return; }
  const color = l.flag === '🇨🇭' ? '#e3342f' : '#19b874';
  const token = renderToken;
  if (!silent && l.source) $('#app').innerHTML = skeleton();
  const table = await loadRegionalTable(l);
  if (token !== renderToken) return;
  const row = findRow(table, t.name);
  $('#app').innerHTML = `<button class="back" data-action="back">${BACK} Zurück</button>
    <div class="hero" style="--team:${color}"><div class="hero-inner">
      <span class="tc-badge hero-badge">${esc(initials(t.name))}</span>
      <div><h1>${esc(t.name)}</h1><div class="sub"><a class="sub-link" href="#/regional/${lk}">${l.flag} ${esc(l.name)} ›</a> · ${esc(l.region)}</div></div>
      <div class="hero-actions">${starBtn(t)}</div></div>
      ${row ? `<div class="hero-kpis">${[['Platz', `${row.rank}.`], ['Punkte', row.pts], ['Bilanz', `${row.w}-${row.d}-${row.l}`], ['Tore', `${row.gf}:${row.ga}`], ['Spiele', row.p]]
        .map(([k, v]) => `<div class="kpi"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`).join('')}</div>` : ''}</div>
    ${row ? `<section class="section"><div class="section-head"><h2>Tabelle ${esc(l.name)}</h2></div>${regionalTableHtml(table, l.key)}</section>` : ''}
    <div class="card info-card">
      <p>${row ? 'Spielplan und Einzelergebnisse öffnest du direkt beim Verband bzw. Ergebnisdienst:' : `Noch keine Tabelle für diese Liga in der App. <a class="inline-link" href="#/regional/${lk}">Tabelle einfügen ›</a> – oder direkt beim Verband bzw. Ergebnisdienst öffnen:`}</p>
      <div class="ext-links">${regionalTeamLinks(t).map(x => extLink(x, 'ext-link big')).join('')}</div>
    </div>`;
  if (row && !silent) $('tr.me')?.scrollIntoView({ block: 'nearest' });
}

/* ---------- Game ---------- */
const gameTabs = {};
const SOCCER_STATS = [
  ['possessionPct', 'Ballbesitz', '%'], ['totalShots', 'Schüsse'], ['shotsOnTarget', 'Schüsse aufs Tor'],
  ['wonCorners', 'Ecken'], ['totalPasses', 'Pässe'], ['passPct', 'Passquote', 'pct'], ['foulsCommitted', 'Fouls'],
  ['offsides', 'Abseits'], ['saves', 'Paraden'], ['yellowCards', 'Gelbe Karten'], ['redCards', 'Rote Karten'],
  ['effectiveTackles', 'Gewonnene Tacklings'], ['interceptions', 'Abgefangene Bälle'],
];
const LABEL_DE = {
  'Field Goal %': 'Wurfquote', 'Three Point %': 'Dreierquote', 'Free Throw %': 'Freiwurfquote', 'Rebounds': 'Rebounds',
  'Assists': 'Assists', 'Steals': 'Steals', 'Blocks': 'Blocks', 'Turnovers': 'Ballverluste', 'Fouls': 'Fouls',
  'Total Yards': 'Raumgewinn gesamt', 'Passing': 'Passing Yards', 'Rushing': 'Rushing Yards', '1st Downs': 'First Downs',
  'Turnovers ': 'Ballverluste', 'Possession': 'Ballbesitz', 'Penalties': 'Strafen', 'Shots': 'Schüsse', 'Hits': 'Hits',
  'Blocked Shots': 'Geblockte Schüsse', 'Faceoffs Won': 'Gewonnene Bullys', 'Giveaways': 'Puckverluste', 'Takeaways': 'Puckgewinne',
  'Power Play Goals': 'Powerplay-Tore', 'Penalty Minutes': 'Strafminuten', 'Fast Break Points': 'Fastbreak-Punkte',
  'Points in Paint': 'Punkte in der Zone', 'Largest Lead': 'Größte Führung',
};

function periodName(sport, n) {
  if (sport === 'soccer') return n === 1 ? '1. Halbzeit' : n === 2 ? '2. Halbzeit' : n <= 4 ? 'Verlängerung' : 'Elfmeterschießen';
  if (sport === 'basketball' || sport === 'football') return n <= 4 ? `${n}. Viertel` : 'Verlängerung';
  if (sport === 'hockey') return n <= 3 ? `${n}. Drittel` : n === 4 ? 'Verlängerung' : 'Penaltyschießen';
  return `${n}. Inning`;
}

async function viewGame([sport, lg, eventId], { silent } = {}) {
  const league = `${sport}/${lg}`;
  const app = $('#app');
  if (!silent) app.innerHTML = skeleton();
  const token = renderToken;
  const sum = await safe(loadSummary(league, eventId, 15000));
  if (token !== renderToken) return;
  if (!sum?.header) {
    app.innerHTML = `<button class="back" data-action="back">${BACK} Zurück</button><div class="err">Spieldaten konnten nicht geladen werden.</div>`;
    return;
  }
  const comp = sum.header.competitions?.[0] || {};
  const e = normEvent({ id: eventId, date: comp.date, competitions: [comp] }, league);
  const live = e.state === 'in', pre = e.state === 'pre';
  currentView.refresh = live ? 20000 : 0;
  const isSoccer = sport === 'soccer';
  const H = e.home, A = e.away;
  const homeTeam = comp.competitors?.find(c => c.homeAway === 'home')?.team || {};
  const awayTeam = comp.competitors?.find(c => c.homeAway === 'away')?.team || {};
  const goals = isSoccer ? goalsFromSummary(sum) : [];

  const scorersBlock = goals.length ? `<div class="sh-scorers">
      <div class="h">${goals.filter(g => g.teamId === H.id).map(g => `<span>${esc(shortName(g.player))} ${esc(g.min)}${g.pen ? ' (E)' : ''}${g.og ? ' (ET)' : ''} ⚽</span>`).join('')}</div>
      <div>${goals.filter(g => g.teamId === A.id).map(g => `<span>⚽ ${esc(shortName(g.player))} ${esc(g.min)}${g.pen ? ' (E)' : ''}${g.og ? ' (ET)' : ''}</span>`).join('')}</div></div>` : '';

  const statusLine = live ? `<span class="live-pill">Live</span> ${esc(statusText(e))}`
    : pre ? `${relDay(e.date)}, ${timeOf(e.date)} Uhr` : esc(statusText(e));

  const hero = `<div class="card score-hero" style="--home:${hex(homeTeam.color)};--away:${hex(awayTeam.color)}">
    <div class="sh-meta">${SPORTS[sport].icon} ${esc(leagueByKey[league]?.name || sum.header.league?.name || '')} · ${fullDate(e.date)}</div>
    <div class="sh-main">
      <div class="sh-team" data-href="#/team/${sport}/${lg}/${H.id}">${img(H.logo)}<div class="nm">${esc(H.name)}</div>${H.record && !isSoccer ? `<div class="rec">${esc(H.record)}</div>` : ''}</div>
      <div>${pre ? `<div class="sh-score pre">${timeOf(e.date)}</div>` : `<div class="sh-score" style="${live ? 'color:var(--live)' : ''}">${esc(H.score ?? 0)}<span class="sep">:</span>${esc(A.score ?? 0)}</div>`}
        <div class="sh-status">${statusLine}</div></div>
      <div class="sh-team" data-href="#/team/${sport}/${lg}/${A.id}">${img(A.logo)}<div class="nm">${esc(A.name)}</div>${A.record && !isSoccer ? `<div class="rec">${esc(A.record)}</div>` : ''}</div>
    </div>${scorersBlock}</div>`;

  // Verlauf
  let timeline = '';
  if (isSoccer) timeline = soccerTimeline(sum, H.id, sport);
  else timeline = scoringPlays(sum, sport, H, A);

  const stats = statsCompare(sum, isSoccer, H, A);
  const lineups = isSoccer ? soccerLineups(sum) : leadersBlock(sum);
  const lines = !isSoccer ? linescore(comp, sport) : '';
  const gi = sum.gameInfo || {};
  const info = `<div class="card cmp"><div class="info-list">
    ${gi.venue?.fullName ? `<div><span>Stadion</span><b>${esc(gi.venue.fullName)}${gi.venue.address?.city ? `, ${esc(gi.venue.address.city)}` : ''}</b></div>` : ''}
    ${gi.attendance ? `<div><span>Zuschauer</span><b>${Number(gi.attendance).toLocaleString('de-DE')}</b></div>` : ''}
    ${gi.officials?.[0] ? `<div><span>Schiedsrichter</span><b>${esc(gi.officials[0].displayName || gi.officials[0].fullName)}</b></div>` : ''}
    <div><span>Anstoß</span><b>${fullDate(e.date)}, ${timeOf(e.date)} Uhr</b></div>
  </div></div>`;

  const tabs = [
    ['timeline', isSoccer ? 'Spielverlauf' : 'Punkte'],
    ['stats', 'Statistik'],
    ['lineups', isSoccer ? 'Aufstellung' : 'Top-Spieler'],
    ['info', 'Infos'],
  ];
  const tab = gameTabs[eventId] || (pre ? 'info' : 'timeline');

  app.innerHTML = `<button class="back" data-action="back">${BACK} Zurück</button>${hero}
    ${lines ? `<div class="card cmp" style="margin-top:16px">${lines}</div>` : ''}
    <div class="tabs" style="margin-top:20px" data-tabgroup="g${esc(eventId)}">${tabs.map(([k, n]) => `<button class="tab ${tab === k ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
    <div class="tab-panel ${tab === 'timeline' ? 'on' : ''}" data-panel="timeline">${timeline || `<div class="card empty-inline">${pre ? 'Das Spiel hat noch nicht begonnen.' : 'Kein Spielverlauf verfügbar.'}</div>`}</div>
    <div class="tab-panel ${tab === 'stats' ? 'on' : ''}" data-panel="stats">${stats || `<div class="card empty-inline">${pre ? 'Statistiken gibt es ab Anpfiff.' : 'Keine Statistiken verfügbar.'}</div>`}</div>
    <div class="tab-panel ${tab === 'lineups' ? 'on' : ''}" data-panel="lineups">${lineups || '<div class="card empty-inline">Noch keine Daten verfügbar.</div>'}</div>
    <div class="tab-panel ${tab === 'info' ? 'on' : ''}" data-panel="info">${info}</div>
    ${live ? `<p class="updated" style="justify-content:center;margin-top:20px">Live – aktualisiert alle 20 s · zuletzt ${timeOf(new Date())}</p>` : ''}`;
}

function soccerTimeline(sum, homeId, sport) {
  const evs = (sum.keyEvents || []).filter(k => {
    const t = k.type?.type || '';
    return k.scoringPlay || t.includes('card') || t.includes('substitution') || t === 'halftime' || t === 'end-regular-time';
  });
  if (!evs.length) return '';
  let html = '', lastPeriod = 0;
  for (const k of evs) {
    const t = k.type?.type || '';
    const p = k.period?.number || 1;
    if (p !== lastPeriod) { html += `<div class="tl-period">${periodName(sport, p)}</div>`; lastPeriod = p; }
    if (t === 'halftime' || t === 'end-regular-time') continue;
    const side = String(k.team?.id) === String(homeId) ? 'home' : 'away';
    const pl = k.participants || [];
    let ico, cls = '', title, sub = '';
    if (k.scoringPlay) {
      ico = '⚽'; cls = 'goal';
      title = pl[0]?.athlete?.displayName || 'Tor';
      sub = t.includes('own-goal') ? 'Eigentor' : t.includes('penalty') ? 'Elfmeter' : pl[1] ? `Vorlage: ${pl[1].athlete.displayName}` : (k.type?.text || '').replace('Goal', 'Tor');
      const m = (k.text || '').match(/(\d+),\s*[^,]*?(\d+)\./);
      if (m) title += ` <span class="tl-score">${m[1]}:${m[2]}</span>`;
    } else if (t.includes('red') || t.includes('second-yellow')) {
      ico = ''; cls = 'red'; title = pl[0]?.athlete?.displayName || 'Rote Karte'; sub = t.includes('yellow') ? 'Gelb-Rot' : 'Rote Karte';
    } else if (t.includes('card')) {
      ico = ''; cls = 'yellow'; title = pl[0]?.athlete?.displayName || 'Gelbe Karte'; sub = 'Gelbe Karte';
    } else {
      ico = '🔄'; title = pl[0]?.athlete?.displayName || 'Wechsel'; sub = pl[1] ? `für ${pl[1].athlete.displayName}` : 'Auswechslung';
    }
    const ev = `<div class="tl-ev ${side}"><div class="tl-ico ${cls}">${ico}</div><div class="tl-txt"><b>${title.includes('<span') ? title.replace(/^([^<]*)/, m => esc(m)) : esc(title)}</b><small>${esc(sub)}</small></div></div>`;
    html += `<div class="tl-item ${cls}">${side === 'home' ? ev : '<div></div>'}<div class="tl-min">${esc(k.clock?.displayValue || '')}</div>${side === 'away' ? ev : '<div></div>'}</div>`;
  }
  return `<div class="card timeline">${html}</div>`;
}

function scoringPlays(sum, sport, H, A) {
  const plays = sum.scoringPlays || [];
  if (!plays.length) return '';
  let html = '', lastP = 0;
  for (const p of plays) {
    const n = p.period?.number || 1;
    if (n !== lastP) { html += `<div class="tl-period">${periodName(sport, n)}</div>`; lastP = n; }
    const logo = p.team?.logo || (String(p.team?.id) === H.id ? H.logo : A.logo);
    html += `<div class="play">${img(logo)}<div class="t">${esc(p.text)}<small>${esc(p.type?.text || '')}${p.clock?.displayValue ? ` · ${esc(p.clock.displayValue)}` : ''}</small></div>
      <div class="s">${esc(p.awayScore ?? '')} : ${esc(p.homeScore ?? '')}</div></div>`;
  }
  return `<div class="card list-card"><div style="display:flex;justify-content:flex-end;gap:6px;padding:8px 12px;font-size:11px;color:var(--text-3);font-weight:700">${esc(A.abbr)} : ${esc(H.abbr)}</div>${html}</div>`;
}

function statsCompare(sum, isSoccer, H, A) {
  const teams = sum.boxscore?.teams || [];
  if (teams.length < 2) return '';
  const ht = teams.find(t => String(t.team?.id) === H.id) || teams[1];
  const at = teams.find(t => String(t.team?.id) === A.id) || teams[0];
  if (!ht.statistics?.length) return '';
  const val = (t, name) => t.statistics?.find(s => s.name === name);
  let rows = [];
  if (isSoccer) {
    rows = SOCCER_STATS.map(([n, label, unit]) => {
      const a = val(ht, n), b = val(at, n);
      if (!a || !b) return null;
      let av = a.displayValue, bv = b.displayValue;
      if (unit === 'pct') { av = `${Math.round(parseFloat(av) * 100)} %`; bv = `${Math.round(parseFloat(bv) * 100)} %`; }
      if (unit === '%') { av = `${av} %`; bv = `${bv} %`; }
      return { label, av, bv, a: parseFloat(a.displayValue) || 0, b: parseFloat(b.displayValue) || 0 };
    }).filter(Boolean);
  } else {
    rows = ht.statistics.slice(0, 16).map(s => {
      const o = at.statistics.find(x => x.name === s.name);
      if (!o) return null;
      const num = v => parseFloat(String(v).split(/[-/]/)[0]) || 0;
      return { label: LABEL_DE[s.label] || s.label || s.name, av: s.displayValue, bv: o.displayValue, a: num(s.displayValue), b: num(o.displayValue) };
    }).filter(Boolean);
  }
  if (!rows.length) return '';
  return `<div class="card cmp" style="--home:${hex(ht.team?.color)};--away:${hex(at.team?.color)}">
    <div class="cmp-head">${img(H.logo)}<span class="dim" style="font-size:13px;font-weight:600">Teamstatistik</span>${img(A.logo)}</div>
    ${rows.map(r => {
      const tot = r.a + r.b || 1;
      return `<div class="cmp-row"><div class="cmp-lbl"><b class="${r.a > r.b ? 'more' : ''}">${esc(r.av)}</b><span>${esc(r.label)}</span><b class="${r.b > r.a ? 'more' : ''}">${esc(r.bv)}</b></div>
        <div class="cmp-bar"><div><i class="l" style="width:${r.a / tot * 100}%"></i></div><div><i class="r" style="width:${r.b / tot * 100}%"></i></div></div></div>`;
    }).join('')}</div>`;
}

function soccerLineups(sum) {
  const rs = sum.rosters || [];
  if (!rs.length || !rs.some(r => r.roster?.length)) return '';
  const ordered = [...rs].sort((a, b) => (a.homeAway === 'home' ? -1 : 1) - (b.homeAway === 'home' ? -1 : 1));
  return `<div class="lineups">${ordered.map(r => {
    const starters = (r.roster || []).filter(p => p.starter);
    const bench = (r.roster || []).filter(p => !p.starter);
    const pRow = p => {
      const tags = [];
      const st = Object.fromEntries((p.stats || []).map(s => [s.name, s.value]));
      if (st.totalGoals > 0) tags.push('⚽'.repeat(Math.min(st.totalGoals, 4)));
      if (st.yellowCards > 0) tags.push('🟨');
      if (st.redCards > 0) tags.push('🟥');
      if (p.subbedOut) tags.push('<span class="dim">↓</span>');
      if (p.subbedIn) tags.push('<span style="color:var(--win)">↑</span>');
      return `<div class="player"><span class="no">${esc(p.jersey ?? '')}</span><span>${esc(p.athlete?.displayName)}</span>
        <span class="tags">${tags.join(' ')}</span><span class="pos">${esc(p.position?.abbreviation || '')}</span></div>`;
    };
    return `<div class="card lineup"><h3>${img(logoOf(r.team))}${esc(r.team?.displayName)}</h3>
      <div class="formation">${r.formation ? `Formation ${esc(r.formation)}` : r.homeAway === 'home' ? 'Heim' : 'Gast'}</div>
      <h4>Startelf</h4>${starters.map(pRow).join('') || '<div class="dim">–</div>'}
      ${bench.length ? `<h4>Bank</h4>${bench.map(pRow).join('')}` : ''}</div>`;
  }).join('')}</div>`;
}

function leadersBlock(sum) {
  const L = sum.leaders || [];
  if (!L.length || !L.some(t => t.leaders?.length)) return '';
  return `<div class="leaders-grid">${L.map(t => `<div class="card lineup"><h3>${img(logoOf(t.team))}${esc(t.team?.displayName)}</h3>
    ${(t.leaders || []).slice(0, 4).map(cat => {
      const l = cat.leaders?.[0]; if (!l) return '';
      return `<div class="leader">${l.athlete?.headshot?.href ? `<img class="ph" src="${esc(l.athlete.headshot.href)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="ph"></span>'}
        <div><div class="cat">${esc(LABEL_DE[cat.displayName] || cat.displayName)}</div><div class="nm">${esc(l.athlete?.displayName)}</div><div class="val">${esc(l.displayValue)}</div></div></div>`;
    }).join('')}</div>`).join('')}</div>`;
}

function linescore(comp, sport) {
  const cs = comp.competitors || [];
  if (!cs.some(c => c.linescores?.length)) return '';
  const ordered = [...cs].sort((a, b) => (a.homeAway === 'away' ? -1 : 1) - (b.homeAway === 'away' ? -1 : 1));
  const n = Math.max(...ordered.map(c => c.linescores?.length || 0));
  const head = Array.from({ length: n }, (_, i) => {
    const lim = sport === 'hockey' ? 3 : sport === 'baseball' ? 99 : 4;
    return `<th>${i < lim ? i + 1 : 'OT'}</th>`;
  }).join('');
  return `<div class="table-wrap"><table class="linescore"><thead><tr><th class="l">Team</th>${head}<th>${sport === 'baseball' ? 'R' : 'Ges.'}</th></tr></thead><tbody>
    ${ordered.map(c => `<tr><td class="l"><div class="tm" style="display:flex;align-items:center;gap:8px;font-weight:600">${img(logoOf(c.team), '', '')}${esc(c.team?.abbreviation)}</div></td>
      ${Array.from({ length: n }, (_, i) => `<td>${esc(c.linescores?.[i]?.displayValue ?? '-')}</td>`).join('')}<td class="tot">${esc(c.score ?? '')}</td></tr>`).join('')}
  </tbody></table></div>`;
}

/* ---------- Search modal ---------- */
let searchState = { sport: 'all', league: 'all', q: '' };
let allTeams = null;

async function openSearch() {
  $('#searchModal').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#searchInput').focus(), 50);
  renderSearchChips();
  if (!allTeams) {
    $('#searchResults').innerHTML = '<div class="spinner" style="grid-column:1/-1"></div>';
    allTeams = await loadAllTeams();
  }
  renderSearchResults();
}
function closeSearch() {
  $('#searchModal').hidden = true;
  document.body.style.overflow = '';
  route({ silent: true });
}
function renderSearchChips() {
  const sports = ['all', ...Object.keys(SPORTS)];
  $('#sportChips').innerHTML = sports.map(s => `<button class="chip ${searchState.sport === s ? 'on' : ''}" data-ssport="${s}">${s === 'all' ? 'Alle Sportarten' : `${SPORTS[s].icon} ${SPORTS[s].name}`}</button>`).join('');
  const lgs = searchState.sport === 'regional' ? REGIONAL_LEAGUES
    : LEAGUES.filter(l => !l.noSearch && (searchState.sport === 'all' || sportOf(l.key) === searchState.sport));
  $('#leagueChips').innerHTML = lgs.length > 1
    ? [`<button class="chip ${searchState.league === 'all' ? 'on' : ''}" data-sleague="all">Alle Ligen</button>`, ...lgs.map(l => `<button class="chip ${searchState.league === l.key ? 'on' : ''}" data-sleague="${l.key}">${l.flag} ${esc(l.name)}</button>`)].join('')
    : '';
}
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss'); }
function renderSearchResults() {
  if (!allTeams) return;
  const q = norm(searchState.q.trim());
  const customs = favorites.filter(f => f.custom);
  let list = [...allTeams, ...REGIONAL_TEAMS, ...customs].filter(t =>
    (searchState.sport === 'all' || sportOf(t.league) === searchState.sport) &&
    (searchState.league === 'all' || t.league === searchState.league) &&
    (!q || norm(`${t.name} ${t.short} ${t.abbr} ${t.location}`).includes(q)));
  list.sort((a, b) => (isFav(b.league, b.id) - isFav(a.league, a.id)) || a.name.localeCompare(b.name));
  const total = list.length;
  list = list.slice(0, 120);
  $('#searchResults').innerHTML = list.length
    ? list.map(t => `<div class="sr-item">${t.regional ? `<span class="mini-badge lg">${esc(initials(t.name))}</span>` : img(t.logo)}<div><div class="nm">${esc(t.name)}</div>
        <div class="lg">${t.regional ? leagueFlag(t.league) : SPORTS[sportOf(t.league)].icon} ${esc(leagueName(t.league))}</div></div>${starBtn(t)}</div>`).join('') +
      (total > list.length ? `<div class="empty-inline" style="grid-column:1/-1">… ${total - list.length} weitere – grenze die Suche ein</div>` : '')
    : `<div class="empty-inline" style="grid-column:1/-1">Kein Team gefunden für „${esc(searchState.q)}“</div>`;
  if (searchState.sport === 'regional' || (q && !list.length)) $('#searchResults').innerHTML += customTeamForm(searchState.q.trim(), searchState.league);
}

function customTeamForm(name = '', league = 'all') {
  const sel = isRegional(league) ? league : 'regional/ll';
  return `<form class="custom-form" id="customTeamForm" style="grid-column:1/-1">
    <div><b>Dein Verein fehlt?</b><p class="muted">Füge jedes Team aus Vorarlberg oder der Ostschweiz selbst hinzu. Tabelle und Spiele öffnest du dann mit einem Tipp.</p></div>
    <div class="cf-row">
      <input id="customTeamName" name="name" required maxlength="60" placeholder="Vereinsname, z. B. FC Hard" value="${esc(name)}" autocomplete="off">
      <select id="customTeamLeague" name="league">${REGIONAL_LEAGUES.map(l => `<option value="${l.key}" ${l.key === sel ? 'selected' : ''}>${l.flag} ${esc(l.name)}</option>`).join('')}</select>
      <button class="btn" type="submit">Hinzufügen</button>
    </div></form>`;
}

document.addEventListener('submit', ev => {
  if (ev.target.classList.contains('import-form')) {
    ev.preventDefault();
    const n = importFavCode($('#favCodeInput').value);
    const msg = $('#favMsg');
    if (n < 0) { msg.textContent = 'Kein gültiger Code. Er beginnt mit ANPFIFF1:'; return; }
    toast(n ? `${n} Favorit${n === 1 ? '' : 'en'} übernommen` : 'Alle Favoriten waren schon vorhanden');
    renderToken++; route();
    return;
  }
  if (ev.target.classList.contains('paste-form')) {
    ev.preventDefault();
    const key = ev.target.dataset.league;
    const l = regionalByKey[key];
    const ta = ev.target.querySelector('textarea');
    const msg = ev.target.querySelector('.paste-msg');
    const rows = parsePastedTable(ta.value);
    if (rows.length < 4) {
      msg.textContent = 'Keine Tabelle erkannt. Kopiere die komplette Tabelle mit Platz, Spielen, S/U/N, Toren (z. B. 28:8) und Punkten.';
      return;
    }
    store.set(manualKey(key), { rows, season: seasonStr(), savedAt: new Date().toISOString() });
    toast(`Tabelle ${l?.name || ''} gespeichert (${rows.length} Teams)`);
    renderToken++; route();
    return;
  }
  if (ev.target.id !== 'customTeamForm') return;
  ev.preventDefault();
  const name = $('#customTeamName').value.trim();
  const league = $('#customTeamLeague').value;
  if (!name || !regionalByKey[league]) return;
  const slug = norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'team';
  const team = { ...rteam(league, `eigen-${slug}-${Date.now().toString(36)}`, name, name), custom: true };
  toggleFav(team);
  searchState.q = ''; $('#searchInput').value = '';
  renderSearchResults();
});

/* ---------- Router & refresh ---------- */
const routes = [
  [/^#\/?$/, viewHome, 'home'],
  [/^#\/live\/?$/, viewLive, 'live'],
  [/^#\/tables\/?$/, viewTables, 'tables'],
  [/^#\/league\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/, viewLeague, 'tables'],
  [/^#\/regional\/([^/]+)$/, viewRegionalLeague, 'tables'],
  [/^#\/rteam\/([^/]+)\/([^/]+)$/, viewRegionalTeam, 'team'],
  [/^#\/team\/([^/]+)\/([^/]+)\/([^/]+)$/, viewTeam, 'team'],
  [/^#\/game\/([^/]+)\/([^/]+)\/([^/]+)$/, viewGame, 'game'],
];
let refreshTimer = null;

async function route({ silent = false } = {}) {
  const hash = location.hash || '#/';
  let match = null;
  for (const [re, fn, name] of routes) {
    const m = hash.match(re);
    if (m) { match = { fn, name, params: m.slice(1) }; break; }
  }
  if (!match) { location.hash = '#/'; return; }
  if (!silent) renderToken++;
  $('#app').classList.toggle('silent', silent);
  currentView = { name: match.name, refresh: 0 };
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === match.name));
  if (!silent) window.scrollTo({ top: 0 });
  try {
    await match.fn(match.params, { silent });
  } catch (err) {
    console.error(err);
    if (!silent) $('#app').innerHTML = `<div class="err">Etwas ist schiefgelaufen: ${esc(err.message)}. <button class="link-btn" data-action="reload">Erneut versuchen</button></div>`;
  }
  scheduleRefresh();
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  const ms = currentView?.refresh;
  if (!ms) return;
  refreshTimer = setTimeout(() => {
    if (document.hidden || !$('#searchModal').hidden) return scheduleRefresh();
    route({ silent: true });
  }, ms);
}

function setLiveDot(on) { $('#navLiveDot').hidden = !on; }

/* ---------- Events ---------- */
document.addEventListener('click', ev => {
  if (ev.target.closest('a[href]') && !ev.target.closest('[data-fav]')) return;
  const fav = ev.target.closest('[data-fav]');
  if (fav) {
    ev.preventDefault(); ev.stopPropagation();
    const team = JSON.parse(fav.dataset.fav);
    toggleFav(team);
    document.querySelectorAll('[data-fav]').forEach(b => {
      try { const t = JSON.parse(b.dataset.fav); const on = isFav(t.league, t.id); b.classList.toggle('on', on); } catch {}
    });
    const go = $('#goHome');
    if (go) { go.hidden = !favorites.length; go.textContent = `Los geht's mit ${favorites.length} Team${favorites.length === 1 ? '' : 's'} →`; }
    if (!$('#searchModal').hidden || go) return;
    if (currentView?.name === 'home') { renderToken++; route(); }
    return;
  }
  const tab = ev.target.closest('[data-tab]');
  if (tab) {
    const group = tab.closest('[data-tabgroup]');
    const key = group.dataset.tabgroup;
    if (currentView?.name === 'game') gameTabs[key.slice(1)] = tab.dataset.tab;
    else teamTabs[key] = tab.dataset.tab;
    group.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === tab));
    document.querySelectorAll('[data-panel]').forEach(p => p.classList.toggle('on', p.dataset.panel === tab.dataset.tab));
    return;
  }
  const day = ev.target.closest('[data-day]');
  if (day) { liveState.offset = +day.dataset.day; renderToken++; viewLive(null, {}).then(scheduleRefresh); return; }
  const filter = ev.target.closest('[data-filter]');
  if (filter) { liveState.filter = filter.dataset.filter; store.set('fk.liveFilter', liveState.filter); renderToken++; viewLive(null, {}).then(scheduleRefresh); return; }
  const ss = ev.target.closest('[data-ssport]');
  if (ss) { searchState.sport = ss.dataset.ssport; searchState.league = 'all'; renderSearchChips(); renderSearchResults(); return; }
  const sl = ev.target.closest('[data-sleague]');
  if (sl) { searchState.league = sl.dataset.sleague; renderSearchChips(); renderSearchResults(); return; }
  const act = ev.target.closest('[data-action]');
  if (act) {
    const a = act.dataset.action;
    if (a === 'open-search') openSearch();
    else if (a === 'close-search') closeSearch();
    else if (a === 'back') { if (history.length > 1) history.back(); else location.hash = '#/'; }
    else if (a === 'reload' || a === 'go-home') route();
    else if (a === 'copy-favs') {
      const code = favCode();
      const fallback = () => { const i = $('#favCodeInput'); i.value = code; i.focus(); i.select(); $('#favMsg').textContent = 'Code markiert – jetzt kopieren und in der anderen App einfügen.'; };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(() => toast('Code kopiert – in der anderen App einfügen'), fallback);
      else fallback();
    }
    else if (a === 'clear-table') { try { localStorage.removeItem(manualKey(act.dataset.league)); } catch {} toast('Eingefügte Tabelle entfernt'); renderToken++; route(); }
    else if (a === 'toggle-theme') {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next; store.set('fk.theme', next);
    }
    return;
  }
  const href = ev.target.closest('[data-href]');
  if (href) { location.hash = href.dataset.href; }
});

$('#searchInput').addEventListener('input', e => { searchState.q = e.target.value; renderSearchResults(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#searchModal').hidden) closeSearch();
  if (e.key === '/' && $('#searchModal').hidden && !/input|textarea/i.test(document.activeElement?.tagName)) { e.preventDefault(); openSearch(); }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && currentView?.refresh) route({ silent: true }); });
window.addEventListener('hashchange', () => route());

/* ---------- Init ---------- */
const savedTheme = store.get('fk.theme', null);
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) document.documentElement.dataset.theme = 'light';
liveState.filter = store.get('fk.liveFilter', 'fav');
favorites.forEach(f => { f.name = germanize(f.name || ''); });
route();

// Als App installierbar machen (PWA) – Service Worker für Offline-Start und schnelle Ladezeiten
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW:', err)));
}
})();
