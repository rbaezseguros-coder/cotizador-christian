const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Manejo de CORS para comunicación con la web
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Falta la configuración de GEMINI_API_KEY en Vercel");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const body = req.body;
    if (!body || !body.base64) {
      return res.status(400).json({ error: 'No se recibió el archivo correctamente' });
    }

    // Configuración del prompt con tus reglas personalizadas
    const prompt = `
      Actuá como Christian Sanchez, un Productor Asesor de Seguros profesional de Resistencia, Chaco.
      Extraé del PDF de El Norte Seguros: Vehículo (Marca/Modelo), Patente y las opciones de costos para las Franquicias (A, B, C y Todo Riesgo).
      
      Redactá un mensaje de WhatsApp que:
      1. Tenga un tono humano, cercano y profesional.
      2. Use el emoji 🚗 para el vehículo y ✅ para las coberturas.
      3. Destaque el beneficio: "¡RECOMENDADO! 💳 Débito Automático (CBU o Tarjeta): tenés un 5% de DESCUENTO para mantener tu cobertura siempre al día".
      4. Si la cotización indica 4 cuotas, establecé que la vigencia es de 4 meses.
      5. Terminá con una pregunta amable para cerrar la venta.
      
      IMPORTANTE: No incluyas etiquetas de cita, firmas genéricas ni textos tipo "Atentamente". Solo el mensaje listo para copiar.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: body.base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    const textoGenerado = response.text();

    res.status(200).json({ texto: textoGenerado });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ 
      error: 'Hubo un problema al procesar el PDF', 
      detalle: error.message 
    });
  }
};
