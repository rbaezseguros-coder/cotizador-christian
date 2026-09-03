// api/share-target.js
//
// Recibe el POST que dispara Android cuando el usuario toca
// "Compartir → Cotizador Christian" sobre uno o más PDFs.
// Reusa /api/procesar (accion: 'analizar') para no duplicar la
// lógica de extracción, y devuelve una páginita puente que guarda
// el resultado en sessionStorage y redirige al cotizador, que lo
// detecta y salta directo al Paso 2 (Elegir coberturas).
//
// Requiere la dependencia "busboy" (ver package.json).

import Busboy from 'busboy';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  try {
    const { pdfs } = await parseMultipart(req);

    if (!pdfs.length) {
      return responderError(res, 'No se recibió ningún PDF. Probá compartir de nuevo.');
    }

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];

    const analizarRes = await fetch(`${proto}://${host}/api/procesar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'analizar', pdfs })
    });

    const data = await analizarRes.json();

    if (!analizarRes.ok) {
      return responderError(res, data.error || 'No se pudo analizar el PDF compartido.');
    }

    return responderOk(res, data);
  } catch (err) {
    console.error('Error en share-target:', err);
    return responderError(res, err.message || 'Error procesando el archivo compartido.');
  }
}

// ─────────────────────────────────────────────
// Parsear el multipart/form-data que manda Android
// ─────────────────────────────────────────────
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const pdfs = [];

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      if (mimeType !== 'application/pdf') {
        file.resume(); // descartar archivos que no sean PDF
        return;
      }
      const chunks = [];
      file.on('data', (d) => chunks.push(d));
      file.on('end', () => {
        pdfs.push({ nombre: filename || 'cotizacion.pdf', base64: Buffer.concat(chunks).toString('base64') });
      });
    });

    busboy.on('close', () => resolve({ pdfs }));
    busboy.on('error', reject);

    req.pipe(busboy);
  });
}

// ─────────────────────────────────────────────
// Página puente: guarda el resultado y redirige al cotizador
// ─────────────────────────────────────────────
function responderOk(res, data) {
  // Escapamos "<" para que el JSON no pueda cerrar el <script> (XSS-safe),
  // y lo volvemos a envolver como literal JS válido con JSON.stringify.
  const jsonSeguro = JSON.stringify(data).replace(/</g, '\\u003c');

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Procesando cotización...</title></head>
<body style="font-family:sans-serif;text-align:center;padding-top:80px;color:#1a1714;background:#f5f3ef;">
<div style="font-size:44px;">✨</div>
<p>Cotización recibida, abriendo el cotizador...</p>
<script>
  try {
    sessionStorage.setItem('cotizacion_pendiente', ${JSON.stringify(jsonSeguro)});
  } catch (e) {}
  window.location.replace('/');
</script>
</body></html>`);
}

function responderError(res, mensaje) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Error</title></head>
<body style="font-family:sans-serif;text-align:center;padding-top:80px;color:#c8401a;background:#f5f3ef;">
<div style="font-size:44px;">⚠️</div>
<p>${escapeHtml(mensaje)}</p>
<p style="margin-top:20px;"><a href="/" style="color:#1a5fa8;">Volver al cotizador</a></p>
</body></html>`);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
