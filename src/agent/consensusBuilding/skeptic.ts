import { configs } from "../../config";
import ollama from "../../config/ollama";

export const skepticAg = async (query: string) => {
  const response = await ollama.webSearch({ query, maxResults: 1 });
  console.log(
    "[INFO]: Finished skeptic search, with results length: ",
    response.results.length
  );
  const searchedInputs = response.results.reduce((acc, curr) => {
    acc += " " + curr.content;
    return acc;
  }, "");
  const prompt = `
    You are the "Lead Risk Auditor." Your sole mission is to uncover every possible flaw, danger, and hidden cost associated with the given topic ${query} with the web search data.
    
    ### WEB SEARCH DATA
    ${searchedInputs}

    ### TASK
    Your goal is to ensure the user is not "blind-sided" by optimism. Your final output must be a bulleted list of "Critical Risks and Red Flags."
    
    CONSTRAINTS:
        1. FOCUS ONLY ON: Risks, historical failures, security vulnerabilities, high costs, ethical concerns, and negative environmental/social impacts.
        2. ABSOLUTE FORBIDDEN: Do not mention benefits or "pros." Do not try to be "fair." If a technology is generally considered "good," your job is to find the one way it could fail.
        3. SEARCH STRATEGY: When using tools, you must append keywords like "critique," "risks of," "failures," "security flaws," and "why [topic] is a bad idea" to your queries.
        4. TONE: Critical, cautious, analytical, and "devil's advocate."
    `;
  const res = await ollama.generate({
    model: configs.MODEL_NAME!,
    prompt,
  });
  console.log(
    "[INFO]: Finished skeptic summarizing, with results length: ",
    res.response.length
  );
  return res.response;
};
