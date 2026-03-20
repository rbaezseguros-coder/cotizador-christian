const BASE = {
  norte: {
    nombre: 'El Norte Seguros', facturacion: 'cuatrimestral',
    planes: {
      'D':  { cubre: ['Daño propio por accidente','Robo total y parcial','Incendio total y parcial','Granizo','Responsabilidad civil','Grúa SOS 300km'], no_cubre: [] },
      'C':  { cubre: ['Robo total y parcial','Incendio total y parcial','Destrucción total por accidente','Granizo','Responsabilidad civil','Grúa SOS 300km'], no_cubre: ['Daño propio por accidente'] },
      'C1': { cubre: ['Robo total y parcial','Incendio total y parcial','Granizo','Responsabilidad civil','Grúa SOS 300km'], no_cubre: ['Daño propio','Destrucción total'] },
      'B':  { cubre: ['Robo total','Incendio total','Destrucción total por accidente','Responsabilidad civil','Grúa SOS 300km'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'B2': { cubre: ['Robo total','Incendio total y parcial','Granizo','Responsabilidad civil','Grúa SOS 300km'], no_cubre: ['Robo parcial','Daño propio'] },
      'B1': { cubre: ['Robo total','Incendio total','Responsabilidad civil','Grúa SOS 300km'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'A':  { cubre: ['Responsabilidad civil por daños a terceros'], no_cubre: ['Robo','Incendio propio','Daño propio','Granizo'] },
    }
  },
  fedpat: {
    nombre: 'Federación Patronal', facturacion: 'semestral',
    planes: {
      'TD3': { cubre: ['Daño propio por accidente (con franquicia)','Robo total y parcial','Incendio total y parcial','Destrucción total','Responsabilidad civil','Grúa incluida','Cristales y cerraduras','Asistencia en viaje'], no_cubre: ['Granizo'] },
      'CF':  { cubre: ['Robo total y parcial','Incendio total y parcial','Destrucción total por accidente','Responsabilidad civil','Grúa incluida','Cristales y cerraduras'], no_cubre: ['Daño propio por accidente','Granizo'] },
      'C':   { cubre: ['Robo total y parcial','Incendio total y parcial','Destrucción total','Responsabilidad civil','Grúa incluida'], no_cubre: ['Daño propio','Granizo'] },
      'C1':  { cubre: ['Robo total y parcial','Incendio total y parcial','Responsabilidad civil','Grúa incluida'], no_cubre: ['Daño propio','Destrucción total','Granizo'] },
      'B':   { cubre: ['Robo total','Incendio total','Destrucción total','Responsabilidad civil','Grúa incluida'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'B1':  { cubre: ['Robo total','Incendio total','Responsabilidad civil','Grúa incluida'], no_cubre: ['Robo parcial','Granizo','Daño propio'] },
      'A4':  { cubre: ['Responsabilidad civil — límite máximo'], no_cubre: ['Robo','Incendio propio','Daño propio','Grúa'] },
    }
  },
  sancor: {
    nombre: 'Sancor Seguros', facturacion: 'mensual',
    planes: {
      'Max Incendio': { cubre: ['Incendio total y parcial','Destrucción total 80%','Responsabilidad civil','Asistencia al vehículo'], no_cubre: ['Robo','Daño propio','Granizo'] },
      'Max 1':        { cubre: ['Responsabilidad civil'], no_cubre: ['Robo','Incendio propio','Daño propio','Asistencia','Granizo'] },
      'Max 3':        { cubre: ['Robo total y parcial','Incendio total y parcial','Destrucción total','Responsabilidad civil','Asistencia al vehículo','Cobertura de ruedas'], no_cubre: ['Daño propio por accidente','Granizo'] },
      'Max Totales':  { cubre: ['Daño propio total por accidente','Robo total','Incendio total','Destrucción total','Responsabilidad civil','Asistencia al vehículo'], no_cubre: ['Robo parcial','Granizo','Daño parcial propio'] },
      'Max 6':        { cubre: ['Daño propio por accidente','Robo total y parcial','Incendio total y parcial','Granizo sin deducible','Inundación','Destrucción total','Responsabilidad civil','Asistencia al vehículo','Cobertura de ruedas'], no_cubre: ['Cristales','Cerraduras'] },
      'Max Premium':  { cubre: ['Daño propio','Robo total y parcial','Incendio','Granizo','Cristales sin deducible','Cerraduras','Gestoría','Accidentes personales','Responsabilidad civil','Asistencia completa'], no_cubre: [] },
      'Todo Riesgo':  { cubre: ['Daño propio (con franquicia deducible)','Robo total y parcial','Incendio','Granizo','Cristales','Cerraduras','Gestoría','Responsabilidad civil','Asistencia completa'], no_cubre: [] },
    }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Falta GEMINI_API_KEY en variables de entorno' });

  const { accion } = req.body;

  try {
    if (accion === 'analizar') {
      return await analizarPDFs(req, res, apiKey);
    } else if (accion === 'generar') {
      return await generarMensaje(req, res, apiKey);
    } else {
      return res.status(400).json({ error: 'Acción no válida' });
    }
  } catch (err) {
    console.error('Error en handler:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}

async function analizarPDFs(req, res, apiKey) {
  const { pdfs } = req.body;
  if (!pdfs || !pdfs.length) return res.status(400).json({ error: 'No se recibieron PDFs' });

  const parts = [];

  // Agregar cada PDF
  for (const pdf of pdfs) {
    parts.push({
      inlineData: { data: pdf.base64, mimeType: 'application/pdf' }
    });
  }

  // Agregar el prompt con la base de conocimiento
  parts.push({
    text: `Analizá los ${pdfs.length} PDFs adjuntos de cotizaciones de seguros argentinos.

IDENTIFICACIÓN DE COMPAÑÍAS:
- Si dice "EL NORTE" o "elnorte.com.ar" → compania: "norte"
- Si dice "FEDERACION PATRONAL" o "fedpat.com.ar" → compania: "fedpat"
- Si dice "SANCOR SEGUROS" o "sancorseguros.com.ar" → compania: "sancor"

BASE DE CONOCIMIENTO DE PLANES:
${JSON.stringify(BASE, null, 2)}

Devolvé SOLO un JSON válido sin markdown ni backticks con esta estructura exacta:
{
  "vehiculo": {
    "descripcion": "Marca Modelo Año",
    "patente": "AAA111 o null",
    "valor": "$XX.XXX.XXX",
    "ubicacion": "Ciudad"
  },
  "coberturas": [
    {
      "id": "norte_D_1",
      "compania": "norte|fedpat|sancor",
      "codigo": "D|TD3|Max 6|etc",
      "nombre": "nombre completo del plan",
      "franquicia": "ej: Franquicia 6% o null",
      "precio_mensual": "$xxx.xxx",
      "precio_semestral": "$xxx.xxx o null",
      "precio_cuatrimestral": "$xxx.xxx o null",
      "precio_contado": "$xxx.xxx o null",
      "cubre": ["coberturas en lenguaje simple"],
      "no_cubre": ["qué NO cubre importante"]
    }
  ]
}

REGLAS DE PRECIOS:
- El Norte: precio_cuatrimestral = monto de cada cuota (ej $131.258), precio_mensual = mismo valor, precio_contado = precio contado
- FedPat: precio_semestral = total premio, precio_mensual = total/6 redondeado, precio_contado = contado indicado
- Sancor: precio_mensual = importe mensual indicado, el resto null
- Si hay varias TD con distintas franquicias → una entrada por cada una con id único (norte_D_1, norte_D_2, etc)
- Completá cubre/no_cubre desde la base de conocimiento según compañía y código de plan`
  });

  const geminiBody = {
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: 2000, temperature: 0.1 }
  };

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error de Gemini (' + geminiRes.status + ')');
  }

  const geminiData = await geminiRes.json();
  const texto = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!texto) throw new Error('Gemini no devolvió texto. Verificá la API key y el billing.');

  const limpio = texto.replace(/```json|```/g, '').trim();
  const cotizacion = JSON.parse(limpio);

  return res.status(200).json(cotizacion);
}

async function generarMensaje(req, res, apiKey) {
  const { vehiculo, coberturas, esComparativa, hayMultiCompania, tipoPrecio } = req.body;

  const prompt = `Sos Christian Sanchez, Productor Asesor de Seguros en Resistencia, Chaco.

Generá un mensaje de WhatsApp ${esComparativa ? 'comparativo' : 'de presentación'} para el vehículo: ${vehiculo.descripcion}${vehiculo.patente ? ', patente ' + vehiculo.patente : ''}.

${esComparativa ? 'Coberturas a comparar' : 'Cobertura a presentar'}:
${JSON.stringify(coberturas, null, 2)}

Instrucciones:
- Usá emojis (🚗 🛡️ ✅ ❌ 💰 💡 ⚠️)
- Lenguaje simple, que entienda cualquier persona
${esComparativa ? '- Marcá diferencias clave con ✅ y ❌' : ''}
${hayMultiCompania ? '- Mencioná las diferencias de facturación entre compañías (ej: uno cobra por mes, otro cada 6 meses) — esto es importante para el cliente' : ''}
- Si hay Todo Riesgo con franquicia, explicá en 1 frase qué significa la franquicia en términos simples
- Si hay descuento de El Norte por débito automático, destacalo
- Cerrá con frase cálida invitando a consultar cualquier duda
- Sin firma formal al final, sin "Atentamente"
- Máximo 40 líneas, fácil de leer en el celular`;

  const geminiBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
  };

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error de Gemini (' + geminiRes.status + ')');
  }

  const geminiData = await geminiRes.json();
  const mensaje = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!mensaje) throw new Error('Gemini no devolvió el mensaje.');

  return res.status(200).json({ mensaje });
}
