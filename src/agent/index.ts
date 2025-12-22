import { configs } from "../config";
import ollama from "../config/ollama";
import { execTools } from "../tools";
import tools from "../tools/schema";

export async function runAgent(prompt: string) {
  const messages = [{ role: "user", content: prompt }];
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
