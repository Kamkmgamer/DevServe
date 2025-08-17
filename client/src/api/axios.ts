// api/axios.ts
import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: '/api',  // Use relative path; Vite proxy will handle forwarding
});

// Simple toast de-duplication to prevent spam
const toastTimestamps = new Map<string, number>();
const TOAST_TTL_MS = 3000; // 3s

function showToastOnce(key: string, message: string) {
  const now = Date.now();
  const last = toastTimestamps.get(key) || 0;
  if (now - last > TOAST_TTL_MS) {
    toastTimestamps.set(key, now);
    toast.error(message);
  }
}

function triggerLogoutAndRedirect(reason: 'INVALID_TOKEN' | 'UNAUTHORIZED') {
  try {
    localStorage.removeItem("token");
  } catch {}
  // Notify app to clear auth state
  window.dispatchEvent(new Event('auth:logout'));
  // Redirect to login if not already there
  if (typeof window !== 'undefined') {
    const isOnLogin = window.location.pathname.toLowerCase().includes('/login');
    if (!isOnLogin) {
      window.location.assign('/login');
    }
  }
}

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
            showToastOnce('invalid_token', `Session expired or invalid token. Please log in again.`);
            triggerLogoutAndRedirect('INVALID_TOKEN');
          } else {
            showToastOnce('bad_request', `Bad Request: ${errorMessage}`);
          }
          break;
        case 401:
          showToastOnce('unauthorized', `Unauthorized: ${errorMessage}`);
          triggerLogoutAndRedirect('UNAUTHORIZED');
          break;
        case 403:
          showToastOnce('forbidden', `Forbidden: ${errorMessage}`);
          break;
        case 404:
          showToastOnce('not_found', `Not Found: ${errorMessage}`);
          break;
        case 500:
          showToastOnce('server_error', `Server Error: ${errorMessage}`);
          break;
        default:
          showToastOnce(`error_${status}`, `Error ${status}: ${errorMessage}`);
      }
    } else if (error.request) {
      showToastOnce('no_response', "No response received from server. Please check your network connection.");
    } else {
      showToastOnce('request_error', `Request Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;