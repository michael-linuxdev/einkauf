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
(0, eval)(fs.readFileSync(__dirname + "/../build/app.js", "utf8") + ";globalThis.T={names,cats,icons,CATS,byNorm,norm,add,cur,render,catOf,synBy,emoFile,EMO_DEF};");
const T = globalThis.T;
const distinct = new Set(T.icons).size;
console.log(`${T.names.length} Artikel, ${T.CATS.length} Abteilungen, ${Object.keys(T.synBy).length} Synonyme, ${distinct} verschiedene Bildzeichen`);
const erwartet = { "Äpfel": "🍎", "Vollmilch": "🥛", "Brötchen": "#bun", "Spaghetti": "🍝", "Hammer": "🔨" };
let ok = true;
for (const [n, e] of Object.entries(erwartet)) { const i = T.byNorm[T.norm(n)]; if (i === undefined || T.icons[i] !== e) { ok = false; console.log("FEHLER", n, T.icons[i]); } }
// Zu jedem benutzten Bildzeichen muss die Grafik in emoji/ liegen.
const dateien = new Set([...T.icons, ...T.EMO_DEF, "🛒"].filter(z => z.charAt(0) !== "#").map(T.emoFile));
const fehlend = [...dateien].filter(f => !fs.existsSync(__dirname + "/../" + f));
if (T.emoFile("🛍️") !== "emoji/1f6cd.svg") { ok = false; console.log("FEHLER emoFile", T.emoFile("🛍️")); }
if (fehlend.length) { ok = false; console.log("FEHLER Grafik fehlt:", fehlend.join(", ")); }
console.log(`${dateien.size} Bildzeichen-Dateien benutzt`);
T.add("karotten"); T.add("Erdbeerkuchen");
const it = T.cur().items.slice(-2).map(i => i.name + " → " + T.CATS[i.cat]);
console.log(it.join(" | "));
T.render();
console.log(ok ? "Prüfung bestanden" : "Prüfung mit Fehlern");
process.exit(ok ? 0 : 1);
