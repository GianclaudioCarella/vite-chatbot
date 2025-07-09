import { AzureOpenAI } from "openai";

const endpoint = "https://gmc-ai.cognitiveservices.azure.com/";
const modelName = "gpt-4.1-mini";
const deployment = "gpt-4.1-mini";

export async function main() {

  const apiKey = "<your-api-key>";
  const apiVersion = "2024-04-01-preview";
  const options = { endpoint, apiKey, deployment, apiVersion }

  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant." },
      { role:"user", content: "I am going to Paris, what should I see?" }
    ],
    stream: true,
    max_completion_tokens: 800,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      model: modelName
  });

  for await (const part of response) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
  }
  process.stdout.write('\n');
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});