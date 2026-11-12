// Proxy untuk api.rizzpedia.ai.id. Browser manggil /api/rizz?path=/api/...,
// server yang nambahin apikey + username, jadi key TIDAK pernah muncul di kode browser.
// Set di Vercel: Settings > Environment Variables > RIZZ_APIKEY (dan RIZZ_USERNAME kalau perlu).
const UPSTREAM = 'https://api.rizzpedia.ai.id';
const APIKEY = process.env.RIZZ_APIKEY || 'ALWAYSRIZZ_0E4333C2FCC1';
const USERNAME = process.env.RIZZ_USERNAME || 'noir';
const ALLOWED = /^\/api\/(download|imagecreator|stalk)\/[\w-]+$/;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const raw = req.query.path;
  if (!raw || typeof raw !== 'string' || !raw.startsWith('/')) {
    return res.status(400).json({ status: false, message: 'Path tujuan tidak valid.' });
  }

  let target;
  try { target = new URL(UPSTREAM + raw); }
  catch (e) { return res.status(400).json({ status: false, message: 'Path tujuan tidak valid.' }); }
  if (!ALLOWED.test(target.pathname)) {
    return res.status(403).json({ status: false, message: 'Endpoint tidak diizinkan.' });
  }

  target.searchParams.set('apikey', APIKEY);
  if (!target.searchParams.get('username')) target.searchParams.set('username', USERNAME);

  try {
    const upstream = await fetch(target.toString());
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.send(buf);
  } catch (e) {
    res.status(502).json({ status: false, message: 'Tidak bisa terhubung ke server Rizz.' });
  }
};
