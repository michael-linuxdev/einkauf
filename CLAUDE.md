# Einkaufszettel

Einkaufslisten-App nach dem Vorbild von Bring, aber einfach und werbefrei. Ziel-Domain: `einkauf.micana.de` (GitHub Pages, wie die anderen micana.de-Apps). Sprache der Oberfläche: Deutsch.

Statische Seite ohne Backend, als PWA installierbar und ohne Netz nutzbar. Daten liegen nur im `localStorage` des Geräts.

## Aufbau

Von Hand bearbeitet:

- `index.html` – Gerüst der Seite, Plus- und Haken-Symbol, 17 eigene farbige Zeichnungen als Symbole `x-<name>` (Brötchen, Becher, Wurst, Tüte, Folienrolle, Windel, Chipstüte, Soßenflasche, Ölflasche, Waschmittel, Sprühflasche, Erdsack, Gefrierbeutel, Marmeladenglas, Kondom, Ohrenstöpsel, Inhalator).
- `app.css` – gesamtes Aussehen, heller und dunkler Modus, Einbindung der Schriften.
- `app.js` – gesamte Logik: Abteilungen und Wortregeln (`META`), Bildzeichen-Tabelle (`EMO`), Zustand, Liste, Suche mit Mengen-Erkennung, Blätter, Menü (Teilen, Vorlagen, Reihenfolge im Laden). Der Block am Ende braucht einen echten Browser: Bildschirm anlassen, Installationshinweis, Service Worker mit Update-Hinweis.
- `manifest.webmanifest`, `icons/` – PWA-Angaben und App-Symbole (`icons/icon.svg` ist die Vorlage der PNGs).
- `src/gen.py` mit `src/add1.py` bis `add4.py` – Katalog-Generator: Artikellisten je Abteilung, Marken, Alltagsartikel (Rangfolge), Synonyme. `add4.py` ist die jüngste Ergänzung; `DROP` in `gen.py` nimmt einzelne Artikel wieder heraus.
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
- Suche über 10.988 Artikel in 19 Abteilungen, 249 Synonyme, Rangfolge mit rund 180 Alltagsartikeln, 339 Markennamen (nur Namen, keine Logos).
- Dreispaltiges Kachelraster; tippen hakt ab, lange drücken öffnet Name, Menge und Abteilung.
- Rückgängig für Abhaken, Löschen und Hinzufügen.
- Eigene Artikel bekommen Abteilung und Bildzeichen über Wortregeln.
- Heller und dunkler Modus.
- PWA: installierbar, läuft nach dem ersten Besuch ohne Netz (App, Katalog, Schriften, alle Bildzeichen).
- Mengen beim Eintippen: „3 Äpfel“, „Milch 2 l“, „500 g Hackfleisch“ setzen die Menge gleich mit.
- Reihenfolge der Abteilungen wie im eigenen Laden (Menü → Reihenfolge im Laden).
- Vorlagen: eine Liste speichern und später mit einem Tipp wieder auf die Liste setzen.
- Teilen ohne Server: Die offenen Artikel stecken im Link (`#l=…`); der Empfänger übernimmt sie als neue Liste oder in die aktuelle.
- Der Bildschirm bleibt an, solange die App zu sehen ist.
- Installationshinweis wie in der App `einbuergerung`: im Handy-Browser beim ersten Mal ein Vollbild-Hinweis mit Anleitung je Gerät, danach ein Balken oben; am Computer einmal ein Blatt.
- Hinweis „Neue Version verfügbar“ mit Knopf „Jetzt laden“.
- Mehrere Artikel auf einmal: eine eingefügte Liste (Zeilen, Kommas, Aufzählungszeichen) oder „Salz, Pfeffer, 2 Zitronen“ im Suchfeld.
- Spracheingabe über das Mikrofon im Suchfeld, wo der Browser sie anbietet: „Milch Butter drei Äpfel“ wird zu drei Artikeln.
- Geteilten Link einfügen (Menü), damit er auch in der installierten App ankommt.
- Liegt das letzte Abhaken über drei Stunden zurück, bietet die Liste an, Erledigtes zu entfernen.
- Die Reihenfolge der Abteilungen gilt für alle Listen oder nur für eine (anderer Laden).

