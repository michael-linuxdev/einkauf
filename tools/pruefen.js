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
(0, eval)(fs.readFileSync(__dirname + "/../katalog.js", "utf8") + fs.readFileSync(__dirname + "/../app.js", "utf8") + ";globalThis.T={names,cats,icons,CATS,byNorm,norm,add,cur,render,catOf,synBy,emoFile,EMO_DEF,EMO,matchScore,parseQty,S,findItem,readShared,b64e,splitItems,addMany,cur,checkTidy,catOf,stepQty,editDist,fuzzyHits,readBackup,backupData,restoreBackup,norms};");
const T = globalThis.T;
const distinct = new Set(T.icons).size;
console.log(`${T.names.length} Artikel, ${T.CATS.length} Abteilungen, ${Object.keys(T.synBy).length} Synonyme, ${distinct} verschiedene Bildzeichen`);
const erwartet = { "Äpfel": "🍎", "Vollmilch": "🥛", "Brötchen": "#bun", "Spaghetti": "🍝", "Hammer": "🔨",
  "Thunfisch in Öl": "#fishcan", "Frischhaltefolie": "#roll", "Windeln": "#diaper", "Backpapier": "#roll", "Passierte Tomaten": "🥫", "Mangold": "🥬", "Tomatensaft": "#juicered",
  "Himbeeren": "#raspberry", "Heidelbeeren": "🫐", "Brombeeren": "#blackberry", "Pflaumen": "#plum", "Limetten": "#lime", "Blumenkohl": "#cauliflower", "Lauch": "#leek", "Knoblauch": "🧄", "Schnittlauch frisch": "🌿", "TK-Erbsen": "🫛", "Pizza Spinat": "🍕", "Datteltomaten": "🍅", "Zahnpasta": "#toothpaste", "Wandfarbe weiß": "#paintcan", "Paketaufkleber": "📦", "Kaffirlimettenblätter": "🌿",
  "Schneebesen": "🥄", "Fleischklopfer": "🥄", "Pastis": "🥃", "Preiselbeeren Glas": "#redberry", "Reis": "🍚", "Tapete": "#wallpaper", "Möhrenkuchen": "🍰", "Ventilator": "🌬️", "Tampons normal": "🩸",
  "Senf": "#sauce", "Rapsöl": "#oil", "Chips": "#chips", "Waschmittel": "#detergent", "Glasreiniger": "#spray", "Blumenerde": "#soil", "Gefrierbeutel 1 l": "#zipbag", "Marmelade": "#jam", "Kondome": "#condom", "Ohrenstöpsel": "#earplug", "Inhalator": "#inhaler", "Insektenspray": "🪰",
  "Flammkuchen Lachs": "🍕", "Lammkeule TK": "🥩", "Kalklöser Gel": "#detergent", "Zigarillos": "🚬", "Taschenbuch": "📚", "Malbuch": "🖍️", "Kinderbuch": "📚", "Aromat": "#bag", "Geschirrspültabs 30er": "#detergent", "Ketchup": "#ketchup", "Gummibärchen": "#gummybear",
  "Weintrauben hell": "#grapesgreen", "Weintrauben dunkel": "🍇", "Paprika rot": "#pepperred", "Paprika gelb": "#pepperyellow", "Paprika grün": "🫑", "Rote Zwiebeln": "#redonion", "Zwiebeln": "🧅", "Weißwein trocken": "#whitewine", "Rotwein trocken": "🍷", "Roséwein": "#rosewine", "Rosé-Sekt": "🍾",
  "Seelachsfilet": "🐟", "Lachsfilet": "#salmon", "Mettwurst": "#sausage", "Hackfleisch": "#mince", "Roggenbrötchen": "#bun", "Badeöl": "🛁", "Shampoo": "#shampoo", "Mundspülung": "🪥", "Deo": "#spraycan", "Bohrmaschine": "#drill", "Schnuller": "#pacifier", "Zucker": "#sugar", "Mehl": "#flour", "Salz": "🧂", "Pfeffer": "#peppermill" };
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
// Mengen beim Eintippen
const mengen = [["3 Äpfel", "Äpfel", "3×"], ["Milch 2 l", "Milch", "2 l"], ["500g Hackfleisch", "Hackfleisch", "500 g"], ["2 x Butter", "Butter", "2×"], ["Äpfel 3", "Äpfel", "3×"], ["2 Bund Petersilie", "Petersilie", "2 Bund"],
  ["Eier 10er", "Eier 10er", ""], ["Eier 10", "Eier 10", ""], ["Mineralwasser 1,5 l", "Mineralwasser 1,5 l", ""], ["5 Minuten Terrine", "5 Minuten Terrine", ""], ["2 Xylit", "Xylit", "2×"], ["Sprühfarbe RAL 9010", "Sprühfarbe RAL 9010", ""], ["3 Glasnudeln", "Glasnudeln", "3×"]];
