// Cadangan upload untuk Vercel: terima file mentah (maks 4 MB), teruskan ke catbox.moe, balas link-nya.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ status: false, message: 'Gunakan POST.' });

  const buf = Buffer.isBuffer(req.body) ? req.body : null;
  if (!buf || !buf.length) return res.status(400).json({ status: false, message: 'File kosong.' });
  if (buf.length > 4 * 1024 * 1024) return res.status(413).json({ status: false, message: 'Maksimal 4 MB.' });

  const name = String(req.query.name || 'file').replace(/[^\w.\-]/g, '_').slice(0, 80) || 'file';
  const type = String(req.query.type || 'application/octet-stream');

  try {
    const fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('fileToUpload', new Blob([buf], { type }), name);
    const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd });
    const text = (await r.text()).trim();
    if (!r.ok || !/^https?:\/\//.test(text)) {
      return res.status(502).json({ status: false, message: 'Host upload menolak file.' });
    }
    return res.status(200).json({ status: true, url: text });
  } catch (e) {
    return res.status(502).json({ status: false, message: 'Tidak bisa menghubungi host upload.' });
  }
};
