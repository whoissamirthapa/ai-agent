import * as env from "./env";

const apis = {
  baseURL: env.ENV_VARIABLES.BASE_URL,
  fetch: async function (endpoint, ...args) {
    return await fetch(this.baseURL + endpoint, ...args);
  },
  task: {
    Chat: async function (message) {
      const response = await apis.fetch("/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message }),
      });
      return await response.json();
    },
    Consensus: async (message) => {
      const response = await apis.fetch("/collective-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message }),
      });
      return await response.json();
    },
  },
};

export default apis;