## Getroffene Entscheidungen

- Bedienung: ein Bildschirm, zwei Gesten. Keine Werbung, keine Angebote, keine Rezepte, kein Kontozwang.
- Raster durchgehend 3 Spalten, nach Abteilung sortiert, ohne Zwischenüberschriften.
- Kein Hinweistext am Seitenende.
- Bildzeichen: Noto-Emoji-Grafiken als SVG-Dateien aus `emoji/`, nicht aus einer Schrift; nur wenn eine Datei nicht lädt, springt die Emoji-Schrift des Geräts ein. Keine Kombinationen aus Grundform und Zusatzzeichen.
- Lücken im Set werden durch eigene Zeichnungen im gleichen Look gefüllt.
- Nichts wird von fremden Servern geladen (keine Google-Schriften, kein CDN).
- Suche: Treffer am Namens- oder Wortanfang und am Wortende („milch“ in „Vollmilch“) stehen vor Treffern mitten im Wort („ap“ in „Rapsöl“); Alltagsartikel und oft Gekauftes rücken nur innerhalb dieser Gruppen nach vorn.
- Offline: erst der Cache, dann das Netz. Eine neue Version wird im Hintergrund geladen und wartet, bis man „Jetzt laden“ tippt; von selbst lädt die App nie neu.
- Menü: Alles Weitere hängt am Listennamen oben (ein Blatt), damit der Hauptbildschirm bei einem Bildschirm und zwei Gesten bleibt.
- Reihenfolge im Laden: Pfeiltasten statt Ziehen, weil das auf jedem Gerät und mit Bedienungshilfen sicher funktioniert.
- Teilen: nur offene Artikel, als Link ohne Server. Es gibt keinen Abgleich; jede Seite hat danach ihre eigene Kopie.
- Spracheingabe: Die Erkennung macht der Browser, bei Chrome und Safari auf den Servern von Google bzw. Apple. Das ist die einzige Stelle, an der Daten das Gerät verlassen, und nur nach Tipp auf das Mikrofon. Die App selbst lädt und sendet weiter nichts.
- Erledigtes wird nie von selbst gelöscht; die App fragt nur.
- Eigene Artikel: Die Abteilung kommt zuerst aus dem Katalog (ein Katalogname steckt als Wort im Namen oder ein Wort endet darauf), erst danach aus den Wortregeln.

## Offene Punkte

1. **Live-Abgleich.** Teilen per Link gibt es; gewünscht sind darüber hinaus geteilte Listen in Echtzeit ohne Konto, per Link oder Code. Backend noch nicht entschieden (Firestore: Offline-Abgleich eingebaut; Supabase: EU-Region, Offline selbst bauen). Braucht ein Projekt beim gewählten Anbieter.
2. **Echte Geräte.** Geprüft ist nur im Desktop-Browser und in der Handy-Emulation von Chromium (Touch, langes Drücken, Offline). Auf iPhone und Android noch ausprobieren: langes Drücken, Vibration, Installation zum Startbildschirm, Zoom-Sperre, Bildschirm-an, Teilen-Menü. Die Spracheingabe ist nur mit nachgestellter Erkennung geprüft. Auf dem iPhone öffnet ein geteilter Link Safari, nicht die installierte App; dafür gibt es „Geteilte Liste einfügen“.
3. **Zuordnung der Bildzeichen.** Alle 10.988 Artikel sind einmal vollständig durchgesehen (Liste je Abteilung und Motiv gelesen), rund 750 korrigiert. Offen bleibt, wo es kein passendes Motiv gibt: Viele Artikel teilen sich die Pflegeflasche (Drogerie), den Karton (Haushalt) oder den Werkzeugkasten (Baumarkt).
4. **Eigene Zeichnungen.** Alle 17 haben Verlauf und Glanzlicht. Neue Zeichnung: Symbol in `index.html` anlegen (24er-Raster, Verlaufs-IDs eindeutig benennen) und in `EMO` als `"#name"` eintragen; der Logiktest prüft, dass das Symbol existiert.
5. **Katalog.** Das Ziel von 10.000 Artikeln ist erreicht; die früher dünnen Abteilungen (Baby, Tier, Sonstiges, Büro, Garten, Kleidung) sind aufgefüllt. Geprüft ist der Katalog auf Dubletten und Schreibvarianten. Gegen ein echtes Sortiment ist er weiterhin nicht geprüft: Er ist von Hand zusammengestellt, und eine Datenquelle wie Open Food Facts war aus der Arbeitsumgebung nicht erreichbar.

