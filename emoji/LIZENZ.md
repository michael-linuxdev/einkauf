# Bildzeichen: Herkunft und Lizenz

Die SVG-Dateien in diesem Ordner stammen aus dem Projekt **Noto Emoji** von Google:

- Quelle: https://github.com/googlefonts/noto-emoji, Ordner `2D/svg`
- Stand: Tag `v2026-09-24-unicode18_0` (Commit `e20cbc2bbec1926686be9f9bee7d1d2cfa1fea0e`)
- Lizenz: Apache License, Version 2.0 – Wortlaut in `LICENSE` in diesem Ordner
- Copyright: Google LLC und die Noto-Emoji-Mitwirkenden

Laut README des Projekts stehen die Werkzeuge und die Bildressourcen unter der Apache-Lizenz 2.0; nur die Schriftdateien (SIL Open Font License 1.1) und die Flaggenbilder unter `third_party/region-flags` sind anders geregelt. Beides wird hier nicht verwendet.

Die Apache-Lizenz 2.0 erlaubt Nutzung, Weitergabe und Veränderung, auch kommerziell. Bedingungen: Der Lizenztext muss beiliegen (`LICENSE`), und veränderte Dateien müssen als verändert gekennzeichnet werden.

## Änderungen

Keine am Inhalt. Die Dateien sind unverändert übernommen, nur umbenannt: aus `emoji_u1f34e.svg` wird `1f34e.svg`.

## Auswahl

Es liegen nur die Zeichen im Repo, die die Tabelle `EMO` in `src/template.html` benutzt. `tools/bildzeichen.py <Pfad zu noto-emoji/2D/svg>` gleicht den Ordner mit der Tabelle ab.

Die vier eigenen Zeichnungen (Brötchen, Becher, Wurst, Tüte) in `src/sprite_own.html` gehören nicht zu Noto Emoji.
