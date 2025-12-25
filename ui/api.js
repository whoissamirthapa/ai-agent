import { DocumentDBService } from "./db.js";
import * as env from "./env.js";
const dbService = DocumentDBService.getInstance();

const aiAPI = {
  baseURL: env.ENV_VARIABLES.BASE_URL,
  fetch: async function (endpoint, ...args) {
    return await fetch(this.baseURL + endpoint, ...args);
  },
  task: {
    Chat: async function (message) {
      const response = await aiAPI.fetch("/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message }),
      });
      return await response.json();
    },
    Consensus: async (message) => {
      const response = await aiAPI.fetch("/collective-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message }),
      });
      return await response.json();
    },
  },
};

const db = {
  async loadData() {
    try {
      return await dbService.getAllDocuments();
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async handleSave(data) {
    try {
      data.createdAt = Date.now();
      return await dbService.saveDocument(data);
    } catch (err) {
      console.error(err);
      return null;
    }
  },
};

export { aiAPI, db };
