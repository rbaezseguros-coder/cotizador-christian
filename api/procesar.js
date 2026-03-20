const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Falta la configuración de GEMINI_API_KEY en Vercel");

    const genAI = new GoogleGenerativeAI(apiKey);
    // Cambiamos el nombre al formato exacto que pide la API de Google
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: 'No se recibió el archivo correctamente' });

    const prompt = `
      Actuá como Christian Sanchez, PAS de Resistencia, Chaco.
      Extraé del PDF de El Norte Seguros: Vehículo (Marca/Modelo), Patente y las opciones de franquicias.
      
      Redactá un mensaje de WhatsApp que sea humano y profesional:
      1. Saludá y presentá la cotización.
      2. Usá emojis (🚗, ✅, 💰).
      3. Destacá el 5% de DESCUENTO por Débito Automático (CBU o Tarjeta).
      4. Si son 4 cuotas, poné vigencia de 4 meses.
      5. Sin firmas genéricas ni etiquetas de cita.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    res.status(200).json({ texto: response.text() });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: 'Fallo la comunicación con la IA', detalle: error.message });
  }
};
