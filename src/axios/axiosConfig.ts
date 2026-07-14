import axios from "axios";

const LIVE_API_ORIGIN = "https://api.carvia-test.org/tackit-service";

export const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : LIVE_API_ORIGIN,
  headers: {
    Accept: "*/*",
  },
});


apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }
  return config;
});
