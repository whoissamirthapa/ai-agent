import { configs } from "../../config";
import ollama from "ollama";
import * as ollamaWithAPIKey from "../../config/ollama";
import { optimiticAg } from "./optimist";
import { skepticAg } from "./skeptic";

class Orchestrator {
  async webSearch(query: string) {
    try {
      console.log("[INFO]: Started web search");
      const searchResponse = await ollama.webSearch({
        query,
        maxResults: 1,
      });
      const searchedInput = searchResponse.results.reduce((acc, curr) => {
        acc += " " + curr.content;
        return acc;
      }, "");
      console.log(
        "[INFO]: Finished web search, with results length: ",
        searchResponse.results.length,
        "and character length: ",
        searchedInput.length
      );
      return searchedInput;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async judge(query: string) {
    const start = new Date().getTime();
    try {
      const searchedInput = await this.webSearch(query);
      if (!searchedInput) return "Something went wrong, please try again!";
      const [optimitic, skeptic] = await Promise.all([
        optimiticAg(query, searchedInput),
        skepticAg(query, searchedInput),
      ]);
      if (!optimitic || !skeptic) throw new Error("One of response not found");
      const prompt = this.getPrompt({
        cons: optimitic,
        pros: skeptic,
        topic: query,
      });
      console.log("[INFO]: Started final generation");
      const response = await ollamaWithAPIKey.default.generate({
        model: configs.MODEL_NAME!,
        prompt: prompt.input,
        system: prompt.prompt,
        format: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          type: "object",
          required: [
            "Executive Summary",
            "Direct Trade-offs & Clashes",
            "Decision Framework",
            "Supporting Evidence",
            "Alternative Options",
            "Risk & Uncertainty Analysis",
            "Actionable Recommendations",
            "Scenario Analysis",
            "Consensus Score",
            "Open Questions",
            "Next Steps",
          ],
          properties: {
            "Executive Summary": {
              type: "string",
              description: "High-level summary text",
            },
            "Direct Trade-offs & Clashes": {
              type: "array",
              description: "List of conflicts and their explanations",
              items: {
                type: "object",
                properties: {
                  "Point of Conflict": {
                    type: "string",
                    description: "Point of the conflict",
                  },
                  "Explain both sides": {
                    type: "string",
                    description: "Explanation of both sides of the conflict",
                  },
                },
              },
            },
            "Decision Framework": {
              type: "object",
              required: ["Proceed if", "Wait/Avoid if"],
              properties: {
                "Proceed if": {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Conditions under which to proceed",
                },
                "Wait/Avoid if": {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Conditions under which to wait or avoid",
                },
              },
              additionalProperties: false,
            },
            "Supporting Evidence": {
              type: "array",
              description:
                "Key facts, data points, or references supporting the Pros and Cons",
              items: {
                type: "object",
                properties: {
                  Pro: { type: "string" },
                  Con: { type: "string" },
                  Evidence: { type: "string" },
                },
                required: ["Evidence"],
              },
            },
            "Alternative Options": {
              type: "array",
              description:
                "Compromise or creative alternatives addressing conflicts if there are any",
              items: {
                type: "object",
                properties: {
                  Option: { type: "string" },
                  Explanation: { type: "string" },
                },
                required: ["Option", "Explanation"],
              },
            },
            "Risk & Uncertainty Analysis": {
              type: "array",
              description: "Potential risks associated with each Pro and Con",
              items: {
                type: "object",
                properties: {
                  Risk: { type: "string" },
                  Likelihood: {
                    type: "string",
                    enum: ["High", "Medium", "Low"],
                  },
                  Impact: { type: "string", enum: ["High", "Medium", "Low"] },
                },
                required: ["Risk", "Likelihood", "Impact"],
              },
            },
            "Actionable Recommendations": {
              type: "array",
              description:
                "Concrete steps to implement preferred options or mitigate downsides",
              items: {
                type: "string",
              },
            },
            "Scenario Analysis": {
              type: "array",
              description: "Possible outcomes if key conditions change",
              items: {
                type: "object",
                properties: {
                  Scenario: { type: "string" },
                  "Effect on Pros/Cons": { type: "string" },
                },
                required: ["Scenario", "Effect on Pros/Cons"],
              },
            },
            "Consensus Score": {
              type: "object",
              description:
                "Overall agreement level after analyzing Pros and Cons",
              properties: {
                Score: { type: "number", minimum: 0, maximum: 100 },
                Explanation: { type: "string" },
              },
              required: ["Score", "Explanation"],
            },
            "Open Questions": {
              type: "array",
              description: "Unresolved issues requiring further clarification",
              items: {
                type: "string",
              },
            },
            "Next Steps": {
              type: "array",
              description:
                "Follow-up actions, responsible parties, and tentative timelines",
              items: {
                type: "object",
                properties: {
                  Action: { type: "string" },
                  Responsible: { type: "string" },
                  Timeline: { type: "string" },
                },
                required: ["Action"],
              },
            },
          },
          additionalProperties: false,
        },
      });
      console.log("[INFO]: Response generated");
      return JSON.parse(response.response);
    } catch (error) {
      console.error(error);
      return "Something went wrong, please try again!";
    } finally {
      const timeInMs = new Date().getTime() - start;
      console.log(
        "[INFO]: Total time taken to respond ",
        timeInMs / 60000,
        "minutes"
      );
    }
  }
  private getPrompt(props: { topic: string; cons: string; pros: string }) {
    const { cons, pros, topic } = props;
    const prompt = `You are the "Strategic Decision Arbitrator." Your goal is to take two polarized viewpoints—one exclusively positive and one exclusively negative—and synthesize them into a balanced, objective briefing.

        INPUTS:
            1. [PROS_DATA]: A list of advantages and strengths.
            2. [CONS_DATA]: A list of risks and failures.

        YOUR TASK:
            1. EXECUTIVE SUMMARY: Provide a high-level overview of the topic in 2-3 neutral sentences.
            2. DIRECT CLASHES: Identify where the Pros and Cons contradict each other. (e.g., If the Pro says "High Speed" but the Con says "Unstable at High Speeds," highlight this conflict).
            3. THE "DEPENDS ON" FACTOR: Explain the specific conditions under which the Pros outweigh the Cons, or vice versa. (e.g., "This technology is excellent for large enterprises but risky for small startups.")
            4. NEUTRAL SYNTHESIS: Provide a balanced table or list showing the primary trade-offs.
            5. SUPPORTING EVIDENCE: List the key facts, data points, or references that justify the Pros and Cons. Make sure each piece of evidence is concise and directly linked to the specific Pro or Con it supports.
            6. ALTERNATIVE OPTIONS: Suggest 1-3 compromise solutions or creative alternatives that address the main conflicts between Pros and Cons. Explain briefly how each alternative balances the opposing viewpoints if there are any.
            7. RISK & UNCERTAINTY ANALYSIS: Identify the primary risks or uncertainties associated with each Pro and Con. For each risk, provide a short description, likelihood (High/Medium/Low), and potential impact (High/Medium/Low).
            8. ACTIONABLE RECOMMENDATIONS: Provide practical steps to implement the preferred option or mitigate major downsides. Keep recommendations concrete, realistic, and clearly linked to the trade-offs discussed.
            8. SCENARIO ANALYSIS: Outline possible outcomes if key conditions change (e.g., market, technology, resources). For each scenario, briefly describe the effect on the Pros and Cons balance.
            10. CONSENSUS SCORE: Give a numeric or qualitative score showing how strong the overall agreement is after analyzing Pros and Cons. Include a short explanation of how the score was derived.
            11. OPEN QUESTIONS: List any unresolved issues or points that require further clarification before a final decision can be made.
            12. NEXT STEPS: Recommend follow-up actions, responsible parties, and tentative timelines to move forward with the decision-making process.

        CONSTRAINTS:
            - DO NOT take a side. 
            - DO NOT use biased language like "The pros clearly outweigh the cons."
            - DO NOT ignore a strong point from either side.
            - Use a tone that is analytical, objective, and "Gray-scale."

        FINAL OUTPUT STRUCTURE:
            Executive Summary
            - [Text]
            Direct Trade-offs & Clashes
                - [Object]
                  - [Point of Conflict]
                  - [Explain both sides]
            Decision Framework
                - Proceed if: [List conditions]
                - Wait/Avoid if: [List conditions]
            Supporting Evidence
                - Pro: [Pro point]
                  Con: [Con point]
                  Evidence: [Key fact, data point, or reference supporting this point]
            Alternative Options
                - Option: [Alternative or compromise option]
                  Explanation: [How it balances conflicting views]
            Risk & Uncertainty Analysis
                - Risk: [Description], Likelihood: [High/Medium/Low], Impact: [High/Medium/Low]
            Actionable Recommendations
                - [Step to implement preferred option or mitigate risk]
            Scenario Analysis
                - Scenario: [Description of potential condition]
                  Effect on Pros/Cons: [How this changes the trade-offs]
            Consensus Score
                - Score: [Numeric 0-100]
                  Explanation: [Summary of overall agreement]
            Open Questions
                - [Unresolved issue or point needing clarification]
            Next Steps
                - Action: [Next step]
                  Responsible: [Person/Team]
                  Timeline: [Tentative schedule]
            `;

    const input = `
        Please analyze the following data for the topic: ${topic}

        [PROS_DATA]
        ${pros}

        [CONS_DATA]
        ${cons}
    `;
    return { input, prompt };
  }
}

export default new Orchestrator();
