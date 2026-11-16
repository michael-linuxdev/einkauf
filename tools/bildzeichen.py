#!/usr/bin/env python3
"""Kopiert die in src/template.html (Tabelle EMO) benutzten Bildzeichen als SVG nach emoji/.

Aufruf: tools/bildzeichen.py <Pfad zu noto-emoji/2D/svg>
Quelle und Lizenz: siehe emoji/LIZENZ.md. Die Dateien werden unverändert übernommen.
Dateiname: Codepunkte in Hex, mit "_" verbunden, ohne Variantenwähler FE0F (wie glyph() in der Vorlage).
"""
import os, re, shutil, sys

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
t = open(os.path.join(root, "src", "template.html"), encoding="utf-8").read()
block = t[t.index("var EMO = {"):t.index("var EMO_DEF")]
zeichen = {s for s in re.findall(r'"([^"]+)"', block) if any(ord(c) > 0x2000 for c in s)}
zeichen.add("🛒")

def datei(z):
    return "_".join("%x" % ord(c) for c in z if ord(c) != 0xFE0F) + ".svg"

ziel = os.path.join(root, "emoji")
soll = {datei(z): z for z in zeichen}
for alt in os.listdir(ziel):
    if alt.endswith(".svg") and alt not in soll:
        os.remove(os.path.join(ziel, alt)); print("entfernt:", alt)
fehlt = []
if len(sys.argv) > 1:
    for f, z in sorted(soll.items()):
        q = os.path.join(sys.argv[1], "emoji_u" + f)
        if os.path.exists(q): shutil.copyfile(q, os.path.join(ziel, f))
        else: fehlt.append(z + " " + f)
else:
    fehlt = [z + " " + f for f, z in sorted(soll.items()) if not os.path.exists(os.path.join(ziel, f))]
print("%d Bildzeichen, %d fehlen" % (len(soll), len(fehlt)))
for x in fehlt: print("  fehlt:", x)
sys.exit(1 if fehlt else 0)
