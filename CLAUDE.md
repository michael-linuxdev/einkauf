# Einkaufszettel

Einkaufslisten-App nach dem Vorbild von Bring, aber einfach und werbefrei. Ziel-Domain: `einkauf.micana.de` (GitHub Pages, wie die anderen micana.de-Apps). Sprache der Oberfläche: Deutsch.

Statische Seite ohne Backend, als PWA installierbar und ohne Netz nutzbar. Daten liegen nur im `localStorage` des Geräts.

## Aufbau

Von Hand bearbeitet:

- `index.html` – Gerüst der Seite, Plus- und Haken-Symbol, fünf eigene farbige Zeichnungen (`x-bun`, `x-cup`, `x-sausage`, `x-bag`, `x-roll`).
- `app.css` – gesamtes Aussehen, heller und dunkler Modus, Einbindung der Schriften.
- `app.js` – gesamte Logik: Abteilungen und Wortregeln (`META`), Bildzeichen-Tabelle (`EMO`), Zustand, Liste, Suche, Blätter, Anmeldung des Service Workers.
- `manifest.webmanifest`, `icons/` – PWA-Angaben und App-Symbole (`icons/icon.svg` ist die Vorlage der PNGs).
- `src/gen.py` mit `src/add1.py` bis `add3.py` – Katalog-Generator: Artikellisten je Abteilung, Marken, Alltagsartikel (Rangfolge), Synonyme.
- `src/sw.js` – Vorlage des Service Workers.

Erzeugt, nicht von Hand bearbeiten:

- `katalog.js` – Katalog (`DATA`, `SYNRAW`) aus `src/gen.py`. Bewusst eine Skriptdatei statt JSON: Sie lädt ohne Umweg vor `app.js`, und die App startet auch von der Festplatte.
- `sw.js` – aus `src/sw.js`; `tools/sw_bauen.py` trägt die Dateilisten und eine Version ein (Hash über alle vorgehaltenen Dateien).

Fremdes Material:

- `emoji/` – 285 Noto-Emoji-Grafiken als SVG, mit SVGO verkleinert (Apache-Lizenz 2.0; Herkunft, Änderungen und Lizenz in `emoji/LIZENZ.md`). Dateiname = Codepunkte in Hex ohne FE0F, z. B. `1f34e.svg`.
- `fonts/` – Figtree und Bricolage Grotesque als variable WOFF2-Dateien (SIL Open Font License, siehe `fonts/LIZENZ.md`).

Werkzeuge:

- `build.sh` – erzeugt `katalog.js` und `sw.js`, prüft die Skripte und startet den Logiktest. Braucht Python 3 und Node.
- `tools/pruefen.js` – Logiktest ohne Browser: Katalog, Bildzeichen (Datei oder Zeichnung zu jedem Zeichen vorhanden), Suchreihenfolge, Stand von `sw.js`.
- `tools/bildzeichen.py` – gleicht `emoji/` mit der Tabelle `EMO` ab: mit `<Pfad zu noto-emoji/2D/svg>` kopiert es fehlende Dateien und entfernt nicht mehr benutzte, ohne Pfad prüft es nur. Neue Dateien danach verkleinern: `npx svgo@4 --config tools/svgo.config.js -f emoji`.

**Nach jeder Änderung `./build.sh` laufen lassen.** Sonst behält `sw.js` die alte Version, und installierte Apps laden die Änderung nicht.

## Stand der Funktionen

- Mehrere Listen, anlegen, umbenennen, löschen.
- Suche über 8550 Artikel in 19 Abteilungen, 246 Synonyme, Rangfolge mit rund 180 Alltagsartikeln, 339 Markennamen (nur Namen, keine Logos).
- Dreispaltiges Kachelraster; tippen hakt ab, lange drücken öffnet Menge und Abteilung.
- Rückgängig für Abhaken, Löschen und Hinzufügen.
- Eigene Artikel bekommen Abteilung und Bildzeichen über Wortregeln.
- Heller und dunkler Modus.
- PWA: installierbar, läuft nach dem ersten Besuch ohne Netz (App, Katalog, Schriften, alle Bildzeichen).

## Getroffene Entscheidungen

