/* Service Worker: hält die App samt Katalog, Schriften und Bildzeichen für die Nutzung ohne Netz vor.
   Diese Datei ist die Vorlage; tools/sw_bauen.py trägt Version und Dateilisten ein und schreibt sw.js.
   Die Version ist ein Hash über alle vorgehaltenen Dateien: ändert sich eine, entsteht ein neuer Cache. */
"use strict";
var VERSION = "b1098470ce6b";
var CACHE = "einkauf-" + VERSION;
var KERN = ["./", "index.html", "app.css", "app.js", "katalog.js", "manifest.webmanifest", "fonts/figtree.woff2", "fonts/bricolage-grotesque.woff2", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
var BILDER = ["emoji/1f30d.svg", "emoji/1f321.svg", "emoji/1f32c.svg", "emoji/1f32e.svg", "emoji/1f32f.svg", "emoji/1f330.svg", "emoji/1f331.svg", "emoji/1f332.svg", "emoji/1f333.svg", "emoji/1f334.svg", "emoji/1f335.svg", "emoji/1f336.svg", "emoji/1f337.svg", "emoji/1f338.svg", "emoji/1f339.svg", "emoji/1f33b.svg", "emoji/1f33d.svg", "emoji/1f33e.svg", "emoji/1f33f.svg", "emoji/1f342.svg", "emoji/1f344.svg", "emoji/1f345.svg", "emoji/1f346.svg", "emoji/1f347.svg", "emoji/1f348.svg", "emoji/1f349.svg", "emoji/1f34a.svg", "emoji/1f34b.svg", "emoji/1f34c.svg", "emoji/1f34d.svg", "emoji/1f34e.svg", "emoji/1f34f.svg", "emoji/1f350.svg", "emoji/1f351.svg", "emoji/1f352.svg", "emoji/1f353.svg", "emoji/1f354.svg", "emoji/1f355.svg", "emoji/1f356.svg", "emoji/1f357.svg", "emoji/1f358.svg", "emoji/1f35a.svg", "emoji/1f35b.svg", "emoji/1f35c.svg", "emoji/1f35d.svg", "emoji/1f35e.svg", "emoji/1f35f.svg", "emoji/1f360.svg", "emoji/1f362.svg", "emoji/1f363.svg", "emoji/1f366.svg", "emoji/1f368.svg", "emoji/1f369.svg", "emoji/1f36a.svg", "emoji/1f36b.svg", "emoji/1f36c.svg", "emoji/1f36d.svg", "emoji/1f36e.svg", "emoji/1f36f.svg", "emoji/1f370.svg", "emoji/1f371.svg", "emoji/1f372.svg", "emoji/1f373.svg", "emoji/1f374.svg", "emoji/1f375.svg", "emoji/1f376.svg", "emoji/1f377.svg", "emoji/1f379.svg", "emoji/1f37a.svg", "emoji/1f37c.svg", "emoji/1f37d.svg", "emoji/1f37e.svg", "emoji/1f37f.svg", "emoji/1f380.svg", "emoji/1f381.svg", "emoji/1f382.svg", "emoji/1f383.svg", "emoji/1f384.svg", "emoji/1f388.svg", "emoji/1f389.svg", "emoji/1f392.svg", "emoji/1f39f.svg", "emoji/1f3a7.svg", "emoji/1f3a8.svg", "emoji/1f3f7.svg", "emoji/1f3fa.svg", "emoji/1f40c.svg", "emoji/1f414.svg", "emoji/1f41c.svg", "emoji/1f41d.svg", "emoji/1f41e.svg", "emoji/1f41f.svg", "emoji/1f422.svg", "emoji/1f426.svg", "emoji/1f430.svg", "emoji/1f431.svg", "emoji/1f434.svg", "emoji/1f436.svg", "emoji/1f439.svg", "emoji/1f43e.svg", "emoji/1f43f.svg", "emoji/1f452.svg", "emoji/1f453.svg", "emoji/1f454.svg", "emoji/1f455.svg", "emoji/1f456.svg", "emoji/1f457.svg", "emoji/1f459.svg", "emoji/1f45b.svg", "emoji/1f45c.svg", "emoji/1f45d.svg", "emoji/1f45e.svg", "emoji/1f45f.svg", "emoji/1f476.svg", "emoji/1f484.svg", "emoji/1f485.svg", "emoji/1f48a.svg", "emoji/1f490.svg", "emoji/1f4a1.svg", "emoji/1f4a7.svg", "emoji/1f4b6.svg", "emoji/1f4bb.svg", "emoji/1f4be.svg", "emoji/1f4c1.svg", "emoji/1f4c4.svg", "emoji/1f4c5.svg", "emoji/1f4cb.svg", "emoji/1f4cc.svg", "emoji/1f4ce.svg", "emoji/1f4cf.svg", "emoji/1f4d0.svg", "emoji/1f4d2.svg", "emoji/1f4da.svg", "emoji/1f4e6.svg", "emoji/1f4eb.svg", "emoji/1f4f0.svg", "emoji/1f4f1.svg", "emoji/1f4f7.svg", "emoji/1f50b.svg", "emoji/1f50c.svg", "emoji/1f50d.svg", "emoji/1f511.svg", "emoji/1f512.svg", "emoji/1f514.svg", "emoji/1f516.svg", "emoji/1f525.svg", "emoji/1f526.svg", "emoji/1f527.svg", "emoji/1f528.svg", "emoji/1f529.svg", "emoji/1f52a.svg", "emoji/1f56f.svg", "emoji/1f576.svg", "emoji/1f58a.svg", "emoji/1f58b.svg", "emoji/1f58c.svg", "emoji/1f58d.svg", "emoji/1f5a8.svg", "emoji/1f5b1.svg", "emoji/1f5bc.svg", "emoji/1f5d1.svg", "emoji/1f637.svg", "emoji/1f697.svg", "emoji/1f6aa.svg", "emoji/1f6ac.svg", "emoji/1f6b0.svg", "emoji/1f6b2.svg", "emoji/1f6bd.svg", "emoji/1f6bf.svg", "emoji/1f6c1.svg", "emoji/1f6cd.svg", "emoji/1f6cf.svg", "emoji/1f6d2.svg", "emoji/1f6dd.svg", "emoji/1f6de.svg", "emoji/1f6e2.svg", "emoji/1f942.svg", "emoji/1f943.svg", "emoji/1f944.svg", "emoji/1f950.svg", "emoji/1f951.svg", "emoji/1f952.svg", "emoji/1f953.svg", "emoji/1f954.svg", "emoji/1f955.svg", "emoji/1f956.svg", "emoji/1f957.svg", "emoji/1f958.svg", "emoji/1f959.svg", "emoji/1f95a.svg", "emoji/1f95b.svg", "emoji/1f95c.svg", "emoji/1f95d.svg", "emoji/1f95e.svg", "emoji/1f95f.svg", "emoji/1f960.svg", "emoji/1f962.svg", "emoji/1f963.svg", "emoji/1f964.svg", "emoji/1f965.svg", "emoji/1f966.svg", "emoji/1f967.svg", "emoji/1f968.svg", "emoji/1f969.svg", "emoji/1f96a.svg", "emoji/1f96b.svg", "emoji/1f96c.svg", "emoji/1f96d.svg", "emoji/1f96f.svg", "emoji/1f97c.svg", "emoji/1f97d.svg", "emoji/1f97e.svg", "emoji/1f97f.svg", "emoji/1f987.svg", "emoji/1f98b.svg", "emoji/1f990.svg", "emoji/1f991.svg", "emoji/1f994.svg", "emoji/1f99c.svg", "emoji/1f99e.svg", "emoji/1f99f.svg", "emoji/1f9aa.svg", "emoji/1f9b4.svg", "emoji/1f9ba.svg", "emoji/1f9c0.svg", "emoji/1f9c1.svg", "emoji/1f9c2.svg", "emoji/1f9c3.svg", "emoji/1f9c4.svg", "emoji/1f9c5.svg", "emoji/1f9c6.svg", "emoji/1f9c7.svg", "emoji/1f9c8.svg", "emoji/1f9c9.svg", "emoji/1f9ca.svg", "emoji/1f9e2.svg", "emoji/1f9e3.svg", "emoji/1f9e4.svg", "emoji/1f9e5.svg", "emoji/1f9e6.svg", "emoji/1f9e9.svg", "emoji/1f9ea.svg", "emoji/1f9ee.svg", "emoji/1f9ef.svg", "emoji/1f9f0.svg", "emoji/1f9f1.svg", "emoji/1f9f2.svg", "emoji/1f9f3.svg", "emoji/1f9f4.svg", "emoji/1f9f5.svg", "emoji/1f9f6.svg", "emoji/1f9f7.svg", "emoji/1f9f8.svg", "emoji/1f9f9.svg", "emoji/1f9fa.svg", "emoji/1f9fb.svg", "emoji/1f9fc.svg", "emoji/1f9fd.svg", "emoji/1fa71.svg", "emoji/1fa72.svg", "emoji/1fa73.svg", "emoji/1fa74.svg", "emoji/1fa78.svg", "emoji/1fa79.svg", "emoji/1fa7a.svg", "emoji/1fa8f.svg", "emoji/1fa91.svg", "emoji/1fa92.svg", "emoji/1fa93.svg", "emoji/1fa9a.svg", "emoji/1fa9b.svg", "emoji/1fa9c.svg", "emoji/1fa9d.svg", "emoji/1fa9e.svg", "emoji/1fa9f.svg", "emoji/1faa0.svg", "emoji/1faa1.svg", "emoji/1faa3.svg", "emoji/1faa4.svg", "emoji/1faa5.svg", "emoji/1faa8.svg", "emoji/1faae.svg", "emoji/1fab0.svg", "emoji/1fab4.svg", "emoji/1fab5.svg", "emoji/1fab7.svg", "emoji/1fabb.svg", "emoji/1fad0.svg", "emoji/1fad1.svg", "emoji/1fad2.svg", "emoji/1fad3.svg", "emoji/1fad6.svg", "emoji/1fad8.svg", "emoji/1fad9.svg", "emoji/1fada.svg", "emoji/1fadb.svg", "emoji/1fadc.svg", "emoji/1fae7.svg", "emoji/231a.svg", "emoji/2328.svg", "emoji/23f0.svg", "emoji/2600.svg", "emoji/2602.svg", "emoji/2615.svg", "emoji/267b.svg", "emoji/2696.svg", "emoji/26d1.svg", "emoji/26d3.svg", "emoji/26f1.svg", "emoji/26f2.svg", "emoji/26fa.svg", "emoji/26fd.svg", "emoji/2702.svg", "emoji/2709.svg", "emoji/270f.svg", "emoji/2744.svg"];

/* Ohne den Kern läuft die App nicht, deshalb scheitert die Installation, wenn eine Kerndatei fehlt. */
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(KERN); }));
});

/* Eine neue Version wartet, bis die App sie abruft („Jetzt laden“). So wechselt nichts mitten im Einkauf. */
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

/* Alte Caches löschen, dann die Bildzeichen nachladen. Fehlt eines, zeigt die App die Emoji-Schrift des Geräts. */
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k.indexOf("einkauf-") === 0 && k !== CACHE ? caches.delete(k) : null; }));
  }).then(function () { return self.clients.claim(); }).then(function () {
    return caches.open(CACHE).then(function (c) {
      return Promise.all(BILDER.map(function (u) {
        return c.match(u).then(function (hit) { return hit || c.add(u).catch(function () {}); });
      }));
    });
  }));
});

/* Erst der Cache, dann das Netz. Was aus dem Netz kommt und zur App gehört, wird für später abgelegt. */
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req.mode === "navigate" ? "./" : req, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res.ok && res.type === "basic") c.put(req, res.clone());
        return res;
      });
    });
  }));
});
