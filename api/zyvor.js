// Proxy untuk api.zyvor.my.id. Dipanggil dari browser lewat /api/zyvor?path=/api/...,
// server yang nerusin ke zyvor (server-ke-server nggak kena CORS), lalu balasannya
// (status, content-type, isi) diteruskan apa adanya ke browser.
const UPSTREAM = 'https://api.zyvor.my.id';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const path = req.query.path;
  if (!path || typeof path !== 'string' || !path.startsWith('/')) {
    return res.status(400).json({ status: false, message: 'Path tujuan tidak valid.' });
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const headers = {};
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];

  try {
    const upstream = await fetch(UPSTREAM + path, {
      method: req.method,
      headers,
      body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : body
    });
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.send(buf);
  } catch (e) {
    res.status(502).json({ status: false, message: 'Tidak bisa terhubung ke server alat (zyvor).' });
  }
};

module.exports.config = { api: { bodyParser: false } };
