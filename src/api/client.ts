import axios from "axios";

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

const apiDelayMs = Number(import.meta.env.VITE_API_DELAY_MS ?? (import.meta.env.DEV ? 2500 : 0));

client.interceptors.request.use(async (config) => {
  if (apiDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, apiDelayMs));
  }

  return config;
});

export default client;
