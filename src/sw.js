/* Service Worker: hält die App samt Katalog, Schriften und Bildzeichen für die Nutzung ohne Netz vor.
   Diese Datei ist die Vorlage; tools/sw_bauen.py trägt Version und Dateilisten ein und schreibt sw.js.
   Die Version ist ein Hash über alle vorgehaltenen Dateien: ändert sich eine, entsteht ein neuer Cache. */
"use strict";
var VERSION = "/*VERSION*/";
var CACHE = "einkauf-" + VERSION;
var KERN = /*KERN*/;
var BILDER = /*BILDER*/;

/* Ohne den Kern läuft die App nicht, deshalb scheitert die Installation, wenn eine Kerndatei fehlt. */
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(KERN); }).then(function () { return self.skipWaiting(); }));
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
