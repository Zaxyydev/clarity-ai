/* CLARITY AI — chat.js
   Obrolan dengan Public AI. Rute: #c-xxxxxxx (tanpa prefix kategori, ditangani core.js
   lewat App.openChatRoute ketika hash bukan salah satu alat/kategori). */
(() => {
  'use strict';
  const App = window.App;
  const { $, esc, store, ICON, md, typer: typerFn, copyText } = App;
  const reduced = App.reduced;

  const PERSONA = 'Kamu adalah CLARITY AI, asisten AI buatan Sento. Sento adalah satu orang developer asal Bali, Indonesia, BUKAN perusahaan, BUKAN dari Swiss, dan bukan nama organisasi. Kalau ada yang bertanya siapa kamu, siapa yang membuatmu, atau siapa Sento, jawab singkat bahwa kamu CLARITY AI, dan pembuatmu adalah Sento, seorang developer individu asal Bali, Indonesia. Jangan pernah menyebut Sento sebagai perusahaan atau mengaitkannya dengan negara Swiss atau negara lain mana pun. Kalau kamu tidak yakin soal detail lain mengenai Sento, jangan mengarang, cukup jawab yang kamu tahu. Jawab dengan bahasa yang dipakai pengguna, jelas dan ringkas.';
  const chatUrl = q => `${App.BASE_IKYYXD}/ai/publicai?apikey=kyzz&q=${App.enc(PERSONA + '\n\nPesan pengguna: ' + q)}`;

  /* ===== Multi-AI: daftar model yang bisa dipilih, mirip pemilih model di Claude/ChatGPT. ===== */
  async function zyPost(path, body, signal){
    return App.apiFetch(`/api/zyvor?path=${App.enc(path)}`, {
      method:'POST', signal, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body)
    });
  }
  async function zyGet(path, params, signal){
    const qs = new URLSearchParams();
    for (const k in params) if (params[k] !== undefined && params[k] !== '') qs.set(k, params[k]);
    return App.apiFetch(`/api/zyvor?path=${App.enc(path + '?' + qs.toString())}`, { signal });
  }
  function checkStatus(res){
    if (res.data && res.data.status === false) throw new Error(pickText({ m:res.data.message, e:res.data.error }) || 'Server mengembalikan status gagal.');
  }

  const MODELS = [
    { id:'beta1', name:'Clarity Beta 1.0', desc:'Model utama CLARITY AI, dibuat Sento. Pilihan default.',
      run: async (q, id, signal) => {
        const res = await App.apiFetch(chatUrl(q), { signal });
        checkStatus(res);
        const t = pickText(res.data).trim();
        if (!t) throw new Error('Server membalas tanpa isi.');
        return t;
      } },
    { id:'open', name:'Clarity Open', desc:'Model alternatif, gaya jawaban lebih bebas dan langsung ke inti.',
      run: async (q, id, signal) => {
        const res = await zyPost('/api/ai/ainorestrictions', { question:q }, signal);
        checkStatus(res);
        const t = pickText(res.data).trim();
        if (!t) throw new Error('Server membalas tanpa isi.');
        return t;
      } },
    { id:'pro', name:'Clarity Pro', desc:'Mesin obrolan umum, cocok buat percakapan sehari-hari.',
      run: async (q, id, signal) => {
        const res = await zyPost('/api/ai/chatai', { teks:q, model:'chatgpt', session:id, stream:'false' }, signal);
        checkStatus(res);
        const t = pickText(res.data).trim();
        if (!t) throw new Error('Server membalas tanpa isi.');
        return t;
      } },
    { id:'edu', name:'Clarity Edu', desc:'Fokus soal sekolah: matematika, sains, dan tugas belajar.',
      run: async (q, id, signal) => {
        const res = await zyPost('/api/ai/edubrain', { text:q }, signal);
        checkStatus(res);
        const t = pickText(res.data).trim();
        if (!t) throw new Error('Server membalas tanpa isi.');
        return t;
      } },
    { id:'turbo', name:'Clarity Turbo', desc:'Model cepat alternatif buat obrolan santai.',
      run: async (q, id, signal) => {
        const res = await zyGet('/api/ai/freetochat', { teks:q, model:'grok-4.3', session:id }, signal);
        checkStatus(res);
        const t = pickText(res.data).trim();
        if (!t) throw new Error('Server membalas tanpa isi.');
        return t;
      } }
  ];
  const MODEL_BY_ID = {}; MODELS.forEach(m => MODEL_BY_ID[m.id] = m);
  const defaultModelId = () => store.get('clarity.lastModel', 'beta1');

  // Model tambahan diambil otomatis dari /api/v3/models (daftar model yang dipakai endpoint
  // chatai), biar nggak perlu nebak-nebak nama model yang tersedia di sana satu-satu.
  function prettyModelName(s){
    return String(s).replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim() || 'Lainnya';
  }
  let dynModelsLoaded = false;
  async function loadDynamicModels(){
    try {
      const res = await zyGet('/api/v3/models', {}, undefined);
      if (!res.data || res.data.status === false) return;
      let list = res.data;
      if (list && !Array.isArray(list)) list = list.models || list.result || list.data || list.list || [];
      if (!Array.isArray(list)) return;
      list.forEach(m => {
        const id = typeof m === 'string' ? m : (m && (m.id || m.model || m.name) || '');
        if (!id || MODEL_BY_ID['dyn:' + id]) return;
        const label = (typeof m === 'object' && (m.name || m.label)) || id;
        const entry = {
          id: 'dyn:' + id,
          name: 'Clarity ' + prettyModelName(label),
          desc: 'Model tambahan dari daftar model yang tersedia di server.',
          run: async (q, cid, signal) => {
            const r = await zyPost('/api/ai/chatai', { teks:q, model:id, session:cid, stream:'false' }, signal);
            checkStatus(r);
            const t = pickText(r.data).trim();
            if (!t) throw new Error('Server membalas tanpa isi.');
            return t;
          }
        };
        MODELS.push(entry); MODEL_BY_ID[entry.id] = entry;
      });
      dynModelsLoaded = true;
    } catch(e){ /* diam-diam: daftar model statis di atas tetap jalan kalau ini gagal */ }
  }

  let chats = store.get('clarity.chats', {});
  let chat = null;
  Object.values(chats).forEach(c => c.msgs.forEach(m => { if (m.pending){ m.pending = false; m.err = 'Koneksi terputus sebelum jawaban datang.'; } }));
  const save = () => store.set('clarity.chats', chats);
  const newId = () => 'c-' + Math.random().toString(36).slice(2, 9);

  const thread = $('#thread'), scroller = $('#scroll');
  const nearEnd = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 140;
  const toEnd = () => { scroller.scrollTop = scroller.scrollHeight; };

  function render(jump){
    const stick = jump || nearEnd();
    const last = chat.msgs.length - 1;
    thread.innerHTML = chat.msgs.map((m, i) => {
      if (m.role === 'user') return `<div class="msg user"><div class="bubble">${esc(m.text)}</div></div>`;
      if (m.pending) return `<div class="msg ai"><div class="think"><span class="dot"></span><span class="shimmer">Berpikir…</span></div></div>`;
      if (m.err) return `<div class="msg ai"><div class="err">${esc(m.err)}</div><div class="acts"><button type="button" data-act="retry">${ICON.retry}Coba lagi</button></div></div>`;
      return `<div class="msg ai" data-i="${i}"><div class="ai-body">${m.reveal ? '' : md(m.text)}</div><div class="acts"><button type="button" data-act="copy" aria-label="Salin jawaban">${ICON.copy}</button>${i === last ? `<button type="button" data-act="retry" aria-label="Buat ulang jawaban">${ICON.retry}</button>` : ''}</div></div>`;
    }).join('');
    const empty = chat.msgs.length === 0;
    const emptyEl = $('#empty');
    emptyEl.hidden = !empty;
    if (empty && !reduced){
      emptyEl.classList.remove('enter');
      void emptyEl.offsetWidth;
      emptyEl.classList.add('enter');
    }
    thread.hidden = empty;
    $('#starters').hidden = !empty;
    updateSend();
    App.renderChatList();
    const lm = chat.msgs[last];
    if (lm && lm.role === 'ai' && lm.reveal){
      const el = thread.querySelector(`.msg[data-i="${last}"] .ai-body`);
      lm.reveal = false;
      if (el) reveal(lm.text, el, chat.id);
    }
    if (stick) toEnd();
  }

  function reveal(text, el, id){
    if (reduced || text.length < 30){ el.innerHTML = md(text); return; }
    let n = 0; const step = Math.max(3, Math.ceil(text.length / 80));
    const tick = () => {
      if (!el.isConnected || !chat || chat.id !== id) return;
      n = Math.min(text.length, n + step);
      const stick = nearEnd();
      el.innerHTML = md(text.slice(0, n));
      if (stick) toEnd();
      if (n < text.length) requestAnimationFrame(tick);
    };
    tick();
  }

  function pickText(d){
    if (typeof d === 'string') return d;
    for (const v of [d.result, d.response, d.answer, d.message, d.text, d.output, d.reply, d.content, d.data]){
      if (typeof v === 'string' && v.trim()) return v;
      if (v && typeof v === 'object'){ const r = pickText(v); if (r) return r; }
    }
    return '';
  }

  async function run(c){
    const m = c.msgs[c.msgs.length - 1];
    const q = [...c.msgs].reverse().find(x => x.role === 'user').text;
    const model = MODEL_BY_ID[c.model] || MODEL_BY_ID[defaultModelId()] || MODELS[0];
    const ctrl = new AbortController();
    let why = '';
    c.busy = true; c.stop = () => { why = 'stop'; ctrl.abort(); };
    const timer = setTimeout(() => { why = 'timeout'; ctrl.abort(); }, 75000);
    updateSend();
    try {
      const t = await model.run(q, c.id, ctrl.signal);
      m.text = t; m.reveal = true;
    } catch(e){
      if (e.name === 'AbortError') m.err = why === 'stop' ? 'Dihentikan.' : 'Terlalu lama menunggu jawaban. Coba lagi.';
      else if (e instanceof TypeError) m.err = 'Tidak bisa terhubung ke API. Cek koneksi internet. Kalau koneksi aman, API mungkin memblokir akses dari browser (CORS).';
      else m.err = e.message;
    } finally {
      clearTimeout(timer);
      m.pending = false; c.busy = false; c.stop = null;
      c.ts = Date.now(); save();
      if (chat && chat.id === c.id) render(); else App.renderChatList();
    }
  }

  function ask(text){
    text = text.trim();
    if (!text || !chat || chat.busy) return;
    if (!chats[chat.id]) chats[chat.id] = chat;
    if (!chat.title) chat.title = text.slice(0, 48);
    chat.msgs.push({ role:'user', text });
    chat.msgs.push({ role:'ai', pending:true, text:'' });
    chat.ts = Date.now(); save();
    render(true);
    run(chat);
  }
  function retry(){
    if (!chat || chat.busy) return;
    const last = chat.msgs[chat.msgs.length - 1];
    if (!last || last.role !== 'ai') return;
    chat.msgs[chat.msgs.length - 1] = { role:'ai', pending:true, text:'' };
    render(true);
    run(chat);
  }

  const input = $('#input'), sendBtn = $('#sendBtn');
  function autosize(){ input.style.height = '26px'; input.style.height = Math.min(input.scrollHeight, 160) + 'px'; updateSend(); }
  function updateSend(){
    if (chat && chat.busy){ sendBtn.disabled = false; sendBtn.innerHTML = ICON.stop; sendBtn.setAttribute('aria-label', 'Hentikan'); sendBtn.dataset.mode = 'stop'; }
    else { sendBtn.innerHTML = ICON.up; sendBtn.setAttribute('aria-label', 'Kirim'); sendBtn.dataset.mode = 'send'; sendBtn.disabled = !input.value.trim(); }
  }
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !matchMedia('(pointer: coarse)').matches){ e.preventDefault(); $('#form').requestSubmit(); }
  });
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    if (sendBtn.dataset.mode === 'stop'){ chat && chat.stop && chat.stop(); return; }
    const t = input.value;
    if (!t.trim()) return;
    input.value = ''; autosize();
    ask(t);
  });
  $('#starters').addEventListener('click', e => { const b = e.target.closest('.starter'); if (b) ask(b.dataset.q); });
  thread.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'retry') retry();
    else if (act === 'copy'){ const m = chat.msgs[+b.closest('.msg').dataset.i]; if (m) copyText(m.text, b, ICON.check); }
    else if (act === 'copycode'){ copyText(b.closest('.code').querySelector('code').textContent, b, 'Tersalin'); }
  });

  /* ===== Dropdown pemilih model (mirip pemilih model di Claude) ===== */
  const modelBtn = $('#modelBtn'), modelMenu = $('#modelMenu'), modelBtnLabel = $('#modelBtnLabel');
  const currentModelId = () => (chat && chat.model) || defaultModelId();
  function updateModelBtn(){
    const m = MODEL_BY_ID[currentModelId()] || MODELS[0];
    modelBtnLabel.textContent = m.name;
  }
  function renderModelMenu(){
    const cur = currentModelId();
    modelMenu.innerHTML = MODELS.map(m =>
      `<button type="button" class="mi" role="option" aria-selected="${m.id === cur}" data-model="${m.id}">` +
      `<span class="mi-check">${ICON.check}</span><span><b>${esc(m.name)}</b><small>${esc(m.desc)}</small></span>` +
      `</button>`
    ).join('');
  }
  function closeModelMenu(){ modelMenu.hidden = true; modelBtn.setAttribute('aria-expanded', 'false'); }
  function openModelMenu(){ renderModelMenu(); modelMenu.hidden = false; modelBtn.setAttribute('aria-expanded', 'true'); }
  modelBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (modelMenu.hidden) openModelMenu(); else closeModelMenu();
  });
  modelMenu.addEventListener('click', e => {
    const b = e.target.closest('[data-model]'); if (!b) return;
    const id = b.dataset.model;
    if (chat){ chat.model = id; if (chats[chat.id]) chats[chat.id].model = id; save(); }
    store.set('clarity.lastModel', id);
    updateModelBtn();
    closeModelMenu();
  });
  document.addEventListener('click', e => { if (!modelMenu.hidden && !e.target.closest('.brandwrap')) closeModelMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModelMenu(); });

  App.renderChatList = function renderChatList(){
    const rows = Object.values(chats).sort((a, b) => b.ts - a.ts);
    $('#list').innerHTML = rows.length ? rows.map(c =>
      `<div class="row${chat && c.id === chat.id ? ' cur' : ''}"><a href="#${c.id}">${esc(c.title || 'Obrolan baru')}</a><button class="del" type="button" data-del="${c.id}" aria-label="Hapus obrolan">${ICON.trash}</button></div>`
    ).join('') : '<div class="none">Belum ada obrolan.</div>';
  };
  $('#list').addEventListener('click', e => {
    const d = e.target.closest('[data-del]');
    if (d){
      const id = d.dataset.del;
      if (chats[id] && chats[id].stop) chats[id].stop();
      delete chats[id]; save();
      if (chat && chat.id === id) newChat(); else App.renderChatList();
      return;
    }
    if (e.target.closest('a')) App.closeDrawer();
  });

  function newChat(){ location.hash = newId(); setTimeout(() => { if (!document.body.classList.contains('view-tool')) input.focus(); }, 60); }
  $('#newTop').addEventListener('click', newChat);
  $('#newDrawer').addEventListener('click', newChat);

  App.leaveChat = function leaveChat(){ /* chat state tetap tersimpan, nggak perlu dibersihkan */ };
  App.openChatRoute = function openChatRoute(id){
    if (!/^c-[a-z0-9]+$/.test(id)){
      history.replaceState(null, '', '#' + newId());
      return App.route();
    }
    chat = chats[id] || { id, title:'', msgs:[], ts:Date.now(), model: defaultModelId() };
    if (!chat.model) chat.model = defaultModelId();
    render(true);
    updateModelBtn();
    closeModelMenu();
    input.value = '';
    autosize();
  };

  loadDynamicModels();
})();
