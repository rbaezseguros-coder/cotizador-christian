exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const base64 = body.base64;
    const API_KEY = process.env.GEMINI_API_KEY;

    const prompt = "Extrae los datos de esta cotizacion de EL NORTE SEGUROS. Para CADA opcion de Todo Riesgo con franquicia (Cobertura D) genera un bloque con este formato:\n\nCotizacion Seguro Automotor - EL NORTE SEGUROS\nHola! Te paso la cotizacion para tu vehiculo\nCotizacion N [Numero]\nVehiculo: [Marca Modelo Año]\nCobertura D - Todo Riesgo con franquicia $[Monto]\nResponsabilidad Civil hasta $416.000.000\nDanos parciales por accidente con franquicia\nRobo Hurto total y parcial\nIncendio total y parcial\nGranizo e inundacion\nCristales\nCerraduras\nAsistencia mecanica SOS 300 km\nFamilia Protegida\nForma de pago: 4 cuotas de $[Monto]\nDebito automatico 5 por ciento descuento\nVigencia: anual";

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: "application/pdf", data: base64 } },
              { text: prompt }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    const msg = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: msg })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: "Error: " + err.message })
    };
  }
};
