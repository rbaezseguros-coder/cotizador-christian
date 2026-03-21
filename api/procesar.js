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
      'A':  { cubre: ['Responsabilidad Civil por daños a terceros'], no_cubre: ['Robo','Incendio propio','Daños por accidente','Granizo'], todo_riesgo: false, solo_tarjeta_credito: true },
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
      'A4':  { cubre: ['Responsabilidad Civil límite máximo'], no_cubre: ['Robo','Incendio propio','Daños por accidente','Grúa'], todo_riesgo: false, solo_tarjeta_credito: true },
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
      'Todo Riesgo':  { cubre: ['Daños por accidente','Robo/Hurto e Incendio','Inundación','Granizo','Cristales','Cerraduras','Responsabilidad Civil','Asistencia completa'], no_cubre: [], todo_riesgo: true },
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

// ─────────────────────────────────────────────
// ANALIZAR PDFs
// ─────────────────────────────────────────────
async function analizarPDFs(req, res, apiKey) {
  const { pdfs } = req.body;
  if (!pdfs || !pdfs.length) return res.status(400).end(JSON.stringify({ error: 'No se recibieron PDFs' }));

  const parts = [];
  for (const pdf of pdfs) {
    parts.push({ inlineData: { data: pdf.base64, mimeType: 'application/pdf' } });
  }

  parts.push({ text: `Analiza los ${pdfs.length} PDFs de cotizaciones de seguros argentinos.

IDENTIFICACION DE COMPANIA:
- "EL NORTE" o "elnorte.com.ar" → compania: "norte"
- "FEDERACION PATRONAL" o "fedpat.com.ar" → compania: "fedpat"
- "SANCOR SEGUROS" o "sancorseguros.com.ar" → compania: "sancor"

BASE DE CONOCIMIENTO DE PLANES:
${JSON.stringify(BASE, null, 2)}

Devuelve SOLO un JSON valido sin markdown ni backticks:
{
  "vehiculo": {
    "descripcion": "Marca Modelo Anio",
    "patente": "AAA111 o null",
    "valor": "$XX.XXX.XXX",
    "ubicacion": "Ciudad"
  },
  "numero_cotizacion": "3.285.107 o null",
  "coberturas": [
    {
      "id": "norte_D_1",
      "compania": "norte",
      "codigo": "D",
      "nombre": "nombre completo del plan",
      "todo_riesgo": true,
      "solo_tarjeta_credito": false,
      "franquicia_tipo": "fija o porcentaje o null",
      "franquicia_valor": "$700.000 o 10% o null",
      "ajuste_automatico": true,
      "grua_km": "300km o null",
      "precio_cuatrimestral": "$xxx.xxx o null",
      "precio_semestral": "$xxx.xxx o null",
      "precio_mensual": "$xxx.xxx o null",
      "precio_contado": "$xxx.xxx o null",
      "cubre": ["item1", "item2"],
      "no_cubre": ["item1"]
    }
  ]
}

REGLAS DE PRECIOS:

EL NORTE (facturacion cuatrimestral):
- precio_cuatrimestral = valor de CADA CUOTA MENSUAL
- precio_contado = total de la factura cuatrimestral pagada de una vez
- precio_semestral = null / precio_mensual = null

FEDERACION PATRONAL (facturacion semestral):
- precio_semestral = valor de CADA CUOTA MENSUAL
- precio_contado = total de la factura semestral pagada de una vez
- precio_cuatrimestral = null / precio_mensual = null

SANCOR (facturacion mensual):
- precio_mensual = importe mensual
- precio_contado = null / precio_cuatrimestral = null / precio_semestral = null

REGLAS DE FRANQUICIA:
- La franquicia es el monto que paga el asegurado de su bolsillo en caso de siniestro parcial.
- NO es lo mismo que ajuste automático de suma asegurada. Son conceptos distintos.
- Solo tienen franquicia real los planes TODO RIESGO: Norte D, FedPat TD3, Sancor Max 6 / Max Premium / Todo Riesgo.
- El Norte TD: franquicia_tipo = "fija", franquicia_valor = monto fijo en pesos (ej: "$700.000")
- FedPat TD3 y Sancor TR: franquicia_tipo = "porcentaje", franquicia_valor = porcentaje de la suma asegurada (ej: "10%")
- Para TODOS los demás planes (B, B1, B2, C, C1, CF, A, A4, Max 1, Max 3, Max Totales, Max Incendio): franquicia_tipo = null, franquicia_valor = null

REGLAS DE COBERTURAS:
- El campo "nombre" debe ser el nombre comercial limpio del plan según la BASE DE CONOCIMIENTO, NO el texto literal del PDF (ej: "Plan B" no "PLAN B RC.PERD TOTAL Accid. Inc. y Robo").
- El campo "cubre" debe contener EXACTAMENTE los items definidos en la BASE DE CONOCIMIENTO para ese plan.
- NO agregar coberturas adicionales que aparezcan en el PDF como beneficios generales (asistencia, accidentes personales, gestoría, etc.) — esos se manejan por separado.
- NO duplicar coberturas ni agregar variantes.
- La grúa NO va en el array "cubre" — va en el campo "grua_km" con solo los kilómetros o la palabra "incluida" si no especifica km (ej: "300km", "incluida").
- ajuste_automatico = true si el PDF menciona "ajuste automático", "ajuste de suma asegurada", "actualización automática" o similar
- ajuste_automatico = false si no lo menciona
- Aplica a las tres compañías

REGLAS TODO RIESGO:
- todo_riesgo = true: Norte D, FedPat TD3, Sancor Max 6 / Max Premium / Todo Riesgo
- todo_riesgo = false: resto

REGLAS SOLO TARJETA CREDITO:
- solo_tarjeta_credito = true: Norte A, FedPat A4
- solo_tarjeta_credito = false: resto

Si hay varias TD con distintas franquicias crear una entrada por cada una con id unico.` });

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

// ─────────────────────────────────────────────
// GENERAR MENSAJE WHATSAPP — armado en backend sin Gemini
// ─────────────────────────────────────────────
async function generarMensaje(req, res, apiKey) {
  const { vehiculo, coberturas, nombreCliente } = req.body;

  const nombre = nombreCliente || 'cliente';
  const companias = [...new Set(coberturas.map(c => c.compania))];
  const hayMultiCompania = companias.length > 1;

  // Emojis como escape sequences Unicode
  const E = {
    saludo:  '\uD83D\uDC4B',  // 👋
    auto:    '\uD83D\uDE97',  // 🚗
    cotiz:   '\uD83D\uDCCB',  // 📋
    escudo:  '\uD83D\uDEE1',  // 🛡️
    estrella:'\u2B50',        // ⭐
    check:   '\u2705',        // ✅
    dinero:  '\uD83D\uDCB0',  // 💰
    franq:   '\uD83D\uDCCC',  // 📌
    tarjeta: '\uD83D\uDCB3',  // 💳
    banco:   '\uD83C\uDFE6',  // 🏦
    fecha:   '\uD83D\uDCC5',  // 📅
    ok:      '\uD83D\uDC4D',  // 👍
    sonrisa: '\uD83D\uDE0A',  // 😊
    maletin: '\uD83D\uDCBC',  // 💼
    norte:   '\uD83D\uDD35',  // 🔵
    fedpat:  '\uD83D\uDD34',  // 🔴
    sancor:  '\uD83D\uDFE3',  // 🟣
  };

  const EMOJI_COMP = { norte: E.norte, fedpat: E.fedpat, sancor: E.sancor };
  const NOMBRE_COMP = { norte: 'El Norte Seguros', fedpat: 'Federación Patronal', sancor: 'Sancor Seguros' };

  // Número de cotización — usar el del vehiculo si viene, o el del primer grupo
  const numeroCotizacion = vehiculo.numero_cotizacion || null;

  let msg = '';

  // ── ENCABEZADO ──
  if (!hayMultiCompania) {
    const comp = companias[0];
    msg += `${E.saludo} *¡Hola ${nombre}!* Te paso la cotización de *${NOMBRE_COMP[comp]}* para tu vehículo:\n\n`;
  } else {
    msg += `${E.saludo} *¡Hola ${nombre}!* Te paso la cotización para tu vehículo:\n\n`;
  }

  msg += `${E.auto} *${vehiculo.descripcion.toUpperCase()}*\n`;
  if (numeroCotizacion && !hayMultiCompania) {
    msg += `${E.cotiz} *Cotización N° ${numeroCotizacion}*\n`;
  }
  msg += '\n';

  // ── COBERTURAS POR COMPAÑÍA ──
  for (const comp of companias) {
    const cobsDeComp = coberturas.filter(c => c.compania === comp);

    if (hayMultiCompania) {
      msg += `${EMOJI_COMP[comp]} *${NOMBRE_COMP[comp].toUpperCase()}*\n`;
      if (numeroCotizacion) msg += `${E.cotiz} *Cotización N° ${numeroCotizacion}*\n`;
      msg += '\n';
    }

    for (const [idx, cob] of cobsDeComp.entries()) {
      const esRecomendado = cob.todo_riesgo === true;
      const esUnica = cobsDeComp.length === 1;
      const numOpcion = idx + 1;

      // Título
      if (esUnica) {
        const titulo = esRecomendado ? `${cob.nombre} — RECOMENDADO` : cob.nombre;
        msg += `${esRecomendado ? E.estrella : E.escudo} *${titulo}*\n`;
      } else {
        const titulo = esRecomendado
          ? `Opción ${numOpcion} — ${cob.nombre} — RECOMENDADO`
          : `Opción ${numOpcion} — ${cob.nombre}`;
        msg += `${esRecomendado ? E.estrella : E.escudo} *${titulo}*\n`;
      }

      // Coberturas en una línea + Grúa
      const itemsCubre = [...(cob.cubre || [])];
      if (cob.grua_km) {
        const kmLabel = cob.grua_km === 'incluida' ? '' : ` ${cob.grua_km}`;
        itemsCubre.push(`\uD83D\uDD27 Asistencia con grúa${kmLabel}`);  // 🔧
      }
      msg += `${E.check} ${itemsCubre.join(' + ')}\n`;

      // Ajuste automático de suma asegurada
      if (cob.ajuste_automatico) {
        msg += `\uD83D\uDCC8 *Suma asegurada con ajuste automático*\n`;  // 📈
      }

      // Franquicia
      if (cob.franquicia_valor) {
        if (cob.franquicia_tipo === 'fija') {
          msg += `${E.franq} *Franquicia fija: ${cob.franquicia_valor}*\n`;
        } else if (cob.franquicia_tipo === 'porcentaje') {
          msg += `${E.franq} *Franquicia: ${cob.franquicia_valor} de la suma asegurada*\n`;
        }
      }

      // Precio
      msg += buildPrecioLinea(cob, E);
      msg += '\n';

      // Beneficios exclusivos FedPat
      if (comp === 'fedpat' && !cob.solo_tarjeta_credito) {
        msg += buildBeneficiosFedpat(cob.codigo, E);
      }
    }

    // Separador entre compañías en comparativa
    if (hayMultiCompania) msg += '---\n\n';

    // Bloque DA al final de cada compañía
    msg += buildBloqueDA(comp, cobsDeComp, E);
  }

  // ── CIERRE ──
  msg += `${E.fecha} *Vigencia anual*\n`;
  msg += `*¿Tenés alguna duda o consulta? ¡Quedo atento!* ${E.sonrisa}${E.ok}\n\n`;
  msg += `${E.maletin} *Christian Sanchez*\n`;
  msg += `_Tu Asesor de Seguros_`;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).end(Buffer.from(JSON.stringify({ mensaje: msg }), 'utf8'));
}

