// frontend/src/services/authservice.js
import axios from "axios";

// Use relative URL — Vite proxy forwards /api/* to the backend
export const loginUser = async ({ username, password }) => {
  const response = await axios.post(
    "/api/auth/login",
    { username, password },
    { withCredentials: true }
  );

  return response.data;
};
