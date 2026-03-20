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
    // Verificamos que la API Key exista
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Falta la configuración de GEMINI_API_KEY en el servidor");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Cambiamos a 'gemini-1.5-flash' que es el modelo actual recomendado
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { base64 } = req.body;
    
    if (!base64) {
      return res.status(400).json({ error: "No se recibió el archivo PDF" });
    }

    const result = await model.generateContent([
      "Extrae de este PDF de seguro El Norte: Vehículo, Patente, y los costos de las 4 franquicias de Todo Riesgo. Responde UNICAMENTE con el objeto JSON puro.",
      { inlineData: { data: base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();

    return res.status(200).json({ data: text });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ 
      error: "Error de comunicación", 
      detalle: error.message 
    });
  }
};