- Bedienung: ein Bildschirm, zwei Gesten. Keine Werbung, keine Angebote, keine Rezepte, kein Kontozwang.
- Raster durchgehend 3 Spalten, nach Abteilung sortiert, ohne Zwischenüberschriften.
- Kein Hinweistext am Seitenende.
- Bildzeichen: Noto-Emoji-Grafiken als SVG-Dateien aus `emoji/`, nicht aus einer Schrift; nur wenn eine Datei nicht lädt, springt die Emoji-Schrift des Geräts ein. Keine Kombinationen aus Grundform und Zusatzzeichen.
- Lücken im Set werden durch eigene Zeichnungen im gleichen Look gefüllt.
- Nichts wird von fremden Servern geladen (keine Google-Schriften, kein CDN).
- Suche: Treffer am Namens- oder Wortanfang und am Wortende („milch“ in „Vollmilch“) stehen vor Treffern mitten im Wort („ap“ in „Rapsöl“); Alltagsartikel und oft Gekauftes rücken nur innerhalb dieser Gruppen nach vorn.
- Offline: erst der Cache, dann das Netz. Eine neue Version wird im Hintergrund geladen und gilt ab dem nächsten Öffnen.

## Offene Punkte

1. **Teilen und Live-Abgleich.** Gewünscht: geteilte Listen in Echtzeit ohne Konto, per Link oder Code. Backend noch nicht entschieden (Firestore: Offline-Abgleich eingebaut; Supabase: EU-Region, Offline selbst bauen). Braucht ein Projekt beim gewählten Anbieter.
2. **Echte Geräte.** Geprüft ist nur im Desktop-Browser und in der Handy-Emulation von Chromium (Touch, langes Drücken, Offline). Auf iPhone und Android noch ausprobieren: langes Drücken, Vibration, Installation zum Startbildschirm.
3. **Zuordnung der Bildzeichen.** Alle 8550 Artikel sind einmal vollständig durchgesehen (Liste je Abteilung und Motiv gelesen), rund 420 korrigiert. Offen bleibt, wo es kein passendes Motiv gibt: Viele Artikel teilen sich die Pflegeflasche (Drogerie), den Karton (Haushalt), den Werkzeugkasten (Baumarkt) oder die Flasche für Soßen und Senf. Kondome, Ohrenstöpsel oder Inhalator zeigen deshalb die Pflegeflasche.
4. **Eigene Zeichnungen.** Die vorhandenen wirken flacher als das Set. Kandidaten für neue: Windel (zeigt jetzt ein Babygesicht), Chipstüte, Konservenglas mit Inhalt, Waschmittel, Blumenerde, Gefrierbeutel.
5. **Aufräumen.** In `META` steht je Abteilung und je Regel noch der Name eines früheren Linien-Symbols; ausgewertet wird er nicht mehr.
6. **Katalog.** Ziel waren 10.000 Artikel. Der Katalog ist von Hand zusammengestellt und nicht gegen echte Sortimente geprüft.

## Technische Hinweise

- Zustand: `localStorage`-Schlüssel `einkaufszettel.v1`, Feld `v: 3`. Artikel speichern den Index ihrer Abteilung; wenn sich die Abteilungen ändern, `v` erhöhen und in `load()` neu einsortieren.
- Suche vergleicht ohne Umlaute und Groß-/Kleinschreibung (`norm()`). Die Wortregeln in `META` und `EMO` laufen auf dem so vereinfachten Namen; die erste passende Regel gewinnt, die Reihenfolge ist also Teil der Logik. Kurze Muster treffen leicht mitten im Wort („mate“ in „Tomatensaft“, „leiter“ in „Filzgleiter“, „klo“ in „Fleischklopfer“, „reis“ in „Preiselbeeren“, „tape“ in „Tapete“) und brauchen dann eine Wortgrenze. Ausnahmen stehen als eigene Regel am Anfang der Abteilung. Nach Änderungen an den Regeln die ganze Liste gegenlesen, nicht nur Stichproben: Die Fehlgriffe zeigen sich erst im Zusammenhang.
- Das Blatt mit den Details schließt beim Tippen auf den Schleier nur, wenn die Berührung dort auch begonnen hat. Sonst schließt das Loslassen nach langem Drücken es sofort wieder.
- Der Service Worker lädt beim Aktivieren alle Bildzeichen nach (1 MB). Kerndateien sind Pflicht, Bildzeichen nicht.
