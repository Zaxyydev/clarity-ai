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
    $('#empty').hidden = !empty;
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
    const ctrl = new AbortController();
    let why = '';
    c.busy = true; c.stop = () => { why = 'stop'; ctrl.abort(); };
    const timer = setTimeout(() => { why = 'timeout'; ctrl.abort(); }, 75000);
    updateSend();
    try {
      const res = await fetch(chatUrl(q), { signal: ctrl.signal });
      const raw = await res.text();
      let data = null; try { data = JSON.parse(raw); } catch(e){}
      if (!res.ok) throw new Error(res.status >= 500
        ? `Server sedang bermasalah (${res.status}). Coba lagi sebentar.`
        : `Permintaan ditolak server (${res.status}).`);
      if (!data) throw new Error('Balasan server tidak bisa dibaca.');
      if (data.status === false) throw new Error(pickText({ m:data.message, e:data.error }) || 'Server mengembalikan status gagal.');
      const t = pickText(data).trim();
      if (!t) throw new Error('Server membalas tanpa isi.');
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
    chat = chats[id] || { id, title:'', msgs:[], ts:Date.now() };
    render(true);
    input.value = '';
    autosize();
  };
})();
