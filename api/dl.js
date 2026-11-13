// Proxy unduh: browser minta /api/dl?url=...&name=..., server ambil file lalu kirim balik
// sebagai attachment. Dipakai kalau server asal file nggak mengizinkan unduh langsung dari browser (CORS).
const { Readable } = require('stream');

const PRIVATE = /^(localhost|.*\.local|.*\.internal|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?|\[?f[cd][0-9a-f]{2}:)/i;

module.exports = async (req, res) => {
  const raw = req.query.url;
  let u;
  try { u = new URL(String(raw || '')); } catch (e) { return res.status(400).json({ message: 'Link tidak valid.' }); }
  if (!/^https?:$/.test(u.protocol) || PRIVATE.test(u.hostname)) {
    return res.status(400).json({ message: 'Link tidak diizinkan.' });
  }
  const name = String(req.query.name || 'clarity-file').replace(/[^\w.\- ]+/g, '_').slice(0, 80) || 'clarity-file';
  try {
    const up = await fetch(u.toString(), { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!up.ok || !up.body) return res.status(502).json({ message: 'File tidak bisa diambil dari server asal.' });
    res.setHeader('Content-Type', up.headers.get('content-type') || 'application/octet-stream');
    const len = up.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('Cache-Control', 'no-store');
    Readable.fromWeb(up.body).pipe(res);
  } catch (e) {
    res.status(502).json({ message: 'Tidak bisa terhubung ke server asal file.' });
  }
};
