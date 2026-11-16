# Einkaufszettel

Einkaufslisten-App nach dem Vorbild von Bring, aber einfach und werbefrei. Ziel-Domain: `einkauf.micana.de` (GitHub Pages, wie die anderen micana.de-Apps). Sprache der Oberfläche: Deutsch.

Dieser Stand ist ein Prototyp aus einer Chat-Vorschau: eine einzige `index.html` ohne Backend, Daten nur im `localStorage` des Geräts.

## Aufbau

- `index.html` – gebaute Seite, nicht von Hand bearbeiten.
- `src/template.html` – Vorlage mit CSS und der gesamten App-Logik. Platzhalter: `/*CATALOG*/`, `/*SYN*/`, `<!--SPRITE-->`, `<!--OWN-->`.
- `src/gen.py` – Katalog-Generator: Artikellisten je Abteilung, Marken, Alltagsartikel (Rangfolge), Synonyme. Liest zusätzlich `src/add1.py` bis `add3.py`.
- `src/sprite_base.html`, `src/sprite_new.html` – Linien-Symbole (werden nur noch für Plus und Haken gebraucht).
- `src/sprite_own.html` – vier eigene farbige Zeichnungen: Brötchen, Becher, Wurst, Tüte.
- `build.sh` – baut `index.html` und startet `tools/pruefen.js` (Logiktest ohne Browser). Braucht Python 3 und Node.

Bauen: `./build.sh`

## Stand der Funktionen

- Mehrere Listen, anlegen, umbenennen, löschen.
- Suche über 8550 Artikel in 19 Abteilungen, 246 Synonyme, Rangfolge mit rund 180 Alltagsartikeln, 339 Markennamen (nur Namen, keine Logos).
- Dreispaltiges Kachelraster; tippen hakt ab, lange drücken öffnet Menge und Abteilung.
- Rückgängig für Abhaken, Löschen und Hinzufügen.
- Eigene Artikel bekommen Abteilung und Bildzeichen über Wortregeln.
- Heller und dunkler Modus.

## Getroffene Entscheidungen

- Bedienung: ein Bildschirm, zwei Gesten. Keine Werbung, keine Angebote, keine Rezepte, kein Kontozwang.
- Raster durchgehend 3 Spalten, nach Abteilung sortiert, ohne Zwischenüberschriften.
- Kein Hinweistext am Seitenende.
- Bildzeichen: farbig im Stil von Noto Color Emoji; keine Kombinationen aus Grundform und Zusatzzeichen.
- Lücken im Set werden durch eigene Zeichnungen im gleichen Look gefüllt.

## Offene Punkte, in dieser Reihenfolge

1. **Bildzeichen als Dateien.** Die Vorschau nutzt die Emoji-Schrift des Geräts, weil die nachgeladene Google-Schrift auf manchen Geräten leer blieb. Für die App die Noto-Emoji-Grafiken als einzelne SVG-Dateien ins Repo legen und über die Tabelle `EMO` in `src/template.html` zuordnen. Vorher die Lizenz der Grafiken prüfen und im Repo vermerken.
2. **Zuordnung durchsehen.** Bekannte Fehlgriffe: „Thunfisch in Öl“ zeigt eine Flasche, „Frischhaltefolie“ eine Einkaufstüte, Windeln eine Sicherheitsnadel. 286 Motive für 8550 Artikel; viele Artikel teilen sich ein Motiv (Pflegeflasche, Tüte).
3. **Eigene Zeichnungen.** Die vier vorhandenen wirken flacher als das Set. Kandidaten für neue: Windel, Chipstüte, Konservenglas mit Inhalt, Waschmittel, Blumenerde.
4. **PWA.** Manifest, App-Symbole, Service Worker für Offline-Nutzung. Schriften (Bricolage Grotesque, Figtree) lokal einbinden statt von Google laden.
5. **Aufteilen.** Katalog als eigene JSON-Datei, CSS und Skript in eigene Dateien. Nicht mehr gebrauchten Code entfernen (Linien-Symbole, `META`-Regeln dienen nur noch dem Einsortieren eigener Artikel).
6. **Teilen und Live-Abgleich.** Gewünscht: geteilte Listen in Echtzeit ohne Konto, per Link oder Code. Backend noch nicht entschieden (Firestore: Offline-Abgleich eingebaut; Supabase: EU-Region, Offline selbst bauen).
7. **Katalog.** Ziel waren 10.000 Artikel. Der Katalog ist von Hand zusammengestellt und nicht gegen echte Sortimente geprüft.

## Technische Hinweise

- Zustand: `localStorage`-Schlüssel `einkaufszettel.v1`, Feld `v: 3`. Artikel speichern den Index ihrer Abteilung; wenn sich die Abteilungen ändern, `v` erhöhen und in `load()` neu einsortieren.
- Suche vergleicht ohne Umlaute und Groß-/Kleinschreibung (`norm()`).
- Geprüft wurde nur in einem Handy-großen Desktop-Browserfenster, nicht auf echten Geräten. Langes Drücken und Vibration sind ungetestet.
