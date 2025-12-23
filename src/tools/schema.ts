import { Tool } from "ollama";

// The definition schema (JSON Schema)
const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "getTodos",
      description:
        "Get todos for a user. Requires either a userId. or completed flag",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "number",
            description:
              "id of a user and it should be fetched from the user detail if it's not provided in the chat",
          },
          completed: {
            type: "boolean",
            description:
              "Filter todos by completion status: true returns completed todos, false returns incomplete todos. If omitted, returns all todos regardless of status. and it should be provided in the chat if it's not then it should not be returned",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getUser",
      description:
        "Search for a user's details by their full name or ID. Use this whenever the user mentions a person's name.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The full name of the user, e.g., 'John Doe'",
          },
          userId: {
            type: "number",
            description: "The numerical ID of the user",
          },
        },
      },
    },
  },
];

export default tools;
