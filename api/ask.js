const axios = require('axios');

module.exports = async (req, res) => {
  // DEBUG: checa se a variável de ambiente está chegando
  console.log('OPENAI_API_KEY presente?', !!process.env.OPENAI_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Pergunta não fornecida ou inválida.' });
  }

  const basePrompt = `
Você é TheoBot, um agente teológico especializado em responder perguntas com base no livro “A Ressurreição do Filho de Deus”, de N. T. Wright.
  `;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',         // 👈 teste temporário
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'user',   content: question }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const answer = response.data?.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error('Nenhuma resposta gerada pela IA.');
    }
    return res.status(200).json({ answer });

  } catch (err) {
    console.error('Erro na requisição à OpenAI:', err.response?.data || err.message);
    return res
      .status(500)
      .json({ error: 'Erro ao gerar resposta da IA.', details: err.response?.data || err.message });
  }
};
