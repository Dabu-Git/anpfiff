# Anpfiff ⚽🏀🏈🏒⚾

Verfolge deine Lieblingsteams: Live-Spiele, Ergebnisse, Torschützen, Statistiken und Tabellen.

## Online öffnen
Die App läuft über GitHub Pages dieses Repositorys.

Als App installieren:
- **iPhone/iPad:** Link in Safari öffnen → Teilen → „Zum Home-Bildschirm“
- **Mac (Chrome/Edge):** Installieren-Symbol rechts in der Adressleiste
- **Mac (Safari):** Ablage → Zum Dock hinzufügen

## Lokal starten
Doppelklick auf **„Anpfiff starten.command“**. Die App öffnet sich dann unter http://localhost:5173.
Alternativ im Terminal: `python3 -m http.server 5173` in diesem Ordner.

## Updates veröffentlichen
Änderungen committen und pushen (`git push`) – GitHub Pages aktualisiert die Online-Version nach ca. 1 Minute.

## Funktionen
- **Meine Teams**: Dashboard mit Live-Spielen, letztem Ergebnis, nächstem Spiel und Form deiner Favoriten
- **Spieltag**: alle Spiele eines Tages (±3 Tage), gefiltert nach deinen Ligen oder Sportarten
- **Tabellen**: alle Ligen auf einen Blick, jede Tabelle mit einem Tipp – auch direkt aus jeder Teamkarte
- **Teamseite**: Ergebnisse mit Torschützen, Spielplan, Saisonstatistik (Bilanz, Tore/Punkte pro Spiel, Heim/Auswärts, Serien, Torjäger) und Tabelle
- **Spielseite**: Spielverlauf (Tore, Vorlagen, Karten, Wechsel), Teamstatistik, Aufstellungen bzw. Top-Spieler, Viertel-/Drittelergebnisse
- **Team hinzufügen**: Suche über Bundesliga, 2. Bundesliga, Premier League, LaLiga, Serie A, Ligue 1, Eredivisie, Primeira Liga, Österr. Bundesliga, NBA, NFL, NHL und MLB
- Live-Spiele aktualisieren sich automatisch, heller und dunkler Modus, für Handy optimiert

- **Vorarlberg & Ostschweiz**: Regionalliga West, Eliteliga, Vorarlbergliga, Landesliga, 1.–5. Landesklasse und die Schweizer 2. Liga regional (z. B. FC Au-Berneck 05). Eigene Vereine lassen sich hinzufügen.
  Für diese Ligen gibt es keine offene Datenschnittstelle (ÖFB und football.ch sperren automatische Abrufe) – Tabelle und Spiele werden deshalb auf der jeweiligen Seite geöffnet.

Favoriten werden lokal im Browser gespeichert. Die Daten stammen aus der öffentlichen ESPN-Sport-API.
