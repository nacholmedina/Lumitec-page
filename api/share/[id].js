import { getPhotoMeta } from '../_lib/r2.js';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  const { id } = req.query;
  const meta = await getPhotoMeta(id);

  if (!meta || !meta.url) {
    return res.redirect(302, '/#novedades');
  }

  const siteUrl = `https://${req.headers.host}`;
  const title = 'LUMITEC - Electricidad, Iluminaci\u00f3n y Ferreter\u00eda';
  const description = meta.description
    || 'Materiales el\u00e9ctricos industriales y domiciliarios, iluminaci\u00f3n y ferreter\u00eda en Adelia Mar\u00eda, C\u00f3rdoba.';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(meta.url)}">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="LUMITEC">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(meta.url)}">
  <meta http-equiv="refresh" content="0;url=${siteUrl}/#novedades">
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <p>Redirigiendo a <a href="${siteUrl}/#novedades">LUMITEC</a>...</p>
</body>
</html>`);
}
