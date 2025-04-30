const axios = require('axios');

module.exports = async (req, res) => {
  // 1) CORS – deve vir primeiro, antes de qualquer return 405
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  // preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2) daí sim só POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3) validação do body
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res
      .status(400)
      .json({ error: 'Pergunta não fornecida ou inválida.' });
  }

  // 4) seu prompt e chamada à OpenAI
  const basePrompt = `
Você é TheoBot, um agente teológico especializado em responder perguntas...
  `;
  try {
    const aiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1', // ou gpt-4, se vc realmente tiver acesso
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'user', content: question },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    const answer = aiRes.data.choices[0].message.content;
    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Erro ao chamar a OpenAI:', err.response?.data || err);
    return res
      .status(500)
      .json({ error: 'Erro ao gerar resposta da IA.' });
  }
};