// ─────────────────────────────────────────────
// HELPER — formatear precio con separador de miles
// ─────────────────────────────────────────────
function formatPrecio(valor) {
  if (!valor) return null;
  // Extraer solo dígitos y coma/punto
  const limpio = valor.toString().replace(/[^\d.,]/g, '');
  // Convertir a número, eliminar decimales redondeando hacia arriba
  const num = Math.ceil(parseFloat(limpio.replace(/\./g, '').replace(',', '.')));
  if (isNaN(num)) return valor;
  // Formatear con punto como separador de miles
  return '$' + num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}
function buildPrecioLinea(cob, E) {
  const comp = cob.compania;
  const esTodoRiesgo  = cob.todo_riesgo === true;
  const esSoloTarjeta = cob.solo_tarjeta_credito === true;

  const cuatri  = formatPrecio(cob.precio_cuatrimestral);
  const semest  = formatPrecio(cob.precio_semestral);
  const contado = formatPrecio(cob.precio_contado);
  const mensual = formatPrecio(cob.precio_mensual);

  if (comp === 'norte') {
    if (esSoloTarjeta) {
      let l = '';
      if (contado) l += `${E.dinero} *Contado: ${contado}*\n`;
      if (cuatri)  l += `${E.tarjeta} *4 cuotas de ${cuatri} — solo mediante Débito Automático con Tarjeta de Crédito*\n`;
      return l;
    }
    if (esTodoRiesgo) {
      return cuatri ? `${E.dinero} *4 cuotas de ${cuatri}*\n` : '';
    }
    // Resto Norte: solo cuotas, sin contado
    return cuatri ? `${E.dinero} *4 cuotas de ${cuatri}*\n` : '';
  }

  if (comp === 'fedpat') {
    if (esSoloTarjeta) {
      let l = '';
      if (contado) l += `${E.dinero} *Contado: ${contado}*\n`;
      if (semest)  l += `${E.tarjeta} *6 cuotas de ${semest} — solo mediante Débito Automático con Tarjeta de Crédito*\n`;
      return l;
    }
    if (esTodoRiesgo) {
      return semest ? `${E.dinero} *6 cuotas de ${semest}*\n` : '';
    }
    // Resto FedPat: solo cuotas, sin contado
    return semest ? `${E.dinero} *6 cuotas de ${semest}*\n` : '';
  }

  if (comp === 'sancor') {
    return mensual ? `${E.dinero} *${mensual}/mes*\n` : '';
  }

  return '';
}

