/* CLARITY AI — service worker.
   Tugasnya cuma dua: (1) bikin situs ini bisa di-"install" jadi aplikasi,
   (2) nyimpen file inti (shell) biar kebuka walau koneksi lagi jelek.
   Panggilan ke api.zyvor.my.id / api.ikyyxd.my.id / /api/* TIDAK pernah dicache —
   itu harus selalu fresh dari server. */
'use strict';

const CACHE_VERSION = 'v1'; // naikin angka ini tiap kali mau paksa klien ambil ulang shell
const CACHE_NAME = 'clarity-shell-' + CACHE_VERSION;

const SHELL = [
  './',
  'index.html',
  'css/app.css',
  'js/core.js',
  'js/chat.js',
  'js/tools.js',
  'js/toolsmenu.js',
  'js/maker.js',
  'js/downloader.js',
  'js/about.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isApiCall(url){
  return url.pathname.startsWith('/api/') || /api\.zyvor\.my\.id|api\.ikyyxd\.my\.id|catbox\.moe|uguu\.se/.test(url.host);
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return; // jangan ganggu POST ke /api/*
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && !isApiCall(url)) return; // biarin font/CDN lewat apa adanya
  if (isApiCall(url)) return; // selalu network, jangan dicache

  if (req.mode === 'navigate') {
    // Halaman utama: coba network dulu biar selalu versi terbaru, fallback ke cache kalau offline.
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put('index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Aset statis (css/js/icon): cache dulu biar cepat, lalu diam-diam diperbarui di belakang.
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
