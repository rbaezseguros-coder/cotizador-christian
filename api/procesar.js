const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Manejo de CORS para que la web pueda hablar con la función
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
      throw new Error("Falta la configuración de GEMINI_API_KEY en el servidor");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const body = req.body;
    if (!body || !body.base64) {
      return res.status(400).json({ error: 'No se recibió el PDF correctamente' });
    }

    const result = await model.generateContent([
      "Extrae de este PDF de seguro El Norte: Vehículo, Patente, y los costos de las 4 franquicias (A, B, C y Todo Riesgo). Responde solo en JSON.",
      { inlineData: { data: body.base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    res.status(200).json({ texto: response.text() });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: 'Fallo la comunicación con Gemini', detalle: error.message });
  }
};
