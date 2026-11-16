// Kurzer Logiktest ohne Browser: lädt das gebaute Skript mit einem minimalen DOM-Ersatz.
const fs = require("fs");
function N(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.hidden = false; this._t = ""; this.value = ""; }
N.prototype = {
  appendChild(c) { this.children.push(c); return c; }, setAttribute(k, v) { this.attrs[k] = v; if (k === "value") this.value = v; },
  addEventListener() {}, focus() {}, blur() {},
  set textContent(v) { this._t = v; this.children = []; }, get textContent() { return this._t + this.children.map(c => c.textContent).join(""); }
};
const ids = {};
global.document = { createElement: t => new N(t), createElementNS: (n, t) => new N(t), createTextNode: t => { const n = new N("#"); n._t = t; return n; },
  getElementById: i => ids[i] || (ids[i] = new N(i)), addEventListener() {} };
const store = {}; global.localStorage = { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } };
(0, eval)(fs.readFileSync(__dirname + "/../katalog.js", "utf8") + fs.readFileSync(__dirname + "/../app.js", "utf8") + ";globalThis.T={names,cats,icons,CATS,byNorm,norm,add,cur,render,catOf,synBy,emoFile,EMO_DEF,EMO,matchScore};");
const T = globalThis.T;
const distinct = new Set(T.icons).size;
console.log(`${T.names.length} Artikel, ${T.CATS.length} Abteilungen, ${Object.keys(T.synBy).length} Synonyme, ${distinct} verschiedene Bildzeichen`);
const erwartet = { "Äpfel": "🍎", "Vollmilch": "🥛", "Brötchen": "#bun", "Spaghetti": "🍝", "Hammer": "🔨",
  "Thunfisch in Öl": "🐟", "Frischhaltefolie": "#roll", "Windeln": "👶", "Backpapier": "#roll", "Passierte Tomaten": "🥫", "Mangold": "🥬", "Tomatensaft": "🧃" };
let ok = true;
for (const [n, e] of Object.entries(erwartet)) { const i = T.byNorm[T.norm(n)]; if (i === undefined || T.icons[i] !== e) { ok = false; console.log("FEHLER", n, T.icons[i]); } }
// Zu jedem benutzten Bildzeichen muss die Grafik in emoji/ liegen.
const alle = [...T.icons, ...T.EMO_DEF, "🛒"];
Object.values(T.EMO).forEach(m => m[1].forEach(r => alle.push(r[1])));
const dateien = new Set(alle.filter(z => z.charAt(0) !== "#").map(T.emoFile));
// Eigene Zeichnungen ("#name") müssen als Symbol in index.html stehen.
const seite = fs.readFileSync(__dirname + "/../index.html", "utf8");
new Set(alle.filter(z => z.charAt(0) === "#")).forEach(z => { if (!seite.includes('id="x-' + z.slice(1) + '"')) { ok = false; console.log("FEHLER Zeichnung fehlt:", z); } });
// Suche: Wortanfang vor Wortende vor Treffer mitten im Wort.
const stufen = [["apfel", "ap", 1], ["bio-apfel", "ap", 2], ["vollmilch", "milch", 3], ["rapsol", "ap", 4], ["backpapier", "ap", 4], ["butter", "xy", -1]];
stufen.forEach(([t, q, e]) => { if (T.matchScore(t, q) !== e) { ok = false; console.log("FEHLER Suche", t, q, T.matchScore(t, q)); } });
const fehlend = [...dateien].filter(f => !fs.existsSync(__dirname + "/../" + f));
if (T.emoFile("🛍️") !== "emoji/1f6cd.svg") { ok = false; console.log("FEHLER emoFile", T.emoFile("🛍️")); }
if (fehlend.length) { ok = false; console.log("FEHLER Grafik fehlt:", fehlend.join(", ")); }
console.log(`${dateien.size} Bildzeichen-Dateien benutzt`);
T.add("karotten"); T.add("Erdbeerkuchen");
const it = T.cur().items.slice(-2).map(i => i.name + " → " + T.CATS[i.cat]);
console.log(it.join(" | "));
T.render();
if (require("child_process").spawnSync("python3", [__dirname + "/sw_bauen.py", "--pruefen"], { stdio: "inherit" }).status !== 0) ok = false;
console.log(ok ? "Prüfung bestanden" : "Prüfung mit Fehlern");
process.exit(ok ? 0 : 1);
