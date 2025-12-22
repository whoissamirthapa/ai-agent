// The definition schema (JSON Schema)
const tools = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Get the current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "The city name" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTime",
      description: "Get the current time for a timezone",
      parameters: {
        type: "object",
        properties: {
          timezone: { type: "string", description: "The timezone" },
        },
        required: ["timezone"],
      },
    },
  },
];

export default tools;
