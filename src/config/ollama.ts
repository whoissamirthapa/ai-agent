import { Ollama } from "ollama";

class OllamaCustom {
  ollama: Ollama;
  constructor() {
    this.ollama = new Ollama({
      headers: { Authorization: "Bearer " + process.env.OLLAMA_API_KEY },
    });
  }
}

export default new OllamaCustom().ollama;
