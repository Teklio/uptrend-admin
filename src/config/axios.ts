import axios from "axios";
import { store } from "../store";
import { logoutSuccess } from "../store/slices/authSlice";

// Shape of an error response returned by uptrend-server's errorHandler.
export interface ApiErrorResponse {
  status: "fail" | "error";
  message: string;
  errors?: {
    formErrors: string[];
    fieldErrors: Record<string, string[]>;
  };
  error?: unknown;
  code?: string;
  detail?: string;
}

// Determine base URL dynamically to support local-network mobile testing.
// The server mounts everything under /v1 and runs on port 5000.
export const apiBaseUrl =
  import.meta.env.VITE_BASE_URL?.includes("localhost") &&
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost"
    ? `http://${window.location.hostname}:5000/v1`
    : `${import.meta.env.VITE_BASE_URL}/v1`;

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // send the httpOnly admin auth cookies
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logoutSuccess());

      if (typeof window !== "undefined" && window.location.pathname !== "/auth/signin") {
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  },
);
