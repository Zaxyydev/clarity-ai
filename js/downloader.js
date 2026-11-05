/* CLARITY AI — downloader.js
   Kategori "Download" (prefix 'd'). Semua lewat api.zyvor.my.id, kirim {url} dan tampilkan
   semua link yang ditemukan di balasannya lewat tampilan 'links'. */
(() => {
  'use strict';
  const App = window.App;
  const ZY = App.BASE_ZYVOR;
  const urlField = (label, ph) => [{ key:'url', type:'text', label: label || 'Link', placeholder: ph || 'https://…' }];

  const TOOLS = [
    { id:'pinimg', name:'Pinterest (gambar)', color:'#e0382f', kind:'links',
      desc:'Unduh gambar dari sebuah pin Pinterest.', icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 10.5c0-2 1.5-3.5 3.5-2.8"/>',
      fields: urlField('Link pin Pinterest', 'https://id.pinterest.com/pin/…'),
      method:'POST', base:ZY, path:'/api/downloader/pinterest-dl', goLabel:'Unduh' },

    { id:'pinvid', name:'Pinterest (video)', color:'#e0382f', kind:'links',
      desc:'Unduh video dari Pinterest.', icon:'<circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z"/>',
      fields: urlField('Link video Pinterest', 'https://v1.pinimg.com/videos/…'),
      method:'POST', base:ZY, path:'/api/downloader/pinvid', goLabel:'Unduh',
      fine:'Kadang link sumbernya berupa stream (.m3u8) — kalau hasilnya tidak langsung terbuka, coba buka lewat aplikasi pemutar video.' },

    { id:'spotify', name:'Spotify', color:'#1db954', kind:'links',
      desc:'Unduh audio dari sebuah lagu Spotify.', icon:'<circle cx="12" cy="12" r="9"/><path d="M7.5 9.5c3-1 7-.7 9.3.7M7.8 12.7c2.4-.8 5.6-.5 7.5.7M8.2 15.6c2-.6 4.4-.4 6 .5"/>',
      fields: urlField('Link lagu Spotify', 'https://open.spotify.com/track/…'),
      method:'POST', base:ZY, path:'/api/downloader/spotify', goLabel:'Unduh' },

    { id:'instagram', name:'Instagram', color:'#d82f8f', kind:'links',
      desc:'Unduh foto, video, atau carousel dari Instagram.', icon:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="16.3" cy="7.7" r="1"/>',
      fields: urlField('Link postingan Instagram', 'https://www.instagram.com/p/…'),
      method:'POST', base:ZY, path:'/api/downloader/sssinstagram', goLabel:'Unduh' },

    { id:'terabox', name:'TeraBox', color:'#2f6fe0', kind:'links',
      desc:'Unduh file yang dibagikan lewat TeraBox.', icon:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5L12 12l8-4.5M12 12v9"/>',
      fields: urlField('Link TeraBox', 'https://terabox.app/s/…'),
      method:'POST', base:ZY, path:'/api/downloader/terabox', goLabel:'Unduh' },

    { id:'tiktok', name:'TikTok', color:'#161618', kind:'links',
      desc:'Unduh video TikTok tanpa watermark.', icon:'<path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.5 2.2 2.2 3.8 4.3 4"/>',
      fields: urlField('Link video TikTok', 'https://vt.tiktok.com/…'),
      method:'POST', base:ZY, path:'/api/downloader/tiktokv2', goLabel:'Unduh' },

    { id:'tiktokv1', name:'TikTok (cadangan)', color:'#3a3a40', kind:'links',
      desc:'Mesin unduh TikTok cadangan kalau yang utama gagal.', icon:'<path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.5 2.2 2.2 3.8 4.3 4" opacity=".6"/>',
      fields: urlField('Link video TikTok', 'https://vt.tiktok.com/…'),
      method:'POST', base:ZY, path:'/api/downloader/tiktok', goLabel:'Unduh' },

    { id:'youtube', name:'YouTube', color:'#e02f2f', kind:'links',
      desc:'Unduh video atau audio dari YouTube.', icon:'<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/>',
      fields: urlField('Link video YouTube', 'https://www.youtube.com/watch?v=…'),
      method:'POST', base:ZY, path:'/api/downloader/youtubev5', goLabel:'Unduh', timeoutMs:150000 }
  ];

  App.registerSection({
    key:'d', label:'Download', viewClass:'view-tool',
    icon:'<path d="M12 4v11M7 10.5L12 15.5l5-5M5 19.5h14"/>',
    items: TOOLS,
    open: App.makeOpener()
  });
})();
