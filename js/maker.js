/* CLARITY AI — maker.js
   Kategori "Maker" (prefix 'k'). Generator gambar/kartu/meme dari api.zyvor.my.id.

   Catatan: 5 endpoint SENGAJA TIDAK dimasukkan karena bukan sekadar meme/hiburan, tapi alat yang
   niru dokumen resmi/bukti transaksi dan bisa dipakai buat nipu orang lain secara nyata
   (keputusan sadar, bukan error):
   - ektp                 → bikin KTP palsu yang kelihatan asli = pemalsuan dokumen negara / penipuan identitas.
   - fakebca               → bikin screenshot saldo/mutasi rekening BCA palsu = alat penipuan transaksi.
   - saldo-dana/gopay/ovo → sama kayak di atas, bikin screenshot saldo e-wallet palsu.
   "wafat" tetap dimasukkan — bentuknya kartu ucapan duka ala meme, bukan tiruan dokumen resmi
   (beda sama KTP/screenshot saldo), jadi masuk kategori prank/konten sesama teman.
   Sisanya (kartu nama, quote card, fake chat buat konten/prank sesama teman, dsb) tetap sekadar
   hiburan/konten kreatif, jadi tetap dimasukkan. */
(() => {
  'use strict';
  const App = window.App;
  const ZY = App.BASE_ZYVOR;
  const FINE = 'Bentuk hasil tiap alat bisa beda-beda — kalau ada yang hasilnya kosong/aneh, kasih tau biar disesuaikan.';

  const img = (key, label) => ({ key, type:'image', label });
  const txt = (key, label, extra) => Object.assign({ key, type:'text', label }, extra || {});
  const ta  = (key, label, extra) => Object.assign({ key, type:'textarea', label }, extra || {});

  const IC = {
    card:'<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8.5" cy="11" r="2"/><path d="M6 16c0-1.4 1-2.5 2.5-2.5S11 14.6 11 16M14 9.5h5M14 13h5M14 16.5h3"/>',
    chat:'<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2z"/>',
    quote:'<path d="M7 8c-2 1-3 3-3 5.5S5.5 18 8 18s3.5-1.5 3.5-3.5S10 11 8 11M15 8c-2 1-3 3-3 5.5S13.5 18 16 18s3.5-1.5 3.5-3.5S18 11 16 11"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    ribbon:'<circle cx="12" cy="9" r="5.5"/><path d="M9 13.5L7 21l5-3 5 3-2-7.5"/>',
    group:'<circle cx="9" cy="8.5" r="3"/><circle cx="16" cy="9.5" r="2.4"/><path d="M3.5 19c.5-3 2.5-4.6 5.5-4.6s5 1.6 5.5 4.6M14.5 14.8c2.3.3 3.6 1.7 4 4"/>',
    pen:'<path d="M4 20l1-4 11-11 3 3-11 11-4 1z"/><path d="M14 6l3 3"/>',
    wanted:'<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><circle cx="12" cy="10" r="3.4"/><path d="M8 17c.5-2 2-3 4-3s3.5 1 4 3"/>'
  };

  const TOOLS = [
    { id:'bounty', name:'Poster Buronan', color:'#b5451f', kind:'image-single',
      desc:'Bikin poster "wanted" ala koboi dari foto.', icon:IC.wanted,
      fields:[ img('image','Foto'), txt('text','Nama di poster', { placeholder:'Heisenberg' }) ],
      method:'POST', base:ZY, path:'/api/maker/bounty', fine:FINE },

    { id:'afinitasml', name:'Afinitas ML', color:'#4f6bd8', kind:'image-single',
      desc:'Kartu afinitas ala Mobile Legends dari foto profil.', icon:IC.card,
      fields:[ img('ppurl','Foto profil') ],
      method:'POST', base:ZY, path:'/api/maker/fake-afinitas-ml', fine:FINE },

    { id:'fakeff', name:'Kartu Free Fire', color:'#e0382f', kind:'image-single',
      desc:'Kartu profil ala Free Fire dari nama dan lobby.', icon:IC.card,
      fields:[ txt('username','Username', { placeholder:'Zyyvor' }), txt('lobby','Lobby', { default:'1' }) ],
      method:'POST', base:ZY, path:'/api/maker/fake-ff', fine:FINE },

    { id:'fakeml', name:'Kartu Mobile Legends', color:'#6b5ce7', kind:'image-single',
      desc:'Kartu profil ala Mobile Legends: username, rank, dan border.', icon:IC.card,
      fields:[ txt('username','Username', { placeholder:'Zyyvor' }), txt('rank','Rank', { placeholder:'imo' }), txt('border','Border', { default:'0' }) ],
      method:'POST', base:ZY, path:'/api/maker/fake-ml', fine:FINE },

    { id:'fakeprofileff', name:'Profil + ID Free Fire', color:'#d8514f', kind:'image-single',
      desc:'Kartu profil Free Fire lengkap nickname dan UID.', icon:IC.card,
      fields:[ txt('nickname','Nickname', { placeholder:'Zyvor' }), txt('uid','UID', { placeholder:'75813269' }) ],
      method:'POST', base:ZY, path:'/api/maker/fake-profile-ff', fine:FINE },

    { id:'faketele', name:'Profil Telegram', color:'#2f9bd8', kind:'image-single',
      desc:'Mockup profil Telegram: nama, nomor, bio, username, foto.', icon:IC.phone,
      fields:[ txt('nama','Nama', { placeholder:'Always Codex' }), txt('ponsel','Nomor ponsel', { placeholder:'+62 812-3456-7890' }),
        ta('bio','Bio', { placeholder:'Fullstack Developer' }), txt('username','Username', { placeholder:'zyvor' }), img('ppurl','Foto profil') ],
      method:'POST', base:ZY, path:'/api/maker/fake-tele', fine:FINE },

    { id:'fakecall', name:'Panggilan iPhone', color:'#2fae6b', kind:'image-single',
      desc:'Mockup layar panggilan masuk ala iPhone.', icon:IC.phone,
      fields:[ txt('name','Nama penelepon', { placeholder:'my heart ❤️' }), txt('duration','Durasi', { default:'00:00' }), img('avatar','Foto penelepon') ],
      method:'POST', base:ZY, path:'/api/maker/fakecall-ios', fine:FINE },

    { id:'fakech', name:'Story Dilihat', color:'#d84f93', kind:'image-single',
      desc:'Mockup "dilihat oleh sekian pengikut" ala status WA/IG.', icon:IC.chat,
      fields:[ txt('nama','Nama', { placeholder:'RINA IMUP' }), txt('pengikut','Jumlah pengikut', { placeholder:'3.621' }), txt('jam','Jam', { placeholder:'13.10' }), img('ppurl','Foto profil') ],
      method:'POST', base:ZY, path:'/api/maker/fakech', fine:FINE },

    { id:'fakegc', name:'Header Grup WA', color:'#1fa855', kind:'image-single',
      desc:'Mockup header percakapan grup WhatsApp.', icon:IC.group,
      fields:[ txt('nama','Nama grup', { placeholder:'RIN MD OFFICIAL' }), txt('anggota','Jumlah anggota', { placeholder:'2 anggota' }), img('ppurl','Foto grup') ],
      method:'POST', base:ZY, path:'/api/maker/fakegc', fine:FINE },

    { id:'fakeig', name:'Frame Foto Instagram', color:'#c23fa0', kind:'image-single',
      desc:'Bingkai foto profil ala Instagram.', icon:IC.card,
      fields:[ img('pp','Foto profil') ],
      method:'GET', base:ZY, path:'/api/maker/fakeig', fine:FINE },

    { id:'fakenote', name:'Note ala IG/WA', color:'#e0a63f', kind:'image-single',
      desc:'Mockup "note" singkat di atas foto profil.', icon:IC.chat,
      fields:[ txt('name','Nama', { placeholder:'@kyynhz' }), ta('message','Isi note', { placeholder:'jadilah manusia berkualitas, tidak menindas untuk menjadi teratas' }), img('avatar','Foto profil') ],
      method:'POST', base:ZY, path:'/api/maker/fakenote', fine:FINE },

    { id:'fakenotifwa', name:'Notifikasi WA', color:'#1fa855', kind:'image-single',
      desc:'Mockup notifikasi chat WhatsApp masuk di layar kunci.', icon:IC.chat,
      fields:[ txt('username','Nama pengirim', { placeholder:'Zyvor' }), ta('chat','Isi chat', { placeholder:'Haii sayangg udah makan belumm? 🥺' }),
        img('ppurl','Foto profil'), txt('tanggal','Tanggal', { placeholder:'Senin, 6 Maret' }), txt('jam','Jam', { placeholder:'6.39' }) ],
      method:'POST', base:ZY, path:'/api/maker/fakenotifwa', fine:FINE },

    { id:'iqc', name:'Kartu Kutipan', color:'#3f7bd8', kind:'image-single',
      desc:'Kartu kutipan/quote polos dengan nama pembuat.', icon:IC.quote,
      fields:[ ta('text','Isi kutipan', { placeholder:'ketika kamu kesepian, carilah dirimu sendiri' }), txt('author','Nama pembuat', { placeholder:'Zyvor' }) ],
      method:'POST', base:ZY, path:'/api/maker/iqc', fine:FINE },

    { id:'nulis', name:'Tulisan Tangan', color:'#8a6b3f', kind:'image-single',
      desc:'Ubah teks jadi gambar tulisan tangan di kertas.', icon:IC.pen,
      fields:[ ta('text','Teks', { placeholder:'Halo, ini contoh tulisan tangan.' }) ],
      method:'POST', base:ZY, path:'/api/maker/nulis', fine:FINE },

    { id:'profilejson', name:'Kartu Profil', color:'#0b9c84', kind:'links',
      desc:'Kartu profil singkat: nama, jabatan, email, link.', icon:IC.card,
      fields:[ txt('name','Nama', { placeholder:'Zyvor' }), txt('title','Jabatan', { placeholder:'Development' }),
        txt('email','Email', { placeholder:'contact@zyvor.my.id' }), txt('link','Link', { placeholder:'https://api.zyvor.my.id' }) ],
      method:'POST', base:ZY, path:'/api/maker/profilejson', fine:FINE },

    { id:'quotesanime', name:'Quote Anime', color:'#e05fb0', kind:'image-single',
      desc:'Kartu kutipan gaya anime dengan nama karakter.', icon:IC.quote,
      fields:[ txt('username','Nama karakter', { placeholder:'Higuruma' }), txt('background','Kode background', { default:'l' }) ],
      method:'POST', base:ZY, path:'/api/maker/quotes-anime', fine:FINE },

    { id:'sertifikatnasa', name:'Sertifikat NASA', color:'#2f6bd8', kind:'image-single',
      desc:'Sertifikat parodi ala NASA dengan nama sendiri.', icon:IC.ribbon,
      fields:[ txt('nama','Nama', { placeholder:'John Doe' }) ],
      method:'POST', base:ZY, path:'/api/maker/sertifikat-nasa', fine:FINE },

    { id:'students', name:'Kartu Pelajar', color:'#2f9b4f', kind:'image-single',
      desc:'Kartu pelajar lengkap sekolah, kelas, hingga wali.', icon:IC.card,
      fields:[
        txt('name','Nama', { placeholder:'Ahmed Hassan' }), txt('school','Sekolah', { placeholder:'Greenfield High School' }),
        txt('studentId','ID pelajar', { placeholder:'STU-2026-0142' }), txt('class','Kelas', { placeholder:'Grade 10-B' }),
        txt('rollNo','No. absen', { placeholder:'23' }), txt('dob','Tanggal lahir', { placeholder:'15 March 2010' }),
        txt('blood','Golongan darah', { placeholder:'O+' }), txt('guardian','Nama wali', { placeholder:'Muhammad Hassan' }),
        txt('contact','Kontak', { placeholder:'+92 300 1234567' }), txt('address','Alamat', { placeholder:'12 Park Avenue, Lahore' }),
        txt('valid','Masa berlaku', { placeholder:'2026-2027' }), img('photo','Foto')
      ], method:'POST', base:ZY, path:'/api/maker/students', fine:FINE },

    { id:'ttqc', name:'Quote + Avatar', color:'#d84f4f', kind:'image-single',
      desc:'Kartu kutipan dengan avatar dan username di atasnya.', icon:IC.quote,
      fields:[ txt('username','Username', { placeholder:'Ditzzx' }), ta('text','Isi teks', { placeholder:'Just friend kok cemburu 😂😂' }), img('avatar','Avatar') ],
      method:'GET', base:ZY, path:'/api/maker/ttqc', fine:FINE },

    { id:'wafat', name:'Kartu Ucapan Duka', color:'#4f5b7a', kind:'image-single',
      desc:'Kartu ucapan duka ala meme dengan foto, nama, dan tahun.', icon:IC.ribbon,
      fields:[ img('fotourl','Foto'), txt('nama','Nama', { placeholder:'Cukii Dijilat' }), txt('lahir','Tahun lahir', { placeholder:'1995' }), txt('wafat','Tahun wafat', { placeholder:'2026' }) ],
      method:'GET', base:ZY, path:'/api/maker/wafat', fine:FINE },

    { id:'twobuttons', name:'Meme Dua Tombol', color:'#9b4fd8', kind:'image-single',
      desc:'Template meme "dua tombol" yang lagi viral, tinggal isi teksnya.', icon:IC.card,
      fields:[ txt('teks1','Teks 1', { placeholder:'Red Bull' }), txt('teks2','Teks 2', { placeholder:'Mercedes' }), txt('teks3','Teks 3 (keterangan)', { placeholder:'GWH' }) ],
      method:'POST', base:ZY, path:'/api/maker/twobuttons', fine:FINE }
  ];

  App.registerSection({
    key:'k', label:'Maker', viewClass:'view-tool',
    icon:'<path d="M4 20l1-4 11-11 3 3-11 11-4 1z"/><path d="M14 6l3 3"/>',
    items: TOOLS,
    open: App.makeOpener()
  });
})();
