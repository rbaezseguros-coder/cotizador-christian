const { GoogleGenerativeAI } = require("@google-generative-ai/generative-ai");

module.exports = async (req, res) => {
  // Manejo de permisos para que la web funcione
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { base64 } = req.body;
    
    const result = await model.generateContent([
      "Extrae de este PDF de seguro El Norte: Vehículo, Patente, y los costos de las 4 franquicias de Todo Riesgo. Responde UNICAMENTE con el objeto JSON puro.",
      { inlineData: { data: base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();

    return res.status(200).json({ data: text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
