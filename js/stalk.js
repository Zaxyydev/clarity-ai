/* CLARITY AI — stalk.js
   Kategori "Stalk Account" (prefix 's'). Lihat info publik sebuah akun. Semua lewat api.rizzpedia.ai.id
   (proxy /api/rizz, apikey disimpan di server). Cuma menampilkan data yang memang publik. */
(() => {
  'use strict';
  const App = window.App;
  const RZ = App.BASE_RIZZ;
  const STEPS = ['Isi username atau ID akun yang mau dicek.', 'Tekan Cek akun dan tunggu sebentar.', 'Hasilnya muncul sebagai daftar info.'];
  const FINE = 'Hanya menampilkan info yang memang publik. Pastikan username atau ID-nya benar.';
  const USER = '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>';

  const TOOLS = [
    { id:'tiktok', name:'TikTok', color:'#161618', kind:'kv',
      desc:'Lihat profil publik sebuah akun TikTok.', icon:USER,
      fields:[{ key:'username', type:'text', label:'Username TikTok', placeholder:'username (tanpa @)' }],
      method:'GET', base:RZ, path:'/api/stalk/tiktok', goLabel:'Cek akun', steps:STEPS, fine:FINE },

    { id:'instagram', name:'Instagram', color:'#d82f8f', kind:'kv',
      desc:'Lihat profil publik sebuah akun Instagram.', icon:USER,
      fields:[{ key:'username', type:'text', label:'Username Instagram', placeholder:'username (tanpa @)' }],
      method:'GET', base:RZ, path:'/api/stalk/instagram', goLabel:'Cek akun', steps:STEPS, fine:FINE },

    { id:'youtube', name:'YouTube', color:'#e02f2f', kind:'kv',
      desc:'Lihat info publik sebuah channel YouTube.', icon:USER,
      fields:[{ key:'username', type:'text', label:'Username / nama channel', placeholder:'@namachannel' }],
      method:'GET', base:RZ, path:'/api/stalk/youtube', goLabel:'Cek channel', steps:STEPS, fine:FINE },

    { id:'github', name:'GitHub', color:'#2b2f36', kind:'kv',
      desc:'Lihat profil publik sebuah akun GitHub.', icon:USER,
      fields:[{ key:'username', type:'text', label:'Username GitHub', placeholder:'torvalds' }],
      method:'GET', base:RZ, path:'/api/stalk/github', goLabel:'Cek akun', steps:STEPS, fine:FINE },

    { id:'freefire', name:'Free Fire', color:'#e0782f', kind:'kv',
      desc:'Lihat info publik sebuah akun Free Fire dari ID-nya.', icon:USER,
      fields:[{ key:'id', type:'text', label:'ID Free Fire', placeholder:'123456789' }],
      method:'GET', base:RZ, path:'/api/stalk/ffv2', goLabel:'Cek akun', steps:STEPS, fine:FINE }
  ];

  App.registerSection({
    key:'s', label:'Stalk Account', viewClass:'view-tool',
    icon:'<circle cx="11" cy="11" r="6.5"/><path d="M21 21l-5.2-5.2"/><circle cx="11" cy="9.5" r="1.8"/><path d="M7.8 14c.7-1.4 1.8-2 3.2-2s2.5.6 3.2 2"/>',
    items: TOOLS,
    open: App.makeOpener()
  });
})();