// ─────────────────────────────────────────────
// HELPER — beneficios exclusivos FedPat
// ─────────────────────────────────────────────
function buildBeneficiosFedpat(codigo, E) {
  const esCFull = ['CF', 'TD3'].includes(codigo);

  let bloque = `\uD83C\uDF81 *Beneficio Exclusivo FedPat:*\n`;  // 🎁
  bloque += `\uD83D\uDE91 Asistencia en viaje y a las personas\n`;  // 🚑
  bloque += `\uD83E\uDE7A Accidentes personales ${esCFull ? 'conductor y asegurado' : 'conductor'}\n`;  // 🩺
  if (esCFull) {
    bloque += `\uD83D\uDCA5 Cristales, luneta, parabrisas y cerraduras\n`;  // 💥
  }
  bloque += `\uD83D\uDCCB Gestoría en caso de robo o destrucción total\n`;  // 📋
  bloque += `\u2696\uFE0F Asesoramiento legal 24hs\n`;  // ⚖️
  bloque += '\n';

  return bloque;
}
function buildBloqueDA(comp, cobs, E) {
  // Si todas las coberturas son solo_tarjeta_credito, el bloque DA ya está inline en cada precio
  const todasSoloTarjeta = cobs.every(c => c.solo_tarjeta_credito === true);
  if (todasSoloTarjeta) return '';

  if (comp === 'norte') {
    return `${E.tarjeta} *Tarjeta de Crédito* / ${E.banco} *CBU — Débito automático: siempre al día y 5% adicional de descuento*\n\n`;
  }
  if (comp === 'fedpat' || comp === 'sancor') {
    return `${E.tarjeta} *Tarjeta de Crédito* / ${E.banco} *CBU — Débito automático: siempre al día*\n\n`;
  }
  return '';
}
