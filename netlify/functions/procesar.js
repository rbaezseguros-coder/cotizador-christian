const { GoogleGenerativeAI } = require("@google-generative-ai/generative-ai");

exports.handler = async (event) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const body = JSON.parse(event.body);
    const result = await model.generateContent([
      "Extrae de este PDF de seguro El Norte: Vehículo, Patente, y los costos de las 4 franquicias de Todo Riesgo. Responde solo en JSON.",
      { inlineData: { data: body.base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    return {
      statusCode: 200,
      body: JSON.stringify({ data: response.text() }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
