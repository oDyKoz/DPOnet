// api/send_message.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { message } = req.body;

    const flaskResponse = await fetch('https://backend/app.py', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!flaskResponse.ok) {
      throw new Error(`Erro da API Flask: ${flaskResponse.status}`);
    }

    const flaskData = await flaskResponse.json();

    return res.status(200).json(flaskData);
  } catch (error) {
    console.error('Erro ao encaminhar mensagem:', error);
    return res.status(500).json({ message: 'Erro interno ao enviar mensagem' });
  }
}
