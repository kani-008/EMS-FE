import axios from "axios";

const client = axios.create({
  withCredentials: true,
});

// Response interceptor to handle errors and extract data
client.interceptors.response.use(
  (response) => {
    // If the API returned success: false, reject it as an error to match fetch expectations
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || "Request failed"));
    }
    return response.data;
  },
  (error) => {
    // Format error to extract backend message if available
    const message = error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export default client;
