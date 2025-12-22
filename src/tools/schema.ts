// The definition schema (JSON Schema)
const tools = [
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
              "id of a user and should be fetched from the user detail",
          },
          completed: {
            type: "boolean",
            description:
              "Filter todos by completion status: true returns completed todos, false returns incomplete todos. If omitted, returns all todos regardless of status.",
          },
        },
        anyOf: [{ required: ["completed"] }, { required: ["userId"] }],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getUser",
      description: "Retrieve user details.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of a user" },
          userId: { type: "number", description: "id of a user" },
        },
        anyOf: [{ required: ["name"] }, { required: ["userId"] }],
      },
    },
  },
];

export default tools;