mengen.forEach(([e, n, m]) => { const r = T.parseQty(e); if (r.name !== n || r.note !== m) { ok = false; console.log("FEHLER Menge", e, JSON.stringify(r)); } });
T.add("4 Bananen"); if ((T.findItem("Bananen") || {}).note !== "4×") { ok = false; console.log("FEHLER Menge auf der Liste"); }
// Mehrere Artikel auf einmal: eingefügt und gesprochen
const teile = [["Milch, Butter; Eier 10er", false, ["Milch", "Butter", "Eier 10er"]], ["- Brot\n• 3 Äpfel\n[ ] Naturjoghurt 3,5 %", false, ["Brot", "3 Äpfel", "Naturjoghurt 3,5 %"]],
  ["Milch Butter drei Äpfel", true, ["Milch", "Butter", "3 Äpfel"]], ["zwei Liter Milch und Rote Zwiebeln", true, ["2 Liter Milch", "Rote Zwiebeln"]], ["Dingsbums Spezial und Brot", true, ["Dingsbums Spezial", "Brot"]]];
teile.forEach(([t, s, e]) => { const r = T.splitItems(t, s); if (JSON.stringify(r) !== JSON.stringify(e)) { ok = false; console.log("FEHLER Teilen in Artikel", JSON.stringify(t), JSON.stringify(r)); } });
const vorher = T.cur().items.length, rr = T.addMany(["2 Zitronen", "Hefe", "Bananen"]);
if (rr.n !== 2 || T.cur().items.length !== vorher + 2 || T.findItem("Zitronen").note !== "2×") { ok = false; console.log("FEHLER addMany", rr.n); }
// Geteilter Link: aus der Adresse wie aus einer eingefügten Nachricht lesbar
const link = "Wocheneinkauf\n– Milch\n\nhttps://einkauf.micana.de/#l=" + T.b64e(JSON.stringify({ n: "Test", i: [["Milch", "2 l"], ["Äpfel"]] }));
const gl = T.readShared(link); if (!gl || gl.name !== "Test" || gl.items.length !== 2 || gl.items[0].note !== "2 l" || T.readShared("kein Link")) { ok = false; console.log("FEHLER geteilter Link"); }
// Eigene Artikel landen über die Wortregeln in der richtigen Abteilung
[["Omas Apfelkuchen", "Brot & Backwaren"], ["Zahnpasta Kids", "Drogerie & Gesundheit"], ["Dingsbums", "Sonstiges"], ["Omas Nudeln", "Nudeln, Reis & Konserven"], ["Mehl vom Müller", "Backen & Gewürze"], ["Lieblings-Waschmittel", "Haushalt & Putzen"], ["Fisch frisch vom Markt", "Fleisch, Wurst & Fisch"], ["Erdbeertraum gefroren", "Tiefkühl"], ["Kindershampoo Erdbeere", "Drogerie & Gesundheit"], ["Laugengebäck vom Bäcker", "Süßes & Snacks"], ["Chips Dingsbums", "Süßes & Snacks"], ["Schrauben-Sortiment XL", "Baumarkt & Werkzeug"]].forEach(([n, c]) => { if (T.CATS[T.catOf(n)] !== c) { ok = false; console.log("FEHLER Abteilung", n, T.CATS[T.catOf(n)]); } });
// Aufräum-Hinweis erst, wenn das letzte Abhaken länger zurückliegt
T.cur().items[0].done = true; T.S.doneAt = Date.now(); if (T.checkTidy()) { ok = false; console.log("FEHLER Aufräumen zu früh"); }
T.S.doneAt = Date.now() - 4 * 3600 * 1000; if (!T.checkTidy()) { ok = false; console.log("FEHLER Aufräumen fehlt"); }
T.cur().items[0].done = false; T.S.doneAt = 0;
// Tippfehler: unscharfe Treffer finden den gemeinten Artikel, und zwar schnell
[["jogurt", "Joghurt"], ["brokoli", "Brokkoli"], ["zuchini", "Zucchini"], ["spagetti", "Spaghetti"], ["tomaetn", "Tomaten"], ["kartofeln", "Kartoffeln"]].forEach(([q, e]) => {
  const h = T.fuzzyHits(q), hit = Object.keys(h).some(k => T.norms[k].indexOf(T.norm(e)) >= 0);
  if (!hit) { ok = false; console.log("FEHLER unscharfe Suche", q, Object.keys(h).length); }
});
if (T.editDist("milch", "mlich", 1) !== 1 || T.editDist("butter", "kaffee", 1) <= 1 || Object.keys(T.fuzzyHits("xqzwvk")).length) { ok = false; console.log("FEHLER Abstand"); }
{ const t0 = Date.now(); for (let i = 0; i < 20; i++) T.fuzzyHits("schokolaade"); const ms = (Date.now() - t0) / 20; if (ms > 40) { ok = false; console.log("FEHLER unscharfe Suche zu langsam", ms); } }
// Menge mit Plus und Minus
[["", 1, "2×"], ["", -1, ""], ["2×", 1, "3×"], ["2×", -1, ""], ["3", -1, "2×"], ["500 g", 1, "600 g"], ["200 g", -1, "150 g"], ["100 g", 1, "150 g"], ["50 g", -1, "50 g"], ["1 kg", 1, "1,5 kg"], ["1,5 l", -1, "1 l"], ["2 Packungen", 1, "3 Packungen"], ["1 Packung", -1, "1 Packung"], ["reif", 1, "reif"], ["2x", 1, "3×"]].forEach(([n, d, e]) => {
  if (T.stepQty(n, d) !== e) { ok = false; console.log("FEHLER Menge schrittweise", JSON.stringify(n), d, JSON.stringify(T.stepQty(n, d))); }
});
// Sicherung: eigene Daten kommen heil zurück, Fremdes und Übergroßes nicht
{ const b = T.readBackup(JSON.stringify(T.backupData()));
  if (!b || b.lists.length !== T.S.lists.length || b.lists[0].items.length !== T.S.lists[0].items.length || b.lists[0].id === T.S.lists[0].id) { ok = false; console.log("FEHLER Sicherung lesen"); }
  const bad = T.readBackup(JSON.stringify({ app: "einkaufszettel", lists: [{ name: "x".repeat(500), items: [{ name: "A", cat: 999, note: 5 }, { name: "" }, null, { name: "<b>B</b>", cat: 1.5 }] }], templates: [{ name: "", items: [] }, 7], order: [1, 2], freq: { a: "x", b: 3 } }));
  if (!bad || bad.lists[0].name.length !== 40 || bad.lists[0].items.length !== 2 || bad.lists[0].items[0].cat >= T.CATS.length || bad.lists[0].items[0].note !== "" || bad.templates.length || bad.order !== null || bad.freq.a !== undefined || bad.freq.b !== 3) { ok = false; console.log("FEHLER Sicherung prüfen", JSON.stringify(bad)); }
  if (T.readBackup("{}") || T.readBackup("kein JSON") || T.readBackup(JSON.stringify({ app: "anders", lists: [] }))) { ok = false; console.log("FEHLER Sicherung fremd"); }
  const n0 = T.S.lists.length; T.restoreBackup(b, false); if (T.S.lists.length !== 2 * n0) { ok = false; console.log("FEHLER Sicherung dazunehmen"); }
  T.S.lists.length = n0; }
// Der Katalog soll mindestens 10.000 Artikel haben und in jeder Abteilung über 100
if (T.names.length < 10000) { ok = false; console.log("FEHLER Katalog zu klein", T.names.length); }
T.CATS.forEach((c, ci) => { const n = T.cats.filter(x => x === ci).length; if (n < 100) { ok = false; console.log("FEHLER Abteilung dünn", c, n); } });
// Reihenfolge der Abteilungen und Vorlagen gehören zum Zustand
if (T.S.order.length !== T.CATS.length || !Array.isArray(T.S.templates)) { ok = false; console.log("FEHLER Zustand"); }
T.add("karotten"); T.add("Erdbeerkuchen");
const it = T.cur().items.slice(-2).map(i => i.name + " → " + T.CATS[i.cat]);
console.log(it.join(" | "));
T.render();
if (require("child_process").spawnSync("python3", [__dirname + "/sw_bauen.py", "--pruefen"], { stdio: "inherit" }).status !== 0) ok = false;
console.log(ok ? "Prüfung bestanden" : "Prüfung mit Fehlern");
process.exit(ok ? 0 : 1);
