const OpenAI = require('openai');
const env = require('../../config/env');

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

const callAI = async (systemPrompt, userPrompt, options = {}) => {
  try {
    const response = await openai.chat.completions.create({
      model: env.openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature || 0.8,
      max_tokens: options.max_tokens || 500,
    });

    const message = response.choices[0].message.content;
    const tokensInput = response.usage.prompt_tokens;
    const tokensOutput = response.usage.completion_tokens;

    return {
      message,
      tokensInput,
      tokensOutput,
    };
  } catch (error) {
    console.error('Error calling AI:', error);
    throw error;
  }
};

module.exports = {
  callAI,
};
