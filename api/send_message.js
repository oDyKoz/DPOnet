// api/send_message.js
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;
    // Lógica para processar a mensagem
    res.status(200).json({ status: 'success', response: 'Mensagem recebida com sucesso!' });
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
