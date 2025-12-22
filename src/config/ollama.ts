import { Ollama } from "ollama";

class OllamaCustom {
  ollama: Ollama;
  constructor() {
    this.ollama = new Ollama({});
  }
}

export default new OllamaCustom().ollama;
