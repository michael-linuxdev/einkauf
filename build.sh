#!/bin/sh
# Baut index.html aus src/: Vorlage + Piktogramm-Sprites + Katalog.
set -e
cd "$(dirname "$0")"
mkdir -p build
python3 - <<'PY'
import re
d = {}
for f in ("src/sprite_base.html", "src/sprite_new.html"):
    for m in re.finditer(r'<symbol id="i-([a-z]+)".*?</symbol>', open(f, encoding="utf-8").read(), re.S):
        d[m.group(1)] = m.group(0)
t = open("src/template.html", encoding="utf-8").read()
t = t.replace("<!--OWN-->", open("src/sprite_own.html", encoding="utf-8").read())
t = t.replace("<!--SPRITE-->", "\n".join(d.values()))
open("build/template.html", "w", encoding="utf-8").write(t)
PY
(cd src && python3 gen.py ../build/template.html ../index.html 2> ../build/katalog.log)
head -n 1 build/katalog.log
python3 - <<'PY'
import re
s = open("index.html", encoding="utf-8").read()
open("build/app.js", "w", encoding="utf-8").write(re.search(r"<script>(.*)</script>", s, re.S).group(1))
PY
node --check build/app.js && echo "Skript in Ordnung"
python3 tools/bildzeichen.py | head -n 1
node tools/pruefen.js
