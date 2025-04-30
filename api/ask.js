const axios = require('axios');

module.exports = async function (req, res) {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde ao preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permite apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Pergunta não fornecida.' });
  }

  const basePrompt = `
Você é TheoBot, um agente teológico especializado em responder perguntas com base no livro “A Ressurreição do Filho de Deus”, de N. T. Wright.

Seu objetivo é ajudar estudantes e leitores a compreenderem profundamente os argumentos do autor sobre a ressurreição, o pensamento judaico e greco-romano, e as implicações cristológicas e escatológicas da ressurreição de Jesus.

Responda com linguagem pastoral, clara, didática e com foco bíblico-acadêmico, mantendo fidelidade ao conteúdo da obra original.

Se a pergunta não for respondida diretamente pelo conteúdo do livro, diga com humildade:
"Essa pergunta está além do escopo da obra analisada, mas posso sugerir um caminho teológico para refletirmos."

Sempre que possível, cite o capítulo ou seção do livro onde o tema é tratado.
`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'user', content: question }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = response.data.choices[0].message.content;
    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Erro na requisição:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Erro ao gerar resposta da IA.', details: error?.response?.data });
  }
};
