#!/bin/sh
# Erzeugt die gebauten Dateien und prüft den Stand. Braucht Python 3 und Node.
#   katalog.js  aus src/gen.py (Artikel, Marken, Synonyme)
#   sw.js       aus src/sw.js (Dateilisten und Version für die Offline-Nutzung)
# index.html, app.css und app.js werden von Hand bearbeitet; danach dieses Skript laufen lassen,
# damit sw.js eine neue Version bekommt und installierte Apps die Änderung laden.
set -e
cd "$(dirname "$0")"
(cd src && python3 gen.py ../katalog.js 2>&1 | head -n 1)
python3 tools/bildzeichen.py | head -n 1
python3 tools/sw_bauen.py
node --check app.js && node --check sw.js && echo "Skripte in Ordnung"
node tools/pruefen.js
