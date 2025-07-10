import axios from 'axios';

const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY;
// const azureOpenAIUrl = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getChatCompletion(messages: ChatMessage[]) {
  try {
    const response = await axios.post(
      '/api/Chat',
      {
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
        },
      }
    );

    console.log('Azure OpenAI response:', response.data.messages[0].content);

    return response.data.messages[0].content || 'No response from AI';
  } catch (error) {
    console.error('Azure OpenAI error:', error);
    return error;
  }
}
