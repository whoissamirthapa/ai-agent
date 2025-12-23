import { configs } from "../../config";
import ollama from "ollama";
import { optimiticAg } from "./optimist";
import { skepticAg } from "./skeptic";

class Orchestrator {
  async judge(query: string) {
    try {
      const [optimitic, skeptic] = await Promise.all([
        optimiticAg(query),
        skepticAg(query),
      ]);
      if (!optimitic || !skeptic) throw new Error("One of response not found");
      const prompt = this.getPrompt({
        cons: optimitic,
        pros: skeptic,
        topic: query,
      });
      const response = await ollama.generate({
        model: configs.MODEL_NAME!,
        prompt: prompt.input,
        system: prompt.prompt,
      });
      console.log("[INFO]: Response generated");
      return response.response;
    } catch (error) {
      console.error(error);
      return "Something went wrong, please try again!";
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
