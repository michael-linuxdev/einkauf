#!/usr/bin/env python3
"""Gleicht den Katalog mit den deutschen Kategorienamen von Open Food Facts ab.

Die Taxonomien liegen im öffentlichen Quelltext (github.com/openfoodfacts/openfoodfacts-server, Ordner taxonomies).
Ausgegeben werden die Namen, die im Katalog in keiner Schreibweise vorkommen (Wortstämme, Reihenfolge egal).
Die Liste ist ein Vorschlag zum Durchsehen, kein Automat: Vieles sind Sammelbegriffe, Herkunftsangaben oder
Mehrzahlformen. Was davon in den Katalog gehört, kommt von Hand in src/add5.py.

Aufruf: python3 tools/abgleich_off.py [food|beauty|petfood|product] > fehlend.txt
"""
import json, os, re, sys, unicodedata, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://raw.githubusercontent.com/openfoodfacts/openfoodfacts-server/main/taxonomies/%s/categories.txt"

def norm(s):
    s = unicodedata.normalize("NFD", s.lower().replace("ß", "ss"))
    return "".join(c for c in s if not unicodedata.combining(c))

def stems(s):
    return sorted(re.sub("(en|er|es|e|n|s)$", "", w) if len(w) > 4 else w for w in re.split("[^a-z0-9]+", norm(s)) if w)

def katalog():
    t = open(os.path.join(ROOT, "katalog.js"), encoding="utf-8").read()
    data = json.loads(re.search(r"var DATA = (.*?);\n", t, re.S).group(1))
    out = []
    def walk(x):
        if isinstance(x, str): out.extend(n for n in x.split("|") if n)
        elif isinstance(x, list): [walk(y) for y in x]
        elif isinstance(x, dict): [walk(y) for y in x.values()]
    walk(data)
    return out

def main():
    names = katalog()
    have = {" ".join(stems(n)) for n in names} | {"".join(stems(n)) for n in names}
    seen, miss, total = set(), [], 0
    for part in (sys.argv[1:] or ["food", "beauty", "petfood"]):
        for line in urllib.request.urlopen(URL % part, timeout=120).read().decode("utf-8").split("\n"):
            if not line.startswith("de:"): continue
            alle = [x.strip() for x in line[3:].split(",") if x.strip()]
            if not alle or " ".join(stems(alle[0])) in seen: continue
            seen.add(" ".join(stems(alle[0]))); total += 1
            if not any(" ".join(stems(n)) in have or "".join(stems(n)) in have for n in alle): miss.append(alle[0])
    print("\n".join(sorted(miss)))
    print("%d deutsche Kategorienamen, %d davon nicht im Katalog" % (total, len(miss)), file=sys.stderr)

if __name__ == "__main__":
    main()
