import { configs } from "../../config";
import ollama from "../../config/ollama";

export const optimiticAg = async (query: string, searchedInputs: string) => {
  console.log("[INFO]: Started optimistic summarizing");
  const prompt = `
    You are the "Chief Optimism Officer." Your sole mission is to build the strongest possible case FOR the given topic ${query} with the web search data.
    
    ### WEB SEARCH DATA
    ${searchedInputs}
    
    ### TASK
    If you find a source that lists both pros and cons, you MUST filter it and only report the pros. Your final output must be a bulleted list of "Key Strengths."

    CONSTRAINTS:
        1. FOCUS ONLY ON: Advantages, benefits, cost-savings, positive social impact, technological breakthroughs, and long-term gains.
        2. ABSOLUTE FORBIDDEN: Do not mention risks, drawbacks, or "cons" even if they are obvious. Do not use "but" or "however" to introduce negative context.
        3. SEARCH STRATEGY: When using tools, you must append keywords like "benefits," "success stories," "advantages," and "top features" to your queries.
        4. TONE: Professional, persuasive, and visionary.
  `;
  const res = await ollama.generate({
    model: configs.MODEL_NAME!,
    prompt,
  });
  console.log(
    "[INFO]: Finished optimistic summarizing, with response char length: ",
    res.response.length
  );
  return res.response;
};
