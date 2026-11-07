/* CLARITY AI — tools.js
   Kategori "Alat gambar & video" (prefix 't'). 8 alat lama (api.ikyyxd.my.id) + 13 alat baru (api.zyvor.my.id). */
(() => {
  'use strict';
  const App = window.App;
  const IK = App.BASE_IKYYXD, ZY = App.BASE_ZYVOR;
  const STEPS_IMG = ['Pilih gambar dari galeri.','Tekan Proses dan tunggu sebentar.','Geser garis untuk membandingkan Before dan After.'];
  const STEPS_TXT = ['Pilih gambar dari galeri.','Tekan Buat prompt.','Salin prompt hasilnya.'];
  const STEPS_VID = ['Pilih video dari galeri.','Tekan Proses. Video besar bisa beberapa menit.','Putar video Before dan After.'];
  const FINE = 'File diunggah sementara ke catbox.moe atau uguu.se supaya bisa diproses.';
  const img1 = (label) => [{ key:'url', type:'image', label: label || 'Pilih gambar' }];

  const TOOLS = [
    /* ---------- 8 alat lama ---------- */
    { id:'upscale', name:'Upscale', color:'#0b9c84', kind:'image-compare', sample:'sharp',
      desc:'Perbesar dan pertajam gambar.', icon:'<path d="M4 14v6h6M20 10V4h-6M4 20l7-7M20 4l-7 7"/>',
      fields: img1(), method:'GET', base:IK, path:'/tools/upscale', steps:STEPS_IMG, fine:FINE },
    { id:'upscale2', name:'Upscale v2', color:'#2f6fe0', kind:'image-compare', sample:'sharp',
      desc:'Mesin upscale cadangan kalau hasil pertama kurang pas.', icon:'<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',
      fields: img1(), method:'GET', base:IK, path:'/tools/upscale2', steps:STEPS_IMG, fine:FINE },
    { id:'remini', name:'Remini', color:'#8b45e6', kind:'image-compare', sample:'sharp',
      desc:'Perjelas foto buram dan wajah.', icon:'<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9zM19 3v4M17 5h4"/>',
      fields: img1(), method:'GET', base:IK, path:'/tools/remini', steps:STEPS_IMG, fine:FINE },
    { id:'removebg', name:'Hapus latar', color:'#e0600f', kind:'image-compare', sample:'cutout',
      desc:'Buang latar belakang, objek utama tetap.', icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
      fields: img1(), method:'GET', base:IK, path:'/tools/removebg', steps:STEPS_IMG, fine:FINE },
    { id:'unwatermark', name:'Hapus watermark', color:'#d6347f', kind:'image-compare', sample:'wm',
      desc:'Hapus watermark dari gambar.', icon:'<path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.7 12 3.5 12 3.5zM4 4l16 16"/>',
      fields: [{ key:'image', type:'image', label:'Pilih gambar' }], method:'GET', base:IK, path:'/edit/unwatermark', steps:STEPS_IMG, fine:FINE },
    { id:'blur', name:'Blur', color:'#0b8aa6', kind:'image-compare', sample:'blur',
      desc:'Buat gambar jadi buram.', icon:'<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="6.5" stroke-dasharray="2 3"/><circle cx="12" cy="12" r="9.5" stroke-dasharray="1 4"/>',
      fields: img1(), method:'GET', base:IK, path:'/image/blur', steps:STEPS_IMG, fine:FINE },
    { id:'img2prompt', name:'Gambar ke prompt', color:'#b4730a', kind:'text', sample:'sharp', samplePrompt:'Flat vector illustration of a person in an orange jacket standing before layered blue mountains at sunrise, soft peach sky, large yellow sun at the top right, wide composition, calm color palette, clean minimal style, high detail.',
      desc:'Ubah gambar jadi deskripsi prompt.', icon:'<path d="M4 6h16M4 12h10M4 18h14"/>',
      fields: img1(), method:'GET', base:IK, path:'/tools/img2prompt', steps:STEPS_TXT, fine:FINE, goLabel:'Buat prompt' },
    { id:'hdvid', name:'Upscale video', color:'#d83a3a', kind:'video-compare', sample:'sharp',
      desc:'Naikkan kualitas video. Video besar butuh waktu lebih lama.', icon:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      fields: [{ key:'videourl', type:'video', label:'Pilih video' }], method:'GET', base:IK, path:'/tools/hdvidd', steps:STEPS_VID, fine:FINE, timeoutMs:300000, busyText:'Memproses video, ini bisa beberapa menit…' },

    /* ---------- 13 alat baru ---------- */
    { id:'wink', name:'Wink HD Video', color:'#c23fa0', kind:'video-compare', sample:'sharp',
      desc:'Perjelas kualitas video lewat mesin Wink.', icon:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 10l2 2-2 2M14 10l2 2-2 2"/>',
      fields: [{ key:'url', type:'video', label:'Pilih video' }], method:'POST', base:ZY, path:'/api/hdvidio/wink-hd-video',
      steps:STEPS_VID, fine:FINE, timeoutMs:300000, busyText:'Memproses video, ini bisa beberapa menit…' },
    { id:'qwenedit', name:'Edit objek foto', color:'#3f7bd8', kind:'image-compare', sample:'sharp',
      desc:'Edit objek di dalam foto sesuai perintah teks (mesin Qwen).', icon:'<path d="M4 16l5-5 3 3 6-6M15 5h4v4"/>',
      fields: [...img1('Pilih foto'), { key:'prompt', type:'textarea', label:'Perintah', placeholder:'ganti warna baju jadi merah' }],
      method:'POST', base:ZY, path:'/api/image/qwen-edit', steps:STEPS_IMG, fine:FINE },
    { id:'toanime', name:'Jadi anime', color:'#e05fb0', kind:'image-compare', sample:'sharp',
      desc:'Ubah gaya foto jadi ilustrasi anime.', icon:'<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M8.5 15a4 4 0 0 0 7 0"/>',
      fields: img1(), method:'POST', base:ZY, path:'/api/image/toanimev2', steps:STEPS_IMG, fine:FINE },
    { id:'unblur', name:'Unblur', color:'#2f9bd8', kind:'image-compare', sample:'blur',
      desc:'Perjelas foto yang buram, dengan tingkat kekuatan yang bisa diatur.', icon:'<circle cx="12" cy="12" r="8.5"/><path d="M8 15c1-3.5 3-3.5 4-3.5s3 0 4 3.5"/>',
      fields: [...img1(), { key:'level', type:'select', label:'Tingkat kejernihan', default:'5',
        options:[1,2,3,4,5,6,7,8,9,10].map(n => ({ value:String(n), label:String(n) })) }],
      method:'POST', base:ZY, path:'/api/image/unblur', steps:STEPS_IMG, fine:FINE },
    { id:'unblurv2', name:'Unblur v2', color:'#2fb0d8', kind:'image-compare', sample:'blur',
      desc:'Mesin unblur cadangan.', icon:'<circle cx="12" cy="12" r="8.5"/><path d="M8 13.5c1-3 3-3 4-3s3 0 4 3"/>',
      fields: img1(), method:'GET', base:ZY, path:'/api/image/unblurv2', steps:STEPS_IMG, fine:FINE },
    { id:'unwatermarkv2', name:'Hapus watermark v2', color:'#d65fb0', kind:'image-compare', sample:'wm',
      desc:'Mesin hapus watermark cadangan.', icon:'<path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.7 12 3.5 12 3.5z" opacity=".55"/><path d="M4 4l16 16"/>',
      fields: img1(), method:'GET', base:ZY, path:'/api/image/unwatermark', steps:STEPS_IMG, fine:FINE },
    { id:'enhance', name:'Enhance AI', color:'#17a06b', kind:'image-compare', sample:'sharp',
      desc:'Pertajam detail dan warna foto pakai AI.', icon:'<path d="M12 3l1.6 4.8L18.5 9l-4.9 1.2L12 15l-1.6-4.8L5.5 9l4.9-1.2z"/><path d="M19 15v3M17.5 16.5h3"/>',
      fields: img1(), method:'POST', base:ZY, path:'/api/imagehd/ai-enhancev6', steps:STEPS_IMG, fine:FINE },
    { id:'optimole', name:'Optimasi gambar', color:'#5c8f1f', kind:'image-compare', sample:'sharp',
      desc:'Perkecil ukuran file gambar tanpa merusak kualitas.', icon:'<path d="M4 12l5-7 5 7 2.5-3.5L20 15"/><path d="M4 18h16"/>',
      fields: img1(), method:'POST', base:ZY, path:'/api/imagehd/optimole', steps:STEPS_IMG, fine:FINE },
    { id:'superres', name:'Resolusi realistis', color:'#0b7a9c', kind:'image-compare', sample:'sharp',
      desc:'Naikkan resolusi gambar dengan hasil senatural mungkin.', icon:'<rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/><path d="M10.5 10.5l3-3"/>',
      fields: img1(), method:'GET', base:ZY, path:'/api/imagehd/super-resolution', steps:STEPS_IMG, fine:FINE },
    { id:'winkhd', name:'Wink HD Foto', color:'#c23fa0', kind:'image-compare', sample:'sharp',
      desc:'Perjelas foto lewat mesin Wink.', icon:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M8 10l2 2-2 2M14 10l2 2-2 2"/>',
      fields: img1(), method:'POST', base:ZY, path:'/api/imagehd/wink-hd', steps:STEPS_IMG, fine:FINE },
    { id:'nanobanana', name:'Edit foto (prompt)', color:'#d8a92f', kind:'image-compare', sample:'sharp',
      desc:'Ubah isi foto sesuai perintah teks bebas.', icon:'<path d="M5 19c3-10 11-10 14-14M7 17l2 2M4 20l1.5 1.5"/>',
      fields: [...img1('Pilih foto'), { key:'prompt', type:'textarea', label:'Perintah', placeholder:'a futuristic cyberpunk cat in neon city' }],
      method:'POST', base:ZY, path:'/api/image/nanobananav4', extra:{ model:'photoeditor_3.0', ratio:'match_input_image' },
      steps:STEPS_IMG, fine:FINE },
    { id:'faceswap', name:'Face swap', color:'#a84fe0', kind:'three-shots',
      desc:'Tukar wajah dari satu foto ke foto lain.', icon:'<circle cx="8" cy="12" r="4.5"/><circle cx="16" cy="12" r="4.5"/><path d="M12 7v10"/>',
      fields: [
        { key:'source_url', type:'image', label:'Foto sumber (wajah yang dipakai)' },
        { key:'target_url', type:'image', label:'Foto target (wajah yang diganti)' }
      ], method:'GET', base:ZY, path:'/api/image/faceswap',
      steps:['Pilih foto sumber (wajah yang mau dipasang).','Pilih foto target (wajah yang mau diganti).','Tekan Proses dan lihat hasilnya.'], fine:FINE },
    { id:'lego', name:'Efek Lego', color:'#d8482f', kind:'image-compare', sample:'sharp',
      desc:'Ubah foto jadi mosaik gaya balok Lego.', icon:'<rect x="4" y="10" width="16" height="9" rx="2"/><rect x="7" y="6" width="4" height="4" rx="1"/><rect x="13" y="6" width="4" height="4" rx="1"/>',
      fields: [...img1(), { key:'cols', type:'number', label:'Jumlah kolom', default:'40', placeholder:'40' }, { key:'brick', type:'number', label:'Ukuran balok (px)', default:'20', placeholder:'20' }],
      method:'POST', base:ZY, path:'/api/image/lego', steps:STEPS_IMG, fine:FINE }
  ];

  App.registerSection({
    key:'t', label:'Alat gambar & video', viewClass:'view-tool',
    icon:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 16l3-3.5 2.5 2.5L16 12l2 2.5M9 9.5v.01"/>',
    items: TOOLS,
    open: App.makeOpener()
  });
})();
