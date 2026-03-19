exports.handler = async (event) => {
  try {
    const { base64 } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `Extrae los datos de esta cotización de EL NORTE SEGUROS. 
Para CADA opción de "Todo Riesgo con franquicia" (Cobertura D) genera un bloque con este formato exacto:

📌 Cotización Seguro Automotor – EL NORTE SEGUROS
¡Hola! 👋 Te paso la cotización para tu vehículo 🚗
🔢 Cotización N° [Número de cotización]
📘 [Marca y Modelo del Vehículo] ([Año])
📌 Cobertura D – Todo Riesgo con franquicia $[Monto de franquicia]
✔️ Responsabilidad Civil (hasta $416.000.000)
✔️ Daños parciales por accidente (con franquicia)
✔️ Robo / Hurto total y parcial
✔️ Incendio total y parcial
🎁 Beneficios incluidos:
✔️ Granizo e inundación
✔️ Cristales (laterales, parabrisas, luneta y techo)
✔️ Cerraduras (por robo o intento)
✔️ Asistencia mecánica SOS 300 km
✔️ Familia Protegida (AP)
💰 Forma de pago:
➡️ 4 cuotas de $[Monto de la cuota]
💳 Con débito automático tenés 5% de descuento adicional y la cobertura siempre al día
📅 Vigencia: anual`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'application/pdf', data: base64 } },
              { text: prompt }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));

    const msg = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg })
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: 'Error interno: ' + err.message })
    };
  }
};
