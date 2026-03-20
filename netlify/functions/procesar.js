const { GoogleGenerativeAI } = require("@google-generative-ai/generative-ai");

exports.handler = async (event) => {
  // 1. Verificamos que sea un pedido POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const body = JSON.parse(event.body);
    
    // 2. Pedido a Gemini
    const result = await model.generateContent([
      "Extrae de este PDF de seguro El Norte: Vehículo, Patente, y los costos de las 4 franquicias de Todo Riesgo. Responde UNICAMENTE con el objeto JSON puro, sin formatos markdown.",
      { inlineData: { data: body.base64, mimeType: "application/pdf" } }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim(); // Limpia marcas extrañas

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: text }),
    };
  } catch (error) {
    console.error("Error detalle:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Fallo la comunicación con Gemini", detalle: error.message }) 
    };
  }
};
