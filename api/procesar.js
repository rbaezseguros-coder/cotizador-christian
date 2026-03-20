const BASE = {
  norte: {
    nombre: 'El Norte Seguros', facturacion: 'cuatrimestral',
    planes: {
      'D':  { cubre: ['Daño propio por accidente','Robo total y parcial','Incendio total y parcial','Granizo','Responsabilidad civil','Grua SOS 300km'], no_cubre: [] },
      'C':  { cubre: ['Robo total y parcial','Incendio total y parcial','Destruccion total por accidente','Granizo','Responsabilidad civil','Grua SOS 300km'], no_cubre: ['Daño propio por accidente'] },
      'C1': { cubre: ['Robo total y parcial','Incendio total y parcial','Granizo','Responsabilidad civil','Grua SOS 300km'], no_cubre: ['Daño propio','Destruccion total'] },
      'B':  { cubre: ['Robo total','Incendio total','Destruccion total por accidente','Responsabilidad civil','Grua SOS 300km'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'B2': { cubre: ['Robo total','Incendio total y parcial','Granizo','Responsabilidad civil','Grua SOS 300km'], no_cubre: ['Robo parcial','Daño propio'] },
      'B1': { cubre: ['Robo total','Incendio total','Responsabilidad civil','Grua SOS 300km'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'A':  { cubre: ['Responsabilidad civil por daños a terceros'], no_cubre: ['Robo','Incendio propio','Daño propio','Granizo'] },
    }
  },
  fedpat: {
    nombre: 'Federacion Patronal', facturacion: 'semestral',
    planes: {
      'TD3': { cubre: ['Daño propio por accidente con franquicia','Robo total y parcial','Incendio total y parcial','Destruccion total','Responsabilidad civil','Grua incluida','Cristales y cerraduras','Asistencia en viaje'], no_cubre: ['Granizo'] },
      'CF':  { cubre: ['Robo total y parcial','Incendio total y parcial','Destruccion total por accidente','Responsabilidad civil','Grua incluida','Cristales y cerraduras'], no_cubre: ['Daño propio por accidente','Granizo'] },
      'C':   { cubre: ['Robo total y parcial','Incendio total y parcial','Destruccion total','Responsabilidad civil','Grua incluida'], no_cubre: ['Daño propio','Granizo'] },
      'C1':  { cubre: ['Robo total y parcial','Incendio total y parcial','Responsabilidad civil','Grua incluida'], no_cubre: ['Daño propio','Destruccion total','Granizo'] },
      'B':   { cubre: ['Robo total','Incendio total','Destruccion total','Responsabilidad civil','Grua incluida'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'B1':  { cubre: ['Robo total','Incendio total','Responsabilidad civil','Grua incluida'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'A4':  { cubre: ['Responsabilidad civil limite maximo'], no_cubre: ['Robo','Incendio propio','Daño propio','Grua'] },
    }
  },
  sancor: {
    nombre: 'Sancor Seguros', facturacion: 'mensual',
    planes: {
      'Max Incendio': { cubre: ['Incendio total y parcial','Destruccion total 80%','Responsabilidad civil','Asistencia al vehiculo'], no_cubre: ['Robo','Daño propio','Granizo'] },
      'Max 1':        { cubre: ['Responsabilidad civil'], no_cubre: ['Robo','Incendio propio','Daño propio','Asistencia','Granizo'] },
      'Max 3':        { cubre: ['Robo total y parcial','Incendio total y parcial','Destruccion total','Responsabilidad civil','Asistencia al vehiculo','Cobertura de ruedas'], no_cubre: ['Daño propio por accidente','Granizo'] },
      'Max Totales':  { cubre: ['Daño propio total por accidente','Robo total','Incendio total','Destruccion total','Responsabilidad civil','Asistencia al vehiculo'], no_cubre: ['Robo parcial','Granizo','Daño parcial propio'] },
      'Max 6':        { cubre: ['Daño propio por accidente','Robo total y parcial','Incendio total y parcial','Granizo sin deducible','Inundacion','Destruccion total','Responsabilidad civil','Asistencia al vehiculo','Cobertura de ruedas'], no_cubre: ['Cristales','Cerraduras'] },
      'Max Premium':  { cubre: ['Daño propio','Robo total y parcial','Incendio','Granizo','Cristales sin deducible','Cerraduras','Gestoria','Accidentes personales','Responsabilidad civil','Asistencia completa'], no_cubre: [] },
      'Todo Riesgo':  { cubre: ['Daño propio con franquicia deducible','Robo total y parcial','Incendio','Granizo','Cristales','Cerraduras','Gestoria','Responsabilidad civil','Asistencia completa'], no_cubre: [] },
    }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end(JSON.stringify({ error: 'Metodo no permitido' }));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).end(JSON.stringify({ error: 'Falta GEMINI_API_KEY' }));

  const { accion } = req.body;

  try {
    if (accion === 'analizar') return await analizarPDFs(req, res, apiKey);
    if (accion === 'generar') return await generarMensaje(req, res, apiKey);
    return res.status(400).end(JSON.stringify({ error: 'Accion no valida' }));
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).end(JSON.stringify({ error: err.message || 'Error interno' }));
  }
}

async function analizarPDFs(req, res, apiKey) {
  const { pdfs } = req.body;
  if (!pdfs || !pdfs.length) return res.status(400).end(JSON.stringify({ error: 'No se recibieron PDFs' }));

  const parts = [];
  for (const pdf of pdfs) {
    parts.push({ inlineData: { data: pdf.base64, mimeType: 'application/pdf' } });
  }

  parts.push({ text: `Analiza los ${pdfs.length} PDFs de cotizaciones de seguros argentinos.

IDENTIFICACION DE COMPANIA:
- "EL NORTE" o "elnorte.com.ar" corresponde a compania: "norte"
- "FEDERACION PATRONAL" o "fedpat.com.ar" corresponde a compania: "fedpat"
- "SANCOR SEGUROS" o "sancorseguros.com.ar" corresponde a compania: "sancor"

BASE DE CONOCIMIENTO:
${JSON.stringify(BASE, null, 2)}

Devuelve SOLO un JSON valido sin markdown ni backticks:
{
  "vehiculo": {
    "descripcion": "Marca Modelo Anio",
    "patente": "AAA111 o null",
    "valor": "$XX.XXX.XXX",
    "ubicacion": "Ciudad"
  },
  "coberturas": [
    {
      "id": "norte_D_1",
      "compania": "norte",
      "codigo": "D",
      "nombre": "nombre completo del plan",
      "franquicia": "Franquicia 6% o null",
      "precio_mensual": "$xxx.xxx",
      "precio_semestral": "$xxx.xxx o null",
      "precio_cuatrimestral": "$xxx.xxx o null",
      "precio_contado": "$xxx.xxx o null",
      "cubre": ["item1", "item2"],
      "no_cubre": ["item1"]
    }
  ]
}

REGLAS DE PRECIOS:
- El Norte: precio_cuatrimestral es el monto de cada cuota, precio_mensual es el mismo valor, precio_contado es el precio contado
- FedPat: precio_semestral es el total del premio, precio_mensual es total dividido 6, precio_contado es el contado indicado
- Sancor: precio_mensual es el importe mensual, el resto null
- Si hay varias TD con distintas franquicias crear una entrada por cada una con id unico` });

  const geminiBody = {
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: 2000, temperature: 0.1, thinkingConfig: { thinkingBudget: 0 } }
  };

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error de Gemini (' + geminiRes.status + ')');
  }

  const geminiData = await geminiRes.json();
  const texto = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!texto) throw new Error('Gemini no devolvio texto.');

  const jsonMatch = texto.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No se encontro JSON en la respuesta.');
  const cotizacion = JSON.parse(jsonMatch[0]);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).end(Buffer.from(JSON.stringify(cotizacion), 'utf8'));
}

async function generarMensaje(req, res, apiKey) {
  const { vehiculo, coberturas, esComparativa, hayMultiCompania, nombreCliente } = req.body;

  const nombre = nombreCliente || 'cliente';

  // Pedimos a Gemini SOLO el contenido en JSON — sin emojis ni formato
  const prompt = `Sos un asistente para productores de seguros argentinos.

Genera el contenido de un mensaje de WhatsApp para esta cotizacion.
Devuelve SOLO un JSON sin markdown, sin emojis, sin texto fuera del JSON:

{
  "saludo": "Hola ${nombre}! Te paso la cotizacion para tu vehiculo",
  "coberturas_formateadas": [
    {
      "titulo": "NOMBRE COBERTURA - COMPANIA EN MAYUSCULAS",
      "precio": "Precio mensual: $XXX.XXX",
      "franquicia_explicacion": "descripcion simple de la franquicia si aplica, sino el string null",
      "items_cubre": ["Daño propio por accidente", "Robo total y parcial"],
      "facturacion": "Facturacion cuatrimestral (cada 4 meses)",
      "franquicia_valor": "$XXX.XXX o el string null",
      "descuento": "5% de descuento pagando con debito automatico (tarjeta o CBU) o el string null"
    }
  ],
  "comparativa": "frase breve comparando diferencias si hay mas de una opcion, sino el string null",
  "cierre": "Quedo atento a cualquier duda"
}

Vehiculo: ${vehiculo.descripcion}${vehiculo.patente ? ', patente ' + vehiculo.patente : ''}
Coberturas: ${JSON.stringify(coberturas)}
Es comparativa: ${esComparativa}
Multi compania: ${hayMultiCompania}

IMPORTANTE: Solo JSON puro. Sin emojis. Sin markdown. Sin texto fuera del JSON.`;

  const geminiBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1500, temperature: 0.2, thinkingConfig: { thinkingBudget: 0 } }
  };

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error de Gemini (' + geminiRes.status + ')');
  }

  const geminiData = await geminiRes.json();
  const texto = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!texto) throw new Error('Gemini no devolvio respuesta.');

  const jsonMatch = texto.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini no devolvio JSON valido.');
  const datos = JSON.parse(jsonMatch[0]);

  // ── Armar mensaje con emojis definidos como escape sequences Unicode ──
  // Usando \uXXXX que Node.js interpreta nativamente como UTF-8
  const e_saludo   = '\uD83D\uDE0A'; // 😊
  const e_auto     = '\uD83D\uDE97'; // 🚗
  const e_escudo   = '\uD83D\uDEE1'; // 🛡
  const e_dinero   = '\uD83D\uDCB0'; // 💰
  const e_franq    = '\uD83D\uDCCC'; // 📌
  const e_estrella = '\u2728';       // ✨
  const e_check    = '\u2714';       // ✔
  const e_datos    = '\uD83D\uDCE3'; // 📣
  const e_punto    = '\uD83D\uDD38'; // 🔸
  const e_tarjeta  = '\uD83D\uDCB3'; // 💳
  const e_ok       = '\uD83D\uDC4D'; // 👍
  const e_versus   = '\u2696';       // ⚖

  let msg = '';
  msg += e_saludo + ' ' + (datos.saludo || ('Hola ' + nombre + '! Te paso la cotizacion')) + '\n';
  msg += e_auto + ' ' + vehiculo.descripcion;
  if (vehiculo.patente) msg += ' | Patente: ' + vehiculo.patente;
  msg += '\n\n';

  for (const cob of (datos.coberturas_formateadas || [])) {
    msg += e_escudo + ' *' + (cob.titulo || '') + '*\n';
    msg += e_dinero + ' ' + (cob.precio || '') + '\n';

    if (cob.franquicia_explicacion && cob.franquicia_explicacion !== 'null') {
      msg += e_franq + ' ' + cob.franquicia_explicacion + '\n';
    }

    msg += e_estrella + ' Que incluye:\n';
    for (const item of (cob.items_cubre || [])) {
      msg += e_check + ' ' + item + '\n';
    }

    msg += e_datos + ' Datos importantes:\n';
    msg += e_punto + ' ' + (cob.facturacion || '') + '\n';

    if (cob.franquicia_valor && cob.franquicia_valor !== 'null') {
      msg += e_punto + ' Franquicia fija: ' + cob.franquicia_valor + '\n';
    }
    if (cob.descuento && cob.descuento !== 'null') {
      msg += e_tarjeta + ' ' + cob.descuento + '\n';
    }
    msg += '\n';
  }

  if (datos.comparativa && datos.comparativa !== 'null') {
    msg += e_versus + ' ' + datos.comparativa + '\n\n';
  }

  msg += e_ok + ' ' + (datos.cierre || 'Quedo atento a cualquier duda');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).end(Buffer.from(JSON.stringify({ mensaje: msg }), 'utf8'));
}
