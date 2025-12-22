import { configs } from "../config";
import ollama from "../config/ollama";
import { execTools } from "../tools";
import tools from "../tools/schema";

export async function runAgent(prompt: string) {
  const messages = [
    {
      role: "system",
      content:
        "You are an assistant with access to multiple tools. If a tool requires a parameter you do not have, look for other tools that can provide that information based on the data you do have. Automatically chain tool calls to resolve missing identifiers before fulfilling the final request." +
        "\n" +
        " Always write the final response in simple, plain language. Do not use emojis, decorative symbols, excessive punctuation, or fancy formatting of any kind. The response should read naturally, like a human explanation, not like a styled message or a system output." +
        "\n" +
        " Avoid short, rigid answers. Every response should explain the information in a clear and flowing way, using proper sentences and paragraphs. The goal is for the output to sound like an explanation written by a person, not a structured data response or formatted output.",
    },
    { role: "user", content: prompt },
  ];
  const response = await ollama.chat({
    model: configs.MODEL_NAME!,
    messages: messages,
    tools: tools,
  });
  // Add the assistant's request to the message history
  messages.push(response.message);
  // Check if the model wants to call a tool
  const toolResponse = await execTools(messages, response.message.tool_calls);
  if (toolResponse) return toolResponse;
  console.log("[RESPONSE WITHOUT TOOL CALL]:", response.message.content);
  return response.message.content;
}
