/* CLARITY AI — ikyyxd.js
   Fitur tambahan dari api.ikyyxd.my.id. Item disisipkan ke kategori yang sudah ada
   (Download 'd', Alat gambar 't', Tools 'm', Stalk 's'), jadi file ini harus dimuat
   SETELAH tools/toolsmenu/downloader/stalk dan SEBELUM App.boot().
   Endpoint yang butuh apikey lewat /api/ikyy (key disimpan di server).
   Sengaja TIDAK dimasukkan: waprofile/getppchwa (ambil foto profil WA orang dari nomor = risiko privasi),
   reaction-wa (bot reaksi massal), bypass turnstile & skiplink (menembus proteksi), fakewafat (kartu duka palsu dari foto orang). */
(() => {
  'use strict';
  const App = window.App, IK = App.BASE_IKYYXD, KEY = '/api/ikyy';
  const add = (k, items) => { const s = App.SECTIONS.find(x => x.key === k); if (s) s.items.push(...items); };
  const IC = {
    dl:'<path d="M12 4v11M7 10.5L12 15.5l5-5M5 19.5h14"/>',
    img:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l5-5 4 4 3-3 4 4"/>',
    txt:'<path d="M4 6h16M4 12h10M4 18h14"/>',
    link:'<path d="M9 15l6-6M9.5 5.5L11 4a3.8 3.8 0 0 1 5.4 5.4l-1.9 1.9M14.5 18.5L13 20a3.8 3.8 0 0 1-5.4-5.4l1.9-1.9"/>',
    user:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    chat:'<path d="M12 20.5c-1.6 0-3.1-.4-4.4-1.2L3.5 20.5l1.3-3.6A8.3 8.3 0 0 1 3.5 12 8.5 8.5 0 1 1 12 20.5z"/>',
    music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.7 4 6 4 9s-1.3 6.3-4 9c-2.7-2.7-4-6-4-9s1.3-6.3 4-9z"/>',
    wand:'<path d="M5 19c3-10 11-10 14-14M7 17l2 2M4 20l1.5 1.5"/>'
  };
  const FINE_UP = 'File diunggah sementara ke catbox.moe atau uguu.se supaya bisa diproses.';
  const STEPS_IMG = ['Pilih gambar dari galeri.', 'Tekan Proses dan tunggu sebentar.', 'Geser garis untuk membandingkan Before dan After.'];
  const T = (key, label, ph, x) => Object.assign({ key, type:'text', label, placeholder: ph || '' }, x || {});
  const TA = (key, label, ph) => ({ key, type:'textarea', label, placeholder: ph || '' });
  const IMG = (key, label) => ({ key: key || 'url', type:'image', label: label || 'Pilih gambar' });
  const mk = o => Object.assign({ method:'GET', base:IK, kind:'text' }, o);
  const dl = (id, name, color, path, ph, desc, x) => mk(Object.assign({
    id, name, color, kind:'links', desc, icon:IC.dl, path, goLabel:'Unduh',
    fields:[T('url', 'Link', ph)]
  }, x || {}));

  /* ---------- Download ---------- */
  add('d', [
    dl('ik_igall', 'Instagram (semua)', '#d82f8f', '/download/igall', 'https://www.instagram.com/p/…', 'Unduh postingan, reel, atau story Instagram.'),
    dl('ik_gdrive', 'Google Drive', '#2f9b4f', '/download/gdrive', 'https://drive.google.com/file/d/…', 'Ambil link unduhan langsung dari Google Drive.'),
    dl('ik_capcut', 'CapCut', '#161618', '/download/capcut', 'https://www.capcut.com/…', 'Unduh template atau video CapCut.'),
    dl('ik_mediafire', 'MediaFire', '#2f6fe0', '/download/mediafire', 'https://www.mediafire.com/file/…', 'Unduh file dari MediaFire.'),
    dl('ik_pindl', 'Pinterest (v2)', '#e0382f', '/download/pindl', 'https://pin.it/…', 'Unduh gambar atau video Pinterest, mesin kedua.'),
    dl('ik_spotify', 'Spotify (v2)', '#1db954', '/download/spotifydl', 'https://open.spotify.com/track/…', 'Unduh lagu Spotify, mesin kedua.'),
    dl('ik_soundcloud', 'SoundCloud', '#e0782f', '/download/soundclouddl', 'https://soundcloud.com/…', 'Unduh audio dari SoundCloud.', { proxy:KEY }),
    dl('ik_terabox', 'TeraBox (v2)', '#2f6fe0', '/download/terabox', 'https://terabox.app/s/…', 'Unduh file TeraBox, mesin kedua.'),
    dl('ik_tiktok2', 'TikTok (v2)', '#161618', '/download/tiktokkv2', 'https://vt.tiktok.com/…', 'Unduh TikTok, mesin ketiga.'),
    dl('ik_tiktok4', 'TikTok (v4)', '#3a3a40', '/download/tiktokv4', 'https://vt.tiktok.com/…', 'Unduh TikTok, mesin keempat.'),
    dl('ik_ucbrowser', 'UC Browser', '#e0a02f', '/download/ucbrowser', 'https://…', 'Unduh file dari tautan UC Browser.'),
    dl('ik_videy', 'Videy', '#8b45e6', '/download/videy', 'https://videy.co/v?id=…', 'Unduh video dari Videy.'),
    dl('ik_ytmp3', 'YouTube MP3', '#e02f2f', '/download/ytmp3', 'https://www.youtube.com/watch?v=…', 'Ambil audio MP3 dari video YouTube.', { timeoutMs:150000 }),
    dl('ik_ytmp4', 'YouTube MP4', '#c42f2f', '/download/ytmp4', 'Link YouTube atau judul video', 'Ambil video MP4 dari YouTube.', { timeoutMs:150000, fields:[T('q', 'Link atau judul video', 'https://www.youtube.com/watch?v=…')] })
  ]);

  /* ---------- Alat gambar & video ---------- */
  add('t', [
    mk({ id:'ik_aiedit', name:'Edit gambar AI', color:'#d8a92f', kind:'image-compare', sample:'sharp', icon:IC.wand,
      desc:'Ubah isi gambar sesuai perintah teks.', fields:[IMG(), T('prompt', 'Perintah', 'jadikan malam hari')],
      path:'/edit/ai-edit-img', steps:STEPS_IMG, fine:FINE_UP }),
    mk({ id:'ik_anime2real', name:'Anime ke realistis', color:'#5f7bd8', kind:'image-compare', sample:'sharp', icon:IC.user,
      desc:'Ubah gambar anime jadi tampilan foto asli.', fields:[IMG()], path:'/edit/anime2real', steps:STEPS_IMG, fine:FINE_UP }),
    mk({ id:'ik_tofigure', name:'Jadi action figure', color:'#e05fa0', kind:'image-compare', sample:'sharp', icon:IC.user,
      desc:'Ubah foto jadi tampilan figure koleksi.', fields:[IMG()], path:'/edit/tofigure', steps:STEPS_IMG, fine:FINE_UP })
  ]);

  /* ---------- Tools ---------- */
  const shortT = (id, name, path) => mk({ id, name, color:'#2f7bb0', kind:'links', icon:IC.link, desc:'Perpendek link.',
    fields:[T('url', 'Link panjang', 'https://…')], path, goLabel:'Perpendek' });
  add('m', [
    mk({ id:'ik_ocr', name:'OCR (gambar ke teks)', color:'#6a4fe0', kind:'text', icon:IC.txt, desc:'Baca tulisan dari gambar.',
      fields:[IMG()], path:'/tools/ocr', goLabel:'Baca teks', fine:FINE_UP }),
    mk({ id:'ik_img2pdf', name:'Gambar ke PDF', color:'#d8382f', kind:'links', icon:IC.dl, desc:'Ubah gambar jadi file PDF.',
      fields:[IMG()], path:'/tools/img2pdf', goLabel:'Buat PDF', fine:FINE_UP }),
    mk({ id:'ik_ascii', name:'Gambar ke ASCII', color:'#444a5c', kind:'text', icon:IC.txt, desc:'Ubah gambar jadi seni teks ASCII.',
      fields:[IMG()], path:'/tools/ascii', proxy:KEY, goLabel:'Buat ASCII', fine:FINE_UP }),
    mk({ id:'ik_qrcode', name:'QR Code (v2)', color:'#1f8f6b', kind:'image-single', icon:IC.web, desc:'Ubah teks atau link jadi kode QR.',
      fields:[TA('text', 'Teks atau link', 'https://…')], path:'/tools/qrcode', goLabel:'Buat QR' }),
    mk({ id:'ik_webmeta', name:'Meta website', color:'#2f6b9b', kind:'kv', icon:IC.web, desc:'Lihat judul, deskripsi, dan meta sebuah situs.',
      fields:[T('url', 'Link website', 'https://example.com')], path:'/tools/webmeta', goLabel:'Cek' }),
    mk({ id:'ik_vidlen', name:'Durasi video', color:'#d83a3a', kind:'kv', icon:IC.dl, desc:'Cek durasi sebuah video.',
      fields:[{ key:'url', type:'video', label:'Pilih video' }], path:'/tools/video-duration', goLabel:'Cek durasi', fine:FINE_UP }),
    mk({ id:'ik_whatmusic', name:'Cari judul lagu', color:'#8b45e6', kind:'kv', icon:IC.music, desc:'Kenali judul lagu dari potongan audio atau video.',
      fields:[{ key:'url', type:'file', label:'Pilih audio atau video', accept:'audio/*,video/*' }], path:'/tools/whatmusic', goLabel:'Kenali lagu', fine:FINE_UP }),
    shortT('ik_shortby', 'Shortlink Shortby', '/tools/shortby'),
    shortT('ik_shortouo', 'Shortlink Ouo', '/tools/shortouo'),
    shortT('ik_shortlink', 'Shortlink (umum)', '/tools/shortlink'),
    mk({ id:'ik_logo', name:'Bikin logo teks', color:'#3f7bd8', kind:'image-single', icon:IC.wand, desc:'Buat logo sederhana dari teks.',
      fields:[T('text', 'Teks logo', 'IkyyXD')], path:'/image/logo', goLabel:'Buat logo' }),
    mk({ id:'ik_musicip', name:'Kartu musik', color:'#1db954', kind:'image-single', icon:IC.music, desc:'Kartu pemutar musik dari gambar sampul dan nama.',
      fields:[IMG('imgUrl', 'Gambar sampul'), T('name', 'Nama lagu', 'Judul lagu')], path:'/canvas/musicip', goLabel:'Buat kartu', fine:FINE_UP }),
    mk({ id:'ik_nulis', name:'Tulisan tangan (v2)', color:'#8a6b3f', kind:'image-single', icon:IC.wand, desc:'Ubah teks jadi gambar tulisan tangan.',
      fields:[TA('text', 'Teks', 'Halo, ini contoh tulisan tangan.')], path:'/canvas/nulis', proxy:KEY, goLabel:'Buat gambar' }),
    mk({ id:'ik_qc', name:'Quote Chat (v2)', color:'#1fa855', kind:'image-single', icon:IC.chat, desc:'Gambar kutipan chat dengan nama, foto, dan tema.',
      fields:[TA('text', 'Isi pesan', 'Tulis kutipan…'), T('name', 'Nama', 'Nama'), T('profile', 'Link foto profil (opsional)', 'https://…'),
        { key:'theme', type:'select', label:'Tema', default:'light', options:[{ value:'light', label:'Terang' }, { value:'dark', label:'Gelap' }] }],
      path:'/canvas/qc', goLabel:'Buat gambar' }),
    mk({ id:'ik_iqc', name:'Chat iPhone (v2)', color:'#2f7bd8', kind:'image-single', icon:IC.chat, desc:'Gambar percakapan bergaya iPhone dengan jam yang bisa diatur.',
      fields:[TA('text', 'Isi pesan', 'Halo, apa kabar?'), T('chatTime', 'Jam chat', '19:42'), T('statusBarTime', 'Jam status bar', '19:45')],
      path:'/canvas/iqc', goLabel:'Buat gambar' }),
    mk({ id:'ik_iqw', name:'Chat IQW', color:'#1fa8a0', kind:'image-single', icon:IC.chat, desc:'Gambar percakapan bergaya WhatsApp dari teks.',
      fields:[TA('text', 'Isi pesan', 'Halo!')], path:'/canvas/iqw', goLabel:'Buat gambar' })
  ]);

  /* ---------- Stalk (hanya data publik) ---------- */
  const st = (id, name, color, key, label, ph, path, x) => mk(Object.assign({
    id, name, color, kind:'kv', icon:IC.user, desc:`Lihat info publik ${name}.`, fields:[T(key, label, ph)], path, goLabel:'Cek akun',
    steps:['Isi username yang mau dicek.', 'Tekan Cek akun.', 'Hasilnya muncul sebagai daftar info.'],
    fine:'Hanya menampilkan info yang memang publik.'
  }, x || {}));
  add('s', [
    st('ik_roblox', 'Roblox', '#e0382f', 'username', 'Username Roblox', 'Roblox', '/stalk/roblox'),
    st('ik_chtele', 'Channel Telegram', '#229ed9', 'username', 'Username channel', 'namachannel', '/tools/chtele/stalk'),
    st('ik_ig', 'Instagram (cadangan)', '#d82f8f', 'username', 'Username Instagram', 'username (tanpa @)', '/stalk/ig'),
    st('ik_tiktok', 'TikTok (cadangan)', '#161618', 'username', 'Username TikTok', 'username (tanpa @)', '/stalk/tiktok'),
    st('ik_github', 'GitHub (cadangan)', '#2b2f36', 'user', 'Username GitHub', 'torvalds', '/stalk/github', { proxy:KEY })
  ]);
})();
