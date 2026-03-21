const BASE = {
  norte: {
    nombre: 'El Norte Seguros', facturacion: 'cuatrimestral',
    planes: {
      'D':  { cubre: ['Daños por accidente','Robo/Hurto e Incendio Total y Parcial','Inundación','Granizo','Cristales y Cerraduras','Responsabilidad Civil','Grúa SOS'], no_cubre: [], todo_riesgo: true },
      'C':  { cubre: ['Robo/Hurto e Incendio Total y Parcial','Destrucción Total por Accidente','Granizo','Responsabilidad Civil','Grúa SOS'], no_cubre: ['Daños por accidente'], todo_riesgo: false },
      'C1': { cubre: ['Robo/Hurto e Incendio Total y Parcial','Granizo','Responsabilidad Civil','Grúa SOS'], no_cubre: ['Daños por accidente','Destrucción Total'], todo_riesgo: false },
      'B':  { cubre: ['Robo/Hurto e Incendio Total','Destrucción Total por Accidente','Responsabilidad Civil','Grúa SOS'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
      'B2': { cubre: ['Robo/Hurto e Incendio Total y Parcial','Granizo','Responsabilidad Civil','Grúa SOS'], no_cubre: ['Robo parcial','Daños por accidente'], todo_riesgo: false },
      'B1': { cubre: ['Robo/Hurto e Incendio Total','Responsabilidad Civil','Grúa SOS'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
      'A':  { cubre: ['Responsabilidad Civil por daños a terceros'], no_cubre: ['Robo','Incendio propio','Daños por accidente','Granizo'], todo_riesgo: false, solo_tarjeta_credito: true }
    }
  },
  fedpat: {
    nombre: 'Federación Patronal', facturacion: 'semestral',
    planes: {
      'TD3': { cubre: ['Daños por accidente','Robo/Hurto e Incendio Total y Parcial','Destrucción Total','Responsabilidad Civil','Grúa incluida','Cristales y Cerraduras','Asistencia en viaje'], no_cubre: ['Granizo'], todo_riesgo: true },
      'CF':  { cubre: ['Robo/Hurto e Incendio Total y Parcial','Destrucción Total por Accidente','Responsabilidad Civil','Grúa incluida','Cristales y Cerraduras'], no_cubre: ['Daños por accidente','Granizo'], todo_riesgo: false },
      'C':   { cubre: ['Robo/Hurto e Incendio Total y Parcial','Destrucción Total','Responsabilidad Civil','Grúa incluida'], no_cubre: ['Daños por accidente','Granizo'], todo_riesgo: false },
      'C1':  { cubre: ['Robo/Hurto e Incendio Total y Parcial','Responsabilidad Civil','Grúa incluida'], no_cubre: ['Daños por accidente','Destrucción Total','Granizo'], todo_riesgo: false },
      'B':   { cubre: ['Robo/Hurto e Incendio Total','Destrucción Total','Responsabilidad Civil','Grúa incluida'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
      'B1':  { cubre: ['Robo/Hurto e Incendio Total','Responsabilidad Civil','Grúa incluida'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
      'A4':  { cubre: ['Responsabilidad Civil límite máximo'], no_cubre: ['Robo','Incendio propio','Daños por accidente','Grúa'], todo_riesgo: false, solo_tarjeta_credito: true }
    }
  },
  sancor: {
    nombre: 'Sancor Seguros', facturacion: 'mensual',
    planes: {
      'Max Incendio': { cubre: ['Incendio Total y Parcial','Destrucción Total','Responsabilidad Civil','Asistencia al vehículo'], no_cubre: ['Robo','Daños por accidente','Granizo'], todo_riesgo: false },
      'Max 1':        { cubre: ['Responsabilidad Civil'], no_cubre: ['Robo','Incendio propio','Daños por accidente','Asistencia','Granizo'], todo_riesgo: false },
      'Max 3':        { cubre: ['Robo/Hurto e Incendio Total y Parcial','Destrucción Total','Responsabilidad Civil','Asistencia al vehículo'], no_cubre: ['Daños por accidente','Granizo'], todo_riesgo: false },
      'Max Totales':  { cubre: ['Daños totales por accidente','Robo/Hurto e Incendio Total','Destrucción Total','Responsabilidad Civil','Asistencia al vehículo'], no_cubre: ['Robo parcial','Granizo','Daños parciales'], todo_riesgo: false },
      'Max 6':        { cubre: ['Daños por accidente','Robo/Hurto e Incendio Total y Parcial','Inundación','Granizo','Destrucción Total','Responsabilidad Civil','Asistencia al vehículo'], no_cubre: ['Cristales','Cerraduras'], todo_riesgo: true },
      'Max Premium':  { cubre: ['Daños por accidente','Robo/Hurto e Incendio','Inundación','Granizo','Cristales','Cerraduras','Responsabilidad Civil','Asistencia completa'], no_cubre: [], todo_riesgo: true },
      'Todo Riesgo':  { cubre: ['Daños por accidente','Robo/Hurto e Incendio','Inundación','Granizo','Cristales','Cerraduras','Responsabilidad Civil','Asistencia completa'], no_cubre: [], todo_riesgo: true }
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
    if (accion === 'generar')  return await generarMensaje(req, res, apiKey);
    return res.status(400).end(JSON.stringify({ error: 'Accion no valida' }));
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).end(JSON.stringify({ error: err.message || 'Error interno' }));
  }
}

async function analizarPDFs(req, res, apiKey) {
  const { pdfs } = req.body;
  if (!pdfs || !pdfs.length) return res.status(400).end(JSON.stringify({ error: 'No se recibieron PDFs' }));

  const parts = pdfs.map(pdf => ({
    inlineData: { data: pdf.base64, mimeType: 'application/pdf' }
  }));

  // Prompt mejorado para evitar texto extra
  parts.push({
    text: `Extrae los datos de este seguro. BASE: ${JSON.stringify(BASE)}. Responde EXCLUSIVAMENTE con un objeto JSON. No escribas nada fuera de las llaves. Ejemplo: {"vehiculo": {"descripcion": "..."}, "coberturas": [...]}`
  });

  const geminiBody = {
    contents: [{ parts: parts }],
    generationConfig: { maxOutputTokens: 2000, temperature: 0.1 }
  };

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiBody)
  });

  const geminiData = await geminiRes.json();
  const texto = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Limpiador de JSON más potente (elimina bloques de código Markdown si los hay)
  const cleanJson = texto.replace(/```json/g, '').replace(/```/g, '').trim();
  const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    console.error("Texto recibido de IA:", texto);
    throw new Error('La IA no generó un formato de datos válido.');
  }

  const cotizacion = JSON.parse(jsonMatch[0]);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).end(Buffer.from(JSON.stringify(cotizacion), 'utf8'));
}

async function generarMensaje(req, res, apiKey) {
  const { vehiculo, coberturas, nombreCliente } = req.body;
  const nombre = nombreCliente || 'cliente';
  const companias = [...new Set(coberturas.map(c => c.compania))];
  const hayMultiCompania = companias.length > 1;

  const E = {
    saludo: '👋', auto: '🚗', cotiz: '📋', escudo: '🛡️', estrella: '⭐', check: '✅',
    dinero: '💰', franq: '📌', tarjeta: '💳', banco: '🏦', fecha: '📅', ok: '👍',
    sonrisa: '😊', maletin: '💼', norte: '🔵', fedpat: '🔴', sancor: '🟣',
  };

  const NOMBRE_COMP = { norte: 'El Norte Seguros', fedpat: 'Federación Patronal', sancor: 'Sancor Seguros' };
  const EMOJI_COMP = { norte: E.norte, fedpat: E.fedpat, sancor: E.sancor };

  let msg = '';
  if (!hayMultiCompania) {
    msg += `${E.saludo} *¡Hola ${nombre}!* Te paso la cotización de *${NOMBRE_COMP[companias[0]]}* para tu vehículo:\n\n`;
  } else {
    msg += `${E.saludo} *¡Hola ${nombre}!* Te paso la cotización para tu vehículo:\n\n`;
  }

  msg += `${E.auto} *${vehiculo.descripcion.toUpperCase()}*\n`;
  if (!hayMultiCompania && coberturas[0]?.numero_cotizacion) {
    msg += `${E.cotiz} *Cotización N° ${coberturas[0].numero_cotizacion}*\n`;
  }
  msg += '\n';

  for (const comp of companias) {
    const cobsDeComp = coberturas.filter(c => c.compania === comp);
    if (hayMultiCompania) {
      msg += `${EMOJI_COMP[comp]} *${NOMBRE_COMP[comp].toUpperCase()}*\n`;
      if (cobsDeComp[0]?.numero_cotizacion) msg += `${E.cotiz} *Cotización N° ${cobsDeComp[0].numero_cotizacion}*\n`;
      msg += '\n';
    }

    for (const [idx, cob] of cobsDeComp.entries()) {
      const esRecomendado = cob.todo_riesgo === true;
      const titulo = (cobsDeComp.length === 1) ? 
        (esRecomendado ? `${cob.nombre} — RECOMENDADO` : cob.nombre) :
        (esRecomendado ? `Opción ${idx + 1} — ${cob.nombre} — RECOMENDADO` : `Opción ${idx + 1} — ${cob.nombre}`);

      msg += `${esRecomendado ? E.estrella : E.escudo} *${titulo}*\n`;
      const itemsCubre = [...(cob.cubre || [])];
      if (cob.grua_km) itemsCubre.push(`🔧 Asistencia con grúa ${cob.grua_km === 'incluida' ? '' : cob.grua_km}`);
      msg += `${E.check} ${itemsCubre.join(' + ')}\n`;

      // AJUSTE AUTOMÁTICO: No mostrar para Plan A
      if (cob.ajuste_automatico && !['A', 'A4', 'Max 1'].includes(cob.codigo)) {
        msg += `📈 *Suma asegurada con ajuste automático*\n`;
      }

      if (cob.franquicia_valor) {
        msg += `${E.franq} *Franquicia ${cob.franquicia_tipo === 'fija' ? 'fija' : ''}: ${cob.franquicia_valor}${cob.franquicia_tipo === 'porcentaje' ? ' de la suma' : ''}*\n`;
      }

      msg += buildPrecioLinea(cob, E);
      msg += '\n';
      if (comp === 'fedpat' && !cob.solo_tarjeta_credito) msg += buildBeneficiosFedpat(cob.codigo, E);
    }
    if (hayMultiCompania) msg += '---\n\n';
    msg += buildBloqueDA(comp, cobsDeComp, E);
  }

  msg += `${E.fecha} *Vigencia ${companias[0] === 'norte' ? '4 meses' : 'anual'}*\n`;
  msg += `*¿Tenés alguna duda o consulta? ¡Quedo atento!* ${E.sonrisa}${E.ok}\n\n`;
  msg += `${E.maletin} *Christian Sanchez*\n_Tu Asesor de Seguros_`;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).end(Buffer.from(JSON.stringify({ mensaje: msg }), 'utf8'));
}

function buildPrecioLinea(cob, E) {
  const comp = cob.compania;
  const cuatri = formatPrecio(cob.precio_cuatrimestral);
  const semest = formatPrecio(cob.precio_semestral);
  const contado = formatPrecio(cob.precio_contado);

  if (cob.solo_tarjeta_credito) {
    let l = contado ? `${E.dinero} *Contado: ${contado}*\n` : '';
    const cuotas = comp === 'norte' ? `4 cuotas de ${cuatri}` : `6 cuotas de ${semest}`;
    return l + `${E.tarjeta} *${cuotas} — solo mediante Débito Automático con Tarjeta de Crédito*\n`;
  }

  if (comp === 'norte') return cuatri ? `${E.dinero} *4 cuotas de ${cuatri}*\n` : '';
  if (comp === 'fedpat') return semest ? `${E.dinero} *6 cuotas de ${semest}*\n` : '';
  return formatPrecio(cob.precio_mensual) ? `${E.dinero} *${formatPrecio(cob.precio_mensual)}/mes*\n` : '';
}

function formatPrecio(v) { 
  if (!v) return null; 
  const n = Math.ceil(parseFloat(v.toString().replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')));
  return isNaN(n) ? v : '$' + n.toLocaleString('es-AR'); 
}

function buildBeneficiosFedpat(c, E) {
  const f = ['CF', 'TD3'].includes(c);
  return `🎁 *Beneficio Exclusivo FedPat:*\n🚑 Asistencia en viaje\n🩺 Accidentes personales ${f?'conductor y asegurado':'conductor'}\n${f?'💥 Cristales y cerraduras\n':''}📋 Gestoría\n⚖️ Asesoramiento legal\n\n`;
}

function buildBloqueDA(comp, cobs, E) {
  if (cobs.every(c => c.solo_tarjeta_credito)) return '';
  return `${E.tarjeta} *Tarjeta* / ${E.banco} *CBU — Débito automático: siempre al día${comp==='norte'?' y 5% de descuento':''}*\n\n`;
}
