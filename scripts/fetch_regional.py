#!/usr/bin/env python3
"""Holt Tabellen regionaler Ligen, die keine offene Schnittstelle haben, und speichert sie als JSON.

Quelle für die OFV 2. Liga (Gruppe des FC Au-Berneck 05): die öffentliche Seite des
Liechtensteiner Fussballverbands (LFV), deren robots.txt das Abrufen erlaubt.
Wird stündlich von GitHub Actions ausgeführt – bewusst selten, um die Seite nicht zu belasten.
Nur Python-Standardbibliothek.
"""
import html
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone

UA = 'AnpfiffApp/1.0 (+https://dabu-git.github.io/anpfiff/)'
OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else 'data'

SOURCES = {
    'ch2lr': {
        'url': 'https://www.lfv.li/breitenfussball/vereinsfussball/erwachsenenfussball/2-liga',
        'label': 'Liechtensteiner Fussballverband (LFV) / OFV',
    },
}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'de'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', errors='replace')


def text(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).replace('\xa0', ' ').strip()


def team_name(raw):
    name = text(raw)
    # "FC Bad Ragaz 1" = 1. Mannschaft -> Nummer weglassen, "Vaduz 2" bleibt
    return re.sub(r'\s+1$', '', name)


def parse_lfv(page):
    heading = re.search(r'<h[1-4][^>]*>\s*(2\. Liga[^<]*)</h[1-4]>', page)
    title = text(heading.group(1)) if heading else '2. Liga'
    start = page.find('cfcleague-leaguetable-row')
    if start < 0:
        raise ValueError('Tabelle nicht gefunden')
    table = page[page.rfind('<table', 0, start):page.find('</table>', start)]
    rows = []
    for tr in re.findall(r'<tr class="cfcleague-leaguetable-row[^"]*">(.*?)</tr>', table, re.S):
        def cell(cls):
            m = re.search(r'class="' + cls + r'[^"]*"[^>]*>(.*?)</', tr, re.S)
            return text(m.group(1)) if m else ''
        def num(cls):
            v = cell(cls)
            return int(v) if re.fullmatch(r'-?\d+', v) else 0
        name_m = re.search(r'class="name[^"]*">(.*?)</span>', tr, re.S)
        pos = re.sub(r'\D', '', cell('position'))
        if not name_m:
            continue
        rows.append({
            'rank': int(pos) if pos else len(rows) + 1,
            'team': team_name(name_m.group(1)),
            'p': num('matchcount'), 'w': num('wincount'), 'd': num('drawcount'), 'l': num('losecount'),
            'gf': num('goals1'), 'ga': num('goals2'), 'pts': num('points'),
        })
    if len(rows) < 4:
        raise ValueError(f'zu wenige Zeilen ({len(rows)})')
    season = re.search(r'Saison\s*(\d{4}/\d{2,4})', title)
    group = re.sub(r'\s*\(Saison[^)]*\)', '', title).strip()
    return {'title': group, 'season': season.group(1) if season else '', 'rows': rows}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    ok = True
    for key, src in SOURCES.items():
        try:
            data = parse_lfv(fetch(src['url']))
            data.update({
                'source': {'label': src['label'], 'url': src['url']},
                'updated': datetime.now(timezone.utc).isoformat(timespec='seconds'),
            })
            with open(os.path.join(OUT_DIR, f'{key}.json'), 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=1)
            print(f'{key}: {len(data["rows"])} Zeilen – {data["title"]} {data["season"]}')
        except Exception as e:  # Quelle down oder umgebaut: alten Stand behalten
            ok = False
            print(f'{key}: FEHLER {e}', file=sys.stderr)
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
