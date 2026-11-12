/* CLARITY AI — movie.js
   Kategori "Film & Drama" (prefix 'f'). Beda dari kategori lain: halaman ini BUKAN form alat biasa.
   Begitu dibuka langsung muncul grid film/drama (seperti halaman utama Netflix) tanpa perlu isi
   form dulu, plus kotak pencarian di atas. Tiap situs (freemovie/melolo/moviebox/moviezone) punya
   parameter sendiri (lihat `defaultVals`/`searchKey` tiap alat), jadi bagian itu disembunyikan dari
   pengguna dan ditangani otomatis di sini. */
(() => {
  'use strict';
  const App = window.App;
  const { $, esc } = App;
  const ZY = App.BASE_ZYVOR;

  const TOOLS = [
    { id:'freemovie', name:'Free Movie Archive', color:'#b5451f',
      desc:'Film jadul/bebas hak cipta dari arsip Internet Archive.',
      icon:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      method:'POST', base:ZY, path:'/api/movie/freemovie',
      defaultVals:{ action:'list', collection:'feature_films', sort:'downloads', page:'1', rows:'24' },
      searchKey:'query', searchVals:{ action:'list' } },

    { id:'melolo', name:'Melolo Drama', color:'#d84f93',
      desc:'Drama pendek dari Melolo.',
      icon:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      method:'POST', base:ZY, path:'/api/movie/melolo',
      defaultVals:{ action:'home', page:'1' },
      searchKey:'query', searchVals:{ action:'home' } },

    { id:'moviebox', name:'MovieBox', color:'#4f6bd8',
      desc:'Film dan serial trending dari MovieBox.',
      icon:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      method:'POST', base:ZY, path:'/api/movie/moviebox',
      defaultVals:{ action:'trending' },
      searchKey:'', searchVals:null },

    { id:'moviezone', name:'MovieZone', color:'#2f9b8f',
      desc:'Cari film/serial dan dapatkan link nonton.',
      icon:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      method:'POST', base:ZY, path:'/api/movie/moviezone',
      defaultVals:{ action:'trending', server:'VidSrcWiki', type:'all' },
      searchKey:'query', searchVals:{ action:'trending', server:'VidSrcWiki', type:'all' } }
  ];

  const view = { view:null, icon:null, title:null, form:null, input:null, body:null };
  let curKey = null, ctrl = null;

  function load(item, navKey, query){
    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    const vals = query
      ? Object.assign({}, item.searchVals, { [item.searchKey]: query })
      : Object.assign({}, item.defaultVals);
    view.body.innerHTML = `<div class="prog" role="status"><div class="row1"><span class="shimmer">Memuat…</span></div><div class="bar"><i></i></div></div>`;
    const run = App.makeRun({ method:item.method, base:item.base, path:item.path });
    run(vals, ctrl.signal).then(res => {
      if (curKey !== navKey) return;
      if (res.data && res.data.status === false) throw new Error(res.data.message || 'Server mengembalikan status gagal.');
      if (!res.data) throw new Error('Server tidak mengirim data.');
      view.body.innerHTML = '';
      App.renderResult(view.body, 'movie', { data: res.data });
    }).catch(e => {
      if (curKey !== navKey || e.name === 'AbortError') return;
      view.body.innerHTML = `<p class="cmp-warn">${esc(e.message || 'Gagal memuat data.')}</p>`;
    });
  }

  function openMovie(item, navKey){
    curKey = navKey;
    view.view.style.setProperty('--tool', item.color);
    view.view.scrollTop = 0;
    view.icon.style.background = item.color;
    view.icon.innerHTML = `<svg class="ic" viewBox="0 0 24 24">${item.icon}</svg>`;
    view.title.textContent = item.name;
    view.input.value = '';
    view.input.placeholder = item.searchKey ? `Cari judul di ${item.name}…` : `${item.name} tidak punya pencarian judul`;
    view.input.disabled = !item.searchKey;
    view.form.querySelector('button').disabled = !item.searchKey;
    load(item, navKey, '');
    view.form.onsubmit = e => {
      e.preventDefault();
      if (!item.searchKey) return;
      load(item, navKey, view.input.value.trim());
    };
  }

  App.registerSection({
    key:'f', label:'Film & Drama', viewClass:'view-movie',
    icon:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M9 9v6l5.5-3z"/>',
    items: TOOLS,
    open(item, navKey){
      if (!view.view){
        view.view = $('#movieView'); view.icon = $('#movieIcon'); view.title = $('#movieTitle');
        view.form = $('#movieSearchForm'); view.input = $('#movieSearchInput'); view.body = $('#movieBody');
      }
      openMovie(item, navKey);
    }
  });
})();
