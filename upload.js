// Upload untuk Vercel: terima file mentah (maks 4 MB), teruskan ke catbox.moe, cadangan uguu.se, balas link-nya.
async function toCatbox(buf, name, type) {
  const fd = new FormData();
  fd.append('reqtype', 'fileupload');
  fd.append('fileToUpload', new Blob([buf], { type }), name);
  const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd });
  const text = (await r.text()).trim();
  return r.ok && /^https?:\/\/\S+$/.test(text) ? text : '';
}

async function toUguu(buf, name, type) {
  const fd = new FormData();
  fd.append('files[]', new Blob([buf], { type }), name);
  const r = await fetch('https://uguu.se/upload', { method: 'POST', body: fd });
  const raw = (await r.text()).trim();
  if (!r.ok) return '';
  try {
    const j = JSON.parse(raw);
    return (j.files && j.files[0] && j.files[0].url) || j.url || '';
  } catch (e) {
    return /^https?:\/\/\S+$/.test(raw) ? raw : '';
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ status: false, message: 'Gunakan POST.' });

  const buf = Buffer.isBuffer(req.body) ? req.body : null;
  if (!buf || !buf.length) return res.status(400).json({ status: false, message: 'File kosong.' });
  if (buf.length > 4 * 1024 * 1024) return res.status(413).json({ status: false, message: 'Maksimal 4 MB.' });

  const name = String(req.query.name || 'file').replace(/[^\w.\-]/g, '_').slice(0, 80) || 'file';
  const type = String(req.query.type || 'application/octet-stream');

  for (const host of [toCatbox, toUguu]) {
    try {
      const url = await host(buf, name, type);
      if (url) return res.status(200).json({ status: true, url });
    } catch (e) {
      // coba host berikutnya
    }
  }
  return res.status(502).json({ status: false, message: 'Semua host upload menolak file.' });
};
