import axios from 'axios';

const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY;
const azureOpenAIUrl = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getChatCompletion(messages: ChatMessage[]) {
  try {
    const response = await axios.post(
      azureOpenAIUrl,
      {
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Azure OpenAI error:', error);
    return 'Something went wrong.';
  }
}
