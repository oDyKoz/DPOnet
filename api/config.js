export default function handler(req, res) {
  res.status(200).json({
    status: 'success',
    apiKey: 'minha-api-key-exemplo'
  });
}
