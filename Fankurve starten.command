#!/bin/bash
# Startet Fankurve lokal und öffnet die App im Browser.
cd "$(dirname "$0")"
PORT=5173
HOST="$(scutil --get LocalHostName 2>/dev/null).local"
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)"
( sleep 1 && open "http://localhost:$PORT" ) &
echo ""
echo "  Fankurve läuft!"
echo "  Auf diesem Mac:    http://localhost:$PORT"
echo "  Auf dem iPhone:    http://$HOST:$PORT"
[ -n "$IP" ] && echo "  (oder per IP:     http://$IP:$PORT)"
echo "  iPhone muss im selben WLAN sein. Zum Beenden dieses Fenster schließen."
echo ""
python3 -m http.server $PORT
