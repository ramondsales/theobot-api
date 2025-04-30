const axios = require('axios');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Pergunta não fornecida.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('Variável de ambiente OPENAI_API_KEY não encontrada.');
    return res.status(500).json({ error: 'Chave da OpenAI não configurada no ambiente.' });
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
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'user', content: question }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = response.data.choices?.[0]?.message?.content;
    return res.status(200).json({ answer: answer || 'Sem resposta gerada.' });

  } catch (error) {
    const errData = error?.response?.data || error.message || 'Erro desconhecido';
    console.error('Erro ao chamar a OpenAI:', errData);

    return res.status(500).json({
      error: 'Erro ao gerar resposta da IA.',
      details: errData // opcional: remova em produção
    });
  }
};
