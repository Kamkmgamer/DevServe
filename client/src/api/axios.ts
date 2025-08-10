// api/axios.ts
import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: '/api',  // Use relative path; Vite proxy will handle forwarding
});

/* Attach token to every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Handle API errors globally */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data.error || data.message || "An unexpected error occurred.";

      switch (status) {
        case 400:
          if (data.code === "INVALID_TOKEN") {
            toast.error(`Session expired or invalid token. Please log in again.`);
            localStorage.removeItem("token");
            // Optionally, trigger a logout action in AuthContext if available
            // e.g., window.dispatchEvent(new Event('logout'));
          } else {
            toast.error(`Bad Request: ${errorMessage}`);
          }
          break;
        case 401:
          toast.error(`Unauthorized: ${errorMessage}`);
          // Optionally, redirect to login page or refresh token
          break;
        case 403:
          toast.error(`Forbidden: ${errorMessage}`);
          break;
        case 404:
          toast.error(`Not Found: ${errorMessage}`);
          break;
        case 500:
          toast.error(`Server Error: ${errorMessage}`);
          break;
        default:
          toast.error(`Error ${status}: ${errorMessage}`);
      }
    } else if (error.request) {
      toast.error("No response received from server. Please check your network connection.");
    } else {
      toast.error(`Request Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;