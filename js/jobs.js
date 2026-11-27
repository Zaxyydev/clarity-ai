/* CLARITY AI — jobs.js
   Proses (job) berjalan di latar, bebas dari halaman yang sedang dibuka. Pindah alat, pindah menu, atau pindah tab
   browser: proses tetap jalan. Semua proses dan unduhan masuk Riwayat (disimpan di perangkat).
   Batasan: kalau tab/aplikasi ditutup, permintaan ke server ikut putus. Proses yang terputus ditandai "Terputus"
   dan bisa dicoba lagi tanpa unggah ulang (link file sementara disimpan). */
(() => {
  'use strict';
  const App = window.App, { $, esc, escA, store, ICON } = App;
  const KEY = 'clarity.jobs', MAXJ = 40;
  const isUp = f => f.type === 'image' || f.type === 'video' || f.type === 'file';
  const lab = l => String(l || 'file').replace(/\s*\(.*?\)\s*$/, '').replace(/^pilih\s+/i, '').toLowerCase();
  const newId = () => 'j' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  let jobs = store.get(KEY, []);
  const live = {}, subs = new Set(), urls = {};
  let pendingShow = null;
  jobs.forEach(j => { if (j.status === 'running'){ j.status = 'lost'; j.err = 'Terputus karena halaman ditutup atau dimuat ulang.'; } });

  /* ---------- IndexedDB (hasil berupa file biner) ---------- */
  const idb = () => new Promise((ok, no) => { try { const r = indexedDB.open('clarity', 1); r.onupgradeneeded = () => r.result.createObjectStore('blobs'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } });
  const idbOp = async (mode, fn) => { const d = await idb(); return new Promise((ok, no) => { const t = d.transaction('blobs', mode); const q = fn(t.objectStore('blobs')); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); }); };
  async function persist(id, payload, map){
    let n = 0; const keys = [];
    const conv = async v => {
      if (typeof v === 'string'){
        if (map[v]) return map[v];
        if (v.startsWith('blob:')){
          try { const b = await (await fetch(v)).blob(); const k = id + ':' + (n++); await idbOp('readwrite', s => s.put(b, k)); keys.push(k); return 'idb:' + k; } catch (e) { return ''; }
        }
        return v;
      }
      if (Array.isArray(v)){ const o = []; for (const x of v) o.push(await conv(x)); return o; }
      if (v && typeof v === 'object'){ const o = {}; for (const k in v) o[k] = await conv(v[k]); return o; }
      return v;
    };
    return { res: await conv(payload), keys };
  }
  async function resolve(v){
    if (typeof v === 'string' && v.startsWith('idb:')){
      const k = v.slice(4); if (urls[k]) return urls[k];
      try { const b = await idbOp('readonly', s => s.get(k)); if (b) return (urls[k] = URL.createObjectURL(b)); } catch (e) {}
      return '';
    }
    if (Array.isArray(v)){ const o = []; for (const x of v) o.push(await resolve(x)); return o; }
    if (v && typeof v === 'object'){ const o = {}; for (const k in v) o[k] = await resolve(v[k]); return o; }
    return v;
  }

  const save = () => {
    while (jobs.length > MAXJ){
      const d = jobs.pop();
      (d.keys || []).forEach(k => idbOp('readwrite', s => s.delete(k)).catch(() => {}));
    }
    store.set(KEY, jobs);
  };
  const get = id => jobs.find(j => j.id === id);
  const running = () => jobs.filter(j => j.status === 'running');
  function emit(){
    const n = running().length;
    document.body.classList.toggle('has-running', n > 0);
    const c = $('#histCnt'); if (c){ c.textContent = n ? n + ' jalan' : String(jobs.length); c.classList.toggle('on', n > 0); }
    subs.forEach(f => f());
  }

  /* ---------- Rencana tahap ---------- */
  function plan(upFields){
    const st = upFields.map(f => ({ label: 'Mengunggah ' + lab(f.label), detail: 'File dikirim ke penyimpanan sementara supaya server bisa mengambilnya.' }));
    const waitIdx = st.length;
    st.push({ label: 'Server memproses', detail: 'Permintaan terkirim. Server sedang menjalankan mesin untuk alat ini, biasanya beberapa detik sampai setengah menit.' });
    st.push({ label: 'Menerima hasil', detail: 'Server sudah menjawab, hasilnya sedang diambil.' });
    st.push({ label: 'Menyiapkan tampilan', detail: 'Menyusun hasil supaya bisa dilihat dan diunduh.' });
    return { stages: st, waitIdx };
  }

  /* ---------- Tampilan di halaman alat ---------- */
  function unmountAll(){
    Object.values(live).forEach(l => { if (l.mount){ if (l.prog) l.prog.stop(); l.prog = null; l.mount = null; } });
  }
  const canRetry = job => { const f = App.findItem(job.navKey); return !!(f && (f.item.fields || []).every(x => !isUp(x) || job.vals[x.key])); };
  function showEnd(job, lv){
    const box = lv.mount && lv.mount.box; if (!box) return;
    if (job.status === 'done'){
      if (lv.payload) return App.renderResult(box, job.kind, lv.payload);
      resolve(job.res).then(p => {
        if (!lv.mount || lv.mount.box !== box) return;
        if (p) App.renderResult(box, job.kind, p); else box.innerHTML = '<div class="status">Hasil tidak tersimpan di perangkat ini. Jalankan ulang alatnya.</div>';
      });
      return;
    }
    box.innerHTML = `<div class="status">${esc(job.err || 'Gagal.')}</div>` + (job.status !== 'cancelled' && canRetry(job) ? `<div class="acts"><button class="mini" type="button" data-retry>${ICON.retry}Coba lagi</button></div>` : '');
    const rb = box.querySelector('[data-retry]');
    if (rb) rb.onclick = () => { retry(job.id); mount(job, box, lv.mount.onEnd); };
  }
  function mount(job, box, onEnd){
    const lv = live[job.id] || (live[job.id] = {});
    unmountAll(); lv.mount = { box, onEnd };
    if (job.status !== 'running') return showEnd(job, lv);
    lv.prog = App.progress(box, job.stages, job.limit, job.t0);
    lv.prog.set(job.stage);
    const card = box.querySelector('.prog2');
    if (card){ card.insertAdjacentHTML('beforeend', '<div class="pg-foot"><small>Boleh pindah halaman atau tab, proses tetap jalan. Lihat di Riwayat.</small><button class="mini ghost" type="button" data-cancel>Batalkan</button></div>'); card.querySelector('[data-cancel]').onclick = () => cancel(job.id); }
  }

  /* ---------- Eksekusi ---------- */
  function setStage(job, i){ job.stage = i; const lv = live[job.id]; if (lv && lv.prog) lv.prog.set(i); emit(); }
  function toast(msg, onTap){
    let t = $('#toast');
    if (!t){ t = document.createElement('button'); t.id = 'toast'; t.type = 'button'; document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; t.onclick = () => { t.hidden = true; onTap && onTap(); };
    clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 7000);
  }
  const oldTitle = document.title;
  document.addEventListener('visibilitychange', () => { if (!document.hidden) document.title = oldTitle; });
  function settle(job, lv){
    if (lv.prog){ lv.prog.stop(); lv.prog = null; }
    if (lv.mount){ showEnd(job, lv); if (lv.mount && lv.mount.onEnd) lv.mount.onEnd(); return; }
    const ok = job.status === 'done';
    toast((ok ? '✓ ' : '⚠ ') + job.name + (ok ? ' selesai. Ketuk untuk lihat.' : ' gagal. Ketuk untuk detail.'), () => view(job.id));
    if (document.hidden) document.title = (ok ? '✓ ' : '⚠ ') + job.name + ' — CLARITY AI';
    try { navigator.vibrate && navigator.vibrate(60); } catch (e) {}
  }
  async function exec(job, lv){
    const item = lv.item, ctrl = lv.ctrl = new AbortController();
    let timer; lv.why = '';
    try {
      const previews = {}; let ui = 0;
      for (const b of (lv.built || [])){
        if (isUp(b.field)){ setStage(job, ui++); previews[b.key] = b.preview(); job.vals[b.key] = await b.upload(ctrl.signal); }
      }
      (item.fields || []).forEach(f => { if (isUp(f) && !previews[f.key]) previews[f.key] = job.vals[f.key] || ''; });
      setStage(job, job.waitIdx);
      timer = setTimeout(() => { lv.why = 'timeout'; ctrl.abort(); }, item.timeoutMs || 90000);
      App.stageHooks.set(ctrl.signal, s => { if (s === 'receive') setStage(job, job.waitIdx + 1); });
      const run = item.run || App.makeRun({ method: item.method || 'GET', base: item.base || App.BASE_IKYYXD, path: item.path, extra: item.extra, proxy: item.proxy });
      const apiRes = await run(job.vals, ctrl.signal);
      setStage(job, job.waitIdx + 2);
      lv.payload = (item.extract || App.defaultExtract)(apiRes, item, job.vals, previews);
      job.status = 'done'; job.t1 = Date.now(); job.err = '';
      emit(); settle(job, lv);
      const map = {}; for (const k in previews) if (previews[k] && job.vals[k]) map[previews[k]] = job.vals[k];
      const p = await persist(job.id, lv.payload, map); job.res = p.res; job.keys = p.keys;
    } catch (err) {
      job.t1 = Date.now();
      if (err.name === 'AbortError'){
        job.status = lv.why === 'cancel' ? 'cancelled' : 'error';
        job.err = lv.why === 'cancel' ? 'Dibatalkan.' : 'Terlalu lama menunggu. Coba lagi atau pakai file yang lebih kecil.';
      } else { job.status = 'error'; job.err = err.message || 'Terjadi kesalahan.'; }
      emit(); settle(job, lv);
    } finally { clearTimeout(timer); save(); emit(); }
  }
  function start({ navKey, item, built }){
    const vals = {}; built.forEach(b => { if (!isUp(b.field)) vals[b.key] = b.get(); });
    const pl = plan(built.filter(b => isUp(b.field)).map(b => b.field));
    const job = { id: newId(), type: 'tool', navKey, name: item.name, color: item.color, icon: item.icon, kind: item.kind, status: 'running',
      t0: Date.now(), stage: 0, stages: pl.stages, waitIdx: pl.waitIdx, limit: item.timeoutMs || 0, vals, res: null, keys: [], err: '' };
    live[job.id] = { item, built };
    jobs.unshift(job); save(); emit(); exec(job, live[job.id]);
    return job;
  }
  function retry(id){
    const job = get(id), f = job && App.findItem(job.navKey); if (!f) return;
    const pl = plan([]);
    Object.assign(job, { status: 'running', t0: Date.now(), t1: 0, stage: 0, stages: pl.stages, waitIdx: pl.waitIdx, err: '', res: null });
    const old = live[id]; live[id] = { item: f.item, mount: old && old.mount };
    emit(); exec(job, live[id]);
  }
  function cancel(id){ const lv = live[id]; if (lv && lv.ctrl){ lv.why = 'cancel'; lv.ctrl.abort(); } }

  /* ---------- Unduhan ---------- */
  function trackDownload(name, url){
    const job = { id: newId(), type: 'download', name, url: /^https?:/.test(url) ? url : '', color: '#2f6fe0', status: 'running', pct: -1, t0: Date.now() };
    jobs.unshift(job); save(); emit();
    let last = -2;
    return {
      set: (p, bytes) => { job.pct = p; job.bytes = bytes || 0; if (p !== last){ last = p; emit(); } },
      done: () => { job.status = 'done'; job.t1 = Date.now(); job.pct = 100; save(); emit(); },
      fail: msg => { job.status = 'error'; job.err = msg; job.t1 = Date.now(); save(); emit(); }
    };
  }

  /* ---------- Riwayat ---------- */
  let hs = null, hsTimer = null;
  const ago = t => { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? 'baru saja' : s < 3600 ? Math.floor(s / 60) + ' mnt lalu' : s < 86400 ? Math.floor(s / 3600) + ' jam lalu' : new Date(t).toLocaleDateString('id-ID'); };
  const dur = t0 => { const s = Math.round((Date.now() - t0) / 1000); return s < 60 ? s + ' dtk' : Math.floor(s / 60) + ' mnt ' + (s % 60) + ' dtk'; };
  const thumb = j => { const r = j.res || {}; const c = r.after || r.image || (r.shots && r.shots.length && r.shots[r.shots.length - 1].src) || ''; return /^https?:/.test(c) && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(c) ? c : ''; };
  function rowHtml(j){
    const dl = j.type === 'download';
    const th = thumb(j);
    const ic = th ? `<img src="${escA(th)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : App.svg(dl ? '<path d="M12 4v11M7 10.5L12 15.5l5-5M5 19.5h14"/>' : (j.icon || ''));
    let st = '', btn = '';
    if (j.status === 'running'){
      const stage = dl ? (j.pct >= 0 ? 'Mengunduh ' + j.pct + '%' : 'Mengunduh' + (j.bytes ? ' ' + App.fmtSize(j.bytes) : '…')) : ((j.stages[j.stage] || {}).label || 'Memproses') + '…';
      st = `<span class="spinner sm"></span><span>${esc(stage)} · <em data-t0="${j.t0}">${dur(j.t0)}</em></span>`;
      if (dl && j.pct >= 0) st += `<span class="hbar"><i style="width:${j.pct}%"></i></span>`;
      if (!dl) btn = `<button class="mini ghost" data-act="cancel">Batalkan</button>`;
    } else {
      const when = ago(j.t1 || j.t0);
      st = j.status === 'done' ? `<span class="ok">✓</span><span>Selesai · ${when}</span>`
        : `<span class="bad">!</span><span>${j.status === 'lost' ? 'Terputus' : j.status === 'cancelled' ? 'Dibatalkan' : 'Gagal'} · ${when}</span>`;
      if (dl){ if (j.url) btn += `<button class="mini" data-act="redl">${ICON.download}${j.status === 'done' ? 'Unduh lagi' : 'Coba lagi'}</button>`; }
      else if (j.status === 'done') btn += `<button class="mini" data-act="view">Lihat</button>`;
      else btn += canRetry(j) ? `<button class="mini" data-act="retry">${ICON.retry}Coba lagi</button>` : `<button class="mini" data-act="view">Buka alat</button>`;
      btn += `<button class="mini ghost" data-act="del" aria-label="Hapus dari riwayat">${ICON.trash}</button>`;
    }
    const extra = j.status === 'error' || j.status === 'lost' ? `<small class="herr">${esc(j.err || '')}</small>` : '';
    return `<div class="hrow" data-id="${j.id}"><span class="hi" style="background:${escA(j.color || '#6b5ce7')}">${ic}</span><div class="hm"><b>${esc(j.name)}</b><div class="hst">${st}</div>${extra}<div class="hb">${btn}</div></div></div>`;
  }
  function renderHist(){
    if (!hs || hs.hidden) return;
    const body = hs.querySelector('.hs-list'); if (!body) return;
    body.innerHTML = jobs.length ? jobs.map(rowHtml).join('') : '<p class="hs-empty">Belum ada riwayat. Proses dan unduhan yang kamu jalankan akan muncul di sini.</p>';
    const clr = hs.querySelector('[data-act="clear"]'); if (clr) clr.hidden = !jobs.some(j => j.status !== 'running');
  }
  function closeHist(){ if (hs){ hs.hidden = true; document.body.classList.remove('help-open'); clearInterval(hsTimer); subs.delete(renderHist); } }
  function openHist(){
    if (!hs){
      hs = document.createElement('div'); hs.id = 'helpSheet'; hs.className = 'hist'; hs.hidden = true; document.body.appendChild(hs);
      hs.innerHTML = `<div class="hs-scrim" data-close></div><div class="hs-card" role="dialog" aria-modal="true" aria-label="Riwayat"><div class="hs-grab"></div>`
        + `<div class="hs-head"><span class="hs-ic" style="background:#6b5ce7">${App.svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}</span><div><small>Riwayat & proses</small><h2>Aktivitasmu</h2></div><button class="hs-x" type="button" data-close aria-label="Tutup">${App.svg('<path d="M6 6l12 12M18 6L6 18"/>')}</button></div>`
        + `<p class="hs-note">Proses tetap jalan saat kamu pindah halaman atau pindah tab. Kalau tab atau aplikasi ditutup, proses yang belum selesai terputus, tapi bisa dicoba lagi tanpa unggah ulang. Riwayat tersimpan di perangkat ini (maks ${MAXJ}).</p>`
        + `<div class="hs-list"></div><button class="mini ghost hs-clear" type="button" data-act="clear">Hapus riwayat yang sudah selesai</button></div>`;
      hs.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) return closeHist();
        const b = e.target.closest('[data-act]'); if (!b) return;
        const act = b.dataset.act, row = b.closest('.hrow'), id = row && row.dataset.id, j = id && get(id);
        if (act === 'clear'){ jobs.filter(x => x.status !== 'running').forEach(x => (x.keys || []).forEach(k => idbOp('readwrite', s => s.delete(k)).catch(() => {}))); jobs = jobs.filter(x => x.status === 'running'); save(); emit(); return; }
        if (!j) return;
        if (act === 'cancel') cancel(id);
        else if (act === 'view') view(id);
        else if (act === 'retry'){ retry(id); view(id); }
        else if (act === 'redl'){ closeHist(); App.saveFile(j.url, 'clarity-unduhan'); }
        else if (act === 'del'){ (j.keys || []).forEach(k => idbOp('readwrite', s => s.delete(k)).catch(() => {})); jobs = jobs.filter(x => x.id !== id); save(); emit(); }
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && hs && !hs.hidden) closeHist(); });
    }
    hs.hidden = false; document.body.classList.add('help-open');
    subs.add(renderHist); renderHist();
    hsTimer = setInterval(() => { hs.querySelectorAll('[data-t0]').forEach(e => { e.textContent = dur(+e.dataset.t0); }); }, 1000);
  }
  function view(id){
    const j = get(id); if (!j || j.type === 'download') return;
    pendingShow = id; closeHist();
    if (location.hash.slice(1) === j.navKey) App.route(); else location.hash = j.navKey;
  }

  App.jobs = {
    start, mount, unmountAll, cancel, retry, trackDownload, openHist, view,
    runningFor: navKey => jobs.find(j => j.type === 'tool' && j.navKey === navKey && j.status === 'running') || null,
    takeShow: navKey => { const j = pendingShow && get(pendingShow); pendingShow = null; return j && j.navKey === navKey ? j : null; }
  };
  App.stageHooks = new WeakMap();

  const hn = $('#histNav'); if (hn) hn.addEventListener('click', () => { App.closeDrawer(); openHist(); });
  window.addEventListener('beforeunload', e => { if (running().length){ e.preventDefault(); e.returnValue = ''; } });
  emit();
})();
