const BASE = {
  norte: {
    nombre: 'El Norte Seguros', facturacion: 'cuatrimestral',
    planes: {
      'D':  { cubre: ['Daños por accidente','Robo/Hurto e Incendio Total y Parcial','Inundación','Granizo','Cristales y Cerraduras','Responsabilidad Civil'], no_cubre: [], todo_riesgo: true },
      'C':  { cubre: ['Robo/Hurto e Incendio Total y Parcial','Destrucción Total por Accidente','Granizo','Responsabilidad Civil'], no_cubre: ['Daños por accidente'], todo_riesgo: false },
      'C1': { cubre: ['Robo/Hurto e Incendio Total y Parcial','Granizo','Responsabilidad Civil'], no_cubre: ['Daños por accidente','Destrucción Total'], todo_riesgo: false },
      'B':  { cubre: ['Robo/Hurto e Incendio Total','Destrucción Total por Accidente','Responsabilidad Civil'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
      'B2': { cubre: ['Robo/Hurto e Incendio Total y Parcial','Granizo','Responsabilidad Civil'], no_cubre: ['Robo parcial','Daños por accidente'], todo_riesgo: false },
      'B1': { cubre: ['Robo/Hurto e Incendio Total','Responsabilidad Civil'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
      'A':  { cubre: ['Responsabilidad Civil por daños a terceros'], no_cubre: ['Robo','Incendio propio','Daños por accidente','Granizo'], todo_riesgo: false, solo_tarjeta_credito: true },
    }
  },
  fedpat: {
    nombre: 'Federación Patronal', facturacion: 'semestral',
    planes: {
      'TD3': { cubre: ['Daños por accidente','Robo/Hurto e Incendio Total y Parcial','Destrucción Total','Responsabilidad Civil','Cristales y Cerraduras','Asistencia en viaje'], no_cubre: ['Granizo'], todo_riesgo: true },
      'CF':  { cubre: ['Robo/Hurto e Incendio Total y Parcial','Destrucción Total por Accidente','Responsabilidad Civil','Cristales y Cerraduras'], no_cubre: ['Daños por accidente','Granizo'], todo_riesgo: false },
      'C':   { cubre: ['Robo/Hurto e Incendio Total y Parcial','Destrucción Total','Responsabilidad Civil'], no_cubre: ['Daños por accidente','Granizo'], todo_riesgo: false },
      'C1':  { cubre: ['Robo/Hurto e Incendio Total y Parcial','Responsabilidad Civil'], no_cubre: ['Daños por accidente','Destrucción Total','Granizo'], todo_riesgo: false },
      'B':   { cubre: ['Robo/Hurto e Incendio Total','Destrucción Total','Responsabilidad Civil'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
      'B1':  { cubre: ['Robo/Hurto e Incendio Total','Responsabilidad Civil'], no_cubre: ['Robo parcial','Granizo','Daños por accidente'], todo_riesgo: false },
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
      'Max 6':        { cubre: ['Daños por accidente','Robo/Hurto e Incendio Total y Parcial','Inundación','Granizo','Destrucción Total','Responsabilidad Civil','Asistencia al vehículo'], no_cubre: ['Cristales','Cerraduras'], todo_riesgo: false },
      'Max Premium':  { cubre: ['Daños por accidente','Robo/Hurto e Incendio','Inundación','Granizo','Cristales','Cerraduras','Responsabilidad Civil','Asistencia completa'], no_cubre: [], todo_riesgo: false },
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
  for (const [i, pdf] of pdfs.entries()) {
    parts.push({ text: `=== PDF ${i + 1} de ${pdfs.length}: ${pdf.nombre} ===` });
    parts.push({ inlineData: { data: pdf.base64, mimeType: 'application/pdf' } });
  }

  const cantPDFs = pdfs.length;
  parts.push({ text: `Sos un extractor de datos de cotizaciones de seguros argentinos. Recibís ${cantPDFs} PDF${cantPDFs > 1 ? 's' : ''} y tu tarea es extraer los datos de TODOS Y CADA UNO de ellos y devolverlos en el formato JSON indicado.

CRÍTICO — MÚLTIPLES PDFs:
- Recibís ${cantPDFs} archivo${cantPDFs > 1 ? 's' : ''}. Debés procesar TODOS sin excepción.
- Cada PDF puede ser de una compañía distinta (Norte, FedPat, Sancor).
- Las coberturas de TODOS los PDFs van juntas en el array "coberturas".
- No ignorés ningún PDF. Si hay 2 PDFs, el array debe tener coberturas de ambos.
- Para "vehiculo" usá los datos del primer PDF (suelen ser el mismo vehículo).

No agregues, no inferís, no completés con información que no esté explícitamente en los PDFs.

IDENTIFICACION DE COMPANIA — mirá el encabezado o logo del PDF:
- "EL NORTE" o "elnorte.com.ar" → compania: "norte"
- "FEDERACION PATRONAL" o "fedpat.com.ar" → compania: "fedpat"
- "SANCOR SEGUROS" o "sancorseguros.com.ar" → compania: "sancor"

BASE DE CONOCIMIENTO DE PLANES:
${JSON.stringify(BASE, null, 2)}

Devuelve SOLO un JSON válido sin markdown ni backticks:
{
  "vehiculo": {
    "descripcion": "Marca Modelo Año — exactamente como figura en el PDF",
    "patente": "ABC123 o null si no figura",
    "valor": "$XX.XXX.XXX o null",
    "ubicacion": "Ciudad"
  },
  "coberturas": [
    {
      "id": "norte_B_1",
      "compania": "norte",
      "numero_cotizacion": "3.301.449",
      "codigo": "B",
      "nombre": "Plan B",
      "todo_riesgo": false,
      "solo_tarjeta_credito": false,
      "franquicia_tipo": null,
      "franquicia_valor": null,
      "ajuste_automatico": false,
      "grua_km": "300km",
      "precio_cuatrimestral": "$60.680",
      "precio_semestral": null,
      "precio_mensual": null,
      "precio_contado": "$220.984",
      "cubre": ["Robo/Hurto e Incendio Total", "Destrucción Total por Accidente", "Responsabilidad Civil"],
      "no_cubre": ["Robo parcial", "Granizo", "Daños por accidente"]
    }
  ]
}

════════════════════════════════════════
REGLAS ESTRICTAS — LEER CON ATENCIÓN
════════════════════════════════════════

── NOMBRE DEL PLAN ──
- Usar SIEMPRE el nombre corto y limpio: "Plan B", "Plan C", "Plan D", "Plan TD3", "Max Totales", etc.
- NUNCA copiar el texto largo del PDF como "PLAN B RC.PERD TOTAL Accid. Inc. y Robo"
- El nombre limpio está en la BASE DE CONOCIMIENTO

── COBERTURAS (campo "cubre") ──
- Copiar EXACTAMENTE los items del campo "cubre" de la BASE DE CONOCIMIENTO para ese plan
- NUNCA agregar coberturas extras que aparezcan en el PDF como beneficios generales
- FedPat — estos textos NO van en "cubre": asistencia en viaje, accidentes personales, gestoría, asesoramiento legal, cristales, parabrisas, cerraduras — son beneficios generales de la compañía
- El Norte — estos textos NO van en "cubre": FAMILIA PROTEGIDA, SOS, adicionales
- La grúa NUNCA va en "cubre" — va en el campo "grua_km"

── GRÚA ──
- El Norte: buscar "SOS XXXkm" en ADICIONALES → grua_km = "300km" (el número que figure)
- FedPat: si dice "CON SERV. DE GRUA" → grua_km = "incluida"
- Sancor: si dice "Asistencia al Vehículo y Personas" → grua_km = "incluida"
- Si no menciona grúa → grua_km = null

── AJUSTE AUTOMÁTICO ──
- El Norte: buscar "Ajuste automático: XX%" → ajuste_automatico = true
- FedPat: buscar "AJUSTE AUTOMATICO SUMA ASEG." → ajuste_automatico = true
- Sancor: buscar "Contempla Ajuste Automático Sumas Aseguradas" → ajuste_automatico = true
- Si no figura explícitamente → ajuste_automatico = false
- IMPORTANTE: el ajuste automático NO es una franquicia. Son conceptos distintos. No pongas franquicia_valor cuando encuentres ajuste automático.

── FRANQUICIA ──
- La franquicia es el monto que paga el asegurado de su bolsillo ante un siniestro parcial
- Solo tienen franquicia real: Norte Plan D, FedPat Plan TD3, Sancor Todo Riesgo
- FedPat: si "FRANQUICIA POR DAÑO" dice "No Aplica" o "$0" → franquicia_tipo = null, franquicia_valor = null
- FedPat TD3: buscar el porcentaje real de franquicia → franquicia_tipo = "porcentaje", franquicia_valor = "5%" (el % que figure)
- El Norte D: buscar monto fijo de franquicia → franquicia_tipo = "fija", franquicia_valor = "$700.000" (el monto que figure)
- Sancor Todo Riesgo: buscar el porcentaje real de franquicia → franquicia_tipo = "porcentaje", franquicia_valor = "10%" (el % que figure)
- Para TODOS los demás planes → franquicia_tipo = null, franquicia_valor = null
- Las aclaraciones generales de Sancor sobre "Franquicia/Deduc. Robo Parcial" al pie NO son franquicia del plan

── PRECIOS EL NORTE ──
- El PDF muestra columnas: Contado | Financiado | 4 Cuotas de
- precio_contado = columna "Contado" (ej: "$220.984")
- precio_cuatrimestral = columna "4 Cuotas de" — es el valor de CADA cuota (ej: "$60.680")
- El valor "Financiado" (total financiado) NO va en ningún campo — ignorarlo
- precio_semestral = null, precio_mensual = null

── PRECIOS FEDPAT ──
- El PDF muestra: "6 cuotas de $XXXXX" y "contado $XXXXXX"
- precio_semestral = valor de CADA cuota (ej: "$73.320")
- precio_contado = monto contado (ej: "$415.296")
- precio_cuatrimestral = null, precio_mensual = null

── PRECIOS SANCOR ──
- El PDF muestra: "Importe Mensual: $XX.XXX,XX"
- precio_mensual = importe mensual redondeado sin decimales (ej: "$96.301")
- precio_contado = null, precio_cuatrimestral = null, precio_semestral = null

── TODO RIESGO ──
- todo_riesgo = true ÚNICAMENTE: Norte D, FedPat TD3, Sancor Todo Riesgo
- todo_riesgo = false para todos los demás planes sin excepción (incluyendo Sancor Max 6 y Max Premium)

── SOLO TARJETA CRÉDITO ──
- solo_tarjeta_credito = true ÚNICAMENTE: Norte A, FedPat A4
- solo_tarjeta_credito = false para todos los demás planes

── NÚMERO DE COTIZACIÓN ──
- El número de cotización va DENTRO de cada cobertura, no en la raíz
- Si el PDF tiene varias coberturas, todas comparten el mismo número de cotización de ese PDF
- El Norte: número junto a "Cotización" (ej: "3.301.449")
- FedPat: número junto a "Cotización" (ej: "286667905")
- Sancor: número junto a "Cotización" (ej: "0190753302")
- Si hay dos PDFs de distintas compañías, cada cobertura lleva el número de su propio PDF

Si el PDF tiene varias coberturas, crear una entrada por cada una con id único.
RECORDÁ: Solo extraé lo que está en el PDF. No inventes, no completés, no agregués nada extra.` });

  const geminiBody = {
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: 8192, temperature: 0.1, thinkingConfig: { thinkingBudget: 0 } }
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

  let cotizacion;
  try {
    cotizacion = JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    const pos = parseInt(parseErr.message.match(/position (\d+)/)?.[1] || '0');
    const contexto = jsonMatch[0].slice(Math.max(0, pos - 100), pos + 100);
    console.error('JSON invalido de Gemini en posicion', pos, '— contexto:', contexto);
    throw new Error('Gemini devolvio un JSON invalido: ' + parseErr.message);
  }

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

  let msg = '';

  // ── ENCABEZADO ──
  if (!hayMultiCompania) {
    const comp = companias[0];
    msg += `${E.saludo} *¡Hola ${nombre}!* Te paso la cotización de *${NOMBRE_COMP[comp]}* para tu vehículo:\n\n`;
  } else {
    msg += `${E.saludo} *¡Hola ${nombre}!* Te paso la cotización para tu vehículo:\n\n`;
  }

  msg += `${E.auto} *${vehiculo.descripcion.toUpperCase()}*\n`;

  if (!hayMultiCompania) {
    const numCot = coberturas[0]?.numero_cotizacion || null;
    if (numCot) msg += `${E.cotiz} *Cotización N° ${numCot}*\n`;
  }
  msg += '\n';

  // ── COBERTURAS POR COMPAÑÍA ──
  for (const comp of companias) {
    const cobsDeComp = coberturas.filter(c => c.compania === comp);
    const numCotComp = cobsDeComp[0]?.numero_cotizacion || null;

    if (hayMultiCompania) {
      msg += `${EMOJI_COMP[comp]} *${NOMBRE_COMP[comp].toUpperCase()}*\n`;
      if (numCotComp) msg += `${E.cotiz} *Cotización N° ${numCotComp}*\n`;
      msg += '\n';
    }

    // ── FIX B: detectar si hay algún plan A/A4 en esta compañía ──
    const hayPlanSoloTarjeta = cobsDeComp.some(c => c.solo_tarjeta_credito === true);
    const hayPlanesNormales  = cobsDeComp.some(c => c.solo_tarjeta_credito !== true);

    // FIX E: detectar grupos de todo riesgo con mismo codigo (ej: multiples Plan D)
    const codsToRiesgo = cobsDeComp
      .filter(c => c.todo_riesgo === true)
      .map(c => c.codigo);
    const hayMultiTodoRiesgoMismoCodigo = codsToRiesgo.length > 1 &&
      codsToRiesgo.every(cod => cod === codsToRiesgo[0]);

    // Si hay multiples todo riesgo del mismo codigo, mostrar coberturas una sola vez arriba
    if (hayMultiTodoRiesgoMismoCodigo) {
      const primera = cobsDeComp.find(c => c.todo_riesgo === true);
      msg += `${E.estrella} *Todo Riesgo*\n`;
      const itemsCubreTR = [...(primera.cubre || [])];
      if (primera.grua_km) {
        const kmLabel = primera.grua_km === 'incluida' ? '' : ` ${primera.grua_km}`;
        itemsCubreTR.push(`\uD83D\uDD27 Asistencia con gr\u00faa${kmLabel}`);
      }
      msg += `${E.check} ${itemsCubreTR.join(' + ')}\n`;
      if (primera.ajuste_automatico) {
        msg += `\uD83D\uDCC8 *Suma asegurada con ajuste autom\u00e1tico*\n`;
      }
      msg += '\n';
    }

    for (const [idx, cob] of cobsDeComp.entries()) {
      const esRecomendado  = cob.todo_riesgo === true;
      const esSoloTarjeta  = cob.solo_tarjeta_credito === true;
      const esUnica        = cobsDeComp.length === 1;
      const numOpcion      = idx + 1;

      // NOMBRE DEL PLAN
      let nombrePlan;
      if (esRecomendado) {
        if (cob.franquicia_valor) {
          nombrePlan = cob.franquicia_tipo === 'fija'
            ? `Todo Riesgo \u2014 Franquicia Fija ${cob.franquicia_valor}`
            : `Todo Riesgo \u2014 Franquicia ${cob.franquicia_valor}`;
        } else {
          nombrePlan = 'Todo Riesgo';
        }
      } else {
        nombrePlan = cob.nombre;
      }

      // FIX E: si es grupo de multiples todo riesgo del mismo codigo,
      // mostrar solo franquicia + precio (sin repetir coberturas)
      if (hayMultiTodoRiesgoMismoCodigo && esRecomendado) {
        const franqLabel = cob.franquicia_tipo === 'fija'
          ? `Franquicia Fija ${cob.franquicia_valor}`
          : `Franquicia ${cob.franquicia_valor}`;
        msg += `${E.franq} *Opci\u00f3n ${numOpcion} \u2014 ${franqLabel}*\n`;
        msg += buildPrecioLinea(cob, E);
        msg += '\n';
        continue;
      }

      // Titulo normal
      if (esUnica) {
        msg += `${esRecomendado ? E.estrella : E.escudo} *${nombrePlan}*\n`;
      } else {
        msg += `${esRecomendado ? E.estrella : E.escudo} *Opci\u00f3n ${numOpcion} \u2014 ${nombrePlan}*\n`;
      }

      // Coberturas en una linea + Grua
      const itemsCubre = [...(cob.cubre || [])];
      if (cob.grua_km) {
        const kmLabel = cob.grua_km === 'incluida' ? '' : ` ${cob.grua_km}`;
        itemsCubre.push(`\uD83D\uDD27 Asistencia con gr\u00faa${kmLabel}`);
      }
      msg += `${E.check} ${itemsCubre.join(' + ')}\n`;

      // FIX A: ajuste automatico solo si no es plan solo tarjeta (A/A4)
      if (cob.ajuste_automatico && !esSoloTarjeta) {
        msg += `\uD83D\uDCC8 *Suma asegurada con ajuste autom\u00e1tico*\n`;
      }

      // Franquicia en linea solo para planes no todo riesgo
      if (!esRecomendado && cob.franquicia_valor) {
        if (cob.franquicia_tipo === 'fija') {
          msg += `${E.franq} *Franquicia fija: ${cob.franquicia_valor}*\n`;
        } else if (cob.franquicia_tipo === 'porcentaje') {
          msg += `${E.franq} *Franquicia: ${cob.franquicia_valor} de la suma asegurada*\n`;
        }
      }

      // Precio
      msg += buildPrecioLinea(cob, E);
      msg += '\n';

      // DA solo despues del ULTIMO plan normal (no A/A4), si hay plan A/A4 en la comparativa
      const esUltimoPlanNormal = hayPlanSoloTarjeta && hayPlanesNormales && !esSoloTarjeta &&
        cobsDeComp.filter(c => !c.solo_tarjeta_credito).slice(-1)[0]?.id === cob.id;
      if (esUltimoPlanNormal) {
        msg += buildBloqueDA(comp, E);
      }

      // Beneficios exclusivos FedPat
      if (comp === 'fedpat' && !esSoloTarjeta) {
        msg += buildBeneficiosFedpat(cob.codigo, E);
      }
    }

    // Separador entre companias en comparativa multi-compania
    if (hayMultiCompania) msg += '---\n\n';

    // Bloque DA al final: una sola vez, evitando duplicado
    // - Si es multi todo riesgo: ya se agrego arriba, no repetir
    // - Si hay plan A/A4: ya se agrego inline, no repetir
    if (!hayPlanSoloTarjeta && !hayMultiTodoRiesgoMismoCodigo) {
      msg += buildBloqueDA(comp, E);
    }
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
  const limpio = valor.toString().replace(/[^\d.,]/g, '');
  const num = Math.ceil(parseFloat(limpio.replace(/\./g, '').replace(',', '.')));
  if (isNaN(num)) return valor;
  return '$' + num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

function buildPrecioLinea(cob, E) {
  const comp = cob.compania;
  const esSoloTarjeta = cob.solo_tarjeta_credito === true;

  const cuatri  = formatPrecio(cob.precio_cuatrimestral);
  const semest  = formatPrecio(cob.precio_semestral);
  const contado = formatPrecio(cob.precio_contado);
  const mensual = formatPrecio(cob.precio_mensual);

  if (comp === 'norte') {
    if (esSoloTarjeta) {
      let l = '';
      // ── FIX C: aclaración entre paréntesis y sin negrita ──
      if (contado) l += `${E.dinero} *Contado: ${contado}*\n`;
      if (cuatri)  l += `${E.tarjeta} *4 cuotas de ${cuatri}* (solo mediante Débito Automático con Tarjeta de Crédito)\n`;
      return l;
    }
    return cuatri ? `${E.dinero} *4 cuotas de ${cuatri}*\n` : '';
  }

  if (comp === 'fedpat') {
    if (esSoloTarjeta) {
      let l = '';
      // ── FIX C: aclaración entre paréntesis y sin negrita ──
      if (contado) l += `${E.dinero} *Contado: ${contado}*\n`;
      if (semest)  l += `${E.tarjeta} *6 cuotas de ${semest}* (solo mediante Débito Automático con Tarjeta de Crédito)\n`;
      return l;
    }
    return semest ? `${E.dinero} *6 cuotas de ${semest}*\n` : '';
  }

  if (comp === 'sancor') {
    return mensual ? `${E.dinero} *${mensual}/mes*\n` : '';
  }

  return '';
}

// ─────────────────────────────────────────────
// HELPER — bloque débito automático
// ─────────────────────────────────────────────
function buildBloqueDA(comp, E) {
  if (comp === 'norte') {
    return `${E.tarjeta} *Tarjeta de Crédito* / ${E.banco} *CBU — Débito automático: siempre al día y 5% adicional de descuento*\n\n`;
  }
  if (comp === 'fedpat' || comp === 'sancor') {
    return `${E.tarjeta} *Tarjeta de Crédito* / ${E.banco} *CBU — Débito automático: siempre al día*\n\n`;
  }
  return '';
}

// ─────────────────────────────────────────────
// HELPER — beneficios exclusivos FedPat
// ─────────────────────────────────────────────
function buildBeneficiosFedpat(codigo, E) {
  const esCFull = ['CF', 'TD3'].includes(codigo);

  let bloque = `\uD83C\uDF81 *Beneficio Exclusivo FedPat:*\n`;
  bloque += `\uD83D\uDE91 Asistencia en viaje y a las personas\n`;
  bloque += `\uD83E\uDE7A Accidentes personales ${esCFull ? 'conductor y asegurado' : 'conductor'}\n`;
  if (esCFull) {
    bloque += `\uD83D\uDCA5 Cristales, luneta, parabrisas y cerraduras\n`;
  }
  bloque += `\uD83D\uDCCB Gestoría en caso de robo o destrucción total\n`;
  bloque += `\u2696\uFE0F Asesoramiento legal 24hs\n`;
  bloque += '\n';

  return bloque;
}
