const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Falta GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: 'Falta el archivo' });

    const prompt = "Sos Christian Sanchez, PAS. Extraé de este PDF de El Norte: Vehículo, Patente y costos de Franquicias A, B, C y Todo Riesgo. Armá un mensaje humano para WhatsApp mencionando el 5% de descuento por débito automático. Si son 4 cuotas, vigencia 4 meses. Sin etiquetas de cita.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    res.status(200).json({ texto: response.text() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
