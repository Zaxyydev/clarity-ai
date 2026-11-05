/* CLARITY AI — about.js
   Kategori "About website" (prefix 'a'). Halaman statis, bukan form alat, jadi punya
   penampil sendiri (#aboutView) dan tidak lewat App.openToolPage. */
(() => {
  'use strict';
  const App = window.App;
  const { $, esc, ICON, copyText } = App;

  const LINKS = [
    { name:'Channel Update Informasi', url:'https://whatsapp.com/channel/0029Vb8QkZK4o7qPqvW1s90q', color:'#1fa855', ic:'chat' },
    { name:'Update 2',                 url:'https://whatsapp.com/channel/0029Vb8G6wL6BIEcviaCxf3N', color:'#1fa855', ic:'chat' },
    { name:'Update 3',                 url:'https://t.me/aetherupdate',                             color:'#229ed9', ic:'plane' }
  ];
  const EMAIL = 'xyricnich@gmail.com';
  const SUPPORT_URL = 'https://sociabuzz.com/kyoon7/shop';
  const BUG_TEMPLATE = [
    'Halaman / alat yang dipakai:',
    '',
    'Yang gue lakukan sebelum bug muncul (urut dari awal):',
    '1.',
    '2.',
    '3.',
    '',
    'Yang terjadi:',
    '',
    'Yang seharusnya terjadi:',
    '',
    'Penyebab menurut gue:',
    '',
    'HP / browser:',
    'Jam kejadian:',
    '',
    '(Lampirkan screenshot)'
  ].join('\n');

  const ITEMS = [
    { id:'owner', name:'Owner', color:'#6b5ce7', desc:'Orang di balik CLARITY AI.',
      icon:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>' },
    { id:'tujuan', name:'Tujuan Website', color:'#0b9c84', desc:'Kenapa CLARITY AI dibuat, dan di mana cari kabar terbarunya.',
      icon:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>' },
    { id:'bug', name:'Bug Report', color:'#d6561f', desc:'Nemu error? Lapor dengan cara yang bikin cepat dibereskan.',
      icon:'<rect x="8" y="8" width="8" height="11" rx="4"/><path d="M9 8a3 3 0 0 1 6 0M4 12h4M16 12h4M5 19l3-2M19 19l-3-2M5 6l3 2M19 6l-3 2M12 12v7"/>' },
    { id:'support', name:'Support Developer', color:'#e0382f', desc:'Mau bantu CLARITY AI tetap jalan dan berkembang?',
      icon:'<path d="M12 20s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.7 11c-2.2 4.4-9.7 9-9.7 9z"/>' }
  ];

  const linkHtml = (name, url, color, ic, small) =>
    `<a class="link" href="${url}" target="_blank" rel="noopener noreferrer"><i style="background:${color}">${ICON[ic]}</i><span><b>${esc(name)}</b><small>${esc(small)}</small></span>${ICON.arrow}</a>`;

  const BODY = {
    owner: () => `<div class="card profile"><div class="avatar"><span class="ini">S</span><img src="sento.jpg" alt="Foto Sento"></div><h2>Sento</h2><span class="badge">Developer asal Bali</span><p>Halo, gue Sento, satu orang developer asal Bali, Indonesia (bukan perusahaan, bukan dari Swiss). Gue bikin CLARITY AI supaya ngobrol dengan AI dan mengolah gambar atau video bisa dilakukan di satu tempat, langsung dari HP tanpa instal aplikasi.</p><div class="chips2"><span>Developer individu</span><span>Bali, Indonesia</span><span>Pembuat CLARITY AI</span></div></div>`,

    tujuan: () => `<div class="card txt"><h2>Satu tempat untuk AI dan olah gambar</h2><p>CLARITY AI dibuat supaya siapa saja bisa ngobrol dengan asisten AI dan mengolah gambar, video, atau file lain langsung dari HP, tanpa instal aplikasi dan tanpa ribet.</p><p>Isinya obrolan AI, puluhan alat olah gambar/video, Tools serbaguna, dan Download dari berbagai platform.</p></div><h3 class="sec">Channel Update Informasi</h3><div class="links">${LINKS.map(l => linkHtml(l.name, l.url, l.color, l.ic, l.url.replace(/^https?:\/\//, ''))).join('')}</div><p class="fine">Ikuti channel untuk kabar fitur baru dan perbaikan.</p>`,

    bug: () => `<div class="card txt"><h2>Cara lapor bug</h2><p>Laporan yang lengkap bikin penyebab bug lebih cepat ketemu. Sertakan semua ini:</p><ul class="checks">`
      + [['Screenshot', 'Tangkap seluruh layar, termasuk pesan error berwarna merah.'],
         ['Awal mula', 'Ceritakan apa yang lu lakukan sebelum bug muncul, urut dari awal: halaman mana, alat apa, dan file apa yang dipakai.'],
         ['Penyebab', 'Tulis kenapa menurut lu itu bisa terjadi, atau kondisi yang memicunya, misalnya ukuran file besar, koneksi putus, atau setelah menekan tombol tertentu.'],
         ['Perangkat', 'Jenis HP, browser, dan jam kejadian.']
        ].map(x => `<li>${ICON.check}<span><b>${x[0]}</b><small>${x[1]}</small></span></li>`).join('')
      + `</ul></div><h3 class="sec">Template laporan</h3><div class="card" style="margin-top:0"><pre class="tpl">${esc(BUG_TEMPLATE)}</pre><div class="cmp-cap" style="margin-top:12px"><span>Salin, isi, lalu kirim bersama screenshot.</span><button class="mini" id="tplCopy" type="button">${ICON.copy}Salin template</button></div></div>`
      + `<h3 class="sec">Contact Sento</h3><div class="links">${linkHtml('Telegram', 'https://t.me/Senlith', '#229ed9', 'plane', 't.me/Senlith')}<div class="link-row"><a class="link" href="mailto:${EMAIL}"><i style="background:#d6561f">${ICON.mail}</i><span><b>Gmail</b><small>${EMAIL}</small></span></a><button class="mini ghost" id="mailCopy" type="button" aria-label="Salin alamat Gmail">${ICON.copy}</button></div></div>`,

    support: () => `<div class="card support"><span class="heart">${ICON.heart}</span><h2>Dukung Sento</h2><p>CLARITY AI gratis dipakai siapa saja. Kalau alat ini kepakai dan lu mau bantu biaya server atau pengembangan fitur baru, mampir ke halaman dukungan di bawah.</p><a class="mini" href="${SUPPORT_URL}" target="_blank" rel="noopener noreferrer">${ICON.heart}Support Developer</a></div><div class="links" style="margin-top:16px">${linkHtml('Sociabuzz', SUPPORT_URL, '#e0382f', 'heart', SUPPORT_URL.replace(/^https?:\/\//, ''))}</div>`
  };

  const aboutView = $('#aboutView'), aboutHero = $('#aboutHero'), aboutBody = $('#aboutBody');

  function open(item){
    aboutView.style.setProperty('--tool', item.color);
    aboutView.scrollTop = 0;
    aboutHero.innerHTML = App.heroHtml(item);
    aboutBody.innerHTML = BODY[item.id]();
    const im = aboutView.querySelector('.avatar img'); if (im) im.addEventListener('error', () => im.remove());
    const tc = $('#tplCopy'); if (tc) tc.onclick = e => copyText(BUG_TEMPLATE, e.currentTarget, ICON.check + 'Tersalin');
    const mc = $('#mailCopy'); if (mc) mc.onclick = e => copyText(EMAIL, e.currentTarget, ICON.check);
  }

  App.registerSection({
    key:'a', label:'About website', viewClass:'view-about',
    icon:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
    items: ITEMS,
    open
  });
})();
