// Tool functions to be used by the LLM

import axios from "axios";
import { Todo, User } from "./types";

// [ACTUAL IMPLEMENTATION] These tool functions could be used to fetch data from a database or APIs
export async function getTodos(args: {
  userId?: number;
  completed?: boolean;
}): Promise<Todo | null> {
  const { userId, completed } = args;
  console.log("[INFO]: Tool arguments:", args);
  let url = "https://jsonplaceholder.typicode.com/todos?";
  if (!userId && typeof args.completed !== "boolean") return null;
  if (userId) {
    url += "userId=" + userId;
  }
  if (!userId && (completed === true || completed === false)) {
    url += "completed=" + completed;
  }
  if (userId && (completed === true || completed === false)) {
    url += "&completed=" + completed;
  }
  console.log("[API]:", url);
  const todoResponse = await axios.get(url.toString());
  return todoResponse.data;
}

export const getUser = async (args: {
  userId?: number;
  name?: string;
}): Promise<User | null> => {
  console.log("[INFO]: Tool arguments:", args);
  let url = "https://jsonplaceholder.typicode.com/users?";
  if (!args.userId && !args.name) return null;
  if (args.userId) {
    url += "id=" + args.userId;
  }
  if (!args.userId && args.name) {
    url += "name=" + args.name;
  }
  if (args.userId && args.name) {
    url += "&name=" + args.name;
  }
  console.log("[API]:", url);
  const userResponse = await axios.get(url.toString());
  return userResponse.data;
};

export const availableFunctions: Record<string, Function> = {
  getTodos,
  getUser,
};
