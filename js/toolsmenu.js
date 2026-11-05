/* CLARITY AI — toolsmenu.js
   Kategori "Tools" (prefix 'm'). Alat serbaguna dari api.zyvor.my.id (dan satu dari api.ikyyxd.my.id).
   Catatan: spam-otp, ngl-spam dan cloneweb sengaja TIDAK dimasukkan karena berpotensi dipakai
   untuk mengganggu atau menipu orang lain (bukan error — ini keputusan sadar). */
(() => {
  'use strict';
  const App = window.App;
  const ZY = App.BASE_ZYVOR, IK = App.BASE_IKYYXD;
  const FINE_UP = 'File diunggah sementara ke catbox.moe atau uguu.se supaya bisa diproses.';

  function multipart(path, build){
    // api.zyvor.my.id menolak panggilan langsung dari browser, jadi lewat /api/zyvor dulu.
    return async (vals, signal) => {
      const fd = new FormData();
      build(fd, vals);
      return App.apiFetch(`/api/zyvor?path=${App.enc(path)}`, { method:'POST', body:fd, signal });
    };
  }

  const TOOLS = [
    { id:'aidetect', name:'Deteksi AI', color:'#6a4fe0', kind:'kv',
      desc:'Cek kemungkinan sebuah gambar dibuat oleh AI.', icon:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9l6 6M15 9l-6 6"/>',
      fields:[{ key:'url', type:'image', label:'Pilih gambar' }], fine:FINE_UP,
      run: multipart('/api/tools/aidetect', (fd, v) => fd.append('url', v.url)),
      goLabel:'Deteksi' },

    { id:'encrypt', name:'Encrypt / Decrypt', color:'#555b6e', kind:'text',
      desc:'Enkode atau dekode teks.', icon:'<rect x="6" y="10.5" width="12" height="9" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
      fields:[
        { key:'text', type:'textarea', label:'Teks', placeholder:'Tulis teks di sini…' },
        { key:'mode', type:'select', label:'Mode', default:'encrypt', options:[{value:'encrypt',label:'Encrypt'},{value:'decrypt',label:'Decrypt'}] },
        { key:'method', type:'text', label:'Metode', default:'base64', placeholder:'base64' }
      ],
      method:'POST', base:ZY, path:'/api/tools/encrypt', goLabel:'Proses' },

    { id:'ilovepdf', name:'Olah PDF', color:'#d8382f', kind:'links',
      desc:'Beri password, putar halaman, atau tambah watermark teks pada PDF.', icon:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9 13h6M9 16.5h4"/>',
      fields:[
        { key:'file', type:'file', label:'File PDF', accept:'.pdf,application/pdf' },
        { key:'password', type:'text', label:'Password baru (opsional)', placeholder:'Kosongkan kalau tidak perlu' },
        { key:'rotation', type:'select', label:'Putar halaman', default:'0', options:[{value:'0',label:'Tidak diputar'},{value:'90',label:'90°'},{value:'180',label:'180°'},{value:'270',label:'270°'}] },
        { key:'text', type:'text', label:'Teks watermark (opsional)', placeholder:'CONFIDENTIAL' },
        { key:'pages', type:'text', label:'Halaman (opsional)', placeholder:'contoh: 1 atau 1,2,3' }
      ], fine:FINE_UP,
      run: multipart('/api/tools/ilovepdf', (fd, v) => {
        fd.append('url', v.file);
        if (v.password) fd.append('password', v.password);
        fd.append('rotation', v.rotation || '0');
        if (v.text) fd.append('text', v.text);
        if (v.pages) fd.append('pages', v.pages);
      }) },

    { id:'nikparse', name:'Cek NIK', color:'#2f7bd8', kind:'kv',
      desc:'Baca info wilayah dan tanggal lahir dari format NIK.', icon:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M6 16c.5-1.5 1.7-2 2.5-2s2 .5 2.5 2M14 9.5h4M14 13h4"/>',
      fields:[{ key:'nik', type:'text', label:'Nomor NIK', placeholder:'3202285909840005' }],
      method:'GET', base:ZY, path:'/api/tools/nikparse', goLabel:'Cek' },

    { id:'text2qr', name:'Teks ke QR', color:'#1f8f6b', kind:'image-single',
      desc:'Ubah teks atau link jadi kode QR.', icon:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3zM14 20h3M20 17v3"/>',
      fields:[{ key:'text', type:'textarea', label:'Teks atau link', placeholder:'https://…' }],
      method:'GET', base:ZY, path:'/api/tools/text2qr', goLabel:'Buat QR' },

    { id:'qr2text', name:'QR ke teks', color:'#1f9f8f', kind:'text',
      desc:'Baca isi dari foto kode QR.', icon:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M15 15h5v5h-5z"/>',
      fields:[{ key:'url', type:'image', label:'Foto kode QR' }], fine:FINE_UP,
      method:'GET', base:ZY, path:'/api/tools/qr2text', goLabel:'Baca QR' },

    { id:'qrisinfo', name:'Cek QRIS', color:'#2f9b4f', kind:'kv',
      desc:'Lihat info merchant dari kode QRIS. Ini butuh teks/string QRIS, bukan foto. Belum punya teksnya? Buka dulu alat "QR ke teks", unggah foto kode QRIS di sana, salin hasilnya, lalu tempel di sini.',
      icon:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M14 17.5h6"/>',
      fields:[{ key:'qris', type:'textarea', label:'Kode / string QRIS', placeholder:'Belum punya teksnya? Pakai alat "QR ke teks" dulu dari foto kode QRIS, lalu tempel hasilnya di sini.' }],
      method:'POST', base:ZY, path:'/api/tools/qris-info', goLabel:'Cek',
      fine:'Butuh teks QRIS, bukan foto. Dapatkan teksnya lewat alat "QR ke teks" (unggah foto kode QRIS di sana).' },

    { id:'scanweb', name:'Scan website', color:'#2f6b9b', kind:'kv',
      desc:'Pindai info dasar dari sebuah situs.', icon:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
      fields:[{ key:'url', type:'text', label:'Link website', placeholder:'https://example.com' }],
      method:'GET', base:ZY, path:'/api/tools/scanweb', goLabel:'Scan' },

    { id:'ssweb', name:'Screenshot website', color:'#4f6bd8', kind:'image-single',
      desc:'Ambil tangkapan layar dari sebuah halaman web.', icon:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M3.5 9h17"/>',
      fields:[
        { key:'url', type:'text', label:'Link website', placeholder:'https://example.com' },
        { key:'theme', type:'select', label:'Tema', default:'light', options:[{value:'light',label:'Terang'},{value:'dark',label:'Gelap'}] },
        { key:'device', type:'select', label:'Perangkat', default:'desktop', options:[{value:'desktop',label:'Desktop'},{value:'mobile',label:'Mobile'}] },
        { key:'format', type:'select', label:'Format', default:'png', options:[{value:'png',label:'PNG'},{value:'jpg',label:'JPG'}] },
        { key:'quality', type:'number', label:'Kualitas (1-100)', default:'80' },
        { key:'delay', type:'number', label:'Tunda sebelum ambil (ms)', default:'1000' },
        { key:'fullPage', type:'select', label:'Seluruh halaman', default:'true', options:[{value:'true',label:'Ya'},{value:'false',label:'Tidak, satu layar saja'}] }
      ], method:'POST', base:ZY, path:'/api/tools/ssweb', goLabel:'Ambil screenshot', timeoutMs:60000 },

    { id:'trackip', name:'Track IP / Domain', color:'#2f8fd8', kind:'kv',
      desc:'Lihat info lokasi dan jaringan dari IP atau domain.', icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.7 4 6 4 9s-1.3 6.3-4 9c-2.7-2.7-4-6-4-9s1.3-6.3 4-9z"/>',
      fields:[{ key:'domain', type:'text', label:'Domain atau IP', placeholder:'wifi.id atau 8.8.8.8' }],
      method:'POST', base:ZY, path:'/api/tools/trackip', goLabel:'Lacak' },

    { id:'uploadv3', name:'Gambar ke link', color:'#2fa06a', kind:'links',
      desc:'Unggah gambar, dapat link yang bisa dipakai di mana saja.', icon:'<path d="M12 16V5M7 9.5L12 5l5 4.5M5 19h14"/>',
      fields:[
        { key:'file', type:'image', label:'Pilih gambar' },
        { key:'cdn', type:'text', label:'CDN', default:'all', placeholder:'all' },
        { key:'exp', type:'number', label:'Lama simpan', default:'5' },
        { key:'unit', type:'select', label:'Satuan', default:'tahun', options:[{value:'hari',label:'Hari'},{value:'bulan',label:'Bulan'},{value:'tahun',label:'Tahun'}] }
      ], fine:FINE_UP, goLabel:'Unggah',
      run: multipart('/api/tools/upload-v3', (fd, v) => {
        fd.append('url', v.file); fd.append('cdn', v.cdn || 'all'); fd.append('exp', v.exp || '5'); fd.append('unit', v.unit || 'tahun');
      }) },

    { id:'uuidgen', name:'Generator UUID', color:'#6a6a70', kind:'text',
      desc:'Buat kode unik (UUID) sekali tekan.', icon:'<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8M12 8v8" opacity=".5"/><path d="M9 9l6 6M15 9l-6 6"/>',
      fields:[], method:'POST', base:ZY, path:'/api/tools/uuid', goLabel:'Buat UUID' },

    { id:'web2apk', name:'Web ke APK', color:'#3fa05f', kind:'links',
      desc:'Bungkus sebuah website jadi aplikasi Android (APK).', icon:'<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M9.5 6h5M9 18.5h6"/>',
      fields:[
        { key:'url', type:'text', label:'Link website', placeholder:'https://example.com' },
        { key:'appName', type:'text', label:'Nama aplikasi', default:'My App' },
        { key:'packageName', type:'text', label:'Package name', default:'com.example.app' },
        { key:'versionName', type:'text', label:'Versi', default:'1.0.0' },
        { key:'versionCode', type:'text', label:'Kode versi', default:'1' }
      ], method:'POST', base:ZY, path:'/api/tools/web2apk', goLabel:'Buat APK', timeoutMs:180000,
      busyText:'Membangun APK, ini bisa beberapa menit…' },

    { id:'amfinder', name:'AM Finder', color:'#9b6b2f', kind:'kv',
      desc:'Cari info dari sebuah link.', icon:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
      fields:[{ key:'url', type:'text', label:'Link', placeholder:'https://…' }],
      method:'GET', base:IK, path:'/tools/amfinder', goLabel:'Cari' },

    { id:'checkban', name:'Cek Ban WhatsApp', color:'#1fa855', kind:'kv',
      desc:'Cek status sebuah nomor WhatsApp.', icon:'<path d="M12 20.5c-1.6 0-3.1-.4-4.4-1.2L3.5 20.5l1.3-3.6A8.3 8.3 0 0 1 3.5 12 8.5 8.5 0 1 1 12 20.5z"/><path d="M9 11l1.5 1.5L15 9"/>',
      fields:[{ key:'nomor', type:'text', label:'Nomor WhatsApp', placeholder:'6285167361633' }],
      method:'POST', base:ZY, path:'/api/checknumber/checkban', goLabel:'Cek nomor' },

    { id:'shortbitly', name:'Shortlink Bitly', color:'#ee6123', kind:'links',
      desc:'Perpendek link pakai Bitly.', icon:'<path d="M9 15l6-6M9.5 5.5L11 4a3.8 3.8 0 0 1 5.4 5.4l-1.9 1.9M14.5 18.5L13 20a3.8 3.8 0 0 1-5.4-5.4l1.9-1.9"/>',
      fields:[{ key:'link', type:'text', label:'Link panjang', placeholder:'https://…' }],
      method:'POST', base:ZY, path:'/api/shortlink/bitly', goLabel:'Perpendek' },

    { id:'shorttiny', name:'Shortlink TinyURL', color:'#2f7bb0', kind:'links',
      desc:'Perpendek link pakai TinyURL.', icon:'<path d="M9 15l6-6M9.5 5.5L11 4a3.8 3.8 0 0 1 5.4 5.4l-1.9 1.9M14.5 18.5L13 20a3.8 3.8 0 0 1-5.4-5.4l1.9-1.9"/>',
      fields:[{ key:'link', type:'text', label:'Link panjang', placeholder:'https://…' }],
      method:'POST', base:ZY, path:'/api/shortlink/tinyurl', goLabel:'Perpendek' }
  ];

  App.registerSection({
    key:'m', label:'Tools', viewClass:'view-tool',
    icon:'<path d="M14.5 3.5a4 4 0 0 0-5.3 5.3L4 14l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.6 2.6-2-2z"/>',
    items: TOOLS,
    open: App.makeOpener()
  });
})();
