import client from "./client";

export const loginUser = async ({ username, password }) => {
  return client.post("/api/auth/login", { username, password });
};
