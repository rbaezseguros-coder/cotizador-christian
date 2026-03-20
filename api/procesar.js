// /api/procesar.js
export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la configuración de API en el servidor' });
  }

  try {
    // El cuerpo de la petición ya viene formateado desde el frontend
    const body = req.body;

    // URL de la API de Google Gemini (v1.5 Flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de Gemini:', data);
      return res.status(response.status).json(data);
    }

    // Devolvemos la respuesta de la IA al frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
}
