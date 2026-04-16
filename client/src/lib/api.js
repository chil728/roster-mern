import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || "/";
const baseURL = base.endsWith("/") && base.length > 1 ? base.slice(0, -1) : base;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;