/* CLARITY AI — core.js
   Util bersama, komunikasi API, mesin form generik untuk alat, router, drawer, proteksi.
   File kategori (chat.js, tools.js, toolsmenu.js, downloader.js, about.js) daftar diri
   lewat App.registerSection() lalu App.boot() dipanggil sekali di akhir index.html. */
(() => {
  'use strict';
  const App = window.App = {};

  /* ========== Konfigurasi dasar ========== */
  App.BASE_IKYYXD = 'https://api.ikyyxd.my.id';
  App.BASE_ZYVOR = 'https://api.zyvor.my.id';
  const enc = App.enc = encodeURIComponent;

  /* ========== Util kecil ========== */
  const $ = App.$ = s => document.querySelector(s);
  App.$$ = s => Array.from(document.querySelectorAll(s));
  const store = App.store = {
    get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  const esc = App.esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const reduced = App.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = App.svg = (inner, extra) => `<svg class="ic" viewBox="0 0 24 24"${extra || ''}>${inner}</svg>`;
  const ICON = App.ICON = {
    copy: svg('<rect x="9" y="9" width="11" height="11" rx="3"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    retry: svg('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>'),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
    stop: svg('<rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/>', ' style="fill:currentColor;stroke:none"'),
    up: svg('<path d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/>'),
    lr: svg('<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>'),
    chat: svg('<path d="M12 20.5c-1.6 0-3.1-.4-4.4-1.2L3.5 20.5l1.3-3.6A8.3 8.3 0 0 1 3.5 12 8.5 8.5 0 1 1 12 20.5z"/>'),
    plane: svg('<path d="M21 4L3 11l6 2.5L11.5 20 14 14zM9 13.5L21 4"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>'),
    arrow: svg('<path d="M7 17L17 7M9 7h8v8"/>'),
    open: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    download: svg('<path d="M12 4v11M7 10.5L12 15.5l5-5M5 19.5h14"/>'),
    file: svg('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>'),
    img: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l5-5 4 4 3-3 4 4"/>'),
    film: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>'),
    music: svg('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
    link2: svg('<path d="M9 15l6-6M9.5 5.5L11 4a3.8 3.8 0 0 1 5.4 5.4l-1.9 1.9M14.5 18.5L13 20a3.8 3.8 0 0 1-5.4-5.4l1.9-1.9"/>'),
    heart: svg('<path d="M12 20s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.7 11c-2.2 4.4-9.7 9-9.7 9z"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
    key: svg('<circle cx="8" cy="14.5" r="3.5"/><path d="M10.8 11.7L19 3.5M16 7l2.5 2.5M19 4l1.5 1.5"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.7 4 6 4 9s-1.3 6.3-4 9c-2.7-2.7-4-6-4-9s1.3-6.3 4-9z"/>'),
    qr: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3zM14 20h3M20 17v3"/>'),
    cam: svg('<path d="M4 8h3l1.6-2.2A2 2 0 0 1 10.2 5h3.6a2 2 0 0 1 1.6.8L17 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13.5" r="3.6"/>'),
    play: svg('<path d="M7 4.5l13 7.5-13 7.5z" style="fill:currentColor"/>'),
    back: svg('<path d="M15 19l-7-7 7-7"/>'),
    expand: svg('<path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M4 15v4a1 1 0 0 0 1 1h4"/>')
  };
  App.fmtSize = n => n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';

  App.copyText = async (t, btn, done) => {
    try { await navigator.clipboard.writeText(t); }
    catch(e){
      const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch(_){} ta.remove();
    }
    if (!btn) return;
    const old = btn.innerHTML; btn.innerHTML = done; setTimeout(() => { btn.innerHTML = old; }, 1400);
  };

  /* ========== Markdown ringan (dipakai chat.js) ========== */
  function inline(t){
    return t.split(/(`[^`\n]+`)/g).map(p => {
      if (p.length > 1 && p[0] === '`' && p.endsWith('`')) return '<code>' + p.slice(1, -1) + '</code>';
      return p
        .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }).join('');
  }
  App.md = function md(src){
    const blocks = [];
    src = String(src).replace(/```([\w+-]*)\n?([\s\S]*?)(```|$)/g, (m, lang, code) => {
      blocks.push({ lang, code: code.replace(/\n$/, '') });
      return '\u0000' + (blocks.length - 1) + '\u0000';
    });
    const lines = esc(src).split('\n');
    let out = '', list = null, para = [];
    const fp = () => { if (para.length){ out += '<p>' + inline(para.join('<br>')) + '</p>'; para = []; } };
    const fl = () => { if (list){ out += `<${list.t}>` + list.i.map(x => '<li>' + inline(x) + '</li>').join('') + `</${list.t}>`; list = null; } };
    for (const ln of lines){
      let m;
      if (/^\u0000\d+\u0000$/.test(ln.trim())){ fp(); fl(); out += ln.trim(); continue; }
      if ((m = ln.match(/^(#{1,3})\s+(.*)/))){ fp(); fl(); const n = m[1].length + 2; out += `<h${n}>` + inline(m[2]) + `</h${n}>`; continue; }
      if ((m = ln.match(/^\s*[-*•]\s+(.*)/))){ fp(); if (!list || list.t !== 'ul'){ fl(); list = { t:'ul', i:[] }; } list.i.push(m[1]); continue; }
      if ((m = ln.match(/^\s*\d+[.)]\s+(.*)/))){ fp(); if (!list || list.t !== 'ol'){ fl(); list = { t:'ol', i:[] }; } list.i.push(m[1]); continue; }
      if (!ln.trim()){ fp(); fl(); continue; }
      fl(); para.push(ln);
    }
    fp(); fl();
    return out.replace(/\u0000(\d+)\u0000/g, (m, i) => {
      const b = blocks[+i];
      return `<div class="code"><div class="code-h"><span>${esc(b.lang || 'kode')}</span><button type="button" data-act="copycode">Salin</button></div><pre><code>${esc(b.code)}</code></pre></div>`;
    });
  };

  /* ========== Efek ketik (dipakai hasil teks) ========== */
  App.typer = function typer(el, text, o = {}){
    if (reduced){ el.textContent = text; return; }
    const caret = document.createElement('span'); caret.className = 'caret';
    const tx = document.createTextNode(''); el.textContent = ''; el.append(tx, caret);
    const per = Math.max(1, Math.ceil(text.length / 220));
    let i = 0;
    const tick = () => {
      if (!el.isConnected) return;
      i += per;
      tx.data = text.slice(0, i);
      if (i < text.length) setTimeout(tick, 24);
      else if (o.loop) setTimeout(() => { i = 0; tick(); }, 2400);
      else caret.remove();
    };
    tick();
  };

  /* ========== Gambar contoh (hiasan sebelum ada hasil) ========== */
  App.scene = function scene({ blur = 0, wm = false, cut = false } = {}){
    const f = blur ? `<filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${blur}"/></filter>` : '';
    const g = blur ? ' filter="url(#b)"' : '';
    const bg = cut
      ? '<rect width="400" height="300" fill="url(#ck)"/>'
      : '<rect width="400" height="300" fill="url(#sky)"/><circle cx="318" cy="68" r="32" fill="#ffd36b"/><path d="M0 230L90 130 160 200 240 110 330 210 400 160V300H0Z" fill="#6c7bd9"/><path d="M0 262L110 190 200 250 290 180 400 250V300H0Z" fill="#3f4fb0"/>';
    const sub = '<g transform="translate(150 118)"><circle cx="50" cy="30" r="27" fill="#f4a261"/><rect x="16" y="62" width="68" height="100" rx="28" fill="#e76f51"/><circle cx="41" cy="26" r="3" fill="#264653"/><circle cx="59" cy="26" r="3" fill="#264653"/></g>';
    const mark = wm ? '<text x="200" y="160" text-anchor="middle" font-size="36" font-weight="700" fill="#fff" fill-opacity=".6" transform="rotate(-24 200 160)" font-family="sans-serif">WATERMARK</text>' : '';
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb88c"/><stop offset="1" stop-color="#ffe7c7"/></linearGradient><pattern id="ck" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#eeeef2"/><rect width="10" height="10" fill="#d3d3db"/><rect x="10" y="10" width="10" height="10" fill="#d3d3db"/></pattern>${f}</defs><g${g}>${bg}${sub}</g>${mark}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  };
  App.SAMPLES = {
    sharp:  () => [App.scene({ blur:3.5 }), App.scene()],
    cutout: () => [App.scene(), App.scene({ cut:true })],
    blur:   () => [App.scene(), App.scene({ blur:6 })],
    wm:     () => [App.scene({ wm:true }), App.scene()]
  };

  /* ========== Slider Before / After ========== */
  App.makeSlider = function makeSlider(beforeSrc, afterSrc, o = {}){
    const el = document.createElement('div'); el.className = 'cmp';
    el.innerHTML = `<div class="cmp-stage${o.cut ? ' cut' : ''}"><img class="cmp-after" alt="After" referrerpolicy="no-referrer"><img class="cmp-before" alt="Before" referrerpolicy="no-referrer"><span class="tag l">Before</span><span class="tag r">After</span><div class="cmp-handle" role="slider" tabindex="0" aria-label="Geser untuk membandingkan Before dan After" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><span class="grip">${ICON.lr}</span></div></div>`;
    const st = el.firstChild, h = st.querySelector('.cmp-handle'), b = st.querySelector('.cmp-before'), a = st.querySelector('.cmp-after');
    let cur = 50, drag = false;
    b.addEventListener('load', () => { if (b.naturalWidth) st.style.aspectRatio = b.naturalWidth + '/' + b.naturalHeight; });
    const warn = (label) => {
      if (el.querySelector('.cmp-warn')) return;
      const w = document.createElement('p'); w.className = 'cmp-warn';
      w.textContent = `Pratinjau ${label} gagal dimuat di sini. Pakai tombol "Buka hasil" di bawah untuk melihatnya.`;
      el.appendChild(w);
    };
    b.addEventListener('error', () => warn('Before'));
    a.addEventListener('error', () => warn('After'));
    b.src = beforeSrc; a.src = afterSrc;
    const set = p => { p = Math.max(0, Math.min(100, p)); cur = p; st.style.setProperty('--pos', p + '%'); h.setAttribute('aria-valuenow', String(Math.round(p))); };
    const fromEvent = e => { const r = st.getBoundingClientRect(); if (r.width) set((e.clientX - r.left) / r.width * 100); };
    st.addEventListener('pointerdown', e => { drag = true; try { st.setPointerCapture(e.pointerId); } catch(_){} fromEvent(e); });
    st.addEventListener('pointermove', e => { if (drag) fromEvent(e); });
    const end = () => { drag = false; };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    h.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft'){ set(cur - 5); e.preventDefault(); }
      else if (e.key === 'ArrowRight'){ set(cur + 5); e.preventDefault(); }
      else if (e.key === 'Home'){ set(0); e.preventDefault(); }
      else if (e.key === 'End'){ set(100); e.preventDefault(); }
    });
    if (reduced) set(50);
    else {
      set(97); let t0 = null;
      const step = ts => {
        if (drag || (!el.isConnected && t0 !== null)) return;
        if (t0 === null) t0 = ts;
        const k = Math.min(1, (ts - t0) / 1000);
        set(97 - 47 * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    return el;
  };

  /* ========== Upload file sementara (catbox/uguu lewat /api/upload, cadangan uguu langsung) ========== */
  App.uploadFile = async function uploadFile(f, signal){
    let hint = '';
    if (f.size <= 4 * 1048576){
      try {
        const r = await fetch('/api/upload?name=' + enc(f.name || 'file') + '&type=' + enc(f.type || ''), { method:'POST', headers:{ 'Content-Type':'application/octet-stream' }, body:f, signal });
        const j = await r.json().catch(() => null);
        if (r.ok && j && j.url) return j.url;
        if (r.status === 404) hint = ' File api/upload.js belum terpasang di hosting.';
        else if (j && j.message) hint = ' ' + j.message;
      } catch(e){ if (e.name === 'AbortError') throw e; }
    }
    try {
      const fd = new FormData(); fd.append('files[]', f, f.name || 'file');
      const r = await fetch('https://uguu.se/upload', { method:'POST', body:fd, signal });
      const raw = await r.text(); let u = '';
      try { const j = JSON.parse(raw); u = (j.files && j.files[0] && j.files[0].url) || j.url || ''; }
      catch(_){ if (/^https?:\/\//.test(raw.trim())) u = raw.trim().split('\n')[0]; }
      if (r.ok && u) return u;
    } catch(e){ if (e.name === 'AbortError') throw e; }
    throw new Error('Upload gagal.' + hint + ' Coba lagi atau pakai file yang lebih kecil.');
  };

  /* ========== Pemanggil API generik ========== */
  // Mengembalikan {ok,status,contentType,data,raw,blobUrl} atau melempar Error dengan pesan ramah.
  App.apiFetch = async function apiFetch(url, init){
    let res;
    try { res = await fetch(url, init); }
    catch(e){
      if (e.name === 'AbortError') throw e;
      throw new TypeError('Tidak bisa terhubung ke API. Cek koneksi internet. Kalau koneksi aman, API mungkin memblokir akses dari browser (CORS).');
    }
    if (!res.ok){
      throw new Error(res.status >= 500
        ? `Server sedang bermasalah (${res.status}). Coba lagi sebentar.`
        : `Permintaan ditolak server (${res.status}).`);
    }
    const ct = res.headers.get('content-type') || '';
    if (/^(image|video|audio)\//.test(ct) || ct.includes('application/pdf')){
      const blob = await res.blob();
      return { ok:true, status:res.status, contentType:ct, data:null, raw:'', blobUrl:URL.createObjectURL(blob) };
    }
    const raw = await res.text();
    let data = null; try { data = JSON.parse(raw); } catch(_){}
    return { ok:true, status:res.status, contentType:ct, data, raw, blobUrl:'' };
  };

  // Bangun & jalankan request GET (query string) atau POST JSON, dari semua field value.
  // api.zyvor.my.id menolak dipanggil langsung dari browser (CORS), jadi request ke base itu
  // dibelokkan lewat /api/zyvor?path=... (fungsi server di Vercel, nggak kena CORS).
  App.proxyFor = function proxyFor(base){ return base === App.BASE_ZYVOR ? '/api/zyvor' : ''; };

  App.makeRun = function makeRun(opts){
    // opts: {method:'GET'|'POST', base, path, extra?:{}}
    const proxy = App.proxyFor(opts.base);
    return async (vals, signal) => {
      const body = { ...vals, ...(opts.extra || {}) };
      if ((opts.method || 'GET') === 'GET'){
        const qs = new URLSearchParams();
        for (const k in body) if (body[k] !== undefined && body[k] !== '') qs.set(k, body[k]);
        const target = `${opts.path}?${qs.toString()}`;
        return proxy
          ? App.apiFetch(`${proxy}?path=${enc(target)}`, { signal })
          : App.apiFetch(`${opts.base}${target}`, { signal });
      }
      const init = { method:'POST', signal, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) };
      return proxy
        ? App.apiFetch(`${proxy}?path=${enc(opts.path)}`, init)
        : App.apiFetch(`${opts.base}${opts.path}`, init);
    };
  };

  /* ========== Ekstraksi hasil generik ========== */
  function findUrl(d, depth){
    depth = depth || 0; if (depth > 6) return '';
    if (typeof d === 'string') return /^https?:\/\/\S+$/.test(d.trim()) ? d.trim() : '';
    if (!d || typeof d !== 'object') return '';
    const keys = ['download_url','downloadUrl','no_watermark','nowm','hd','url','result','data','output','image','video','audio','file','link','short','apk','download','stream','playurl','play_url','watch','embed','src','m3u8'];
    for (const k of keys){ if (k in d){ const r = findUrl(d[k], depth + 1); if (r) return r; } }
    for (const v of Object.values(d)){ const r = findUrl(v, depth + 1); if (r) return r; }
    return '';
  }
  App.findUrl = findUrl;

  function textOf(d, depth){
    depth = depth || 0; if (depth > 6) return '';
    if (typeof d === 'string') return d.trim();
    if (Array.isArray(d)) return d.map(x => textOf(x, depth + 1)).filter(Boolean).join('\n\n');
    if (d && typeof d === 'object'){
      for (const k of ['result','prompt','text','data','output','description','message','uuid']){
        if (k in d){ const r = textOf(d[k], depth + 1); if (r) return r; }
      }
    }
    return '';
  }
  App.textOf = textOf;

  // Cari semua url di dalam objek hasil (buat daftar download). excludeUrl = url input, biar nggak ikut kehitung.
  App.findLinks = function findLinks(d, excludeUrl){
    const seen = new Set(), out = [];
    const niceLabel = k => ({
      url:'Link', download_url:'Unduh', downloadUrl:'Unduh', hd:'Kualitas HD', sd:'Kualitas SD',
      no_watermark:'Tanpa watermark', nowm:'Tanpa watermark', watermark:'Dengan watermark',
      audio:'Audio', video:'Video', image:'Gambar', thumbnail:'Thumbnail', thumb:'Thumbnail',
      cover:'Sampul', preview:'Pratinjau', mp3:'MP3', mp4:'MP4', short:'Tautan pendek',
      result:'Hasil', file:'File', link:'Link', apk:'APK'
    }[k] || (k.charAt(0).toUpperCase() + k.slice(1).replace(/[_-]/g, ' ')));
    function walk(node, key){
      if (node == null) return;
      if (typeof node === 'string'){
        const m = node.trim();
        if (/^https?:\/\/\S+$/.test(m) && m !== excludeUrl && !seen.has(m)){
          seen.add(m); out.push({ url:m, label: niceLabel(key || 'link') });
        }
        return;
      }
      if (Array.isArray(node)){ node.forEach((x, i) => walk(x, key)); return; }
      if (typeof node === 'object'){ for (const k in node) walk(node[k], k); }
    }
    walk(d, '');
    return out;
  };

  // Ratakan objek jadi daftar {label,value} buat tampilan kv. Lewati status/raw yang nggak penting.
  App.flattenKV = function flattenKV(d, prefix){
    const SKIP = new Set(['status','code','creator']);
    const rows = [];
    function val2str(v){
      if (v === null || v === undefined) return '-';
      if (typeof v === 'boolean') return v ? 'Ya' : 'Tidak';
      if (typeof v === 'object') return '';
      return String(v);
    }
    function walk(node, pfx){
      if (node == null || typeof node !== 'object'){ return; }
      for (const k in node){
        if (!pfx && SKIP.has(k)) continue;
        const v = node[k];
        const label = (pfx ? pfx + ' › ' : '') + k.replace(/[_-]/g, ' ');
        if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, label);
        else if (Array.isArray(v)) rows.push({ label, value: v.map(val2str).filter(x=>x!=='').join(', ') || '-' });
        else { const s = val2str(v); if (s !== '') rows.push({ label, value: s }); }
      }
    }
    walk(d, prefix || '');
    return rows;
  };

  // Cari daftar objek "mirip film" di dalam hasil JSON yang bentuknya nggak pasti.
  function findMovieList(d, depth){
    depth = depth || 0; if (depth > 5) return null;
    if (Array.isArray(d)){
      const objs = d.filter(x => x && typeof x === 'object' && !Array.isArray(x));
      if (objs.length && objs.length >= d.length * 0.6) return objs;
      return null;
    }
    if (d && typeof d === 'object'){
      for (const k of ['results','result','list','items','data','movies','dramas','episodes','hasil','records']){
        if (k in d){ const r = findMovieList(d[k], depth + 1); if (r) return r; }
      }
      for (const v of Object.values(d)){ const r = findMovieList(v, depth + 1); if (r) return r; }
    }
    return null;
  }
  function pickField(o, keys){
    if (!o || typeof o !== 'object') return '';
    for (const k of keys){ if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; }
    const lower = {}; for (const kk in o) lower[kk.toLowerCase()] = o[kk];
    for (const k of keys){ const v = lower[k.toLowerCase()]; if (v !== undefined && v !== null && v !== '') return v; }
    return '';
  }
  function movieTitle(o){ const v = pickField(o, ['title','name','judul','original_title','label']); return v ? String(v) : 'Tanpa judul'; }
  // Kalau bukan daftar (array), coba cari objek detail asli di dalam pembungkus umum (result/data/dst)
  // sebelum nyerah dan makai objek mentah apa adanya.
  function findMovieDetail(d, depth){
    depth = depth || 0; if (depth > 5 || !d || typeof d !== 'object' || Array.isArray(d)) return null;
    if (pickField(d, ['title','name','judul'])) return d;
    for (const k of ['result','data','movie','item','detail','info']){
      if (k in d){ const r = findMovieDetail(d[k], depth + 1); if (r) return r; }
    }
    return null;
  }
  // Identifier Internet Archive (dipakai freemovie): selalu punya thumbnail & embed player baku, jadi
  // nggak perlu nebak bentuk balasan API buat film dari sana.
  function archiveIdentifier(o){
    const v = pickField(o, ['identifier','identifier_name','archive_id']);
    return typeof v === 'string' && v ? v : '';
  }
  function moviePoster(o){
    let v = pickField(o, ['poster','image','img','thumb','thumbnail','cover','poster_url','picture','photo','banner']);
    if (v && typeof v === 'object') v = pickField(v, ['url','src','link']);
    if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
    const id = archiveIdentifier(o);
    return id ? 'https://archive.org/services/img/' + encodeURIComponent(id) : '';
  }
  function movieDesc(o){
    const v = pickField(o, ['desc','description','synopsis','overview','subtitle','summary']);
    return typeof v === 'string' ? v : '';
  }
  function movieGenre(o){
    let v = pickField(o, ['genre','category','subject','type','tags']);
    if (Array.isArray(v)) v = v[0];
    return (typeof v === 'string' && v) ? v : '';
  }
  // Link download langsung archive.org (https://archive.org/download/<identifier>/<file>) kalau
  // nama filenya ketemu — ini lebih bisa diandalkan daripada embed player umum yang kadang nge-blank.
  function archiveFileUrl(o, archId){
    if (!archId) return '';
    let f = pickField(o, ['file','filename','video_file']);
    if (f && typeof f === 'object') f = pickField(f, ['name','file']);
    if (typeof f === 'string' && f) return 'https://archive.org/download/' + encodeURIComponent(archId) + '/' + encodeURIComponent(f);
    const files = Array.isArray(o && o.files) ? o.files : null;
    if (files){
      const hit = files.find(x => x && typeof x === 'object' && /\.(mp4|m4v|webm|ogv)$/i.test(String(x.name || x.file || '')));
      if (hit) return 'https://archive.org/download/' + encodeURIComponent(archId) + '/' + encodeURIComponent(hit.name || hit.file);
    }
    return '';
  }

  // Tampilan ala Netflix: grid poster → ketuk buka halaman detail dengan tombol Play.
  function renderMovie(container, data){
    const list = findMovieList(data);
    const detail = !list && findMovieDetail(data);
    const items = list || (detail ? [detail] : (data && typeof data === 'object' && !Array.isArray(data) ? [data] : []));
    if (!items.length){
      const links = App.findLinks(data);
      container.innerHTML = `<p class="cmp-warn">Data film tidak ditemukan atau bentuk balasannya nggak dikenali.</p>` +
        (links.length ? `<div class="dllist">${links.map(l => `<div class="dlrow"><span class="meta"><b>${esc(l.label)}</b><small>${esc(l.url)}</small></span><a class="dlbtn" href="${l.url}" target="_blank" rel="noopener noreferrer">${ICON.open}Buka</a></div>`).join('')}</div>` : '');
      return;
    }
    function cardHtml(it, i){
      const p = moviePoster(it), t = movieTitle(it);
      return `<button type="button" class="mv-card" data-i="${i}">` +
        (p ? `<img src="${esc(p)}" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.remove()">` : `<span class="mv-ph">${ICON.film}</span>`) +
        `<span class="mv-t">${esc(t)}</span></button>`;
    }
    function showGrid(){
      // Kelompokkan jadi baris per genre/kategori kalau datanya ada field genre — semua film tetap
      // ditampilkan (nggak dipotong), cuma disusun ke bawah ala Netflix dengan animasi masuk.
      const groups = []; const byGenre = {};
      items.forEach((it, i) => {
        const g = movieGenre(it) || '';
        if (!byGenre[g]){ byGenre[g] = { name: g, idx: [] }; groups.push(byGenre[g]); }
        byGenre[g].idx.push(i);
      });
      const multiRow = groups.length > 1;
      container.innerHTML = groups.map((g, gi) => `
        <div class="mv-row" style="animation-delay:${Math.min(gi, 8) * 70}ms">
          ${multiRow ? `<h3 class="mv-rowtitle">${esc(g.name || 'Lainnya')}</h3>` : ''}
          <div class="mv-grid">${g.idx.map(i => cardHtml(items[i], i)).join('')}</div>
        </div>`).join('');
      container.querySelectorAll('.mv-card').forEach(b => b.addEventListener('click', () => showHero(items[+b.dataset.i])));
    }
    function episodesOf(o){
      if (!o || typeof o !== 'object') return null;
      for (const k of ['episodes','episode_list','episodeList','chapters','eps']){
        if (Array.isArray(o[k]) && o[k].length) return o[k];
      }
      return null;
    }
    function isKnownEmbed(url){
      return /archive\.org\/embed\//i.test(url) || /youtube\.com\/embed\//i.test(url) || /player\.vimeo\.com/i.test(url);
    }
    function playInfo(o){
      const v = findUrl(o);
      const archId = archiveIdentifier(o);
      const archFile = (!v && archId) ? archiveFileUrl(o, archId) : '';
      const embed = (!v && !archFile && archId) ? 'https://archive.org/embed/' + encodeURIComponent(archId) : '';
      const url = v || archFile || embed;
      const direct = !!(v || archFile) && /\.(mp4|m4v|m3u8|webm|mov|ogv)(\?|$)/i.test(v || archFile);
      // Cuma file video langsung atau embed yang sudah dikenal aman yang diputar di dalam halaman.
      // Link halaman situs biasa (misalnya link ke melolo.com) dibuka di tab baru, soalnya kalau
      // dipaksa nge-iframe, kebanyakan situs nolak (muncul "menolak untuk tersambung").
      const embeddable = direct || isKnownEmbed(url);
      return { url, direct, embeddable };
    }
    function showHero(it){
      const p = moviePoster(it), t = movieTitle(it), d = movieDesc(it);
      const pl = playInfo(it);
      const episodes = episodesOf(it);
      const recIdx = items.length > 1 ? items.map((x, i) => i).filter(i => items[i] !== it) : [];
      container.innerHTML = `<div class="mv-hero">
        <div class="mv-stage" id="mvStage">
          ${p ? `<img src="${esc(p)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div class="mv-grad"></div>
          ${items.length > 1 ? `<button type="button" class="mv-back">${ICON.back}</button>` : ''}
          ${pl.url
            ? `<button type="button" class="mv-playbtn" aria-label="Play">${ICON.play}</button>`
            : `<div class="mv-noplay">${ICON.film}<span>Link nonton belum ketemu</span></div>`}
        </div>
        <div class="mv-info"><h2>${esc(t)}</h2>${d ? `<p>${esc(d)}</p>` : ''}
          ${!pl.url ? `<p class="cmp-warn" style="margin:10px 0 0">Server tidak mengirim link yang bisa dikenali buat film ini. Coba film lain, atau mungkin perlu action lain di API-nya.</p>` : ''}
        </div>
        ${episodes ? `<div class="mv-sec"><h3>Episode</h3><div class="mv-eprow">${episodes.map((e, i) =>
            `<button type="button" class="mv-ep" data-i="${i}">${esc(pickField(e, ['episode','ep','name','title']) || ('Eps ' + (i + 1)))}</button>`
          ).join('')}</div></div>` : ''}
        ${recIdx.length ? `<div class="mv-sec"><h3>Rekomendasi</h3><div class="mv-grid mv-grid-sm">${recIdx.map(i => {
            const ri = items[i], rp = moviePoster(ri), rt = movieTitle(ri);
            return `<button type="button" class="mv-card mv-rec" data-i="${i}">` +
              (rp ? `<img src="${esc(rp)}" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.remove()">` : `<span class="mv-ph">${ICON.film}</span>`) +
              `<span class="mv-t">${esc(rt)}</span></button>`;
          }).join('')}</div></div>` : ''}
      </div>`;
      const stage = container.querySelector('#mvStage');
      function playNow(url, direct){
        stage.innerHTML = (direct
          ? `<video controls autoplay playsinline referrerpolicy="no-referrer" src="${esc(url)}"></video>`
          : `<iframe src="${esc(url)}" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe>`)
          + `<button type="button" class="mv-fs" aria-label="Perbesar">${ICON.expand}</button>`;
        const fs = stage.querySelector('.mv-fs');
        fs.addEventListener('click', () => {
          const el = stage.querySelector('video,iframe');
          if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
          else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen();
        });
      }
      const back = container.querySelector('.mv-back'); if (back) back.addEventListener('click', showGrid);
      const pb = container.querySelector('.mv-playbtn'); if (pb) pb.addEventListener('click', () => {
        if (pl.embeddable) playNow(pl.url, pl.direct);
        else window.open(pl.url, '_blank', 'noopener,noreferrer');
      });
      container.querySelectorAll('.mv-ep').forEach(b => b.addEventListener('click', () => {
        const epIt = episodes[+b.dataset.i];
        const epl = playInfo(epIt);
        container.querySelectorAll('.mv-ep').forEach(x => x.classList.remove('on')); b.classList.add('on');
        if (epl.url && epl.embeddable) playNow(epl.url, epl.direct);
        else if (epl.url) window.open(epl.url, '_blank', 'noopener,noreferrer');
        else { b.insertAdjacentHTML('afterend', `<span class="mv-eperr">Link episode ini belum ketemu.</span>`); setTimeout(() => { const w = container.querySelector('.mv-eperr'); if (w) w.remove(); }, 2500); }
      }));
      container.querySelectorAll('.mv-rec').forEach(b => b.addEventListener('click', () => showHero(items[+b.dataset.i])));
      if (!pl.url){
        const links = App.findLinks(it);
        if (links.length) container.querySelector('.mv-info').insertAdjacentHTML('beforeend',
          `<div class="dllist">${links.map(l => `<div class="dlrow"><span class="meta"><b>${esc(l.label)}</b><small>${esc(l.url)}</small></span><a class="dlbtn" href="${l.url}" target="_blank" rel="noopener noreferrer">${ICON.open}Buka</a></div>`).join('')}</div>`);
      }
    }
    if (items.length === 1) showHero(items[0]); else showGrid();
  }

  /* ========== Extract default hasil berdasar item.kind ========== */
  App.defaultExtract = function defaultExtract(apiRes, item, vals, previews){
    if (apiRes.data && apiRes.data.status === false){
      throw new Error(textOf({ a: apiRes.data.message, b: apiRes.data.error }) || 'Server mengembalikan status gagal.');
    }
    const isUpload = f => f.type === 'image' || f.type === 'video' || f.type === 'file';
    const imgFields = item.fields.filter(isUpload);
    switch (item.kind){
      case 'image-compare': case 'video-compare': {
        const out = apiRes.blobUrl || findUrl(apiRes.data) || findUrl(apiRes.raw);
        if (!out) throw new Error(`Server tidak mengirim ${item.kind === 'video-compare' ? 'video' : 'gambar'} hasil.`);
        const k = imgFields[0] && imgFields[0].key;
        return { before: previews[k] || '', after: out };
      }
      case 'image-single': {
        const out = apiRes.blobUrl || findUrl(apiRes.data) || findUrl(apiRes.raw);
        if (!out) throw new Error('Server tidak mengirim gambar hasil.');
        return { image: out };
      }
      case 'three-shots': {
        const out = apiRes.blobUrl || findUrl(apiRes.data) || findUrl(apiRes.raw);
        if (!out) throw new Error('Server tidak mengirim gambar hasil.');
        const shots = imgFields.map(f => ({ label: f.label, src: previews[f.key] || '' }));
        shots.push({ label:'Hasil', src: out });
        return { shots };
      }
      case 'text': {
        const out = textOf(apiRes.data) || (apiRes.data ? JSON.stringify(apiRes.data, null, 2) : apiRes.raw.trim());
        if (!out) throw new Error('Server membalas tanpa isi.');
        const k = imgFields[0] && imgFields[0].key;
        return { text: out, image: (k && previews[k]) || '' };
      }
      case 'kv': {
        const rows = App.flattenKV(apiRes.data || {});
        if (!rows.length) throw new Error('Server tidak mengirim data.');
        return { rows };
      }
      case 'links': {
        if (apiRes.blobUrl) return { links: [{ url: apiRes.blobUrl, label:'Hasil' }] };
        const inputUrl = vals.url || vals.link || vals.videourl || '';
        const links = App.findLinks(apiRes.data, inputUrl);
        if (!links.length) throw new Error('Server tidak mengirim link hasil.');
        return { links };
      }
      case 'movie': {
        if (!apiRes.data) throw new Error('Server tidak mengirim data.');
        return { data: apiRes.data };
      }
      default: return {};
    }
  };

  /* ========== Render hasil ke #toolOut ========== */
  App.renderResult = function renderResult(container, kind, payload){
    container.innerHTML = '';
    if (kind === 'image-compare' || kind === 'video-compare'){
      if (kind === 'video-compare'){
        container.innerHTML = `<div class="shots"><div class="shot"><h2>Before</h2><video id="rBefore" controls playsinline preload="metadata" referrerpolicy="no-referrer"></video></div><div class="shot"><h2>After</h2><video id="rAfter" controls playsinline preload="metadata" referrerpolicy="no-referrer"></video><p class="cmp-warn" id="rAfterWarn" hidden>Video gagal dimuat di sini. Pakai tombol "Buka hasil" di bawah.</p><div class="acts"><a class="mini" id="rOpen" target="_blank" rel="noopener noreferrer">${ICON.open}Buka hasil</a></div></div></div>`;
        $('#rBefore').src = payload.before; $('#rAfter').src = payload.after; $('#rOpen').href = payload.after;
        $('#rAfter').addEventListener('error', () => { $('#rAfterWarn').hidden = false; });
        return;
      }
      const wrap = document.createElement('div');
      wrap.appendChild(App.makeSlider(payload.before, payload.after));
      const cap = document.createElement('div'); cap.className = 'cmp-cap';
      cap.innerHTML = `<span>Geser garis untuk membandingkan</span><span class="btns"><a class="mini" id="rOpen" target="_blank" rel="noopener noreferrer">${ICON.open}Buka hasil</a><button class="mini ghost" type="button" id="rCopy" aria-label="Salin link hasil">${ICON.copy}</button></span>`;
      wrap.appendChild(cap); container.appendChild(wrap);
      const a = $('#rOpen'); a.href = payload.after;
      if (payload.after.startsWith('blob:')){ a.download = 'hasil'; const rc = $('#rCopy'); if (rc) rc.remove(); }
      else { const rc = $('#rCopy'); if (rc) rc.onclick = e => App.copyText(payload.after, e.currentTarget, ICON.check); }
      return;
    }
    if (kind === 'three-shots'){
      container.innerHTML = `<div class="shots">${payload.shots.map((s, i) =>
        `<div class="shot"><h2>${esc(s.label || ('Gambar ' + (i + 1)))}</h2><img src="${s.src}" alt="${esc(s.label || '')}" referrerpolicy="no-referrer" onerror="this.insertAdjacentHTML('afterend','<p class=&quot;cmp-warn&quot;>Gambar gagal dimuat di sini.</p>');this.remove()"></div>`
      ).join('')}</div>`;
      return;
    }
    if (kind === 'image-single'){
      container.innerHTML = `<div class="shots"><div class="shot"><h2>Hasil</h2><img id="rImg" alt="Hasil" referrerpolicy="no-referrer"><p class="cmp-warn" id="rImgWarn" hidden>Gambar gagal dimuat di sini. Pakai tombol "Buka hasil" di bawah.</p><div class="acts"><a class="mini" id="rOpen" target="_blank" rel="noopener noreferrer">${ICON.open}Buka hasil</a><button class="mini ghost" type="button" id="rCopy" aria-label="Salin link hasil">${ICON.copy}</button></div></div></div>`;
      $('#rImg').src = payload.image; $('#rOpen').href = payload.image;
      $('#rImg').addEventListener('error', () => { $('#rImgWarn').hidden = false; });
      if (payload.image.startsWith('blob:')){ $('#rOpen').download = 'hasil'; const rc = $('#rCopy'); if (rc) rc.remove(); }
      else { const rc = $('#rCopy'); if (rc) rc.onclick = e => App.copyText(payload.image, e.currentTarget, ICON.check); }
      return;
    }
    if (kind === 'text'){
      if (payload.image){
        container.innerHTML = `<div class="shots"><div class="shot"><h2>Gambar</h2><img id="rBefore" alt="" referrerpolicy="no-referrer"></div><div class="shot"><h2>Hasil</h2><div class="textres" id="rText"></div><div class="acts"><button type="button" id="rCopyText">${ICON.copy}Salin</button></div></div></div>`;
        $('#rBefore').src = payload.image;
      } else {
        container.innerHTML = `<div class="shots"><div class="shot"><h2>Hasil</h2><div class="textres" id="rText"></div><div class="acts"><button type="button" id="rCopyText">${ICON.copy}Salin</button></div></div></div>`;
      }
      App.typer($('#rText'), payload.text);
      $('#rCopyText').onclick = e => App.copyText(payload.text, e.currentTarget, ICON.check + 'Tersalin');
      return;
    }
    if (kind === 'kv'){
      container.innerHTML = `<div class="kv">${payload.rows.map(r => `<div class="r"><b>${esc(r.label)}</b><span>${esc(r.value)}</span></div>`).join('')}</div>`;
      return;
    }
    if (kind === 'movie'){
      renderMovie(container, payload.data);
      return;
    }
    if (kind === 'links'){
      const typeIcon = url => /\.(mp3|m4a|wav|ogg)(\?|$)/i.test(url) ? ICON.music
        : /\.(mp4|mov|webm|mkv|m3u8)(\?|$)/i.test(url) ? ICON.film
        : /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) ? ICON.img
        : /\.apk(\?|$)/i.test(url) ? ICON.file
        : ICON.link2;
      const isImg = url => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
      container.innerHTML = `<div class="dllist">${payload.links.map((l, i) =>
        `<div class="dlrow"><span class="th">${isImg(l.url) ? `<img src="${l.url}" alt="" referrerpolicy="no-referrer" loading="lazy">` : typeIcon(l.url)}</span><span class="meta"><b>${esc(l.label)}</b><small>${esc(l.url)}</small></span><a class="dlbtn" href="${l.url}" target="_blank" rel="noopener noreferrer" download>${ICON.download}Buka</a></div>`
      ).join('')}</div><p class="fine">Sebagian platform tidak mengizinkan unduh otomatis lewat browser — kalau tombol cuma membuka file di tab baru, tahan gambar/video lalu pilih simpan.</p>`;
      return;
    }
  };

  /* ========== Field engine generik (dipakai alat gambar/video + tools menu + downloader) ========== */
  // field: {key,type:'image'|'file'|'text'|'textarea'|'number'|'select',label,placeholder,default,options,accept}
  function buildUploadField(field, tool){
    const kind = field.type === 'video' ? 'video' : (field.type === 'file' ? 'file' : 'image');
    const accept = field.accept || (kind === 'image' ? 'image/*' : kind === 'video' ? 'video/*' : '*/*');
    const maxMb = field.maxMb || (kind === 'video' ? 100 : 25);
    const wrap = document.createElement('div'); wrap.className = 'ufield';
    const uid = 'f_' + field.key;
    wrap.innerHTML = `
      <label for="${uid}_in">${esc(field.label)}</label>
      <label class="drop" for="${uid}_in">
        <span class="up"><svg class="ic" viewBox="0 0 24 24" style="width:26px;height:26px;stroke-width:2.2"><path d="M12 16V5M7 9.5L12 5l5 4.5M5 19h14"/></svg></span>
        <b>${kind === 'image' ? 'Pilih gambar' : kind === 'video' ? 'Pilih video' : 'Pilih file'}</b>
        <small>Ketuk untuk memilih, atau seret file ke sini</small>
        <input class="sr" id="${uid}_in" type="file" accept="${accept}">
      </label>
      <div class="picked" hidden>
        <span class="th${kind === 'file' ? ' file' : ''}"></span>
        <div class="meta"><b></b><small></small></div>
        <button class="swap" type="button">Ganti</button>
      </div>`;
    const drop = wrap.querySelector('.drop'), picked = wrap.querySelector('.picked'), input = wrap.querySelector('input[type=file]');
    const th = wrap.querySelector('.th'), nameEl = wrap.querySelector('.meta b'), sizeEl = wrap.querySelector('.meta small'), swap = wrap.querySelector('.swap');
    let file = null, previewUrl = '';
    function set(f){
      if (!f) return;
      if (kind === 'image' && !f.type.startsWith('image/')){ tool.onFieldError('File harus berupa gambar.'); return; }
      if (kind === 'video' && !f.type.startsWith('video/')){ tool.onFieldError('File harus berupa video.'); return; }
      if (f.size > maxMb * 1048576){ tool.onFieldError(`Ukuran file maksimal ${maxMb} MB.`); return; }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      file = f; previewUrl = URL.createObjectURL(f);
      if (kind === 'image') th.innerHTML = `<img src="${previewUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:14px">`;
      else if (kind === 'video') th.innerHTML = `<video muted playsinline preload="metadata" src="${previewUrl}#t=0.1" style="width:100%;height:100%;object-fit:cover;border-radius:14px"></video>`;
      else th.innerHTML = ICON.file;
      nameEl.textContent = f.name || (kind === 'image' ? 'gambar' : kind === 'video' ? 'video' : 'file');
      sizeEl.textContent = App.fmtSize(f.size);
      picked.hidden = false; drop.hidden = true;
      tool.onFieldChange();
    }
    input.addEventListener('change', () => set(input.files[0]));
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => set(e.dataTransfer && e.dataTransfer.files[0]));
    swap.addEventListener('click', () => {
      file = null; if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = '';
      input.value = ''; picked.hidden = true; drop.hidden = false; tool.onFieldChange();
    });
    return {
      el: wrap, key: field.key, field,
      hasValue: () => !!file,
      preview: () => previewUrl,
      setBusy: v => { swap.disabled = v; },
      upload: async signal => App.uploadFile(file, signal)
    };
  }
  function buildSimpleField(field){
    const wrap = document.createElement('div'); wrap.className = 'fgroup';
    const uid = 'f_' + field.key;
    let inner = '';
    if (field.type === 'textarea'){
      inner = `<textarea class="ftextarea" id="${uid}" placeholder="${esc(field.placeholder || '')}">${esc(field.default || '')}</textarea>`;
    } else if (field.type === 'select'){
      inner = `<select class="fselect" id="${uid}">${(field.options || []).map(o =>
        `<option value="${esc(o.value)}"${o.value === field.default ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
    } else {
      const itype = field.type === 'number' ? 'number' : 'text';
      inner = `<input class="finput" id="${uid}" type="${itype}" placeholder="${esc(field.placeholder || '')}" value="${esc(field.default || '')}">`;
    }
    wrap.innerHTML = `<label for="${uid}">${esc(field.label)}</label>${inner}${field.hint ? `<p class="fhint">${esc(field.hint)}</p>` : ''}`;
    const input = wrap.querySelector('#' + uid);
    return { el: wrap, key: field.key, field, get: () => input.value.trim(), setBusy: v => { input.disabled = v; } };
  }

  /* ========== Render halaman alat (tools/toolsmenu/downloader pakai ini) ========== */
  const heroHtml = item =>
    `<div class="hero-dots"></div><span class="fl f1"></span><span class="fl f2"></span><span class="fl f3"></span>` +
    `<svg class="hero-ghost" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>` +
    `<div class="hero-badge">${svg(item.icon)}</div><h1>${esc(item.name)}</h1><p>${esc(item.desc)}</p>`;
  App.heroHtml = heroHtml;

  let state = { job:null, ctrls:[], curKey:null };

  function showSample(container, item){
    container.innerHTML = '';
    if (!item.sample) return;
    if (item.kind === 'text'){
      const sampleText = item.samplePrompt || 'Contoh hasil akan tampil di sini.';
      container.innerHTML = `<div class="shots"><div class="shot"><h2><span class="badge">Contoh</span>&nbsp; Gambar</h2><img alt="" src="${App.scene()}"></div><div class="shot"><h2>Hasil</h2><div class="textres" id="sText"></div></div></div>`;
      App.typer($('#sText'), sampleText, { loop:true });
      return;
    }
    if (item.kind === 'image-compare' || item.kind === 'video-compare'){
      const pair = (App.SAMPLES[item.sample] || App.SAMPLES.sharp)();
      const wrap = document.createElement('div');
      wrap.appendChild(App.makeSlider(pair[0], pair[1]));
      const cap = document.createElement('div'); cap.className = 'cmp-cap';
      cap.innerHTML = '<span><span class="badge">Contoh</span>&nbsp; Geser garis untuk lihat bedanya.</span>';
      wrap.appendChild(cap);
      container.appendChild(wrap);
    }
  }

  App.openToolPage = function openToolPage(el, item, navKey){
    // el: {view,hero,form,fields,status,out,steps,fine,goBtn}
    if (state.job){ state.job.abort(); state.job = null; }
    state.curKey = navKey;
    el.view.style.setProperty('--tool', item.color);
    el.view.scrollTop = 0;
    el.hero.innerHTML = heroHtml(item);
    el.status.hidden = true; el.status.textContent = '';
    el.fine.textContent = item.fine || '';
    el.steps.innerHTML = (item.steps || []).map((s, i) => `<div class="step"><i>${i + 1}</i><span>${s}</span></div>`).join('');

    el.fields.innerHTML = '';
    const built = [];
    (item.fields || []).forEach(f => {
      const node = (f.type === 'image' || f.type === 'video' || f.type === 'file')
        ? buildUploadField(f, { onFieldError: m => statusMsg(el, m), onFieldChange: () => checkReady() })
        : buildSimpleField(f);
      built.push(node);
      el.fields.appendChild(node.el);
    });

    const uploadFields = built.filter(b => b.field.type === 'image' || b.field.type === 'video' || b.field.type === 'file');
    function checkReady(){
      const ready = uploadFields.every(b => b.hasValue());
      el.goBtn.disabled = !ready;
    }
    checkReady();
    el.goBtn.textContent = item.goLabel || 'Proses';
    el.goBtn.disabled = uploadFields.length > 0;

    showSample(el.out, item);

    function setBusy(v){ built.forEach(b => b.setBusy(v)); el.goBtn.disabled = v || (uploadFields.length && !uploadFields.every(b => b.hasValue())); }

    async function submit(ev){
      if (ev) ev.preventDefault();
      if (el.goBtn.disabled) return;
      const ctrl = new AbortController(); state.job = ctrl;
      let why = '';
      setBusy(true); statusMsg(el, '');
      const timers = [];
      try {
        const vals = {}, previews = {};
        for (const b of built){
          if (b.field.type === 'image' || b.field.type === 'video' || b.field.type === 'file'){
            el.out.innerHTML = `<div class="prog" role="status"><div class="row1"><span class="shimmer">Mengunggah file…</span><small>1 dari 2</small></div><div class="bar"><i></i></div></div>`;
            previews[b.key] = b.preview();
            vals[b.key] = await b.upload(ctrl.signal);
          } else {
            vals[b.key] = b.get();
          }
        }
        if (state.curKey !== navKey) return;
        el.out.innerHTML = `<div class="prog" role="status"><div class="row1"><span class="shimmer">${esc(item.busyText || 'Memproses…')}</span><small>${uploadFields.length ? '2 dari 2' : ''}</small></div><div class="bar"><i></i></div></div>`;
        timers.push(setTimeout(() => { why = 'timeout'; ctrl.abort(); }, item.timeoutMs || 90000));
        const run = item.run || App.makeRun({ method: item.method || 'GET', base: item.base || App.BASE_IKYYXD, path: item.path, extra: item.extra });
        const apiRes = await run(vals, ctrl.signal);
        if (state.curKey !== navKey) return;
        const extract = item.extract || App.defaultExtract;
        const payload = extract(apiRes, item, vals, previews);
        App.renderResult(el.out, item.kind, payload);
      } catch(err){
        if (state.curKey !== navKey) return;
        el.out.innerHTML = '';
        if (err.name === 'AbortError') statusMsg(el, why === 'timeout' ? 'Terlalu lama menunggu. Coba lagi atau pakai file yang lebih kecil.' : 'Dibatalkan.');
        else statusMsg(el, err.message || 'Terjadi kesalahan.');
      } finally {
        timers.forEach(clearTimeout);
        if (state.job === ctrl) state.job = null;
        if (state.curKey === navKey) setBusy(false);
      }
    }
    el.form.onsubmit = submit;
  };
  function statusMsg(el, text){ el.status.hidden = !text; el.status.textContent = text || ''; }
  App.leaveToolPage = function leaveToolPage(){ if (state.job){ state.job.abort(); state.job = null; } state.curKey = null; };

  /* ========== Registry kategori (drawer) ========== */
  const SECTIONS = App.SECTIONS = [];
  App.registerSection = function registerSection(sec){ SECTIONS.push(sec); };

  /* ========== Proteksi ringan (bukan jaminan, sekadar penghalang) ========== */
  function initProtection(){
    const allow = t => t.closest && t.closest('input,textarea,[contenteditable="true"]');
    document.addEventListener('contextmenu', e => { if (!allow(e.target)) e.preventDefault(); });
    document.addEventListener('selectstart', e => { if (!allow(e.target) && !e.target.closest('.textres,.tpl,.kv')) e.preventDefault(); });
    document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
    document.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'F12') e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I','J','C','K'].includes(k.toUpperCase())) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && k.toUpperCase() === 'U') e.preventDefault();
    });
  }

  /* ========== Drawer & router ========== */
  const $drawer = {}; // diisi saat boot
  function buildDrawer(){
    const nav = $('#navList');
    nav.innerHTML = SECTIONS.map(sec => `
      <button class="nav" id="nav_${sec.key}" type="button" aria-expanded="false" aria-controls="list_${sec.key}">
        <svg class="ic" viewBox="0 0 24 24">${sec.icon}</svg>
        <span class="grow">${esc(sec.label)}</span>
        <svg class="ic chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="subwrap"><div id="list_${sec.key}">${sec.items.map(it =>
        `<a class="sub" href="#${sec.key}-${it.id}" data-key="${sec.key}-${it.id}"><i style="background:${it.color}">${svg(it.icon)}</i>${esc(it.name)}</a>`
      ).join('')}</div></div>
    `).join('');
    SECTIONS.forEach(sec => {
      const btn = $('#nav_' + sec.key);
      btn.addEventListener('click', () => btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'));
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) App.closeDrawer(); });
  }
  App.markNav = function markNav(key){
    App.$$('#navList .sub').forEach(a => a.classList.toggle('cur', a.dataset.key === key));
    SECTIONS.forEach(sec => {
      const btn = $('#nav_' + sec.key);
      const on = !!key && key.split('-')[0] === sec.key;
      btn.classList.toggle('cur', on);
      if (on) btn.setAttribute('aria-expanded', 'true');
    });
  };
  App.closeDrawer = () => document.body.classList.remove('drawer-open');
  App.openDrawer = () => { App.renderChatList && App.renderChatList(); document.body.classList.add('drawer-open'); };

  /* ========== Router ========== */
  function findItem(key){
    const i = key.indexOf('-'); if (i < 0) return null;
    const secKey = key.slice(0, i), id = key.slice(i + 1);
    const sec = SECTIONS.find(s => s.key === secKey);
    const item = sec && sec.items.find(x => x.id === id);
    return item ? { sec, item } : null;
  }
  App.route = function route(){
    const hash = location.hash.slice(1);
    if (hash === 'tools' || hash === 'upscale'){ history.replaceState(null, '', '#t-upscale'); return App.route(); }
    const found = findItem(hash);
    document.body.classList.remove('view-tool', 'view-about', 'view-movie');
    if (found) document.body.classList.add(found.sec.viewClass || 'view-tool');
    App.closeDrawer();
    if (found){
      App.markNav(hash);
      App.leaveChat && App.leaveChat();
      if ((found.sec.viewClass || 'view-tool') === 'view-tool') App.leaveToolPage();
      found.sec.open(found.item, hash);
      return;
    }
    App.markNav(null);
    App.leaveToolPage();
    App.openChatRoute && App.openChatRoute(hash);
  };
  window.addEventListener('hashchange', App.route);

  /* ========== Halaman alat bersama (satu DOM dipakai semua kategori alat) ========== */
  App.toolEl = null;
  App.makeOpener = function makeOpener(){
    return (item, navKey) => App.openToolPage(App.toolEl, item, navKey);
  };

  /* ========== Boot ========== */
  App.boot = function boot(){
    App.toolEl = {
      view: $('#toolView'), hero: $('#toolHero'), form: $('#toolForm'), fields: $('#toolFields'),
      status: $('#toolStatus'), out: $('#toolOut'), steps: $('#toolSteps'), fine: $('#toolFine'), goBtn: $('#goBtn')
    };
    buildDrawer();
    initProtection();
    $('#menuBtn').addEventListener('click', App.openDrawer);
    $('#scrim').addEventListener('click', App.closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') App.closeDrawer(); });
    App.route();
  };
})();
