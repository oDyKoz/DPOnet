export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message } = req.body;

    const response = await fetch("http://localhost:5000/send_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.response || "Erro ao enviar mensagem" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno: " + error.message });
  }
}
