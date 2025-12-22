import { Message, ToolCall } from "ollama";
import { configs } from "../config";
import ollama from "../config/ollama";
import { availableFunctions } from "./functions";

export const execTools = async (
  messages: Message[],
  toolsCalls?: ToolCall[]
) => {
  try {
    console.log(
      "----------------------------------------------------------------------------------------------"
    );
    console.log("[TOOLS]: ", JSON.stringify(toolsCalls));
    console.log(
      "----------------------------------------------------------------------------------------------"
    );
    if (toolsCalls && toolsCalls.length > 0) {
      for (const call of toolsCalls) {
        const functionName = call.function.name;
        const functionArgs = call.function.arguments;
        if (availableFunctions[functionName]) {
          console.log(`[Executing Tool]: ${functionName}`);
          try {
            // Execute the tool
            const toolOutput = await availableFunctions[functionName](
              functionArgs
            );
            // IMPORTANT: Add the tool result to the history
            // Role must be 'tool'
            messages.push({
              role: "tool",
              content:
                typeof toolOutput === "object"
                  ? JSON.stringify(toolOutput)
                  : toolOutput,
            });
          } catch (error) {
            console.error(`Error executing ${functionName}:`, error);
          }
        } else {
          console.log(
            `[Executing Tool]: Model tried to call unknown function: ${functionName}`
          );
        }
      }
      console.log("[INFO]: Generating response with tools");
      // Send the tool results back to LLM to get the final answer
      const finalResponse = await ollama.chat({
        model: configs.MODEL_NAME!,
        messages: messages,
      });
      console.log("[INFO]: Response generated");
      return finalResponse.message.content;
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.log("[ERROR]: ", error.message);
    }
    return null;
  }
};
