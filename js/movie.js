/* CLARITY AI — movie.js
   Kategori "Film & Drama" (prefix 'f'). Alat dari api.zyvor.my.id yang nyari/nonton film, drama,
   dan serial dari beberapa situs. Tiap situs punya parameter beda-beda (action, slug, episode, dst),
   jadi semua kolom dibuat opsional kecuali yang jelas wajib, dan hasilnya ditampilkan apa adanya
   (link apa pun yang ketemu di balasan) karena bentuk balasan tiap "action" bisa beda-beda. */
(() => {
  'use strict';
  const App = window.App;
  const ZY = App.BASE_ZYVOR;
  const FINE = 'Hasil tergantung dari "action" yang diisi — kalau kosong hasilnya, coba ganti action atau isi kolom lain yang relevan.';

  const TOOLS = [
    { id:'freemovie', name:'Free Movie Archive', color:'#b5451f', kind:'movie',
      desc:'Cari dan putar film jadul/bebas hak cipta dari arsip Internet Archive.',
      icon:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      fields:[
        { key:'action', type:'text', label:'Action', default:'list', placeholder:'list' },
        { key:'query', type:'text', label:'Cari judul (opsional)', placeholder:'chaplin' },
        { key:'identifier', type:'text', label:'Identifier arsip (opsional)', placeholder:'CC_1916_10_02_ThePawnshop' },
        { key:'collection', type:'text', label:'Koleksi (opsional)', default:'feature_films' },
        { key:'subject', type:'text', label:'Genre / subjek (opsional)', placeholder:'comedy' },
        { key:'year', type:'text', label:'Tahun (opsional)', placeholder:'1916' },
        { key:'sort', type:'text', label:'Urutkan (opsional)', default:'downloads' },
        { key:'page', type:'number', label:'Halaman', default:'1' },
        { key:'rows', type:'number', label:'Jumlah baris', default:'20' },
        { key:'maxSize', type:'number', label:'Ukuran maks (opsional)', placeholder:'200' },
        { key:'file', type:'text', label:'Nama file video (opsional)', placeholder:'CC_1916_10_02_ThePawnshop_512kb.mp4' }
      ], method:'POST', base:ZY, path:'/api/movie/freemovie', goLabel:'Cari', fine:FINE },

    { id:'melolo', name:'Melolo Drama', color:'#d84f93', kind:'movie',
      desc:'Cari dan tonton drama pendek dari Melolo.',
      icon:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      fields:[
        { key:'action', type:'text', label:'Action', default:'home', placeholder:'home' },
        { key:'query', type:'text', label:'Cari judul (opsional)', placeholder:'dewi permata' },
        { key:'slug', type:'text', label:'Slug drama (opsional)', placeholder:'abstinent-tycoons-desire-the-factory-cinderella' },
        { key:'url', type:'text', label:'Link halaman drama (opsional)', placeholder:'https://melolo.com/dramas/engaged-to-the-enemy' },
        { key:'episode', type:'number', label:'Episode (opsional)', placeholder:'1' },
        { key:'page', type:'number', label:'Halaman', default:'1' }
      ], method:'POST', base:ZY, path:'/api/movie/melolo', goLabel:'Cari', fine:FINE },

    { id:'moviebox', name:'MovieBox', color:'#4f6bd8', kind:'movie',
      desc:'Lihat film dan serial trending dari MovieBox.',
      icon:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      fields:[
        { key:'action', type:'text', label:'Action', default:'trending', placeholder:'trending' },
        { key:'id', type:'text', label:'ID film (opsional)', placeholder:'223695587521217720' }
      ], method:'POST', base:ZY, path:'/api/movie/moviebox', goLabel:'Cari', fine:FINE },

    { id:'moviezone', name:'MovieZone', color:'#2f9b8f', kind:'movie',
      desc:'Cari film atau serial dan dapatkan link nonton dari server tertentu.',
      icon:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      fields:[
        { key:'action', type:'text', label:'Action', default:'trending', placeholder:'trending' },
        { key:'query', type:'text', label:'Cari judul (opsional)', placeholder:'avengers' },
        { key:'slug', type:'text', label:'Slug film (opsional)', placeholder:'movie-969681' },
        { key:'server', type:'text', label:'Server (opsional)', default:'VidSrcWiki' },
        { key:'se', type:'number', label:'Season (opsional)', placeholder:'1' },
        { key:'ep', type:'number', label:'Episode (opsional)', placeholder:'1' },
        { key:'type', type:'text', label:'Tipe', default:'all' }
      ], method:'POST', base:ZY, path:'/api/movie/moviezone', goLabel:'Cari', fine:FINE }
  ];

  App.registerSection({
    key:'f', label:'Film & Drama', viewClass:'view-tool',
    icon:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M9 9v6l5.5-3z"/>',
    items: TOOLS,
    open: App.makeOpener()
  });
})();