## Technische Hinweise

- Zustand: `localStorage`-Schlüssel `einkaufszettel.v1`, Feld `v: 3`. Dazu `order` (Reihenfolge der Abteilungen als Liste ihrer Indizes; eine Liste kann ein eigenes `order` haben), `templates`, `installSeen` und `doneAt` (Zeitpunkt des letzten Abhakens); `load()` ergänzt fehlende oder ungültige Werte. Der Schlüssel `einkaufszettel.gateSkip` merkt sich, dass der Vollbild-Hinweis übersprungen wurde. Artikel speichern den Index ihrer Abteilung; wenn sich die Abteilungen ändern, `v` erhöhen und in `load()` neu einsortieren.
- Suche vergleicht ohne Umlaute und Groß-/Kleinschreibung (`norm()`). Die Wortregeln in `META` und `EMO` laufen auf dem so vereinfachten Namen; die erste passende Regel gewinnt, die Reihenfolge ist also Teil der Logik. Kurze Muster treffen leicht mitten im Wort („mate“ in „Tomatensaft“, „leiter“ in „Filzgleiter“, „klo“ in „Fleischklopfer“, „reis“ in „Preiselbeeren“, „tape“ in „Tapete“) und brauchen dann eine Wortgrenze. Ausnahmen stehen als eigene Regel am Anfang der Abteilung. Nach Änderungen an den Regeln die ganze Liste gegenlesen, nicht nur Stichproben: Die Fehlgriffe zeigen sich erst im Zusammenhang.
- Das Blatt mit den Details schließt beim Tippen auf den Schleier nur, wenn die Berührung dort auch begonnen hat. Sonst schließt das Loslassen nach langem Drücken es sofort wieder.
- Der Service Worker lädt beim Aktivieren alle Bildzeichen nach (1 MB). Kerndateien sind Pflicht, Bildzeichen nicht.
- Mengen (`parseQty`): Abgetrennt wird nur, wenn die Eingabe weder im Katalog steht noch der Anfang eines Katalognamens ist („Eier 10“ bleibt wegen „Eier 10er“ ganz). Eine nackte Zahl am Ende zählt nur, wenn der Rest ein Katalogartikel ist.
- Service Worker: Die neue Version ruft `skipWaiting` erst auf die Nachricht `SKIP_WAITING` hin. Neu geladen wird nur, wenn der Nutzer den Knopf getippt hat (`reloading`), nicht bei jedem `controllerchange`.
- Der Logiktest läuft ohne `window`; alles, was Browser-Schnittstellen braucht, steht deshalb im Block am Ende von `app.js` und ist nur im Browser geprüft.
- `META` enthält je Abteilung nur noch Farbe und Muster. Die Tiefkühl-Muster nennen fast jedes Lebensmittel und zählen in `guess()` nur, wenn der Name nach Tiefkühlware klingt („TK“, „gefroren“, „Eis“).
- Mehrere Artikel (`splitItems`): Getrennt wird an Zeilenumbruch, Semikolon und Komma, nicht an einem Komma zwischen Ziffern („3,5 %“). Gesprochenes wird von links in die längsten Katalognamen zerlegt; geht das nicht auf, bleibt der Text ganz und wird nur an „und“ getrennt.
- Katalog pflegen: Nach Ergänzungen zeigt die erste Zeile von `gen.py` unter `dups` Artikel, die schon vorhanden waren. Zusätzlich auf Beinahe-Doppelte prüfen (Schreibweise mit und ohne Bindestrich, Einzahl und Mehrzahl) und darauf, ob ein neuer Artikel ein bestehendes Synonym verdrängt (dann fällt das Synonym still weg). Danach die neuen Artikel mit ihren Bildzeichen gegenlesen.

