# Bildzeichen: Herkunft und Lizenz

Die SVG-Dateien in diesem Ordner stammen aus dem Projekt **Noto Emoji** von Google:

- Quelle: https://github.com/googlefonts/noto-emoji, Ordner `2D/svg`
- Stand: Tag `v2026-09-24-unicode18_0` (Commit `e20cbc2bbec1926686be9f9bee7d1d2cfa1fea0e`)
- Lizenz: Apache License, Version 2.0 – Wortlaut in `LICENSE` in diesem Ordner
- Copyright: Google LLC und die Noto-Emoji-Mitwirkenden

Laut README des Projekts stehen die Werkzeuge und die Bildressourcen unter der Apache-Lizenz 2.0; nur die Schriftdateien (SIL Open Font License 1.1) und die Flaggenbilder unter `third_party/region-flags` sind anders geregelt. Beides wird hier nicht verwendet.

Die Apache-Lizenz 2.0 erlaubt Nutzung, Weitergabe und Veränderung, auch kommerziell. Bedingungen: Der Lizenztext muss beiliegen (`LICENSE`), und veränderte Dateien müssen als verändert gekennzeichnet werden.

## Änderungen

Die Dateien sind gegenüber dem Original verändert:

- umbenannt: aus `emoji_u1f34e.svg` wird `1f34e.svg`
- mit SVGO 4.1.0 verkleinert (Einstellungen in `tools/svgo.config.js`): Kommentare, Editor-Angaben und überflüssige Genauigkeit entfernt, IDs je Datei mit Präfix versehen. Der Ordner wiegt danach rund 1,3 MB statt unverkleinert etwa 2,7 MB.

Das Aussehen ist gleich geblieben; geprüft durch Bildvergleich aller Dateien mit dem Original bei 128 px.

## Auswahl

Es liegen nur die Zeichen im Repo, die die Tabelle `EMO` in `app.js` benutzt. `tools/bildzeichen.py <Pfad zu noto-emoji/2D/svg>` gleicht den Ordner mit der Tabelle ab; neu kopierte Dateien danach mit `npx svgo@4 --config tools/svgo.config.js -f emoji` verkleinern.

Die eigenen Zeichnungen (Symbole `x-…` in `index.html`) gehören nicht zu Noto Emoji; sie sind für dieses Projekt entstanden.
