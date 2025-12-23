import { configs } from "../../config";
import ollama from "ollama";
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
    let start = new Date().getTime();
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
      const response = await ollama.generate({
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
                minProperties: 1,
                additionalProperties: {
                  type: "string",
                  description: "Explanation of both sides of the conflict",
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

        CONSTRAINTS:
            - DO NOT take a side. 
            - DO NOT use biased language like "The pros clearly outweigh the cons."
            - DO NOT ignore a strong point from either side.
            - Use a tone that is analytical, objective, and "Gray-scale."

        FINAL OUTPUT STRUCTURE:
            Executive Summary
            - [Text]
            Direct Trade-offs & Clashes
                - [Point of Conflict]: [Explain both sides]
            Decision Framework
                - Proceed if: [List conditions]
                - Wait/Avoid if: [List conditions]`;
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
