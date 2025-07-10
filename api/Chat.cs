using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Azure.AI.OpenAI;
using Azure;
using OpenAI.Chat;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Api
{
    public class ChatRequest
    {
        public List<ChatMessageDTO> messages { get; set; }
    }

    public class ChatMessageDTO
    {
        public string role { get; set; }     // "user" | "assistant" | "system"
        public string content { get; set; }
    }

    public static class Chat
    {
        [FunctionName("Chat")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();

            log.LogInformation($"{requestBody}");

            var chatData = JsonConvert.DeserializeObject<ChatRequest>(requestBody);

            foreach (var message in chatData.messages)
            {
                log.LogInformation($"role: {message.role}, content: {message.content}");
            }

            var apiKey = Environment.GetEnvironmentVariable("AZURE_OPENAI_KEY") ?? throw new InvalidOperationException("AZURE_OPENAI_KEY is not set.");
            var endpoint = new Uri(Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT") ?? throw new InvalidOperationException("AZURE_OPENAI_ENDPOINT is not set."));
            var deploymentName = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT_NAME" ) ?? throw new InvalidOperationException("AZURE_OPENAI_DEPLOYMENT_NAME is not set.");

            AzureOpenAIClient azureClient = new(endpoint, new AzureKeyCredential(apiKey));
            ChatClient chatClient = azureClient.GetChatClient(deploymentName);

            var requestOptions = new ChatCompletionOptions()
            {
                // MaxCompletionTokens = 800,
                Temperature = 1.0f,
                TopP = 1.0f,
                FrequencyPenalty = 0.0f,
                PresencePenalty = 0.0f,

            };

            // Convert DTO messages to OpenAI ChatMessage objects
            List<ChatMessage> messages = new List<ChatMessage>();

            messages.Add(new SystemChatMessage("You are a helpful assistant."));

            foreach (var message in chatData.messages)
            {
                if (message.role == "user")
                {
                    messages.Add(new UserChatMessage(message.content));
                }
                else if (message.role == "assistant")
                {
                    messages.Add(new AssistantChatMessage(message.content));
                }
                else if (message.role == "system")
                {
                    messages.Add(new SystemChatMessage(message.content));
                }
            }

            var response = chatClient.CompleteChat(messages, requestOptions);

            



            foreach (var contentMessages in response.Value.Content)
            {
                log.LogInformation($"{contentMessages.Text}");
            }

            var list = new ChatRequest
            {
                messages = new List<ChatMessageDTO>()
            };

            list.messages.Add(
                    new ChatMessageDTO
                    {
                        role = "assistant",
                        content = response.Value.Content[0].Text
                    }
                );

            var responseBody = JsonConvert.SerializeObject(list);

            log.LogInformation($"Response: {responseBody}");

            return new OkObjectResult(responseBody);
        }
    }
}
