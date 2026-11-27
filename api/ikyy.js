// Proxy untuk api.ikyyxd.my.id yang butuh apikey. Browser manggil /api/ikyy?path=/tools/ascii?url=...,
// server yang nambahin apikey, jadi key TIDAK muncul di kode browser.
// Set di Vercel: Settings > Environment Variables > IKYY_APIKEY.
const UPSTREAM = 'https://api.ikyyxd.my.id';
const APIKEY = process.env.IKYY_APIKEY || 'kyzz';
const ALLOWED = /^\/(download|tools|canvas|stalk|image|edit|ai)\/[\w\/-]+$/;

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
  try {
    const upstream = await fetch(target.toString());
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.send(buf);
  } catch (e) {
    res.status(502).json({ status: false, message: 'Tidak bisa terhubung ke server ikyyxd.' });
  }
};
