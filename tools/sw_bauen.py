#!/usr/bin/env python3
"""Schreibt sw.js aus src/sw.js: trägt die Listen der vorzuhaltenden Dateien und eine Version ein.

Die Version ist ein Hash über den Inhalt aller Dateien. Mit --pruefen wird nichts geschrieben,
sondern nur gemeldet, ob sw.js zum aktuellen Stand passt (Rückgabewert 1, wenn nicht).
"""
import hashlib, json, os, sys

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
kern = ["index.html", "app.css", "app.js", "katalog.js", "manifest.webmanifest",
        "fonts/figtree.woff2", "fonts/bricolage-grotesque.woff2",
        "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"]
bilder = sorted("emoji/" + f for f in os.listdir(os.path.join(root, "emoji")) if f.endswith(".svg"))
vorlage = open(os.path.join(root, "src", "sw.js"), encoding="utf-8").read()
h = hashlib.sha256(vorlage.encode("utf-8"))
for f in kern + bilder:
    h.update(f.encode("utf-8")); h.update(open(os.path.join(root, f), "rb").read())
# "./" steht für die Startseite; index.html bleibt zusätzlich unter eigenem Namen abrufbar
neu = (vorlage.replace("/*VERSION*/", h.hexdigest()[:12])
       .replace("/*KERN*/", json.dumps(["./"] + kern))
       .replace("/*BILDER*/", json.dumps(bilder)))
ziel = os.path.join(root, "sw.js")
if "--pruefen" in sys.argv:
    ok = os.path.exists(ziel) and open(ziel, encoding="utf-8").read() == neu
    print("sw.js ist aktuell" if ok else "sw.js ist veraltet: ./build.sh laufen lassen")
    sys.exit(0 if ok else 1)
open(ziel, "w", encoding="utf-8").write(neu)
print("sw.js geschrieben, Version", h.hexdigest()[:12], "-", len(kern) + 1, "Kerndateien,", len(bilder), "Bildzeichen")
