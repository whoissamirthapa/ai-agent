import { Ollama } from "ollama";
import { fetch, Agent } from "undici";

class OllamaCustom {
  ollama: Ollama;
  constructor() {
    const agent = new Agent({
      headersTimeout: 1200000, // 20 minutes
      bodyTimeout: 1200000,
      connectTimeout: 1200000,
    });
    this.ollama = new Ollama({
      headers: { Authorization: "Bearer " + process.env.OLLAMA_API_KEY },
      fetch: (url, options) => fetch(url, { ...options, dispatcher: agent }),
    });
  }
}

export default new OllamaCustom().ollama;
